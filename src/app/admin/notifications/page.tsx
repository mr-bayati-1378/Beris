'use client';

import { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaCheck, FaClock, FaExclamationTriangle, FaInfo, FaCheckCircle } from 'react-icons/fa';

interface Notification {
  id: number;
  type: 'message' | 'system' | 'alert' | 'info';
  title: string;
  content: string;
  sender?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'messages' | 'system'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    // Mock data - باید از API واقعی بیاید
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: 'message',
          title: 'اطلاعیه مهم از مدیریت',
          content: 'لطفا گزارش‌های هفتگی را تا پایان روز آماده کنید و به واحد مالی ارسال نمایید.',
          sender: 'مدیر کل',
          isRead: false,
          priority: 'high',
          createdAt: '1403/01/15 14:30'
        },
        {
          id: 2,
          type: 'system',
          title: 'بک‌آپ خودکار سیستم',
          content: 'بک‌آپ شبانه سیستم با موفقیت انجام شد. تمام داده‌ها محفوظ است.',
          isRead: true,
          priority: 'low',
          createdAt: '1403/01/15 02:00'
        },
        {
          id: 3,
          type: 'alert',
          title: 'هشدار کمبود موجودی',
          content: 'موجودی 5 محصول به حد کمینه رسیده است. لطفا سفارش تامین دهید.',
          isRead: false,
          priority: 'medium',
          createdAt: '1403/01/14 16:45'
        },
        {
          id: 4,
          type: 'message',
          title: 'تغییر ساعات کاری',
          content: 'از فردا ساعات کاری از 8 صبح تا 17 خواهد بود. لطفا این موضوع را در نظر بگیرید.',
          sender: 'مدیر کل',
          isRead: true,
          priority: 'medium',
          createdAt: '1403/01/14 09:15'
        },
        {
          id: 5,
          type: 'info',
          title: 'بروزرسانی سیستم',
          content: 'سیستم با آخرین نسخه بروزرسانی شد. امکانات جدیدی اضافه شده است.',
          isRead: false,
          priority: 'low',
          createdAt: '1403/01/13 11:20'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'messages':
        return notifications.filter(n => n.type === 'message');
      case 'system':
        return notifications.filter(n => n.type === 'system' || n.type === 'alert' || n.type === 'info');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FaEnvelope className="h-5 w-5 text-blue-600" />;
      case 'system':
        return <FaBell className="h-5 w-5 text-gray-600" />;
      case 'alert':
        return <FaExclamationTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <FaInfo className="h-5 w-5 text-green-600" />;
      default:
        return <FaBell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-r-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-r-4 border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-r-4 border-green-500 bg-green-50';
      default:
        return 'border-r-4 border-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'message':
        return 'پیام';
      case 'system':
        return 'سیستم';
      case 'alert':
        return 'هشدار';
      case 'info':
        return 'اطلاعات';
      default:
        return 'عمومی';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaBell className="text-blue-600" />
                اطلاعیه‌ها
              </h1>
              <p className="mt-2 text-gray-600">
                پیام‌ها و اطلاعیه‌های سیستم
                {unreadCount > 0 && (
                  <span className="mr-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {unreadCount} خوانده‌نشده
                  </span>
                )}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaCheckCircle />
                خواندن همه
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'همه', count: notifications.length },
            { key: 'unread', label: 'خوانده‌نشده', count: unreadCount },
            { key: 'messages', label: 'پیام‌ها', count: notifications.filter(n => n.type === 'message').length },
            { key: 'system', label: 'سیستم', count: notifications.filter(n => n.type !== 'message').length }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <span className="mr-1 text-xs">({filterOption.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FaBell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ اطلاعیه‌ای یافت نشد</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'همه اطلاعیه‌ها خوانده شده‌اند' : 'در حال حاضر اطلاعیه‌ای وجود ندارد'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                  !notification.isRead ? getPriorityColor(notification.priority) : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {getTypeLabel(notification.type)}
                          </span>
                          
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <FaClock className="h-3 w-3" />
                              {notification.createdAt}
                            </div>
                            
                            {notification.sender && (
                              <div>
                                فرستنده: <span className="font-medium">{notification.sender}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mr-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="علامت‌گذاری به عنوان خوانده‌شده"
                        >
                          <FaCheck className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف اطلاعیه"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 