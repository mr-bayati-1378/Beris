'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PersianDate from '@/components/ui/persian-date';
import { 
  FaShoppingCart,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaTruck,
  FaDollarSign,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPlus,
  FaEdit,
  FaMinus,
  FaSortAmountUp,
  FaSortAmountDown,
  FaGlobe,
  FaUserTie,
  FaComments
} from 'react-icons/fa';
import { checkFinancialPermission } from '@/lib/admin-permissions-client';

interface Order {
  id: string;
  slug: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  orderSource: 'WEBSITE' | 'SALES_REP';
  salesRep?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  financeApprovedBy?: string;
  financeApprovedAt?: string;
  financeRejectedBy?: string;
  financeRejectedAt?: string;
  financeNotes?: string;
  warehouseApprovedBy?: string;
  warehouseApprovedAt?: string;
  warehouseRejectedBy?: string;
  warehouseRejectedAt?: string;
  warehouseNotes?: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
  addresses?: Array<{
    fullAddress: string;
  }>;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  websiteOrders: number;
  salesRepOrders: number;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    websiteOrders: 0,
    salesRepOrders: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [canViewFinancial, setCanViewFinancial] = useState(false);

  useEffect(() => {
    fetchOrders();
    checkFinancialPermissions();
  }, [fetchOrders]);

  const checkFinancialPermissions = async () => {
    const hasPermission = await checkFinancialPermission();
    setCanViewFinancial(hasPermission);
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: filterStatus,
        sortBy,
        sortOrder,
        role: 'all' // همه سفارشات برای همه ادمین‌ها
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setStats(data.stats || {
          totalOrders: 0,
          pendingOrders: 0,
          processingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          websiteOrders: 0,
          salesRepOrders: 0
        });
      } else {
        console.error('خطا در دریافت سفارشات');
        setOrders([]);
      }
    } catch (error) {
      console.error('خطا در دریافت سفارشات:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
      const customerName = `${order.user.firstName} ${order.user.lastName}`;
      const matchesSearch = 
        order.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.phone.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    const matchesSource = filterSource === 'all' || order.orderSource === filterSource;
    
    return matchesSearch && matchesStatus && matchesPayment && matchesSource;
    });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'در انتظار';
      case 'processing': return 'در حال پردازش';
      case 'shipped': return 'ارسال شده';
      case 'delivered': return 'تحویل شده';
      case 'completed': return 'تکمیل شده';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusText = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'پرداخت شده';
      case 'pending': return 'در انتظار پرداخت';
      case 'failed': return 'پرداخت ناموفق';
      case 'refunded': return 'بازگردانی';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceText = (source: Order['orderSource']) => {
    switch (source) {
      case 'WEBSITE': return 'سایت';
      case 'SALES_REP': return 'مسئول فروش';
      default: return source;
    }
  };

  const getSourceColor = (source: Order['orderSource']) => {
    switch (source) {
      case 'WEBSITE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SALES_REP': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          role: 'admin' // نقش عمومی ادمین
        }),
      });

      if (response.ok) {
        // بروزرسانی سفارش در لیست
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error('خطا در بروزرسانی وضعیت سفارش');
      }
    } catch (error) {
      console.error('خطا در بروزرسانی وضعیت سفارش:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری سفارشات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">مدیریت سفارشات</h1>
          <p className="mt-2 text-gray-600">پیگیری و مدیریت کامل سفارشات مشتریان</p>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل سفارشات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">سفارشات سایت</p>
                <p className="text-2xl font-bold text-gray-900">{stats.websiteOrders}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaGlobe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">سفارشات مسئول فروش</p>
                <p className="text-2xl font-bold text-gray-900">{stats.salesRepOrders}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaUserTie className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">در انتظار</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* Search */}
            <div className="relative md:col-span-2">
              <FaSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در سفارشات، مشتری، شماره تماس..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-10 pl-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="processing">در حال پردازش</option>
                <option value="shipped">ارسال شده</option>
                <option value="delivered">تحویل شده</option>
                <option value="completed">تکمیل شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">همه پرداخت‌ها</option>
                <option value="pending">در انتظار پرداخت</option>
                <option value="paid">پرداخت شده</option>
                <option value="failed">پرداخت ناموفق</option>
                <option value="refunded">بازگردانی</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">همه منابع</option>
                <option value="WEBSITE">سایت</option>
                <option value="SALES_REP">مسئول فروش</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">شماره سفارش</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">مشتری</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">منبع</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">مبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">وضعیت سفارش</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">وضعیت پرداخت</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">تاریخ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <FaShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p>هیچ سفارشی یافت نشد</p>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">#{order.slug}</p>
                          <p className="text-sm text-gray-500">{order.items?.length || 0} آیتم</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user.firstName} {order.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{order.user.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getSourceColor(order.orderSource)}`}>
                          {getSourceText(order.orderSource)}
                        </span>
                        {order.salesRep && (
                          <p className="text-xs text-gray-500 mt-1">{order.salesRep}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{order.total.toLocaleString()} تومان</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          <PersianDate date={order.createdAt} />
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/orders/${order.slug}`}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="مشاهده جزئیات"
                          >
                            <FaEye className="h-4 w-4" />
                          </Link>
                          {order.notes && (
                            <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600" title={order.notes}>
                              <FaComments className="h-4 w-4" />
                            </div>
                          )}
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="text-xs rounded border border-gray-300 px-2 py-1"
                          >
                            <option value="pending">در انتظار</option>
                            <option value="processing">پردازش</option>
                            <option value="shipped">ارسال</option>
                            <option value="delivered">تحویل</option>
                            <option value="completed">تکمیل</option>
                            <option value="cancelled">لغو</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
                  نمایش {startIndex + 1} تا {Math.min(endIndex, filteredOrders.length)} از {filteredOrders.length} سفارش
            </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    قبلی
                  </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                    صفحه {currentPage} از {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    بعدی
                  </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
} 