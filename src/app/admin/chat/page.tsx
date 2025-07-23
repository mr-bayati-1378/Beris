'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { MessageCircle, Clock, CheckCircle, X, Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface ChatMessage {
  id: number;
  customerName: string;
  customerPhone: string;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
}

function ChatContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied'>('all');
  
  const searchParams = useSearchParams();
  const highlightedMessageId = searchParams.get('highlight');

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/chat');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    // هر 30 ثانیه یکبار چک کن
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleReply = async () => {
    if (!selectedMessage || !reply.trim()) return;

    try {
      const response = await fetch('/api/admin/chat/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          reply: reply.trim()
        })
      });

      if (response.ok) {
        setReply('');
        fetchMessages(); // بروزرسانی لیست پیام‌ها
      } else {
        alert('خطا در ارسال پاسخ');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('خطا در ارسال پاسخ');
    }
  };

  const updateStatus = async (messageId: number, status: string) => {
    try {
      const response = await fetch('/api/admin/chat/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, status })
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'در انتظار پاسخ';
      case 'replied':
        return 'پاسخ داده شده';
      case 'closed':
        return 'بسته شده';
      default:
        return status;
    }
  };

  const filteredMessages = messages.filter(msg => 
    statusFilter === 'all' || msg.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مدیریت چت</h1>
            <p className="text-gray-600">پیام‌های مشتریان و پاسخ‌ها</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {messages.filter(m => m.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">در انتظار</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {messages.filter(m => m.status === 'replied').length}
            </div>
            <div className="text-sm text-gray-600">پاسخ داده شده</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          همه ({messages.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'pending' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          در انتظار ({messages.filter(m => m.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('replied')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'replied' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          پاسخ داده شده ({messages.filter(m => m.status === 'replied').length})
        </button>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">پیام‌ها</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              هیچ پیامی یافت نشد
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedMessage?.id === message.id
                      ? 'border-blue-500 bg-blue-50'
                      : message.id.toString() === highlightedMessageId
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } cursor-pointer`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{message.customerName}</h3>
                      <p className="text-sm text-gray-600">{message.customerPhone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {getStatusText(message.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 mb-3 line-clamp-3">{message.message}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(message.createdAt).toLocaleDateString('fa-IR')}</span>
                    <div className="flex gap-2">
                      {message.status === 'pending' && (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      {message.status === 'replied' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">پاسخ</h2>
          {selectedMessage ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">{selectedMessage.customerName}</h3>
                <p className="text-sm text-gray-600">{selectedMessage.customerPhone}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                  {getStatusText(selectedMessage.status)}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">پیام مشتری:</h4>
                <p className="bg-gray-50 p-3 rounded-lg text-gray-800">{selectedMessage.message}</p>
              </div>

              {selectedMessage.adminReply && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">پاسخ شما:</h4>
                  <p className="bg-blue-50 p-3 rounded-lg text-gray-800">{selectedMessage.adminReply}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedMessage.repliedAt && new Date(selectedMessage.repliedAt).toLocaleString('fa-IR')}
                    {selectedMessage.repliedBy && ` - توسط ${selectedMessage.repliedBy}`}
                  </p>
                </div>
              )}

              {selectedMessage.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    پاسخ شما:
                  </label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="پاسخ خود را بنویسید..."
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleReply}
                      disabled={!reply.trim()}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                      ارسال پاسخ
                    </button>
                    <button
                      onClick={() => updateStatus(selectedMessage.id, 'closed')}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      بستن بحث
                    </button>
                  </div>
                </div>
              )}

              {selectedMessage.status === 'replied' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'closed')}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    بستن بحث
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">یک پیام را انتخاب کنید تا پاسخ دهید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
} 