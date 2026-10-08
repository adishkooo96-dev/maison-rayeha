import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeOnSnapshotDoc, safeOnSnapshotQuery } from './safeSnapshot';
import { ChatConversation, ChatMessage, ChatStatus } from '../types/chat';

const CHATS_COLLECTION = 'chats';
const MESSAGES_SUBCOLLECTION = 'messages';
const GUEST_SESSION_STORAGE_KEY = 'maison_rayeha_guest_chat_session';
const GUEST_CHAT_DOC_STORAGE_KEY = 'maison_rayeha_guest_chat_doc_id';

// Stable in-memory session cache so ID never regenerates during a session even if localStorage is disabled
let memoryGuestSessionId: string | null = null;
let memoryGuestChatId: string | null = null;

/**
 * Gets or creates a persistent guestSessionId in localStorage (with in-memory fallback) for anonymous visitors.
 */
export function getOrCreateGuestSessionId(): string {
  if (memoryGuestSessionId) {
    return memoryGuestSessionId;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
      if (stored) {
        memoryGuestSessionId = stored;
        return stored;
      }
    } catch {
      // Storage unavailable or restricted
    }
  }

  const newId = 'guest_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
  memoryGuestSessionId = newId;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GUEST_SESSION_STORAGE_KEY, newId);
    } catch {
      // Ignore
    }
  }
  return newId;
}

/**
 * Retrieves existing chat doc id stored in localStorage/memory for guest, if any.
 */
export function getStoredGuestChatId(): string | null {
  if (memoryGuestChatId) return memoryGuestChatId;
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(GUEST_CHAT_DOC_STORAGE_KEY);
    if (stored) {
      memoryGuestChatId = stored;
      return stored;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function setStoredGuestChatId(chatId: string): void {
  memoryGuestChatId = chatId;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CHAT_DOC_STORAGE_KEY, chatId);
  } catch {
    // Ignore
  }
}

/**
 * Looks up existing chat conversation without creating a new document in Firestore.
 */
