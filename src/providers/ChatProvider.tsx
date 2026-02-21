'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '@/lib/api';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  unreadCount: number;
  latestMessage: Message | null;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  refreshUnreadCount: () => Promise<void>;
  joinConversation: (id: string) => void;
  markAsRead: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  emitTyping: (conversationId: string) => void;
  emitStopTyping: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeConvId = searchParams.get('conv');

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await chatApi.getUnreadCount();
      setUnreadCount(res.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = s;

    s.on('connect', () => {
      setIsConnected(true);
      setSocket(s);
      fetchUnreadCount();
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      setSocket(null);
    });

    s.on('online_users_list', (users: string[]) => setOnlineUsers(users));
    s.on('user_online', (userId: string) => setOnlineUsers(prev => Array.from(new Set([...prev, userId]))));
    s.on('user_offline', (userId: string) => setOnlineUsers(prev => prev.filter(id => id !== userId)));

    s.on('message_received', (data: { conversationId: string, message: Message }) => {
      // Update unread count if we are not on the chat page for this conversation
      const isCurrentlyInThisChat = pathname === '/dashboard/chat' && activeConvId === data.conversationId;
      
      if (!isCurrentlyInThisChat) {
        setUnreadCount(prev => prev + 1);
        setLatestMessage(data.message);
      } else {
        // If we are in the chat, mark it as read immediately
        s.emit('mark_as_read', { conversationId: data.conversationId });
      }
    });

    s.on('messages_read', (data: { conversationId: string, readBy: string }) => {
      if (data.readBy === user?.id) {
        fetchUnreadCount();
      }
    });

    return () => {
      s.disconnect();
    };
  }, [token, pathname, activeConvId, user?.id]);

  const joinConversation = (id: string) => socketRef.current?.emit('join_conversation', id);
  const markAsRead = (conversationId: string) => {
    socketRef.current?.emit('mark_as_read', { conversationId });
    // Optimistically update unread count would be hard without knowing how many were unread in this conv
    // So we just re-fetch or rely on the server confirming 'messages_read'
  };
  const sendMessage = (conversationId: string, content: string) => socketRef.current?.emit('send_message', { conversationId, content });
  const emitTyping = (conversationId: string) => socketRef.current?.emit('typing', conversationId);
  const emitStopTyping = (conversationId: string) => socketRef.current?.emit('stop_typing', conversationId);

  return (
    <ChatContext.Provider value={{
      socket,
      isConnected,
      onlineUsers,
      unreadCount,
      latestMessage,
      notificationsEnabled,
      setNotificationsEnabled,
      refreshUnreadCount: fetchUnreadCount,
      joinConversation,
      markAsRead,
      sendMessage,
      emitTyping,
      emitStopTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};
