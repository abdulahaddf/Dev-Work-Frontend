'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';
import { io, Socket } from 'socket.io-client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useChatStore } from '@/store/useChatStore';

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
  const { setConversations, setUnreadCount, updateUnreadCount, addMessage, setTyping, unreadCount } = useChatStore();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const pathnameRef = useRef<string>('');
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeConvId = searchParams.get('conv');

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
    pathnameRef.current = pathname;
  }, [activeConvId, pathname]);

  const fetchUnreadCountFromStore = async () => {
    if (!token) return;
    try {
      await useChatStore.getState().fetchConversations();
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
      fetchUnreadCountFromStore();
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      setSocket(null);
    });

    s.on('online_users_list', (users: string[]) => setOnlineUsers(users));
    s.on('user_online', (userId: string) => setOnlineUsers(prev => Array.from(new Set([...prev, userId]))));
    s.on('user_offline', (userId: string) => setOnlineUsers(prev => prev.filter(id => id !== userId)));

    s.on('new_message', (message: any) => {
      console.log('📩 Socket.IO: new_message received', message);
      addMessage(message);
      
      const isCurrentlyInThisChat = pathnameRef.current === '/dashboard/chat' && activeConvIdRef.current === message.conversationId;
      if (!isCurrentlyInThisChat && notificationsEnabled) {
        toast.success(`New message from ${message.sender.name}: ${message.content.substring(0, 30)}...`, {
          duration: 4000
        });
      }
    });

    s.on('user_typing', (data: { userId: string, conversationId: string }) => {
      setTyping(data.conversationId, true);
    });

    s.on('user_stop_typing', (data: { userId: string, conversationId: string }) => {
      setTyping(data.conversationId, false);
    });

    s.on('message_received', (data: { conversationId: string, message: any }) => {
      console.log('📩 Socket.IO: message_received', data);
      const isCurrentlyInThisChat = pathnameRef.current === '/dashboard/chat' && activeConvIdRef.current === data.conversationId;
      
      if (!isCurrentlyInThisChat) {
        updateUnreadCount(1);
      } else {
        // Even if we missed the room broadcast, we get this via personal user room
        addMessage(data.message);
        s.emit('mark_as_read', { conversationId: data.conversationId });
      }
    });

    s.on('messages_read', (data: { conversationId: string, readBy: string }) => {
      if (data.readBy === user?.id) {
        // Re-fetch to sync accurately
        useChatStore.getState().fetchConversations();
      }
    });

    return () => {
      s.disconnect();
    };
  }, [token, user?.id]);

  const joinConversation = React.useCallback((id: string) => socketRef.current?.emit('join_conversation', id), []);
  
  const markAsRead = React.useCallback((conversationId: string) => {
    socketRef.current?.emit('mark_as_read', { conversationId });
  }, []);
  
  const sendMessage = React.useCallback((conversationId: string, content: string) => {
    socketRef.current?.emit('send_message', { conversationId, content });
  }, []);
  
  const emitTyping = React.useCallback((conversationId: string) => {
    socketRef.current?.emit('typing', conversationId);
  }, []);
  
  const emitStopTyping = React.useCallback((conversationId: string) => {
    socketRef.current?.emit('stop_typing', conversationId);
  }, []);

  const value = React.useMemo(() => ({
    socket,
    isConnected,
    onlineUsers,
    unreadCount,
    notificationsEnabled,
    setNotificationsEnabled,
    refreshUnreadCount: fetchUnreadCountFromStore,
    joinConversation,
    markAsRead,
    sendMessage,
    emitTyping,
    emitStopTyping
  }), [
    socket,
    isConnected,
    onlineUsers,
    unreadCount,
    notificationsEnabled,
    joinConversation,
    markAsRead,
    sendMessage,
    emitTyping,
    emitStopTyping
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
