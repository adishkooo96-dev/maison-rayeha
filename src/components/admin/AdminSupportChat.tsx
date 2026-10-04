import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  Check,
  CheckCheck,
  Clock,
  Archive,
  ChevronDown,
  ChevronUp,
  Inbox,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '../../types/chat';
import {
  subscribeToChatMessages,
  sendAdminMessage,
  markChatReadByAdmin,
  updateChatStatus,
  deleteChatMessage,
  deleteEntireConversation,
  markMessagesSeen,
} from '../../lib/chatApi';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useI18n } from '../../hooks/useI18n';

interface AdminSupportChatProps {
  chats: ChatConversation[];
}

export const AdminSupportChat: React.FC<AdminSupportChatProps> = ({ chats }) => {
  const { lang, t, formatNumber } = useI18n();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClosedChats, setShowClosedChats] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<ChatConversation | null>(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const markedSeenForChatId = useRef<string | null>(null);
  const prevChatIdRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  // Reset markedSeenForChatId ONLY when selectedChatId itself changes
  useEffect(() => {
    if (selectedChatId !== prevChatIdRef.current) {
      markedSeenForChatId.current = null;
      prevChatIdRef.current = selectedChatId;
    }
  }, [selectedChatId]);

  // Separate useEffect dependent ONLY on [selectedChatId] for mark-as-seen logic
  useEffect(() => {
    if (!selectedChatId) return;

    // Ref guard: if already processed for this chatId, return immediately and do nothing
    if (markedSeenForChatId.current === selectedChatId) {
      return;
    }

    const runMarkSeen = async () => {
      // Read current local messages state
      let unseenCustomerMessages = messagesRef.current.filter(
        (m) => m.senderType === 'customer' && (m.status === 'sent' || !m.status)
      );

      // If local messages state is empty (onSnapshot still fetching), check directly
      if (unseenCustomerMessages.length === 0 && messagesRef.current.length === 0) {
        try {
          const snap = await getDocs(
            query(
              collection(db, 'chats', selectedChatId, 'messages'),
              where('senderType', '==', 'customer'),
              where('status', '==', 'sent')
            )
          );
          if (!snap.empty) {
            const ids = snap.docs.map((d) => d.id);
            await markMessagesSeen(selectedChatId, ids);
          }
        } catch (err) {
          console.warn('[AdminSupportChat] Could not check unseen messages:', err);
        }
        markedSeenForChatId.current = selectedChatId;
        return;
      }

      if (unseenCustomerMessages.length === 0) {
        // No unseen customer messages; set ref and return without writing
        markedSeenForChatId.current = selectedChatId;
        return;
      }

      // Perform ONE single writeBatch that updates all of those message documents to status "seen"
      try {
        const ids = unseenCustomerMessages.map((m) => m.id);
        await markMessagesSeen(selectedChatId, ids);
      } catch (err) {
        console.warn('[AdminSupportChat] Could not mark messages as seen:', err);
      }
      markedSeenForChatId.current = selectedChatId;
    };

    runMarkSeen();
  }, [selectedChatId]);

  // Active selected conversation
  const selectedChat = chats.find((c) => c.id === selectedChatId) || null;

  // Auto-select first chat if none selected yet
  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      // Prefer unread first, then open
      const firstUnread = chats.find((c) => c.unreadByAdmin);
      const firstOpen = chats.find((c) => c.status === 'open');
      setSelectedChatId(firstUnread ? firstUnread.id : firstOpen ? firstOpen.id : chats[0].id);
    }
  }, [chats, selectedChatId]);

  // Subscribe to messages of selected chat in real time
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const unsub = subscribeToChatMessages(selectedChatId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsub();
  }, [selectedChatId]);

  // Mark as read when admin opens an unread conversation
  useEffect(() => {
    if (selectedChat?.unreadByAdmin) {
      markChatReadByAdmin(selectedChat.id);
    }
  }, [selectedChat?.id, selectedChat?.unreadByAdmin]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!selectedChatId || !replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendAdminMessage(selectedChatId, replyText.trim());
      setReplyText('');
      setTimeout(() => {
        replyInputRef.current?.focus();
      }, 50);
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedChat) return;
    const nextStatus = selectedChat.status === 'open' ? 'closed' : 'open';
    try {
      await updateChatStatus(selectedChat.id, nextStatus);
    } catch (err) {
      console.error('Failed to update chat status:', err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChat) return;
    const confirmed = window.confirm(t('admin.support.deleteMessageConfirm'));
    if (!confirmed) return;

    try {
      setDeletingMessageId(messageId);
      await deleteChatMessage(selectedChat.id, messageId);
    } catch (err: any) {
      console.error('Failed to delete chat message:', err);
      alert(t('admin.support.deleteMessageError', { detail: err?.message || String(err) }));
    } finally {
      setDeletingMessageId(null);
    }
  };

  // Delete entire conversation (conversation document + all messages)
  const handleConfirmDeleteConversation = async () => {
    if (!chatToDelete) return;
    const targetId = chatToDelete.id;
    setIsDeletingConversation(true);

    try {
      // If the admin currently has that conversation open in the message view,
      // close it immediately so the view gracefully reverts to the placeholder
      if (selectedChatId === targetId) {
        setSelectedChatId(null);
        setMessages([]);
      }

      await deleteEntireConversation(targetId);
      setChatToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete entire conversation:', err);
      alert(t('admin.support.deleteChatError', { detail: err?.message || String(err) }));
    } finally {
      setIsDeletingConversation(false);
    }
  };

  // Safeguard: If the selected conversation is removed or deleted from Firestore, reset selection
  useEffect(() => {
    if (selectedChatId && chats.length > 0 && !chats.some((c) => c.id === selectedChatId)) {
      setSelectedChatId(null);
      setMessages([]);
    }
  }, [chats, selectedChatId]);

  // Filter chats by search
  const filteredChats = chats.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.customerName.toLowerCase().includes(q) ||
      (c.customerEmail && c.customerEmail.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const openChats = filteredChats.filter((c) => c.status !== 'closed');
  const closedChats = filteredChats.filter((c) => c.status === 'closed');

  return (
    <div className="bg-white border border-zinc-200 rounded-md shadow-xs overflow-hidden flex flex-col md:flex-row h-[750px] md:h-[700px] max-h-[88vh]">
      {/* Sidebar: Conversation List */}
      <div className="w-full md:w-80 h-72 sm:h-80 md:h-full max-h-[42vh] md:max-h-none border-b md:border-b-0 md:border-e border-zinc-200 flex flex-col min-h-0 bg-zinc-50/60 shrink-0">
        {/* Search header - stays fixed at top */}
        <div className="p-3 border-b border-zinc-200 bg-white shrink-0 sticky top-0 z-20">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.support.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-9 pe-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-800"
            />
          </div>
        </div>

        {/* List of chats - fully scrollable with min-h-0 */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain divide-y divide-zinc-200/70 [scrollbar-width:thin] [scrollbar-color:#d4d4d8_transparent]">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-zinc-300 stroke-[1.5]" />
              {t('admin.support.noChatsFound')}
            </div>
          ) : (
            <>
              {/* Open Conversations Section */}
              <div className="sticky top-0 z-10 p-2.5 bg-zinc-100/95 backdrop-blur-xs border-b border-zinc-200/60 text-[11px] font-semibold text-zinc-600 flex items-center justify-between">
                <span>{t('admin.support.openChatsTitle', { count: formatNumber(openChats.length) })}</span>
              </div>

              {openChats.map((c) => {
                const isSelected = c.id === selectedChatId;
                const isGuest = !c.userId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedChatId(c.id)}
                    className={`group relative w-full p-3.5 text-start flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white border-s-4 border-s-zinc-900 shadow-2xs'
                        : 'hover:bg-zinc-100/80'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-medium text-xs">
                          {c.customerName.charAt(0) || 'U'}
                        </div>
                        {c.unreadByAdmin && (
                          <span className="absolute -top-1 -end-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className={`text-xs truncate ${
                              c.unreadByAdmin ? 'font-bold text-zinc-900' : 'font-medium text-zinc-800'
                            }`}
                          >
                            {c.customerName}
                          </span>
                          <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                            {new Date(c.lastMessageAt).toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              isGuest
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isGuest ? t('admin.support.guestUser') : t('admin.support.memberUser')}
                          </span>
                          {c.unreadByAdmin && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-semibold px-1.5 py-0.2 rounded border border-rose-200">
                              {t('admin.support.newBadge')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete entire conversation button - ALWAYS DIRECTLY VISIBLE */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatToDelete(c);
                      }}
                      title={t('admin.support.deleteChatTitle', { name: c.customerName })}
                      aria-label={t('admin.support.deleteChatAria', { name: c.customerName })}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 transition-colors cursor-pointer shrink-0 shadow-2xs ms-2"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                );
              })}

              {/* Closed Conversations Section */}
              {closedChats.length > 0 && (
                <div className="border-t border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setShowClosedChats(!showClosedChats)}
                    className="w-full p-2.5 bg-zinc-100/95 hover:bg-zinc-200/80 text-[11px] font-semibold text-zinc-600 flex items-center justify-between cursor-pointer sticky top-0 z-10 backdrop-blur-xs transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Archive className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t('admin.support.closedChatsTitle', { count: formatNumber(closedChats.length) })}</span>
                    </span>
                    {showClosedChats ? (
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </button>

                  {showClosedChats && (
                    <div className="max-h-60 overflow-y-auto overscroll-contain divide-y divide-zinc-200/60 bg-zinc-50/40 [scrollbar-width:thin] [scrollbar-color:#d4d4d8_transparent]">
                      {closedChats.map((c) => {
                        const isSelected = c.id === selectedChatId;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedChatId(c.id)}
                            className={`group relative w-full p-3 text-start flex items-center justify-between gap-2.5 opacity-70 hover:opacity-100 transition-all cursor-pointer ${
                              isSelected ? 'bg-white border-s-4 border-s-zinc-400' : 'hover:bg-zinc-100'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs shrink-0">
                                {c.customerName.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-zinc-700 block truncate font-medium">
                                  {c.customerName}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {t('admin.support.closedPrefix')} • {new Date(c.lastMessageAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                                </span>
                              </div>
                            </div>

                            {/* Delete closed conversation button - ALWAYS DIRECTLY VISIBLE */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setChatToDelete(c);
                              }}
                              title={t('admin.support.deleteChatTitle', { name: c.customerName })}
                              aria-label={t('admin.support.deleteChatAria', { name: c.customerName })}
                              className="w-8 h-8 rounded-md flex items-center justify-center text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 transition-colors cursor-pointer shrink-0 shadow-2xs ms-2"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2]" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Area: Message Thread */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        {selectedChat ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 text-gold flex items-center justify-center font-bold text-sm">
                  {selectedChat.customerName.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-zinc-900">{selectedChat.customerName}</h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        selectedChat.userId
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedChat.userId ? t('admin.support.memberUser') : t('admin.support.guestUser')}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        selectedChat.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {selectedChat.status === 'open' ? t('admin.support.chatOpen') : t('admin.support.chatClosed')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                    {selectedChat.customerEmail || t('admin.support.emailNotProvided')} • {t('admin.support.idPrefix')}{' '}
                    {selectedChat.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className="px-3 py-1.5 text-xs font-medium border border-zinc-300 hover:bg-zinc-100 rounded transition-colors cursor-pointer text-zinc-700"
                >
                  {selectedChat.status === 'open' ? t('admin.support.closeChatBtn') : t('admin.support.reopenChatBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setChatToDelete(selectedChat)}
                  className="px-3 py-1.5 text-xs font-medium border border-rose-300 bg-rose-50 hover:bg-rose-600 hover:text-white rounded transition-colors cursor-pointer text-rose-700 flex items-center gap-1.5 shadow-2xs"
                  title={t('admin.support.deleteChatBtn')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('admin.support.deleteChatBtn')}</span>
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ivory">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 text-xs">
                  <MessageSquare className="w-10 h-10 mb-2 stroke-[1.25] text-zinc-300" />
                  <p>{t('admin.support.noMessagesYet')}</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isAdmin = m.senderType === 'admin';
                  const isDeleting = deletingMessageId === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`group flex items-end gap-1.5 w-full ${
                        isAdmin ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {/* Trash button for admin message (appears on left/start side of admin bubble) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(m.id)}
                          disabled={isDeleting}
                          title={t('admin.support.deleteMessageTitle')}
                          aria-label={t('admin.support.deleteMessageAria')}
                          className="opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150 cursor-pointer disabled:opacity-30 shrink-0 mb-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                        </button>
                      )}

                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed transition-opacity ${
                          isAdmin
                            ? 'bg-zinc-900 text-white rounded-be-none shadow-2xs'
                            : 'bg-white border border-zinc-200 text-zinc-900 rounded-bs-none shadow-2xs'
                        } ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                      >
                        <span
                          className={`block text-[10px] font-semibold mb-1 ${
                            isAdmin ? 'text-gold' : 'text-zinc-500'
                          }`}
                        >
                          {isAdmin ? t('admin.support.adminSenderName') : selectedChat.customerName}
                        </span>
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <div
                          className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                            isAdmin ? 'text-white/60' : 'text-zinc-400'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span className="font-mono">
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>

                          {/* Real WhatsApp-style tick for Admin's own sent messages */}
                          {isAdmin && (
                            <span title={m.status === 'seen' ? t('admin.support.statusSeen') : t('admin.support.statusSent')}>
                              {m.status === 'seen' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-white/50 shrink-0" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Trash button for customer message (appears on right/end side of customer bubble) */}
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(m.id)}
                          disabled={isDeleting}
                          title={t('admin.support.deleteMessageTitle')}
                          aria-label={t('admin.support.deleteMessageAria')}
                          className="opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150 cursor-pointer disabled:opacity-30 shrink-0 mb-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Bar */}
            <div
              role="group"
              aria-label={t('admin.support.replyAria')}
              className="p-3 border-t border-zinc-200 bg-white flex items-center gap-2"
            >
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply(e);
                  }
                }}
                placeholder={t('admin.support.replyPlaceholder')}
                disabled={isSending}
                className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-800"
              />
              <button
                type="button"
                onClick={handleSendReply}
                disabled={!replyText.trim() || isSending}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-gold text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('admin.support.sendBtn')}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 p-8">
            <MessageSquare className="w-12 h-12 stroke-[1.25] text-zinc-300 mb-2" />
            <p className="text-sm font-medium text-zinc-600">{t('admin.support.selectChatPrompt')}</p>
            <p className="text-xs text-zinc-400 mt-1">
              {t('admin.support.selectChatSubtext')}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deleting Entire Conversation */}
      {chatToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 text-start border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-base font-bold text-zinc-900">
                  {t('admin.support.deleteModalTitle')}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {t('admin.support.deleteModalCustomer', { name: chatToDelete.customerName })}
                </p>
              </div>
            </div>

            <div className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3.5 rounded border border-zinc-200 mb-5 space-y-1.5">
              <p>
                {t('admin.support.deleteModalWarning', { name: chatToDelete.customerName })}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => !isDeletingConversation && setChatToDelete(null)}
                disabled={isDeletingConversation}
                className="px-4 py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('admin.support.deleteModalCancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteConversation}
                disabled={isDeletingConversation}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingConversation ? (
                  <span>{t('admin.support.deleteModalDeleting')}</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('admin.support.deleteModalConfirm')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
