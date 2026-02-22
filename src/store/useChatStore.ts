import { create } from 'zustand';
import { chatApi } from '@/lib/api';

interface Message {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
  status?: 'sending' | 'sent' | 'error';
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Conversation {
  id: string;
  updatedAt: string;
  otherParticipant: {
    id: string;
    name: string;
    avatar: string | null;
    roles: string[];
  };
  unreadCount: number;
  lastMessage: any;
}

interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  unreadCount: number;
  nextCursor: string | null;
  loading: boolean;
  typingUsers: Record<string, boolean>;
  latestMessage: Message | null;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  fetchConversations: () => Promise<void>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  fetchMessages: (conversationId: string, cursor?: string) => Promise<void>;
  setUnreadCount: (count: number) => void;
  updateUnreadCount: (diff: number) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  markMessagesAsRead: (conversationId: string, readAt: string) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: [],
  unreadCount: 0,
  nextCursor: null,
  loading: false,
  typingUsers: {},
  latestMessage: null,

  setConversations: (conversations) => set({ conversations: conversations || [] }),
  
  fetchConversations: async () => {
    try {
      const res = await chatApi.getConversations();
      set({ conversations: res.data.data });
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  },

  setMessages: (messages) => set({ messages: messages || [] }),

  addMessage: (message) => set((state) => {
    if (!message) return state;
    const currentMessages = state.messages || [];
    
    // If message already exists (e.g. from optimistic update), update it
    const existingIndex = currentMessages.findIndex(m => m.id === message.id || (m.id.startsWith('temp-') && m.content === message.content));
    if (existingIndex !== -1) {
      const newMessages = [...currentMessages];
      newMessages[existingIndex] = { ...message, status: 'sent' };
      return { messages: newMessages };
    }
    return { 
      messages: [...currentMessages, { ...message, status: 'sent' }],
      latestMessage: message
    };
  }),

  fetchMessages: async (conversationId: string, cursor?: string) => {
    set({ loading: true });
    try {
      const res = await chatApi.getMessages(conversationId, cursor);
      const data = res.data?.data;
      
      const { messages = [], nextCursor = null } = data || {};
      
      set((state) => ({
        messages: cursor ? [...(messages || []), ...(state.messages || [])] : (messages || []),
        nextCursor: nextCursor || null,
        loading: false
      }));
    } catch (err) {
      console.error('❌ [Store] Failed to fetch messages', err);
      set({ loading: false });
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),
  
  updateUnreadCount: (diff) => set((state) => ({ unreadCount: Math.max(0, state.unreadCount + diff) })),

  setTyping: (conversationId, isTyping) => set((state) => ({
    typingUsers: { ...state.typingUsers, [conversationId]: isTyping }
  })),

  markMessagesAsRead: (conversationId, readAt) => set((state) => ({
    messages: (state.messages || []).map(m =>
      m.conversationId === conversationId && !m.readAt
        ? { ...m, readAt }
        : m
    )
  })),

  resetChat: () => set({ messages: [], nextCursor: null, typingUsers: {}, latestMessage: null })
}));
