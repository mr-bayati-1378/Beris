'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, User, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface ChatMessage {
  id: number;
  message: string;
  status: string;
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
}

export default function ConsultationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasNewReplies, setHasNewReplies] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const fetchChatHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/chat/messages');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.success ? data.messages : []);
        
        // Clear notifications when viewing messages
        if (isOpen) {
          setHasNewReplies(false);
        }
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  }, [user, isOpen]);

  // Load chat history when widget is opened
  useEffect(() => {
    if (isOpen && user) {
      fetchChatHistory();
    }
  }, [isOpen, user, fetchChatHistory]);

  // Auto-refresh messages every 30 seconds when widget is open
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isOpen && user) {
      interval = setInterval(() => {
        fetchChatHistory();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen, user, fetchChatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      });

      if (response.ok) {
        setMessage('');
        fetchChatHistory();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[90] flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 sm:px-4 sm:py-2 text-white shadow-lg transition-all hover:shadow-xl pointer-events-auto ${
          hasNewReplies ? 'animate-bounce' : ''
        }`}
        style={{ touchAction: 'manipulation' }}
      >
        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">مشاوره رایگان</span>
        <span className="text-xs font-medium sm:hidden">مشاوره</span>
        {hasNewReplies && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-20 left-2 right-2 sm:bottom-24 sm:left-6 sm:right-auto z-[95] w-auto sm:w-96 rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">مشاوره رایگان</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white transition-colors hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          {user ? (
            <>
              {/* Chat Messages */}
              <div className="h-64 sm:h-96 overflow-y-auto bg-gray-50 p-3 sm:p-4">
                {chatHistory.length === 0 ? (
                  <div className="mt-8 text-center text-gray-500">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">مکالمه خود را شروع کنید</p>
                    <p className="mt-2 text-xs text-gray-400">کارشناسان ما آماده پاسخگویی هستند</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((msg) => (
                      <div key={msg.id} className="space-y-3">
                        {/* پیام کاربر - سمت چپ */}
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <User size={14} className="text-gray-600" />
                              <span className="text-xs text-gray-600 font-medium">شما</span>
                            </div>
                            <p className="text-sm text-gray-800">{msg.message}</p>
                            <div className="mt-1 text-left">
                              <span className="text-xs text-gray-400">
                                {new Date(msg.createdAt).toLocaleTimeString('fa-IR')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* پاسخ کارشناس - سمت راست */}
                        {msg.adminReply && (
                          <div className="flex justify-end">
                            <div className="max-w-[80%] rounded-lg p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <UserCheck size={14} className="text-blue-100" />
                                <span className="text-xs text-blue-100 font-medium">
                                  {msg.repliedBy || 'کارشناس'}
                                </span>
                              </div>
                              <p className="text-sm text-white">{msg.adminReply}</p>
                              <div className="mt-1 text-right">
                                <span className="text-xs text-blue-100">
                                  {msg.repliedAt && new Date(msg.repliedAt).toLocaleTimeString('fa-IR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send size={16} />
                    )}
                    <span>ارسال</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="mb-4 text-gray-600">
                برای استفاده از مشاوره رایگان، لطفا ابتدا وارد حساب کاربری خود شوید.
              </p>
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <User size={16} />
                ورود به حساب کاربری
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
} 