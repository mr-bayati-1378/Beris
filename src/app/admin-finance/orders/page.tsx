'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FaShoppingCart, 
  FaSearch, 
  FaEye, 
  FaCheck, 
  FaClock, 
  FaDollarSign,
  FaFileInvoice,
  FaFilter,
  FaGlobe,
  FaUserTie,
  FaComments
} from 'react-icons/fa';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  items: number;
  orderSource: 'WEBSITE' | 'SALES_REP';
  salesRep?: string;
  notes?: string;
}

interface OrderStats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  websiteOrders: number;
  salesRepOrders: number;
}

export default function FinanceOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    totalRevenue: 0,
    websiteOrders: 0,
    salesRepOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        source: sourceFilter,
        role: 'finance' // فیلتر برای نقش مالی
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setStats(data.stats || {
          totalOrders: 0,
          paidOrders: 0,
          pendingOrders: 0,
          failedOrders: 0,
          totalRevenue: 0,
          websiteOrders: 0,
          salesRepOrders: 0
        });
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('خطا در دریافت سفارشات:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sourceFilter, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
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
          role: 'finance'
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaDollarSign className="text-green-500" />
            مدیریت سفارشات مالی
          </h1>
          <p className="mt-2 text-gray-600">پیگیری و مدیریت پرداخت‌های سفارشات</p>
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
                <p className="text-sm font-medium text-gray-600">کل درآمد</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaDollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="paid">پرداخت شده</option>
                <option value="pending">در انتظار پرداخت</option>
                <option value="failed">پرداخت ناموفق</option>
              </select>
            </div>

            <div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">شماره سفارش</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">مشتری</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">منبع</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">تاریخ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">مبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">وضعیت پرداخت</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <FaShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p>هیچ سفارشی یافت نشد</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.items} قلم</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{order.customer}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getSourceColor(order.orderSource)}`}>
                          {getSourceText(order.orderSource)}
                        </span>
                        {order.salesRep && (
                          <p className="text-xs text-gray-500 mt-1">{order.salesRep}</p>
                        )}
                      </td>
                    <td className="px-6 py-4">{order.date}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'paid' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {order.status === 'paid' ? <FaCheck className="h-4 w-4" /> : <FaClock className="h-4 w-4" />}
                          {order.status === 'paid' ? 'پرداخت شده' : 
                           order.status === 'pending' ? 'در انتظار' : 'ناموفق'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                          <Link
                            href={`/admin-finance/orders/${order.orderNumber}`}
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
                          <Link
                            href={`/admin-finance/invoices/${order.orderNumber}`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="ایجاد فاکتور"
                          >
                          <FaFileInvoice className="h-4 w-4" />
                          </Link>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="text-xs rounded border border-gray-300 px-2 py-1"
                          >
                            <option value="pending">در انتظار</option>
                            <option value="paid">پرداخت شده</option>
                            <option value="failed">ناموفق</option>
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