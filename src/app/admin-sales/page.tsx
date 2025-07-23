'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaShoppingCart, 
  FaUsers, 
  FaDollarSign,
  FaChartLine,
  FaEye,
  FaFileInvoice,
  FaBoxes,
  FaArrowUp,
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaUserTie,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaHourglassHalf
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp as HiTrend } from 'react-icons/hi';

interface SalesDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  monthlyGrowth: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    date: string;
  }>;
  topCustomers: Array<{
    id: number;
    name: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  salesChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  // جدید: بدهکاری‌ها
  debts: Array<{
    id: string;
    customerName: string;
    amount: number;
    dueDate: string;
    paymentType: 'CASH' | 'ONE_MONTH' | 'TWO_MONTH' | 'THREE_MONTH';
    daysUntilDue: number;
    salesRep: string;
  }>;
  // جدید: سفارشات جدید
  newOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    date: string;
    source: 'WEBSITE' | 'SALES_REP';
    salesRep?: string;
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  }>;
}

interface SalesRep {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: string;
}

export default function SalesDashboard() {
  const [stats, setStats] = useState<SalesDashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    monthlyGrowth: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
    topCustomers: [],
    salesChart: [],
    // جدید: بدهکاری‌ها
    debts: [],
    // جدید: سفارشات جدید
    newOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [approvalForm, setApprovalForm] = useState({
    salesRepName: '',
    notes: ''
  });

  const handleApproveOrder = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowApprovalModal(true);
  };

  const handleApproveOrderSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/new-orders/${selectedOrderId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesRepName: approvalForm.salesRepName,
          notes: approvalForm.notes || 'تایید شده از داشبورد'
        }),
      });

      if (response.ok) {
        // Refresh the data
        fetchSalesData();
        setShowApprovalModal(false);
        setApprovalForm({ salesRepName: '', notes: '' });
        alert('سفارش با موفقیت تایید شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('Error approving order:', error);
      alert('خطا در تایید سفارش');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/new-orders/${orderId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'رد شده از داشبورد'
        }),
      });

      if (response.ok) {
        // Refresh the data
        fetchSalesData();
        alert('سفارش با موفقیت رد شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('خطا در رد سفارش');
    }
  };

    const fetchSalesData = async () => {
      try {
        // در اینجا API مخصوص داده‌های فروش را صدا می‌زنیم
        const response = await fetch('/api/admin/dashboard?role=sales');
        if (response.ok) {
          const data = await response.json();
          // Merge با مقادیر پیش‌فرض برای اطمینان از وجود تمام خصوصیات
          setStats(prevStats => ({
            ...prevStats,
          ...data.stats,
          newOrders: data.newOrders || [],
          debts: data.debts || []
          }));
        } else {
          console.error('Failed to fetch sales data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

  const fetchSalesReps = async () => {
    try {
      const response = await fetch('/api/admin/sales-reps');
      if (response.ok) {
        const data = await response.json();
        setSalesReps(data.salesReps || []);
      } else {
        console.error('Failed to fetch sales reps:', response.status);
      }
    } catch (error) {
      console.error('Error fetching sales reps:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
    fetchSalesReps();
  }, []);

  function getStatusColor(status: string) {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'delivered': return 'تحویل شده';
      case 'processing': return 'در حال پردازش';
      case 'shipped': return 'ارسال شده';
      case 'pending': return 'در انتظار';
      case 'completed': return 'تکمیل شده';
      default: return status;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری داشبورد فروش...</p>
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
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                داشبورد فروش
              </h1>
              <p className="mt-2 text-gray-600 text-lg">مدیریت و نظارت بر فرآیند فروش</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                <FaCalendarAlt className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">امروز</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {stats.newOrders.length || 0} سفارش جدید
                </span>
              </div>
              <Link 
                href="/admin-sales/orders" 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
              >
                <FaShoppingCart className="text-sm" />
                <span className="text-sm font-medium">مدیریت سفارشات</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* کل سفارشات */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaShoppingCart className="h-6 w-6" />
                </div>
                <HiSparkles className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل سفارشات</p>
                <p className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FaArrowUp className="text-xs" />
                  <span className="text-xs opacity-75">+{stats.monthlyGrowth}% این ماه</span>
                </div>
              </div>
            </div>
          </div>

          {/* درآمد کل */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaDollarSign className="h-6 w-6" />
                </div>
                <HiTrend className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">درآمد کل</p>
                <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()} تومان</p>
                <p className="text-xs opacity-75 mt-2">درآمد ماهانه</p>
              </div>
            </div>
          </div>

          {/* مشتریان */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaUsers className="h-6 w-6" />
                </div>
                <FaClock className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل مشتریان</p>
                <p className="text-3xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">مشتری فعال</p>
              </div>
            </div>
          </div>

          {/* سفارشات در انتظار */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaExclamationTriangle className="h-6 w-6" />
                </div>
                <FaClock className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">در انتظار پردازش</p>
                <p className="text-3xl font-bold">{stats.pendingOrders.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">نیاز به بررسی</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">سفارشات اخیر</h3>
                  <Link 
                    href="/admin-sales/orders" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    مشاهده همه
                    <FaEye className="text-xs" />
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مشتری
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مبلغ
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاریخ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-semibold">
                            {order.total.toLocaleString()} تومان
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          هنوز سفارشی ثبت نشده است
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* بدهکاری‌ها */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaMoneyBillWave className="text-red-500" />
                    بدهکاری‌ها
                  </h3>
                  <Link 
                    href="/admin-sales/debts" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    مشاهده همه
                    <FaEye className="text-xs" />
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مشتری
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مبلغ
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نوع تسویه
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاریخ سررسید
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.debts.length > 0 ? stats.debts.map((debt) => (
                      <tr key={debt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{debt.customerName}</div>
                          <div className="text-xs text-gray-500">فروشنده: {debt.salesRep}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-semibold">
                            {debt.amount.toLocaleString()} تومان
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            debt.paymentType === 'CASH' ? 'bg-green-100 text-green-800' :
                            debt.paymentType === 'ONE_MONTH' ? 'bg-blue-100 text-blue-800' :
                            debt.paymentType === 'TWO_MONTH' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {debt.paymentType === 'CASH' ? 'نقدی' :
                             debt.paymentType === 'ONE_MONTH' ? 'یک ماهه' :
                             debt.paymentType === 'TWO_MONTH' ? 'دو ماهه' : 'سه ماهه'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{debt.dueDate}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            debt.daysUntilDue <= 0 ? 'bg-red-100 text-red-800' :
                            debt.daysUntilDue <= 7 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {debt.daysUntilDue <= 0 ? 'سررسید شده' :
                             debt.daysUntilDue <= 7 ? `${debt.daysUntilDue} روز باقی` :
                             `${debt.daysUntilDue} روز باقی`}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          بدهکاری‌ای وجود ندارد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* سفارشات جدید */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaHourglassHalf className="text-blue-500" />
                    سفارشات جدید
                  </h3>
                  <Link 
                    href="/admin-sales/new-orders" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    مشاهده همه
                    <FaEye className="text-xs" />
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مشتری
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مبلغ
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        منبع
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.newOrders.length > 0 ? stats.newOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                          {order.salesRep && (
                            <div className="text-xs text-gray-500">فروشنده: {order.salesRep}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-semibold">
                            {Number(order.total).toLocaleString()} تومان
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            order.source === 'WEBSITE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {order.source === 'WEBSITE' ? 'وب‌سایت' : 'فروشنده'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'PENDING_APPROVAL' ? 'در انتظار تایید' :
                             order.status === 'APPROVED' ? 'تایید شده' : 'رد شده'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {order.status === 'PENDING_APPROVAL' && (
                              <>
                            <button 
                                  onClick={() => handleApproveOrder(order.id)}
                                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              title="تایید سفارش"
                            >
                              <FaCheckCircle className="text-sm" />
                            </button>
                            <button 
                                  onClick={() => handleRejectOrder(order.id)}
                                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="رد سفارش"
                            >
                              <FaTimesCircle className="text-sm" />
                            </button>
                              </>
                            )}
                            {order.status !== 'PENDING_APPROVAL' && (
                              <span className="text-xs text-gray-500">
                                {order.status === 'APPROVED' ? 'تایید شده' : 'رد شده'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          سفارش جدیدی وجود ندارد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions & Top Customers */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">دسترسی سریع</h3>
              <div className="space-y-4">
                <Link 
                  href="/admin-sales/orders" 
                  className="block p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                      <FaShoppingCart className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">مدیریت سفارشات</h4>
                      <p className="text-sm text-gray-600">بررسی و پردازش سفارشات</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-sales/customers" 
                  className="block p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                      <FaUsers className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">مدیریت مشتریان</h4>
                      <p className="text-sm text-gray-600">اطلاعات و سابقه مشتریان</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-sales/invoices" 
                  className="block p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg group-hover:bg-emerald-700 transition-colors">
                      <FaFileInvoice className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">صدور فاکتور</h4>
                      <p className="text-sm text-gray-600">ایجاد و مدیریت فاکتورها</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-sales/reports" 
                  className="block p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-600 rounded-lg group-hover:bg-amber-700 transition-colors">
                      <FaChartLine className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">گزارشات فروش</h4>
                      <p className="text-sm text-gray-600">تحلیل عملکرد فروش</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">برترین مشتریان</h3>
              <div className="space-y-4">
                {stats.topCustomers.length > 0 ? stats.topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{customer.name}</h4>
                      <p className="text-xs text-gray-600">
                        {customer.totalOrders} سفارش • {customer.totalSpent.toLocaleString()} تومان
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">هنوز مشتری‌ای ثبت نشده است</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">تایید سفارش</h3>
              <button 
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalForm({ salesRepName: '', notes: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مسئول فروش (اختیاری)
                </label>
                <select
                  value={approvalForm.salesRepName}
                  onChange={(e) => setApprovalForm(prev => ({ ...prev, salesRepName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب کنید (مستقیم از سایت)</option>
                  {salesReps.map((rep) => (
                    <option key={rep.id} value={rep.name}>
                      {rep.name} - {rep.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  یادداشت (اختیاری)
                </label>
                <textarea
                  value={approvalForm.notes}
                  onChange={(e) => setApprovalForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="یادداشت اضافی..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleApproveOrderSubmit}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  تایید سفارش
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalForm({ salesRepName: '', notes: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 