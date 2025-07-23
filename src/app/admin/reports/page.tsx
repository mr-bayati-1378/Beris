'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaArrowUp,
  FaArrowDown,
  FaCalendar,
  FaDownload,
  FaPrint,
  FaFilter,
  FaChartLine
} from 'react-icons/fa';
import { checkFinancialPermission } from '@/lib/admin-permissions-client';

interface ReportData {
  salesData: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
  };
  ordersData: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  usersData: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  productsData: {
    total: number;
    active: number;
    lowStock: number;
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canViewFinancial, setCanViewFinancial] = useState(false);

  useEffect(() => {
    checkFinancialPermissions();
    fetchReportData();
  }, []);

  const checkFinancialPermissions = async () => {
    const hasPermission = await checkFinancialPermission();
    setCanViewFinancial(hasPermission);
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/users'),
        fetch('/api/admin/products')
      ]);

      if (!ordersRes.ok || !usersRes.ok || !productsRes.ok) {
        throw new Error('خطا در دریافت داده‌ها');
      }

      const [ordersData, usersData, productsData] = await Promise.all([
        ordersRes.json(),
        usersRes.json(),
        productsRes.json()
      ]);

      // محاسبه آمار
      const orders = ordersData.orders || [];
      const users = usersData.users || [];
      const products = productsData.products || [];
      const totalProducts = productsData.total || products.length;

      // محاسبه فروش
      const completedOrders = orders.filter((order: any) => order.status === 'completed' || order.status === 'delivered');
      const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + order.total, 0);

      // محاسبه تاریخ‌ها
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);
      
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      
      const thisYearStart = new Date(today.getFullYear(), 0, 1);
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

      // محاسبه فروش براساس دوره
      const calculateSales = (startDate: Date, endDate?: Date) => {
        const end = endDate || new Date();
        return completedOrders
          .filter((order: any) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= end;
          })
          .reduce((sum: number, order: any) => sum + order.total, 0);
      };

      // محاسبه وضعیت سفارشات
      const getOrderCountByStatus = (status: string) => {
        return orders.filter((order: any) => order.status === status).length;
      };

      // محاسبه کاربران جدید
      const getUsersCount = (startDate: Date, endDate?: Date) => {
        const end = endDate || new Date();
        return users.filter((user: any) => {
          const userDate = new Date(user.createdAt);
          return userDate >= startDate && userDate <= end;
        }).length;
      };

      const data: ReportData = {
        salesData: {
          today: calculateSales(new Date(today.toDateString())),
          yesterday: calculateSales(new Date(yesterday.toDateString()), new Date(yesterday.toDateString())),
          thisWeek: calculateSales(thisWeekStart),
          lastWeek: calculateSales(lastWeekStart, new Date(thisWeekStart.getTime() - 1)),
          thisMonth: calculateSales(thisMonthStart),
          lastMonth: calculateSales(lastMonthStart, lastMonthEnd),
          thisYear: calculateSales(thisYearStart),
          lastYear: calculateSales(lastYearStart, lastYearEnd),
        },
        ordersData: {
          total: orders.length,
          pending: getOrderCountByStatus('pending'),
          processing: getOrderCountByStatus('processing'),
          shipped: getOrderCountByStatus('shipped'),
          delivered: getOrderCountByStatus('delivered'),
          cancelled: getOrderCountByStatus('cancelled'),
        },
        usersData: {
          total: users.length,
          thisMonth: getUsersCount(thisMonthStart),
          lastMonth: getUsersCount(lastMonthStart, lastMonthEnd),
        },
        productsData: {
          total: totalProducts,
          active: products.filter((product: any) => product.isActive).length,
          lowStock: products.filter((product: any) => product.stock < 20).length,
        },
      };

      setReportData(data);
    } catch (error) {
      console.error('خطا در دریافت گزارشات:', error);
      setError('خطا در دریافت داده‌های گزارش');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' تومان';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <FaArrowUp className="h-3 w-3" />;
    if (growth < 0) return <FaArrowDown className="h-3 w-3" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری گزارشات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchReportData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canViewFinancial) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-20">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <FaChartLine className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">دسترسی محدود</h2>
            <p className="text-gray-600 mb-4">شما مجوز مشاهده گزارشات مالی را ندارید.</p>
            <p className="text-sm text-gray-500">برای دسترسی به این بخش، با مدیر مالی تماس بگیرید.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  const currentSales = reportData.salesData[selectedPeriod as keyof typeof reportData.salesData];
  const previousSales = reportData.salesData[
    selectedPeriod === 'today' ? 'yesterday' :
    selectedPeriod === 'thisWeek' ? 'lastWeek' :
    selectedPeriod === 'thisMonth' ? 'lastMonth' :
    'lastYear' as keyof typeof reportData.salesData
  ];
  const salesGrowth = calculateGrowth(currentSales, previousSales);
  const usersGrowth = calculateGrowth(reportData.usersData.thisMonth, reportData.usersData.lastMonth);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">گزارشات و آمار</h1>
            <p className="mt-2 text-gray-600">تحلیل عملکرد فروشگاه و آمار فروش</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="today">امروز</option>
              <option value="thisWeek">این هفته</option>
              <option value="thisMonth">این ماه</option>
              <option value="thisYear">امسال</option>
            </select>
            
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <FaPrint className="h-4 w-4" />
              چاپ
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* فروش */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  فروش {
                    selectedPeriod === 'today' ? 'امروز' :
                    selectedPeriod === 'thisWeek' ? 'این هفته' :
                    selectedPeriod === 'thisMonth' ? 'این ماه' :
                    'امسال'
                  }
                </p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentSales)}</p>
                <div className={`flex items-center gap-1 mt-1 ${getGrowthColor(salesGrowth)}`}>
                  {getGrowthIcon(salesGrowth)}
                  <span className="text-sm">{Math.abs(salesGrowth).toFixed(1)}%</span>
                </div>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaDollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* سفارشات */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل سفارشات</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.ordersData.total)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {reportData.ordersData.pending} در انتظار
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* کاربران */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل کاربران</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.usersData.total)}</p>
                <div className={`flex items-center gap-1 mt-1 ${getGrowthColor(usersGrowth)}`}>
                  {getGrowthIcon(usersGrowth)}
                  <span className="text-sm">{Math.abs(usersGrowth).toFixed(1)}%</span>
                </div>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaUsers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* محصولات */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل محصولات</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.productsData.total)}</p>
                <p className="text-sm text-red-500 mt-1">
                  {reportData.productsData.lowStock} کم موجودی
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <FaBox className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">وضعیت سفارشات</h3>
            <div className="space-y-4">
              {[
                { label: 'در انتظار', value: reportData.ordersData.pending, color: 'bg-yellow-500' },
                { label: 'در حال پردازش', value: reportData.ordersData.processing, color: 'bg-blue-500' },
                { label: 'ارسال شده', value: reportData.ordersData.shipped, color: 'bg-purple-500' },
                { label: 'تحویل شده', value: reportData.ordersData.delivered, color: 'bg-green-500' },
                { label: 'لغو شده', value: reportData.ordersData.cancelled, color: 'bg-red-500' },
              ].map((status) => (
                <div key={status.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <span className="text-gray-700">{status.label}</span>
                  </div>
                  <span className="font-medium">{status.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">آمار کلی</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">نرخ تکمیل سفارشات:</span>
                <span className="font-medium">
                  {reportData.ordersData.total > 0 
                    ? Math.round((reportData.ordersData.delivered / reportData.ordersData.total) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">نرخ لغو سفارشات:</span>
                <span className="font-medium">
                  {reportData.ordersData.total > 0 
                    ? Math.round((reportData.ordersData.cancelled / reportData.ordersData.total) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">محصولات فعال:</span>
                <span className="font-medium">{reportData.productsData.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">کاربران جدید این ماه:</span>
                <span className="font-medium">{reportData.usersData.thisMonth}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Period comparison */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مقایسه دوره‌ای فروش</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'امروز', current: reportData.salesData.today, previous: reportData.salesData.yesterday },
              { label: 'این هفته', current: reportData.salesData.thisWeek, previous: reportData.salesData.lastWeek },
              { label: 'این ماه', current: reportData.salesData.thisMonth, previous: reportData.salesData.lastMonth },
              { label: 'امسال', current: reportData.salesData.thisYear, previous: reportData.salesData.lastYear },
            ].map((period) => {
              const growth = calculateGrowth(period.current, period.previous);
              return (
                <div key={period.label} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{period.label}</h4>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(period.current)}</p>
                  <div className={`flex items-center gap-1 mt-1 ${getGrowthColor(growth)}`}>
                    {getGrowthIcon(growth)}
                    <span className="text-sm">{Math.abs(growth).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 