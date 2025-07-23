'use client';

import { useState, useEffect } from 'react';
import {
  FaBell,
  FaEnvelope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaTrash,
  FaEye,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaCalendarAlt,
  FaUser,
  FaShoppingCart,
  FaDollarSign,
  FaBoxes,
  FaUsers,
  FaClock,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

interface Notification {
  id: number;
  type: 'order' | 'payment' | 'customer' | 'system' | 'alert';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  relatedId?: number;
  actionUrl?: string;
}

export default function SalesNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, order, payment, customer, system, alert
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications?role=sales');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true, role: 'sales' })
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
        body: JSON.stringify({ role: 'sales' })
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
        body: JSON.stringify({ role: 'sales' })
      });

      if (res.ok) {
        setNotifications(notifications.filter(notif => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    if (!confirm(`آیا از حذف ${selectedNotifications.length} اعلان انتخاب شده اطمینان دارید؟`)) return;

    try {
      const res = await fetch('/api/admin/notifications/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedNotifications, role: 'sales' })
      });

      if (res.ok) {
        setNotifications(notifications.filter(notif => !selectedNotifications.includes(notif.id)));
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  const toggleSelection = (notificationId: number) => {
    if (selectedNotifications.includes(notificationId)) {
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
    } else {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    }
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(notif => notif.id));
    }
  };

  // فیلتر کردن اعلانات
  const filteredNotifications = notifications.filter(notification => {
    // فیلتر بر اساس وضعیت خوانده شدن
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;

    // فیلتر بر اساس نوع
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

    // فیلتر بر اساس جستجو
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return notification.title.toLowerCase().includes(searchLower) ||
             notification.message.toLowerCase().includes(searchLower);
    }

    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <FaShoppingCart className="h-5 w-5" />;
      case 'payment': return <FaDollarSign className="h-5 w-5" />;
      case 'customer': return <FaUsers className="h-5 w-5" />;
      case 'system': return <FaInfoCircle className="h-5 w-5" />;
      case 'alert': return <FaExclamationTriangle className="h-5 w-5" />;
      default: return <FaBell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-green-600 bg-green-100';
      case 'payment': return 'text-blue-600 bg-blue-100';
      case 'customer': return 'text-purple-600 bg-purple-100';
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
              <FaSpinner className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
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
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <FaBell className="h-6 w-6 text-white" />
              </div>
              اعلانات فروش
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  {unreadCount} خوانده نشده
                </span>
              )}
            </h1>
            <p className="mt-2 text-gray-600">
              مدیریت اعلانات و پیام‌های مربوط به فروش
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-4">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheck className="h-4 w-4" />
              علامت‌گذاری همه به عنوان خوانده شده
            </button>

            {selectedNotifications.length > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <FaTrash className="h-4 w-4" />
                حذف انتخاب شده ({selectedNotifications.length})
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-100">کل اعلانات</div>
              <FaBell className="text-blue-200 h-8 w-8" />
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

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-green-100">سفارشات</div>
              <FaShoppingCart className="text-green-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold">
              {notifications.filter(n => n.type === 'order').length.toLocaleString()}
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
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در اعلانات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">همه</option>
                <option value="unread">خوانده نشده</option>
                <option value="read">خوانده شده</option>
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه انواع</option>
              <option value="order">سفارشات</option>
              <option value="payment">پرداخت</option>
              <option value="customer">مشتریان</option>
              <option value="system">سیستم</option>
              <option value="alert">هشدار</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {filteredNotifications.length > 0 ? (
            <>
              {/* Select All Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length > 0 
                      ? `${selectedNotifications.length} مورد انتخاب شده`
                      : 'انتخاب همه'
                    }
                  </span>
                </div>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className={`p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className={`text-lg font-medium ${!notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(notification.priority)}`}>
                                {notification.priority === 'urgent' ? 'فوری' :
                                 notification.priority === 'high' ? 'بالا' :
                                 notification.priority === 'medium' ? 'متوسط' : 'پایین'}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FaClock className="h-3 w-3" />
                                {new Date(notification.createdAt).toLocaleDateString('fa-IR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
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

                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            مشاهده جزئیات
                            <FaEye className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
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