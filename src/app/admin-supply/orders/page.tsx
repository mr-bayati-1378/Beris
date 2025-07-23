'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FaShoppingCart,
  FaSearch,
  FaSpinner,
  FaFilter,
  FaSort,
  FaUser,
  FaCalendarAlt,
  FaMoneyBill,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaEye,
  FaComments
} from 'react-icons/fa';

interface Order {
  id: number;
  slug: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  orderSource: string;
  salesRep: string | null;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  financeApprovedBy: string | null;
  financeApprovedAt: string | null;
  warehouseApprovedBy: string | null;
  warehouseApprovedAt: string | null;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
    } | null;
    userPack: {
      name: string;
    } | null;
  }>;
  paymentStatus: string;
}

interface OrderStats {
  totalOrders: number;
  websiteOrders: number;
  salesRepOrders: number;
  pendingOrders: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    websiteOrders: 0,
    salesRepOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: filterStatus,
        source: filterSource,
        sortBy,
        sortOrder,
        role: 'supply'
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, filterSource, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'pending_finance_approval':
        return 'text-blue-600 bg-blue-100';
      case 'finance_approved':
        return 'text-purple-600 bg-purple-100';
      case 'pending_warehouse_approval':
        return 'text-orange-600 bg-orange-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-amber-600 bg-amber-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'در انتظار';
      case 'pending_finance_approval':
        return 'در انتظار تایید مالی';
      case 'finance_approved':
        return 'تایید شده مالی';
      case 'pending_warehouse_approval':
        return 'در انتظار تایید انبار';
      case 'processing':
        return 'در حال پردازش';
      case 'completed':
        return 'تکمیل شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  const getSourceText = (source: string) => {
    switch (source) {
      case 'WEBSITE':
        return 'وب‌سایت';
      case 'SALES_REP':
        return 'مسئول فروش';
      default:
        return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'WEBSITE':
        return 'text-blue-600 bg-blue-100';
      case 'SALES_REP':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <FaTimesCircle className="h-4 w-4" />;
      case 'pending_finance_approval':
      case 'pending_warehouse_approval':
      case 'pending':
        return <FaExclamationCircle className="h-4 w-4" />;
      case 'finance_approved':
      case 'processing':
        return <FaCheckCircle className="h-4 w-4" />;
      default:
        return <FaExclamationCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سفارشات</h1>
          <p className="text-gray-600">مدیریت و پیگیری سفارشات</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل سفارشات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <FaShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">سفارشات وب‌سایت</p>
              <p className="text-2xl font-bold text-gray-900">{stats.websiteOrders}</p>
            </div>
            <FaUser className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">سفارشات مسئول فروش</p>
              <p className="text-2xl font-bold text-gray-900">{stats.salesRepOrders}</p>
            </div>
            <FaUser className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">سفارشات در انتظار</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <FaExclamationCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در سفارشات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در انتظار</option>
              <option value="pending_finance_approval">در انتظار تایید مالی</option>
              <option value="finance_approved">تایید شده مالی</option>
              <option value="pending_warehouse_approval">در انتظار تایید انبار</option>
              <option value="processing">در حال پردازش</option>
              <option value="completed">تکمیل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه منابع</option>
              <option value="website">وب‌سایت</option>
              <option value="sales_rep">مسئول فروش</option>
            </select>

            <button
              onClick={() => handleSort('date')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaSort className="h-4 w-4" />
              تاریخ
            </button>

            <button
              onClick={() => handleSort('amount')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaSort className="h-4 w-4" />
              مبلغ
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <FaShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">هیچ سفارشی یافت نشد</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    شماره سفارش
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    مشتری
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    منبع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    تاریخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    مبلغ کل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaShoppingCart className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{order.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="h-4 w-4 text-gray-400" />
                        <span>{`${order.user.firstName} ${order.user.lastName}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getSourceColor(order.orderSource)}`}>
                          <span>{getSourceText(order.orderSource)}</span>
                        </div>
                        {order.salesRep && (
                          <span className="text-xs text-gray-500">({order.salesRep})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                        <span>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaMoneyBill className="h-4 w-4 text-gray-400" />
                        <span>{new Intl.NumberFormat('fa-IR').format(order.total)} تومان</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin-supply/orders/${order.slug}`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="مشاهده جزئیات"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                        {order.notes && (
                          <FaComments className="h-4 w-4 text-gray-400" title="یادداشت دارد" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  صفحه {currentPage} از {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    قبلی
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 