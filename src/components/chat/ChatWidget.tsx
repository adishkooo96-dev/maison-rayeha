import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../hooks/useI18n';
import { ChatMessage } from '../../types/chat';
import {
  fetchExistingCustomerChat,
  getOrCreateCustomerChat,
  subscribeToChat,
  subscribeToChatMessages,
  sendCustomerMessage,
  markChatReadByCustomer,
  markMessagesSeen,
} from '../../lib/chatApi';
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const ENABLE_SEEN_TICKS = true;

export const ChatWidget: React.FC = () => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { lang } = useI18n();

  const [isOpen, setIsOpen] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState<string>('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Guest onboarding fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [hasEnteredGuestInfo, setHasEnteredGuestInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitializingChatRef = useRef<boolean>(false);
  const hasCheckedExistingRef = useRef<boolean>(false);

  // Safety lock refs for mark-as-seen logic
  const attemptedIdsRef = useRef<Set<string>>(new Set());
  const isWritingRef = useRef<boolean>(false);
  const writeCountRef = useRef<number>(0);

  // Derive unseen admin message IDs and stable string key from local messages state
  const unseenIds = messages
    .filter((m) => m.senderType === 'admin' && m.status === 'sent')
    .map((m) => m.id);
  const unseenKey = unseenIds.join(',');

  // Mark admin messages as seen when customer opens widget and new admin messages arrive
  useEffect(() => {
    // 4. Return immediately if kill-switch is false, widget is closed, or no unseen admin IDs
    if (!ENABLE_SEEN_TICKS || !isOpen || !chatId || unseenIds.length === 0) {
      return;
    }

    // 6. LOCK B (concurrency): return immediately if a write is already in progress
    if (isWritingRef.current) {
      return;
    }

    // 7. LOCK C (hard cap): if session write cap is reached, permanently stop writing
    if (writeCountRef.current >= 10) {
      console.warn('seen-ticks disabled: write cap reached');
      return;
    }

    // 5. LOCK A (per-message limit): filter out IDs already attempted
    const idsToWrite = unseenIds.filter((id) => !attemptedIdsRef.current.has(id));
    if (idsToWrite.length === 0) {
      return;
    }

    // Add remaining IDs to attemptedIdsRef BEFORE writing (guarantees at most once per session)
    idsToWrite.forEach((id) => attemptedIdsRef.current.add(id));

    // 8. Execute single writeBatch updating only status to "seen"
    const markSeen = async () => {
      isWritingRef.current = true;
      try {
        writeCountRef.current += 1;
        const batch = writeBatch(db);
        idsToWrite.forEach((msgId) => {
          const msgRef = doc(db, 'chats', chatId, 'messages', msgId);
          batch.update(msgRef, { status: 'seen' });
        });
        await batch.commit();
      } catch (err) {
        console.warn('[ChatWidget] Could not mark admin messages as seen:', err);
      } finally {
        isWritingRef.current = false;
      }
    };

    markSeen();
  }, [chatId, isOpen, unseenKey]);

  // Rule 1: Generate guestSessionId ONLY ONCE ever, in a useEffect with empty deps []
  useEffect(() => {
    let id = '';
    try {
      id = localStorage.getItem('maison_rayeha_guest_chat_session') || '';
      if (!id) {
        id = 'guest_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
        localStorage.setItem('maison_rayeha_guest_chat_session', id);
      }
    } catch {
      id = 'guest_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    }
    setGuestSessionId(id);
  }, []);

  // Check for existing chat document once guestSessionId is established (read-only, NO writes)
  useEffect(() => {
    if (!guestSessionId) return;
    if (hasCheckedExistingRef.current) return;
    hasCheckedExistingRef.current = true;

    let isMounted = true;
    const checkExisting = async () => {
      try {
        const existing = await fetchExistingCustomerChat({
          userId: user?.uid || null,
          guestSessionId,
        });
        if (isMounted && existing) {
          setChatId(existing.id);
          setHasUnread(Boolean(existing.unreadByCustomer));
          if (existing.customerName && existing.customerName !== 'کاربر مهمان') {
            setHasEnteredGuestInfo(true);
          }
        }
      } catch (err) {
        console.warn('[ChatWidget] Could not check existing chat:', err);
      }
    };
    checkExisting();

    return () => {
      isMounted = false;
    };
  }, [guestSessionId, user?.uid]);

  // Rule 2: onSnapshot for chat conversation updates with minimal STABLE dependency array [chatId]
  useEffect(() => {
    if (!chatId) return;

    const unsub = subscribeToChat(chatId, (updatedChat) => {
      if (!updatedChat) return;
      setHasUnread(Boolean(updatedChat.unreadByCustomer));
    });

    return () => unsub();
  }, [chatId]);

  // Rule 2: onSnapshot for messages with minimal STABLE dependency array [chatId] only
  useEffect(() => {
    if (!chatId) return;

    const unsub = subscribeToChatMessages(chatId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Rule 4: Handle Open/Close via onClick handler (never during render)
  const handleToggleOpen = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    setChatError(null);

    if (nextOpen) {
      setHasUnread(false);

      if (chatId) {
        markChatReadByCustomer(chatId);
      } else if (!isInitializingChatRef.current && guestSessionId) {
        // Create chat document ONLY upon opening panel
        isInitializingChatRef.current = true;
        try {
          const customerName = user
            ? profile?.name || user.displayName || user.email?.split('@')[0] || 'کاربر گرامی'
            : guestName.trim() || undefined;

          const customerEmail = user ? user.email || undefined : guestEmail.trim() || undefined;

          const activeChat = await getOrCreateCustomerChat({
            userId: user ? user.uid : null,
            guestSessionId,
            customerName,
            customerEmail,
          });

          setChatId(activeChat.id);
          if (activeChat.customerName && activeChat.customerName !== 'کاربر مهمان') {
            setHasEnteredGuestInfo(true);
          }
        } catch (err) {
          console.warn('[ChatWidget] Could not initialize chat on open:', err);
        } finally {
          isInitializingChatRef.current = false;
        }
      }
    }
  };

  // Rule 3: Firestore write function ONLY inside event handlers
  const handleSendMessage = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    setChatError(null);
    setIsSending(true);

    try {
      let targetChatId = chatId;

      // If chatId not created yet, create it now
      if (!targetChatId) {
        const customerName = user
          ? profile?.name || user.displayName || user.email?.split('@')[0] || 'کاربر گرامی'
          : guestName.trim() || (lang === 'fa' ? 'کاربر مهمان' : 'Guest Patron');

        const customerEmail = user ? user.email || '' : guestEmail.trim();

        const created = await getOrCreateCustomerChat({
          userId: user ? user.uid : null,
          guestSessionId,
          customerName,
          customerEmail,
        });

        targetChatId = created.id;
        setChatId(created.id);
      }

      await sendCustomerMessage(targetChatId, trimmed, {
        customerName: guestName.trim() || undefined,
        customerEmail: guestEmail.trim() || undefined,
      });

      setInputText('');
      setHasEnteredGuestInfo(true);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const code = err?.code ? `[${err.code}] ` : '';
      const message = err?.message || String(err);
      setChatError(`Error: ${code}${message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Do not render on /admin
  if (location.pathname.includes('/admin')) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-label={
          isOpen
            ? lang === 'fa'
              ? 'بستن گفتگو'
              : 'Close Support Chat'
            : lang === 'fa'
            ? 'گفتگو و پشتیبانی آنلاین'
            : 'Open Support Chat'
        }
        className="fixed bottom-6 end-6 z-40 min-h-[52px] min-w-[52px] h-13 w-13 rounded-full bg-near-black hover:bg-zinc-800 text-gold shadow-xl border border-gold/40 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {isOpen ? (
          <X className="w-5 h-5 stroke-[2] text-gold" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 stroke-[1.75] text-gold" />
            {hasUnread && (
              <span className="absolute -top-1 -end-1 w-3.5 h-3.5 bg-rose-500 border-2 border-near-black rounded-full animate-pulse" />
            )}
          </div>
        )}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={lang === 'fa' ? 'پشتیبانی آنلاین میسون رایحه' : 'Maison Rayeha Concierge Chat'}
          className={`fixed z-40 flex flex-col bg-ivory border border-gold/30 shadow-2xl overflow-hidden
            inset-x-0 bottom-0 h-[85vh] max-h-[580px] rounded-t-2xl sm:rounded-md
            sm:inset-auto sm:bottom-22 sm:end-6 sm:w-[380px] sm:h-[520px]
            animate-in fade-in slide-in-from-bottom-4 duration-200 text-start`}
        >
          {/* Header */}
          <div className="bg-near-black text-ivory p-4 border-b border-gold/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Sparkles className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold font-display tracking-wide text-ivory">
                  {lang === 'fa' ? 'مشاوره اختصاصی میسون رایحه' : 'Maison Rayeha Concierge'}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{lang === 'fa' ? 'پاسخگویی آنلاین کارشناسان' : 'Online & Ready to Assist'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleOpen}
              aria-label={lang === 'fa' ? 'بستن' : 'Close'}
              className="p-1.5 text-ivory/60 hover:text-ivory transition-colors cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ivory">
            {/* Automated Welcome Note */}
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center shrink-0 mt-0.5 text-xs font-serif font-bold">
                M
              </div>
              <div className="bg-ivory-surface border border-border/80 p-3 rounded-md shadow-2xs text-xs text-near-black leading-relaxed">
                <p>
                  {lang === 'fa'
                    ? 'درود بر شما؛ به خانه عطر میسون رایحه خوش آمدید. برای راهنمایی درباره روایح نیش، نت‌ها یا استعلام سفارش‌ها در خدمت شما هستیم.'
                    : 'Greetings and welcome to Maison Rayeha. How may our fragrance specialists assist your sensory journey today?'}
                </p>
                <div className="mt-1 text-[10px] text-muted flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-gold-dark" />
                  <span>{lang === 'fa' ? 'مشاوره تخصصی و اصالت عطر' : 'Official Haute Parfumerie'}</span>
                </div>
              </div>
            </div>

            {/* Guest details prompt if user is guest and hasn't started */}
            {!user && !hasEnteredGuestInfo && messages.length === 0 && (
              <div className="p-3 bg-gold/10 border border-gold/30 rounded-md text-xs space-y-2">
                <span className="block font-medium text-near-black text-[11px]">
                  {lang === 'fa'
                    ? 'جهت پیگیری بهتر پاسخ‌ها (اختیاری):'
                    : 'For tailored follow-up (optional):'}
                </span>
                <input
                  type="text"
                  placeholder={lang === 'fa' ? 'نام شما' : 'Your Name'}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-border rounded-xs focus:outline-none focus:border-gold"
                />
                <input
                  type="email"
                  placeholder={lang === 'fa' ? 'ایمیل شما (اختیاری)' : 'Your Email (optional)'}
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-border rounded-xs focus:outline-none focus:border-gold"
                />
              </div>
            )}

            {/* Render conversation messages */}
            {messages.map((m) => {
              const isCustomer = m.senderType === 'customer';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed ${
                      isCustomer
                        ? 'bg-near-black text-ivory rounded-be-none shadow-2xs'
                        : 'bg-white border border-border text-near-black rounded-bs-none shadow-2xs'
                    }`}
                  >
                    {!isCustomer && (
                      <span className="block text-[10px] font-semibold text-gold-dark mb-1">
                        {lang === 'fa' ? 'کارشناس میسون رایحه' : 'Maison Concierge'}
                      </span>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                        isCustomer ? 'text-ivory/60' : 'text-zinc-500'
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

                      {/* [Safety net: previous static double-tick code]
                      <CheckCheck
                        className={`w-3 h-3 shrink-0 ${
                          isCustomer ? 'text-gold/80' : 'text-gold-dark'
                        }`}
                      />
                      */}

                      {/* Real WhatsApp-style tick for customer's own sent messages */}
                      {isCustomer && (
                        <span title={m.status === 'seen' ? (lang === 'fa' ? 'دیده شد' : 'Seen') : (lang === 'fa' ? 'ارسال شد' : 'Sent')}>
                          {m.status === 'seen' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-gold/90 shrink-0" />
                          ) : (
                            <Check className="w-3 h-3 text-ivory/50 shrink-0" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Visible Error Banner for Debugging */}
          {chatError && (
            <div className="mx-3 my-2 p-2.5 bg-rose-50 border border-rose-300 rounded text-rose-800 text-[11px] font-mono break-all flex items-start gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-[10px]">خطای ارسال / Write Error:</span>
                <span>{chatError}</span>
              </div>
              <button
                type="button"
                onClick={() => setChatError(null)}
                className="p-0.5 text-rose-500 hover:text-rose-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <div
            role="group"
            aria-label={lang === 'fa' ? 'ارسال پیام' : 'Send message input'}
            className="p-3 bg-white border-t border-border flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder={lang === 'fa' ? 'پیام خود را بنویسید...' : 'Type your inquiry...'}
              disabled={isSending}
              className="flex-1 px-3 py-2 text-xs bg-ivory border border-border rounded-xs focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-near-black"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              aria-label={lang === 'fa' ? 'ارسال پیام' : 'Send message'}
              className="min-h-[38px] min-w-[38px] px-3 py-2 bg-near-black hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-gold rounded-xs flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Send className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
