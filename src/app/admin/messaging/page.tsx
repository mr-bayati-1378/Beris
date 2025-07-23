'use client';

import { useState, useEffect } from 'react';
import { FaPaperPlane, FaUsers, FaEnvelope, FaCheck, FaClock, FaTrash } from 'react-icons/fa';

interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  adminRole: {
    name: string;
    displayName: string;
  };
}

interface Message {
  id: number;
  title: string;
  content: string;
  recipients: string[];
  sentAt: string;
  readBy: number[];
}

export default function AdminMessaging() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
    fetchSentMessages();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/users?adminsOnly=true');
      if (response.ok) {
        const data = await response.json();
        // فیلتر کردن مدیرکل از لیست گیرندگان
        const filteredAdmins = data.users?.filter((admin: Admin) => admin.adminRole?.name !== 'admin') || [];
        setAdmins(filteredAdmins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchSentMessages = async () => {
    // Mock data - باید از API واقعی بیاید
    setSentMessages([
      {
        id: 1,
        title: 'اطلاعیه مهم',
        content: 'لطفا گزارش‌های هفتگی را آماده کنید',
        recipients: ['فروش', 'انبار'],
        sentAt: '1403/01/15 14:30',
        readBy: [2, 3]
      },
      {
        id: 2,
        title: 'تغییر ساعات کاری',
        content: 'از فردا ساعات کاری تغییر خواهد کرد',
        recipients: ['همه'],
        sentAt: '1403/01/14 09:15',
        readBy: [2, 3, 4, 5]
      }
    ]);
  };

  const handleRecipientToggle = (adminId: number) => {
    setSelectedRecipients(prev =>
      prev.includes(adminId)
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  const selectAllRecipients = () => {
    if (selectedRecipients.length === admins.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(admins.map(admin => admin.id));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageTitle.trim() || !messageContent.trim() || selectedRecipients.length === 0) {
      alert('لطفا تمام فیلدها را پر کنید و حداقل یک گیرنده انتخاب کنید');
      return;
    }

    setLoading(true);
    
    try {
      // Mock sending - باید به API واقعی ارسال شود
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // اضافه کردن پیام به لیست ارسال شده
      const newMessage: Message = {
        id: Date.now(),
        title: messageTitle,
        content: messageContent,
        recipients: selectedRecipients.map(id => {
          const admin = admins.find(a => a.id === id);
          return admin?.adminRole?.displayName || 'نامشخص';
        }),
        sentAt: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
        readBy: []
      };
      
      setSentMessages(prev => [newMessage, ...prev]);
      
      // پاک کردن فرم
      setMessageTitle('');
      setMessageContent('');
      setSelectedRecipients([]);
      
      alert('پیام با موفقیت ارسال شد');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('خطا در ارسال پیام');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleName: string) => {
    const colors = {
      sales: 'bg-blue-100 text-blue-800',
      finance: 'bg-green-100 text-green-800',
      warehouse: 'bg-purple-100 text-purple-800',
      supply: 'bg-orange-100 text-orange-800',
    };
    return colors[roleName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">پیام‌رسانی ادمین</h1>
          <p className="mt-2 text-gray-600">ارسال پیام و اطلاعیه به سایر مدیران سیستم</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Message Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FaEnvelope className="text-blue-600" />
                ارسال پیام جدید
              </h2>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-6">
              {/* Recipients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <FaUsers className="inline ml-1" />
                    گیرندگان
                  </label>
                  <button
                    type="button"
                    onClick={selectAllRecipients}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedRecipients.length === admins.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
                  </button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {admins.map(admin => (
                    <label key={admin.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(admin.id)}
                        onChange={() => handleRecipientToggle(admin.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.adminRole?.name)}`}>
                            {admin.adminRole?.displayName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{admin.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
                
                {selectedRecipients.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedRecipients.length} نفر انتخاب شده
                  </p>
                )}
              </div>

              {/* Message Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان پیام
                </label>
                <input
                  type="text"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="عنوان پیام خود را وارد کنید"
                  required
                />
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  متن پیام
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="متن پیام خود را با جزئیات کامل بنویسید..."
                  required
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    ارسال پیام
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sent Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">پیام‌های ارسال شده</h2>
              <p className="text-sm text-gray-600">تاریخچه پیام‌های ارسالی شما</p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sentMessages.length === 0 ? (
                <div className="text-center py-8">
                  <FaEnvelope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">هیچ پیامی ارسال نشده</p>
                </div>
              ) : (
                sentMessages.map(message => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{message.title}</h3>
                      <button className="text-gray-400 hover:text-red-600">
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{message.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <FaClock className="h-3 w-3" />
                        {message.sentAt}
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheck className="h-3 w-3" />
                        {message.readBy.length} نفر خوانده
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">گیرندگان:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.recipients.map((recipient, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {recipient}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 