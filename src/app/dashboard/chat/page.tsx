'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';
import { chatApi } from '@/lib/api';
import { useSocket } from '@/lib/useSocket';
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
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  updatedAt: string;
  otherParticipant: {
    id: string;
    name: string;
    avatar: string | null;
    roles: string[];
  };
  lastMessage: any;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
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
    isConnected, 
    onlineUsers, 
    joinConversation, 
    sendMessage,
    emitTyping,
    emitStopTyping 
  } = useSocket();

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

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      joinConversation(activeConv.id);
    }
  }, [activeConv]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      if (activeConv && msg.conversationId === activeConv.id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      
      // Update conversations list with last message
      setConversations((prev) => 
        prev.map(c => c.id === msg.conversationId ? { ...c, lastMessage: msg, updatedAt: msg.createdAt } : c)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
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

    sendMessage(activeConv.id, newMessage.trim());
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
            <div className="flex items-center justify-center h-20">
              <div className="w-5 h-5 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No chats yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-[#1E293B]/50 ${activeConv?.id === conv.id ? 'bg-[#1E293B]' : ''}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-[#334155] overflow-hidden flex items-center justify-center text-[#14B8A6] font-bold">
                    {conv.otherParticipant.avatar ? (
                      <img src={conv.otherParticipant.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      conv.otherParticipant.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {onlineUsers.includes(conv.otherParticipant.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0F172A] rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{conv.otherParticipant.name}</h3>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-500">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#020617]/30 ${!activeConv ? 'hidden md:flex items-center justify-center text-gray-500' : 'flex'}`}>
        {!activeConv ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#1E293B] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-[#14B8A6] opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Select a conversation</h3>
            <p className="text-sm">Choose a chat to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="md:hidden p-2 text-gray-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-[#334155] flex items-center justify-center text-[#14B8A6] font-bold">
                    {activeConv.otherParticipant.avatar ? (
                      <img src={activeConv.otherParticipant.avatar} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      activeConv.otherParticipant.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {onlineUsers.includes(activeConv.otherParticipant.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0F172A] rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none mb-1">{activeConv.otherParticipant.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                      {onlineUsers.includes(activeConv.otherParticipant.id) ? 'Online' : 'Offline'}
                    </span>
                    {otherUserTyping && (
                      <span className="text-[10px] text-gray-500 italic">• typing...</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] group`}>
                      {!isMe && (
                        <span className="text-[10px] text-gray-500 ml-3 mb-1 block">
                          {msg.sender.name}
                        </span>
                      )}
                      <div className={`
                        px-4 py-2 rounded-2xl text-sm
                        ${isMe ? 'bg-[#0F766E] text-white rounded-tr-none' : 'bg-[#1E293B] text-gray-200 rounded-tl-none border border-[#334155]'}
                      `}>
                        {msg.content}
                      </div>
                      <span className={`text-[10px] text-gray-600 mt-1 block px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#1E293B]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] transition-colors"
                  value={newMessage}
                  onChange={handleTypingInput}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 bg-[#0F766E] hover:bg-[#14B8A6] disabled:opacity-50 disabled:hover:bg-[#0F766E] text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-[#0F766E]/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
