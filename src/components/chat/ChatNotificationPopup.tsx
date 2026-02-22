'use client';

import React, { useEffect, useState } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ChatNotificationPopup = () => {
  const { setNotificationsEnabled } = useChat();
  const { user } = useAuthStore();
  const { latestMessage } = useChatStore();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (latestMessage && pathname !== '/dashboard/chat' && latestMessage.senderId !== user?.id) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [latestMessage, pathname, user?.id]);

  if (!mounted || pathname === '/dashboard/chat') return null;

  return (
    <AnimatePresence>
      {show && latestMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[9999] w-80"
        >
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="bg-[#14B8A6]/10 px-4 py-2 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#14B8A6]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">New Message</span>
              </div>
              <button 
                onClick={() => setShow(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <Link 
              href={`/dashboard/chat?conv=${latestMessage.conversationId}`}
              className="p-4 flex gap-3 hover:bg-white/5 transition-colors group block"
              onClick={() => setShow(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] flex-shrink-0 flex items-center justify-center text-[#14B8A6] font-bold border border-[#334155]">
                {latestMessage.sender.avatar ? (
                  <img src={latestMessage.sender.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                ) : (
                  latestMessage.sender.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white mb-0.5">{latestMessage.sender.name}</p>
                <p className="text-xs text-gray-400 truncate">{latestMessage.content}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-[#14B8A6]" />
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
