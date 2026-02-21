'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { token } = useAuthStore();
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    
    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = s;

    s.on('connect', () => {
      console.log('🔌 Connected to socket server');
      setIsConnected(true);
      setSocket(s);
    });

    s.on('disconnect', () => {
      console.log('🔌 Disconnected from socket server');
      setIsConnected(false);
      setSocket(null);
    });

    s.on('online_users_list', (users: string[]) => {
      setOnlineUsers(users);
    });

    s.on('user_online', (userId: string) => {
      setOnlineUsers((prev) => Array.from(new Set([...prev, userId])));
    });

    s.on('user_offline', (userId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      if (s) {
        s.disconnect();
      }
    };
  }, [token]);

  const joinConversation = (id: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', id);
    }
  };

  const markAsRead = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_as_read', { conversationId });
    }
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', { conversationId, content });
    }
  };

  const emitTyping = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', conversationId);
    }
  };

  const emitStopTyping = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', conversationId);
    }
  };

  return {
    socket,
    isConnected,
    onlineUsers,
    joinConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markAsRead,
  };
};
