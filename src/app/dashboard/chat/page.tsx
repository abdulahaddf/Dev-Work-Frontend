'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useChat } from '@/providers/ChatProvider';
import { useChatStore } from '@/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Search,
  MoreVertical,
  ArrowLeft,
  Circle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
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

const MessageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-start">
      <div className="w-2/3 h-12 bg-[#1E293B] animate-pulse rounded-2xl rounded-tl-none" />
    </div>
    <div className="flex justify-end">
      <div className="w-1/2 h-10 bg-[#14B8A6]/20 animate-pulse rounded-2xl rounded-tr-none" />
    </div>
    <div className="flex justify-start">
      <div className="w-1/3 h-8 bg-[#1E293B] animate-pulse rounded-2xl rounded-tl-none" />
    </div>
  </div>
);

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

function ChatContent() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { 
    socket,
    onlineUsers = [],
    joinConversation, 
    sendMessage,
    emitTyping,
    emitStopTyping,
    markAsRead
  } = useChat();

  const conversations = useChatStore(state => state.conversations);
  const messages = useChatStore(state => state.messages);
  const fetchConversations = useChatStore(state => state.fetchConversations);
  const fetchMessages = useChatStore(state => state.fetchMessages);
  const nextCursor = useChatStore(state => state.nextCursor);
  const messagesLoading = useChatStore(state => state.loading);
  const typingUsers = useChatStore(state => state.typingUsers);

  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const otherUserTyping = activeConv ? (typingUsers[activeConv.id] || false) : false;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const convIdFromQuery = searchParams.get('conv');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const init = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };
    init();
  }, [fetchConversations, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (conversations.length > 0 && convIdFromQuery) {
      if (!activeConv || activeConv.id !== convIdFromQuery) {
        const target = conversations.find(c => c.id === convIdFromQuery);
        if (target) {
          setActiveConv(target);
          setIsTyping(false);
        }
      }
    }
  }, [conversations, convIdFromQuery, activeConv, mounted]);

  // Effect to handle joining a conversation and fetching its initial messages
  useEffect(() => {
    if (!mounted || !activeConv?.id) return;
    
    console.log('🔄 Joining conversation room:', activeConv.id);
    joinConversation(activeConv.id);
    markAsRead(activeConv.id);
    fetchMessages(activeConv.id);
  }, [activeConv?.id, fetchMessages, mounted, joinConversation, markAsRead]);

  // Effect to handle cleaning up the store when no conversation is active
  useEffect(() => {
    if (!mounted) return;
    if (!activeConv && (messages.length > 0 || nextCursor)) {
      console.log('🧹 Cleaning up chat store');
      useChatStore.getState().resetChat();
    }
  }, [activeConv, mounted, messages.length, nextCursor]);

  const groupedMessages = React.useMemo(() => {
    console.log('🖼️ [UI] Grouping', messages?.length || 0, 'messages for display');
    const groups: { [key: string]: Message[] } = {};
    if (!Array.isArray(messages)) return groups;
    
    // We reverse the messages once here for grouping
    const reversedMessages = [...messages].reverse();
    
    reversedMessages.forEach(msg => {
      try {
        const date = format(new Date(msg.createdAt), 'yyyy-MM-dd');
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
      } catch (e) {
        console.error('❌ [UI] Invalid date in message', msg);
      }
    });
    return groups;
  }, [messages]);

  const getDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const handleLoadMore = () => {
    if (activeConv && nextCursor && !messagesLoading) {
      fetchMessages(activeConv.id, nextCursor);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const content = newMessage.trim();
    
    const optimisticMsg: any = {
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
    
    useChatStore.getState().addMessage(optimisticMsg);
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

  const filteredConversations = React.useMemo(() => 
    (conversations || []).filter(c => 
      c.otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [conversations, searchTerm]
  );

  if (!mounted) return (
    <div className="h-[calc(100vh-8rem)] flex bg-[#0F172A]/50 backdrop-blur-xl border border-[#1E293B] rounded-2xl overflow-hidden">
      <div className="w-80 border-r border-[#1E293B] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[#1E293B]">
          <div className="h-8 bg-[#1E293B] rounded-lg w-1/2 mb-4 animate-pulse" />
          <div className="h-10 bg-[#1E293B] rounded-xl w-full animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          <ConvSkeleton />
          <ConvSkeleton />
          <ConvSkeleton />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-white opacity-20 animate-pulse flex flex-col items-center gap-4">
          <MessageSquare className="w-12 h-12" />
          <span className="text-sm font-medium tracking-wider uppercase">Initializing Chat...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-[#0F172A]/50 backdrop-blur-xl border border-[#1E293B] rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-[#1E293B] flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#1E293B]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            {conversations.length > 0 && (
              <span className="px-2 py-0.5 bg-[#14B8A6]/10 text-[#14B8A6] text-[10px] font-bold rounded-full">
                {conversations.length}
              </span>
            )}
          </div>
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
                  <p className="text-[11px] min-h-[14px]">
                    {otherUserTyping ? (
                      <span className="text-[#14B8A6] font-bold flex items-center gap-1.5 animate-pulse">
                        <span className="flex gap-1">
                          <span className="w-1 h-1 bg-[#14B8A6] rounded-full"></span>
                          <span className="w-1 h-1 bg-[#14B8A6] rounded-full opacity-60"></span>
                          <span className="w-1 h-1 bg-[#14B8A6] rounded-full opacity-30"></span>
                        </span>
                        typing...
                      </span>
                    ) : (
                      <span className={`leading-none font-medium ${onlineUsers.includes(activeConv.otherParticipant.id) ? 'text-emerald-500/80' : 'text-gray-500'}`}>
                        {onlineUsers.includes(activeConv.otherParticipant.id) ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </p>
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
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 custom-scrollbar space-y-8 flex flex-col-reverse relative">
              <div ref={messagesEndRef} />
              
              {messagesLoading && messages.length === 0 ? (
                <div className="absolute inset-0 p-6">
                  <MessageSkeleton />
                  <div className="mt-8">
                    <MessageSkeleton />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-60 py-20">
                  <div className="w-20 h-20 bg-[#1E293B] rounded-full flex items-center justify-center mb-4 border border-[#334155]/30">
                    <MessageSquare className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="text-sm font-medium">No messages in this conversation yet</p>
                  <p className="text-xs mt-1">Start the conversation by typing below</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date} className="space-y-6 flex flex-col-reverse">
                    {msgs.map((msg: any) => {
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
                    
                    <div className="flex items-center gap-4 my-4">
                      <div className="h-px flex-1 bg-[#1E293B]" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                        {getDateLabel(date)}
                      </span>
                      <div className="h-px flex-1 bg-[#1E293B]" />
                    </div>
                  </div>
                ))
              )}

              {nextCursor && (
                <button 
                  onClick={handleLoadMore}
                  disabled={messagesLoading}
                  className="mx-auto text-xs text-[#14B8A6] font-bold py-2 px-4 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/5 hover:bg-[#14B8A6]/10 transition-colors disabled:opacity-50 my-4"
                >
                  {messagesLoading ? 'Loading...' : 'Load older messages'}
                </button>
              )}
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

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-8rem)] flex bg-[#0F172A]/50 backdrop-blur-xl border border-[#1E293B] rounded-2xl items-center justify-center">
        <div className="text-white opacity-20 animate-pulse">Loading Chat...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
