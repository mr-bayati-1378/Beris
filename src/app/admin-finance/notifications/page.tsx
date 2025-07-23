'use client';

import { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaEnvelope, 
  FaCheck, 
  FaClock, 
  FaExclamationTriangle, 
  FaInfo, 
  FaCheckCircle,
  FaSpinner,
  FaTrash,
  FaEye,
  FaFilter,
  FaSearch,
  FaDollarSign,
  FaFileInvoice,
  FaCreditCard,
  FaChartLine,
  FaInfoCircle
} from 'react-icons/fa';

interface Notification {
  id: number;
  type: 'message' | 'system' | 'alert' | 'info' | 'payment' | 'invoice' | 'financial';
  title: string;
  message: string;
  sender?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  actionUrl?: string;
}

export default function FinanceNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, message, payment, invoice, financial, system, alert
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Derived state
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read/unread status
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;

    // Filter by type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return notification.title.toLowerCase().includes(searchLower) ||
             notification.message.toLowerCase().includes(searchLower);
    }

    return true;
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications?role=finance');
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
          message: 'لطفا گزارش‌های مالی ماهانه را تا پایان هفته آماده کنید و ارسال نمایید.',
          sender: 'مدیر کل',
          isRead: false,
          priority: 'high',
          createdAt: '1403/01/15 14:30'
        },
        {
          id: 2,
          type: 'payment',
          title: 'هشدار پرداخت معوقه',
          message: 'پرداخت فاکتور شماره INV-2024-001 از تاریخ سررسید گذشته است. مبلغ: 5,000,000 تومان',
          isRead: false,
          priority: 'urgent',
          createdAt: '1403/01/15 12:15',
          actionUrl: '/admin-finance/invoices/001'
        },
        {
          id: 3,
          type: 'invoice',
          title: 'فاکتور جدید ثبت شد',
          message: 'فاکتور جدید به مبلغ 2,500,000 تومان برای مشتری آقای احمدی ثبت گردید.',
          isRead: true,
          priority: 'medium',
          createdAt: '1403/01/15 10:45',
          actionUrl: '/admin-finance/invoices/002'
        },
        {
          id: 4,
          type: 'financial',
          title: 'گزارش درآمد هفتگی',
          message: 'درآمد این هفته نسبت به هفته گذشته 15% افزایش یافته است. کل درآمد: 45,000,000 تومان',
          isRead: false,
          priority: 'low',
          createdAt: '1403/01/14 18:00',
          actionUrl: '/admin-finance/reports'
        },
        {
          id: 5,
          type: 'alert',
          title: 'هشدار بودجه',
          message: 'هزینه‌های این ماه به 80% بودجه تخصیص یافته رسیده است. لطفا کنترل کنید.',
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
        body: JSON.stringify({ isRead: true, role: 'finance' })
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
        body: JSON.stringify({ role: 'finance' })
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
        body: JSON.stringify({ role: 'finance' })
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
        body: JSON.stringify({ ids: selectedNotifications, role: 'finance' })
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <FaEnvelope className="h-5 w-5" />;
      case 'payment': return <FaCreditCard className="h-5 w-5" />;
      case 'invoice': return <FaFileInvoice className="h-5 w-5" />;
      case 'financial': return <FaChartLine className="h-5 w-5" />;
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
      case 'message': return 'text-blue-600 bg-blue-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'invoice': return 'text-purple-600 bg-purple-100';
      case 'financial': return 'text-indigo-600 bg-indigo-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      case 'alert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'message': return 'پیام';
      case 'payment': return 'پرداخت';
      case 'invoice': return 'فاکتور';
      case 'financial': return 'مالی';
      case 'system': return 'سیستم';
      case 'alert': return 'هشدار';
      default: return 'عمومی';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
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
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                <FaBell className="h-6 w-6 text-white" />
              </div>
              اعلانات مالی
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  {unreadCount} خوانده نشده
                </span>
              )}
            </h1>
            <p className="mt-2 text-gray-600">
              مدیریت اعلانات و پیام‌های مربوط به امور مالی
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
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-orange-100">کل اعلانات</div>
              <FaBell className="text-orange-200 h-8 w-8" />
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
              <div className="text-green-100">پرداخت‌ها</div>
              <FaCreditCard className="text-green-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold">
              {notifications.filter(n => n.type === 'payment').length.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-purple-100">فوری</div>
              <FaExclamationTriangle className="text-purple-200 h-8 w-8" />
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
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">همه انواع</option>
              <option value="message">پیام‌ها</option>
              <option value="payment">پرداخت‌ها</option>
              <option value="invoice">فاکتورها</option>
              <option value="financial">گزارشات مالی</option>
              <option value="system">سیستم</option>
              <option value="alert">هشدارها</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {filteredNotifications.length > 0 ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={selectAll}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedNotifications.length > 0 
                        ? `${selectedNotifications.length} اعلان انتخاب شده`
                        : `${filteredNotifications.length} اعلان`
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-orange-50 border-r-4 border-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />

                      <div className={`p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                              {notification.priority === 'urgent' ? 'فوری' : 
                               notification.priority === 'high' ? 'مهم' :
                               notification.priority === 'medium' ? 'متوسط' : 'کم'}
                            </span>

                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{notification.createdAt}</span>
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="علامت‌گذاری به عنوان خوانده شده"
                              >
                                <FaCheck className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="حذف اعلان"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        {notification.sender && (
                          <p className="text-sm text-gray-500 mb-2">
                            <span className="font-medium">از:</span> {notification.sender}
                          </p>
                        )}

                        {notification.actionUrl && (
                          <div className="mt-3">
                            <a
                              href={notification.actionUrl}
                              target="_blank"
                              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              <FaEye className="h-3 w-3" />
                              مشاهده جزئیات
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <FaBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">اعلانی یافت نشد</p>
              <p>با فیلترهای انتخاب شده، هیچ اعلانی موجود نیست</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 