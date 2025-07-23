'use client';

import { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaEnvelope, 
  FaCheck, 
  FaClock, 
  FaExclamationTriangle, 
  FaSpinner,
  FaTrash,
  FaEye,
  FaFilter,
  FaSearch,
  FaBox,
  FaWarehouse,
  FaShippingFast,
  FaImage,
  FaInfoCircle
} from 'react-icons/fa';

interface Notification {
  id: number;
  type: 'message' | 'inventory' | 'shipping' | 'product' | 'system' | 'alert';
  title: string;
  message: string;
  sender?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  actionUrl?: string;
}

export default function WarehouseNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications?role=warehouse');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Mock data for demonstration
      setNotifications([
        {
          id: 1,
          type: 'message',
          title: 'اطلاعیه مهم از مدیر کل',
          message: 'لطفا گزارش موجودی انبار را به‌روزرسانی کرده و محصولات منقضی شده را شناسایی نمایید.',
          sender: 'مدیر کل',
          isRead: false,
          priority: 'high',
          createdAt: '1403/01/15 14:30'
        },
        {
          id: 2,
          type: 'inventory',
          title: 'هشدار موجودی پایین',
          message: 'موجودی محصول \"دستکش یکبار مصرف\" به کمتر از 100 جعبه رسیده است.',
          isRead: false,
          priority: 'urgent',
          createdAt: '1403/01/15 12:15',
          actionUrl: '/admin-warehouse/inventory'
        },
        {
          id: 3,
          type: 'shipping',
          title: 'سفارش آماده ارسال',
          message: 'سفارش شماره ORD-2024-150 بسته‌بندی شده و آماده ارسال می‌باشد.',
          isRead: true,
          priority: 'medium',
          createdAt: '1403/01/15 10:45',
          actionUrl: '/admin-warehouse/orders'
        },
        {
          id: 4,
          type: 'product',
          title: 'محصول جدید اضافه شد',
          message: 'محصول \"ترمومتر دیجیتال\" به فهرست محصولات انبار اضافه گردید.',
          isRead: false,
          priority: 'low',
          createdAt: '1403/01/14 18:00',
          actionUrl: '/admin-warehouse/products'
        },
        {
          id: 5,
          type: 'alert',
          title: 'هشدار انقضا',
          message: 'تاریخ انقضای 12 محصول در انبار به اتمام رسیده است. لطفا بررسی کنید.',
          isRead: false,
          priority: 'medium',
          createdAt: '1403/01/14 16:30'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true, role: 'warehouse' })
      });

      if (res.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'warehouse' })
      });

      if (res.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!confirm('آیا از حذف این اعلان اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'warehouse' })
      });

      if (res.ok) {
        setNotifications(notifications.filter(notif => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // فیلتر کردن اعلانات
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return notification.title.toLowerCase().includes(searchLower) ||
             notification.message.toLowerCase().includes(searchLower);
    }

    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <FaEnvelope className="h-5 w-5" />;
      case 'inventory': return <FaWarehouse className="h-5 w-5" />;
      case 'shipping': return <FaShippingFast className="h-5 w-5" />;
      case 'product': return <FaBox className="h-5 w-5" />;
      case 'system': return <FaInfoCircle className="h-5 w-5" />;
      case 'alert': return <FaExclamationTriangle className="h-5 w-5" />;
      default: return <FaBell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600 bg-blue-100';
      case 'inventory': return 'text-purple-600 bg-purple-100';
      case 'shipping': return 'text-green-600 bg-green-100';
      case 'product': return 'text-orange-600 bg-orange-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      case 'alert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-600">در حال بارگذاری اعلانات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                <FaBell className="h-6 w-6 text-white" />
              </div>
              اعلانات انبار
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  {unreadCount} خوانده نشده
                </span>
              )}
            </h1>
            <p className="mt-2 text-gray-600">
              مدیریت اعلانات و پیام‌های مربوط به انبار و موجودی
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-4">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaCheck className="h-4 w-4" />
              علامت‌گذاری همه به عنوان خوانده شده
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-purple-100">کل اعلانات</div>
              <FaBell className="text-purple-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold">
              {notifications.length.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-red-100">خوانده نشده</div>
              <FaEnvelope className="text-red-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold">
              {unreadCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-indigo-100">موجودی</div>
              <FaWarehouse className="text-indigo-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold">
              {notifications.filter(n => n.type === 'inventory').length.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-orange-100">فوری</div>
              <FaExclamationTriangle className="text-orange-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold">
              {notifications.filter(n => n.priority === 'urgent').length.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در اعلانات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">همه</option>
                <option value="unread">خوانده نشده</option>
                <option value="read">خوانده شده</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">همه انواع</option>
              <option value="message">پیام‌ها</option>
              <option value="inventory">موجودی</option>
              <option value="shipping">ارسال</option>
              <option value="product">محصولات</option>
              <option value="system">سیستم</option>
              <option value="alert">هشدارها</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-purple-50 border-r-4 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                              title="علامت‌گذاری به عنوان خوانده شده"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="حذف اعلان"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
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

                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            مشاهده جزئیات
                            <FaEye className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">اعلانی یافت نشد</h3>
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' || typeFilter !== 'all'
                  ? 'هیچ اعلانی با فیلترهای انتخابی یافت نشد'
                  : 'هنوز اعلانی دریافت نکرده‌اید'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 