export async function fetchExistingCustomerChat(params: {
  userId: string | null;
  guestSessionId: string;
}): Promise<ChatConversation | null> {
  const chatsCol = collection(db, CHATS_COLLECTION);

  // 1. If logged in, find by userId
  if (params.userId) {
    try {
      const q = query(chatsCol, where('userId', '==', params.userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId || null,
          guestSessionId: data.guestSessionId || params.guestSessionId,
          customerName: data.customerName || 'کاربر گرامی',
          customerEmail: data.customerEmail || '',
          status: data.status || 'open',
          lastMessageAt: data.lastMessageAt || new Date().toISOString(),
          unreadByAdmin: data.unreadByAdmin ?? false,
          unreadByCustomer: data.unreadByCustomer ?? false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Error querying chat by userId:', err);
    }
  }

  // 2. If guest, check stored guest chat doc ID
  const storedChatId = getStoredGuestChatId();
  if (storedChatId && !params.userId) {
    try {
      const docRef = doc(db, CHATS_COLLECTION, storedChatId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: null,
          guestSessionId: data.guestSessionId || params.guestSessionId,
          customerName: data.customerName || 'کاربر مهمان',
          customerEmail: data.customerEmail || '',
          status: data.status || 'open',
          lastMessageAt: data.lastMessageAt || new Date().toISOString(),
          unreadByAdmin: data.unreadByAdmin ?? false,
          unreadByCustomer: data.unreadByCustomer ?? false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Error fetching stored guest chat doc:', err);
    }
  }

  // 3. Check by guestSessionId
  if (!params.userId && params.guestSessionId) {
    try {
      const q = query(chatsCol, where('guestSessionId', '==', params.guestSessionId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        setStoredGuestChatId(docSnap.id);
        return {
          id: docSnap.id,
          userId: null,
          guestSessionId: params.guestSessionId,
          customerName: data.customerName || 'کاربر مهمان',
          customerEmail: data.customerEmail || '',
          status: data.status || 'open',
          lastMessageAt: data.lastMessageAt || new Date().toISOString(),
          unreadByAdmin: data.unreadByAdmin ?? false,
          unreadByCustomer: data.unreadByCustomer ?? false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Error querying chat by guestSessionId:', err);
    }
  }

  return null;
}

/**
 * Finds or initializes the customer's conversation.
 */
export async function getOrCreateCustomerChat(params: {
  userId: string | null;
  guestSessionId: string;
  customerName?: string;
  customerEmail?: string;
}): Promise<ChatConversation> {
  // Check if existing first
  const existing = await fetchExistingCustomerChat(params);
  if (existing) {
    if (params.customerName && params.customerName !== existing.customerName) {
      const docRef = doc(db, CHATS_COLLECTION, existing.id);
      updateDoc(docRef, { customerName: params.customerName }).catch(console.warn);
      existing.customerName = params.customerName;
    }
    return existing;
  }

  // Create new chat conversation only when needed
  const chatsCol = collection(db, CHATS_COLLECTION);
  const now = new Date().toISOString();
  const newChatData: Omit<ChatConversation, 'id'> = {
    userId: params.userId || null,
    guestSessionId: params.guestSessionId,
    customerName: params.customerName || (params.userId ? 'کاربر گرامی' : 'کاربر مهمان'),
    customerEmail: params.customerEmail || '',
    status: 'open',
    lastMessageAt: now,
    unreadByAdmin: false,
    unreadByCustomer: false,
    createdAt: now,
  };

  const newDocRef = await addDoc(chatsCol, newChatData);
  if (!params.userId) {
    setStoredGuestChatId(newDocRef.id);
  }

  return {
    id: newDocRef.id,
    ...newChatData,
  };
}

/**
 * Real-time listener for a single chat document.
 */
export function subscribeToChat(
  chatId: string,
  callback: (chat: ChatConversation | null) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, CHATS_COLLECTION, chatId);
  return safeOnSnapshotDoc(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback({
          id: snap.id,
          userId: data.userId || null,
          guestSessionId: data.guestSessionId || '',
          customerName: data.customerName || 'کاربر گرامی',
          customerEmail: data.customerEmail || '',
          status: data.status || 'open',
          lastMessageAt: data.lastMessageAt || new Date().toISOString(),
          unreadByAdmin: data.unreadByAdmin ?? false,
          unreadByCustomer: data.unreadByCustomer ?? false,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Error in subscribeToChat:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for messages in a chat conversation.
 */
export function subscribeToChatMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (err: Error) => void
): () => void {
  const messagesCol = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION);

  return safeOnSnapshotQuery(
    messagesCol,
    (snap) => {
      const messages: ChatMessage[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        messages.push({
          id: docSnap.id,
          senderType: d.senderType || 'customer',
          text: d.text || '',
          createdAt: d.createdAt || new Date().toISOString(),
          status: d.status || 'sent',
        });
      });

      // Sort by createdAt ascending (oldest first, newest at bottom)
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(messages);
    },
    (err) => {
      console.warn('Error in subscribeToChatMessages:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Sends a message from the customer.
 */
export async function sendCustomerMessage(
  chatId: string,
  text: string,
  customerMeta?: { customerName?: string; customerEmail?: string }
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const now = new Date().toISOString();
  const messagesCol = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION);

  // 1. Add message sub-document with default status 'sent'
  await addDoc(messagesCol, {
    senderType: 'customer',
    text: trimmed,
    createdAt: now,
    status: 'sent',
  });

  // 2. Update chat conversation document
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  const updatePayload: Record<string, any> = {
    lastMessageAt: now,
    unreadByAdmin: true,
    status: 'open', // customer message reopens chat if closed
  };

  if (customerMeta?.customerName) {
    updatePayload.customerName = customerMeta.customerName;
  }
  if (customerMeta?.customerEmail) {
    updatePayload.customerEmail = customerMeta.customerEmail;
  }

  await updateDoc(chatDocRef, updatePayload);
}

/**
 * Sends a reply from the admin.
 */
export async function sendAdminMessage(chatId: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const now = new Date().toISOString();
  const messagesCol = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION);

  // 1. Add message sub-document with default status 'sent'
  await addDoc(messagesCol, {
    senderType: 'admin',
    text: trimmed,
    createdAt: now,
    status: 'sent',
  });

  // 2. Update chat conversation document
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatDocRef, {
    lastMessageAt: now,
    unreadByAdmin: false,
    unreadByCustomer: true,
  });
}

/**
 * Updates an array of messages to 'seen' status using a single writeBatch.
 */
export async function markMessagesSeen(chatId: string, messageIds: string[]): Promise<void> {
  if (!messageIds || messageIds.length === 0) return;
  for (let i = 0; i < messageIds.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = messageIds.slice(i, i + 400);
    chunk.forEach((id) => {
      const msgRef = doc(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION, id);
      batch.update(msgRef, { status: 'seen' });
    });
    await batch.commit();
  }
}

/**
 * Marks conversation as read by customer (clears unread customer badge).
 */
export async function markChatReadByCustomer(chatId: string): Promise<void> {
  try {
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatDocRef, {
      unreadByCustomer: false,
    });
  } catch (err) {
    console.warn('Error marking chat read by customer:', err);
  }
}

/**
 * Marks conversation as read by admin (clears unread admin indicator).
 */
export async function markChatReadByAdmin(chatId: string): Promise<void> {
  try {
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatDocRef, {
      unreadByAdmin: false,
    });
  } catch (err) {
    console.warn('Error marking chat read by admin:', err);
  }
}

/**
 * Updates status of a conversation ('open' | 'closed').
 */
export async function updateChatStatus(chatId: string, status: ChatStatus): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatDocRef, {
    status,
  });
}

/**
 * Deletes an individual message from a conversation thread.
 */
export async function deleteChatMessage(chatId: string, messageId: string): Promise<void> {
  const messageDocRef = doc(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION, messageId);
  await deleteDoc(messageDocRef);
}

/**
 * Deletes an entire conversation including all its messages and the conversation document itself.
 */
export async function deleteEntireConversation(chatId: string): Promise<void> {
  // 1. Fetch all messages in subcollection
  const messagesCol = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION);
  const messagesSnap = await getDocs(messagesCol);

  // 2. Delete messages in chunks of 400 using writeBatch
  if (!messagesSnap.empty) {
    const docs = messagesSnap.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + 400);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  // 3. Delete parent conversation document
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  await deleteDoc(chatDocRef);
}

/**
 * Real-time listener for all chats (used in Admin panel).
 */
export function subscribeToAllChats(
  callback: (chats: ChatConversation[]) => void,
  onError?: (err: Error) => void
): () => void {
  const chatsCol = collection(db, CHATS_COLLECTION);

  return safeOnSnapshotQuery(
    chatsCol,
    (snap) => {
      const chats: ChatConversation[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        chats.push({
          id: docSnap.id,
          userId: d.userId || null,
          guestSessionId: d.guestSessionId || '',
          customerName: d.customerName || 'کاربر گرامی',
          customerEmail: d.customerEmail || '',
          status: d.status || 'open',
          lastMessageAt: d.lastMessageAt || new Date().toISOString(),
          unreadByAdmin: d.unreadByAdmin ?? false,
          unreadByCustomer: d.unreadByCustomer ?? false,
          createdAt: d.createdAt || new Date().toISOString(),
        });
      });

      // Sort by lastMessageAt descending (most recent conversation first)
      chats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      callback(chats);
    },
    (err) => {
      console.warn('Error in subscribeToAllChats:', err);
      if (onError) onError(err);
    }
  );
}
