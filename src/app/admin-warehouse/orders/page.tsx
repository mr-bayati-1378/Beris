'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FaShippingFast, 
  FaBox, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaDollarSign,
  FaUser,
  FaGlobe,
  FaUserTie,
  FaComments
} from 'react-icons/fa';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  status: string;
  orderSource: 'WEBSITE' | 'SALES_REP';
  salesRep?: string;
  notes?: string;
  shippingMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  websiteOrders: number;
  salesRepOrders: number;
}

export default function WarehouseOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    websiteOrders: 0,
    salesRepOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 20;

  const fetchOrdersData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        source: sourceFilter,
        sortBy,
        sortOrder,
        role: 'warehouse' // فیلتر برای نقش انبار
      });

      const response = await fetch(`/api/admin/orders?${params}`);
              if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
          setStats(prevStats => data.stats || prevStats);
        setTotalPages(data.pagination?.pages || 1);
        }
    } catch (error) {
      console.error('خطا در دریافت سفارشات:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  const getOrderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'در انتظار',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: FaClock
        };
      case 'processing':
        return {
          label: 'در حال پردازش',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: FaBox
        };
      case 'shipped':
        return {
          label: 'ارسال شده',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: FaTruck
        };
      case 'delivered':
        return {
          label: 'تحویل شده',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: FaCheckCircle
        };
      case 'cancelled':
        return {
          label: 'لغو شده',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: FaExclamationTriangle
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: FaBox
        };
    }
  };

  const getSourceText = (source: string) => {
    switch (source) {
      case 'WEBSITE': return 'سایت';
      case 'SALES_REP': return 'مسئول فروش';
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'WEBSITE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SALES_REP': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          role: 'warehouse'
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
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
            <p className="text-gray-600">در حال بارگذاری سفارشات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaShippingFast className="text-amber-600" />
                مدیریت حمل و نقل - انبار
              </h1>
              <p className="mt-1 text-gray-600">
                مدیریت سفارشات، ارسال‌ها و پیگیری حمل و نقل محصولات
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                بروزرسانی
              </button>
              <a
                href="/admin/orders"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <FaEye className="h-4 w-4" />
                مشاهده کامل
              </a>
            </div>
          </div>
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
                <FaShippingFast className="h-6 w-6 text-blue-600" />
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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در سفارشات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در انتظار</option>
              <option value="processing">در حال پردازش</option>
              <option value="shipped">ارسال شده</option>
              <option value="delivered">تحویل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
            <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="all">همه منابع</option>
                <option value="WEBSITE">سایت</option>
                <option value="SALES_REP">مسئول فروش</option>
            </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شماره سفارش
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    منبع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    روش ارسال
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length > 0 ? orders.map((order) => {
                  const orderStatus = getOrderStatus(order.status);
                  const StatusIcon = orderStatus.icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber || order.id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <FaUser className="h-3 w-3 text-gray-400" />
                            {order.customerName}
                          </div>
                          {order.customerPhone && (
                            <div className="text-sm text-gray-500">{order.customerPhone}</div>
                          )}
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
                        <div className="text-sm font-medium text-gray-900">
                          {order.total.toLocaleString()} تومان
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items?.length || 0} محصول
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${orderStatus.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {orderStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.shippingMethod || 'نامشخص'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin-warehouse/orders/${order.orderNumber}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="مشاهده جزئیات"
                          >
                            <FaEye className="h-4 w-4" />
                          </Link>
                          {order.notes && (
                            <div className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title={order.notes}>
                              <FaComments className="h-4 w-4" />
                            </div>
                          )}
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs rounded border border-gray-300 px-2 py-1"
                          >
                            <option value="pending">در انتظار</option>
                            <option value="processing">پردازش</option>
                            <option value="shipped">ارسال</option>
                            <option value="delivered">تحویل</option>
                            <option value="cancelled">لغو</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      <FaShippingFast className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p>هیچ سفارشی یافت نشد</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
              صفحه {currentPage} از {totalPages}
                </div>
            <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                قبلی
                  </button>
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