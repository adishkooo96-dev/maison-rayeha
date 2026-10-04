export type ChatStatus = 'open' | 'closed';
export type MessageSenderType = 'customer' | 'admin';
export type MessageDeliveryStatus = 'sent' | 'seen';

export interface ChatMessage {
  id: string;
  senderType: MessageSenderType;
  text: string;
  createdAt: string;
  status?: MessageDeliveryStatus; // 'sent' | 'seen' (defaults to 'sent')
}

export interface ChatConversation {
  id: string;
  userId: string | null;
  guestSessionId: string;
  customerName: string;
  customerEmail?: string;
  status: ChatStatus;
  lastMessageAt: string;
  unreadByAdmin: boolean;
  unreadByCustomer: boolean;
  createdAt: string;
}
