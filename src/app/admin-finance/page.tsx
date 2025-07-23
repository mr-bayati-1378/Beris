'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaDollarSign, 
  FaChartLine, 
  FaFileInvoice,
  FaCreditCard,
  FaCalculator,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaEye,
  FaPlus,
  FaCalendarAlt,
  FaChartPie
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp as HiTrend, HiTrendingUp } from 'react-icons/hi';

interface FinanceDashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalExpenses: number;
  monthlyExpenses: number;
  netProfit: number;
  profitMargin: number;
  pendingInvoices: number;
  overdueInvoices: number;
  recentTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    status: string;
  }>;
  monthlyChart: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export default function FinanceDashboard() {
  const [stats, setStats] = useState<FinanceDashboardStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    recentTransactions: [],
    monthlyChart: [],
    topExpenseCategories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard?role=finance');
        if (response.ok) {
          const data = await response.json();
          // Merge با مقادیر پیش‌فرض برای اطمینان از وجود تمام خصوصیات
          setStats(prevStats => ({
            ...prevStats,
            ...data.stats
          }));
        } else {
          console.error('Failed to fetch finance data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching finance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری داشبورد مالی...</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                داشبورد مالی
              </h1>
              <p className="mt-2 text-gray-600 text-lg">مدیریت و نظارت بر امور مالی</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border border-purple-200">
                <FaCalendarAlt className="text-purple-600" />
                <span className="text-sm font-medium text-purple-800">این ماه</span>
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {stats.profitMargin.toFixed(1)}% سود
                </span>
              </div>
              <Link 
                href="/admin-finance/invoices" 
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg"
              >
                <FaFileInvoice className="text-sm" />
                <span className="text-sm font-medium">مدیریت فاکتورها</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* درآمد کل */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaDollarSign className="h-6 w-6" />
                </div>
                <HiSparkles className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">درآمد کل</p>
                <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">تومان</p>
              </div>
            </div>
          </div>

          {/* هزینه‌ها */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaArrowDown className="h-6 w-6" />
                </div>
                <HiTrend className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل هزینه‌ها</p>
                <p className="text-3xl font-bold">{stats.totalExpenses.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">تومان</p>
              </div>
            </div>
          </div>

          {/* سود خالص */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <HiTrendingUp className="h-6 w-6" />
                </div>
                <FaArrowUp className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">سود خالص</p>
                <p className="text-3xl font-bold">{stats.netProfit.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FaArrowUp className="text-xs" />
                  <span className="text-xs opacity-75">{stats.profitMargin.toFixed(1)}% حاشیه سود</span>
                </div>
              </div>
            </div>
          </div>

          {/* فاکتورهای معوق */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaExclamationTriangle className="h-6 w-6" />
                </div>
                <FaFileInvoice className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">فاکتورهای معوق</p>
                <p className="text-3xl font-bold">{stats.overdueInvoices.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">نیاز به پیگیری</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">تراکنش‌های اخیر</h3>
                  <Link 
                    href="/admin-finance/reports" 
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  >
                    <FaEye className="text-sm" />
                    مشاهده تمام گزارش‌ها
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        شرح
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نوع
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مبلغ
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاریخ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recentTransactions.length > 0 ? stats.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'income' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {transaction.type === 'income' ? 'درآمد' : 'هزینه'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-semibold ${
                            transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} تومان
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{transaction.date}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          هنوز تراکنشی ثبت نشده است
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions & Analysis */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">دسترسی سریع</h3>
              <div className="space-y-4">
                <Link 
                  href="/admin-finance/analysis" 
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  <FaEye className="text-sm" />
                  مشاهده تحلیل کامل
                </Link>

                <Link 
                  href="/admin-finance/reports" 
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  <FaEye className="text-sm" />
                  مشاهده گزارش‌ها
                </Link>

                <Link 
                  href="/admin-finance/invoices" 
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  <FaEye className="text-sm" />
                  مدیریت فاکتورها
                </Link>

                <Link 
                  href="/admin-finance/orders" 
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  <FaEye className="text-sm" />
                  مشاهده سفارشات
                </Link>
              </div>
            </div>

            {/* Top Expense Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaChartPie className="text-purple-500" />
                بالاترین هزینه‌ها
              </h3>
              <div className="space-y-4">
                {stats.topExpenseCategories.length > 0 ? stats.topExpenseCategories.map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm font-semibold text-gray-600">
                        {category.amount.toLocaleString()} تومان
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}% از کل هزینه‌ها</div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">هنوز هزینه‌ای ثبت نشده است</p>
                )}
              </div>
            </div>

            {/* Financial Health */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">وضعیت مالی</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">درآمد ماهانه</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {stats.monthlyRevenue.toLocaleString()} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">هزینه ماهانه</span>
                  <span className="text-sm font-bold text-red-600">
                    {stats.monthlyExpenses.toLocaleString()} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">نسبت سود</span>
                  <span className="text-sm font-bold text-purple-600">
                    {stats.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 