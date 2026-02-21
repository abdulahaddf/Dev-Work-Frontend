'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';
import { chatApi } from '@/lib/api';
import { useChat } from '@/providers/ChatProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  User, 
  Search,
  MoreVertical,
  ArrowLeft,
  Circle
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';

const ConvSkeleton = () => (
  <div className="p-4 flex items-center gap-3 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-[#1E293B]" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-[#1E293B] rounded w-1/3" />
      <div className="h-2 bg-[#1E293B] rounded w-2/3" />
    </div>
  </div>
);

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

export default function ChatPage() {
  const { user } = useAuthStore();
  const { 
    socket,
    onlineUsers,
    unreadCount,
    joinConversation, 
    sendMessage,
    emitTyping,
    emitStopTyping,
    markAsRead,
    refreshUnreadCount
  } = useChat();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const convIdFromQuery = searchParams.get('conv');

  useEffect(() => {
    fetchConversations();
  }, [convIdFromQuery]); // Re-fetch or check when query changes

  useEffect(() => {
    if (conversations.length > 0 && convIdFromQuery && !activeConv) {
      const target = conversations.find(c => c.id === convIdFromQuery);
      if (target) setActiveConv(target);
    }
  }, [conversations, convIdFromQuery]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      joinConversation(activeConv.id);
      markAsRead(activeConv.id);
    }
  }, [activeConv]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(msg => {
      const date = format(new Date(msg.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      if (activeConv && msg.conversationId === activeConv.id) {
        setMessages((prev) => {
          // If this message was sent by me, it might already be in the list as 'sending'
          const existingIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === msg.content);
          if (existingIndex !== -1) {
            const newMsgs = [...prev];
            newMsgs[existingIndex] = { ...msg, status: 'sent' };
            return newMsgs;
          }
          return [...prev, { ...msg, status: 'sent' }];
        });

        // Mark as read if not from me
        if (msg.senderId !== user?.id) {
          markAsRead(msg.conversationId);
        }

        scrollToBottom();
      }
      
      // Update conversations list with last message and unread count
      setConversations((prev) => 
        prev.map(c => {
          if (c.id === msg.conversationId) {
            const isMe = msg.senderId === user?.id;
            const isActive = activeConv?.id === c.id;
            return { 
              ...c, 
              lastMessage: msg, 
              updatedAt: msg.createdAt,
              unreadCount: (isMe || isActive) ? c.unreadCount : c.unreadCount + 1
            };
          }
          return c;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    };

    const handleTyping = (data: { userId: string, conversationId: string }) => {
      if (activeConv && data.conversationId === activeConv.id && data.userId !== user?.id) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = (data: { userId: string, conversationId: string }) => {
      if (activeConv && data.conversationId === activeConv.id && data.userId !== user?.id) {
        setOtherUserTyping(false);
      }
    };

    const handleMessagesRead = (data: { conversationId: string, readBy: string, readAt: string }) => {
      if (activeConv && data.conversationId === activeConv.id) {
        setMessages((prev) => 
          prev.map(m => m.senderId === user?.id && !m.readAt ? { ...m, readAt: data.readAt } : m)
        );
      }
    };

    const handleMessageReceived = (data: { conversationId: string, message: Message }) => {
      // The provider handles global notifications
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message_received', handleMessageReceived);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message_received', handleMessageReceived);
    };
  }, [socket, activeConv, user]);

  const fetchConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data.data);
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const res = await chatApi.getMessages(id);
      setMessages(res.data.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const content = newMessage.trim();
    
    // Create optimistic message
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConv.id,
      content,
      createdAt: new Date().toISOString(),
      senderId: user?.id || '',
      sender: {
        id: user?.id || '',
        name: user?.name || '',
        avatar: (user as any)?.avatar || null,
      },
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    sendMessage(activeConv.id, content);
    setNewMessage('');
    emitStopTyping(activeConv.id);
  };

  const handleTypingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!activeConv) return;
    
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(activeConv.id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(activeConv.id);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(c => 
    c.otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-[#0F172A]/50 backdrop-blur-xl border border-[#1E293B] rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-[#1E293B] flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#1E293B]">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-[#1E293B] border border-[#334155] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <>
              <ConvSkeleton />
              <ConvSkeleton />
              <ConvSkeleton />
            </>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-[#1E293B] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#334155]/50">
                <MessageSquare className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">No conversations found</p>
              {searchTerm && <p className="text-xs mt-1">Try a different search term</p>}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`p-4 flex items-center gap-3 cursor-pointer border-l-2 transition-all ${
                  activeConv?.id === conv.id 
                    ? 'bg-[#14B8A6]/5 border-[#14B8A6]' 
                    : 'border-transparent hover:bg-[#1E293B]/50'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] overflow-hidden flex items-center justify-center text-[#14B8A6] font-bold">
                    {conv.otherParticipant.avatar ? (
                      <img src={conv.otherParticipant.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      conv.otherParticipant.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {onlineUsers.includes(conv.otherParticipant.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0F172A] rounded-full shadow-lg" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                                <h4 className={`text-[13px] group-hover:text-white transition-colors truncate ${conv.unreadCount > 0 ? 'font-bold text-white' : 'font-medium text-gray-200'}`}>
                                  {conv.otherParticipant.name}
                                </h4>
                                <span className={`text-[10px] ${conv.unreadCount > 0 ? 'text-[#14B8A6] font-bold' : 'text-gray-500'}`}>
                                  {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className={`text-[11px] truncate flex-1 ${conv.unreadCount > 0 ? 'text-gray-200 font-semibold' : 'text-gray-500'}`}>
                                  {conv.lastMessage?.content || 'No messages yet'}
                                </p>
                                {conv.unreadCount > 0 && (
                                  <div className="w-4 h-4 rounded-full bg-[#14B8A6] flex items-center justify-center">
                                    <span className="text-[9px] text-white font-bold">{conv.unreadCount}</span>
                                  </div>
                                )}
                              </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-gradient-to-b from-[#020617]/50 to-[#0F172A]/30 ${!activeConv ? 'hidden md:flex items-center justify-center text-gray-500' : 'flex'}`}>
        {!activeConv ? (
          <div className="text-center p-8 max-w-sm">
            <div className="w-24 h-24 bg-[#14B8A6]/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-[#14B8A6]/10 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-16 h-16 bg-[#0F172A] border border-[#14B8A6]/20 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-[#14B8A6] opacity-50" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Private Messaging</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Select a conversation from the list to view project details or coordinate with team members.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#1E293B]/50 flex items-center justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] flex items-center justify-center text-[#14B8A6] font-bold">
                    {activeConv.otherParticipant.avatar ? (
                      <img src={activeConv.otherParticipant.avatar} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      activeConv.otherParticipant.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {onlineUsers.includes(activeConv.otherParticipant.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0F172A] rounded-full shadow-lg" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none mb-1.5 flex items-center gap-2">
                    {activeConv.otherParticipant.name}
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#14B8A6]/10 text-[#14B8A6] rounded uppercase tracking-tighter">
                      {activeConv.otherParticipant.roles[0] || 'User'}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(activeConv.otherParticipant.id) ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                        {onlineUsers.includes(activeConv.otherParticipant.id) ? 'Active Now' : 'Offline'}
                      </span>
                    </span>
                    {otherUserTyping && (
                      <span className="text-[10px] text-[#14B8A6] italic animate-pulse">typing...</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-gray-500 hover:text-white transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 custom-scrollbar space-y-8">
              {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                <div key={date} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#1E293B]" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                      {getDateLabel(date)}
                    </span>
                    <div className="h-px flex-1 bg-[#1E293B]" />
                  </div>

                  {msgs.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] sm:max-w-[70%] group`}>
                          <div className={`
                            px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed relative
                            ${isMe 
                              ? 'bg-[#14B8A6] text-white rounded-tr-none shadow-lg shadow-[#14B8A6]/10' 
                              : 'bg-[#1E293B] text-gray-200 rounded-tl-none border border-[#334155]'}
                          `}>
                            {msg.content}
                            <div className="flex items-center justify-between gap-2 mt-1.5 ">
                              <span className={`
                                text-[9px] block font-medium opacity-50
                              `}>
                                {format(new Date(msg.createdAt), 'h:mm a')}
                              </span>
                              {isMe && (
                                <span className="text-[10px]">
                                  {msg.status === 'sending' ? (
                                    <span className="opacity-40 animate-pulse">
                                      <Circle className="w-2.5 h-2.5" />
                                    </span>
                                  ) : msg.readAt ? (
                                    <span className="text-white opacity-80 flex">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-200">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                        <polyline points="20 11 11 20 6 15"></polyline>
                                      </svg>
                                    </span>
                                  ) : (
                                    <span className="opacity-40">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 border-t border-[#1E293B]/50 bg-[#0F172A]/50">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1E293B] border border-[#334155] rounded-[1.25rem] px-5 py-3.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6]/20 transition-all"
                  value={newMessage}
                  onChange={handleTypingInput}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-[#14B8A6]/10"
                >
                  <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
