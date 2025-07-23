'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FaChartLine, 
  FaFileAlt, 
  FaDownload, 
  FaCalendarAlt,
  FaDollarSign,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaFilter,
  FaPrint,
  FaChartPie,
  FaChartBar,
  FaExclamationTriangle
} from 'react-icons/fa';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

interface FinanceReport {
  id: number;
  title: string;
  type: 'revenue' | 'expense' | 'profit' | 'cashflow';
  period: string;
  amount: number;
  change: number;
  status: 'positive' | 'negative' | 'neutral';
  createdAt: string;
  description: string;
}

interface FinanceStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyGrowth: number;
  revenueGrowth: number;
  expenseGrowth: number;
  cashFlow: number;
}

export default function FinanceReportsPage() {
  const [reports, setReports] = useState<FinanceReport[]>([]);
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyGrowth: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    cashFlow: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [reportType, setReportType] = useState('all');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        type: reportType,
        role: 'finance'
      });
      
      const response = await fetch(`/api/admin/financial-reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, reportType]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/financial-stats?period=${selectedPeriod}&role=finance`);
      if (response.ok) {
        const data = await response.json();
        setStats(prevStats => data.stats || prevStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return HiTrendingUp;
      case 'expense': return HiTrendingDown;
      case 'profit': return FaChartLine;
      case 'cashflow': return FaDollarSign;
      default: return FaFileAlt;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'revenue': return 'درآمد';
      case 'expense': return 'هزینه';
      case 'profit': return 'سود';
      case 'cashflow': return 'جریان نقدی';
      default: return 'عمومی';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'positive': return 'text-green-600 bg-green-100 border-green-200';
      case 'negative': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <FaArrowUp className="text-green-500" />;
    if (change < 0) return <FaArrowDown className="text-red-500" />;
    return <span className="text-gray-400">-</span>;
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/admin/financial-reports/export?format=${format}&period=${selectedPeriod}&type=${reportType}&role=finance`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${selectedPeriod}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('خطا در خروجی گرفتن از گزارش');
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                  <FaChartLine className="h-6 w-6 text-white" />
                </div>
                گزارش‌های مالی
              </h1>
              <p className="mt-2 text-gray-600">
                تحلیل و بررسی عملکرد مالی
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <button
                onClick={() => exportReport('excel')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <FaDownload className="h-4 w-4" />
                خروجی Excel
              </button>
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <FaPrint className="h-4 w-4" />
                خروجی PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="current-month">ماه جاری</option>
                <option value="last-month">ماه گذشته</option>
                <option value="current-quarter">فصل جاری</option>
                <option value="last-quarter">فصل گذشته</option>
                <option value="current-year">سال جاری</option>
                <option value="last-year">سال گذشته</option>
                <option value="custom">دوره سفارشی</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">همه گزارش‌ها</option>
                <option value="revenue">گزارش‌های درآمد</option>
                <option value="expense">گزارش‌های هزینه</option>
                <option value="profit">گزارش‌های سود</option>
                <option value="cashflow">گزارش‌های جریان نقدی</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
             <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                 <HiTrendingUp className="h-6 w-6" />
               </div>
               {getChangeIcon(stats.revenueGrowth)}
             </div>
            <div>
              <p className="text-sm opacity-90">کل درآمد</p>
              <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-2">
                {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% نسبت به قبل
              </p>
            </div>
          </div>

                     <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
             <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                 <HiTrendingDown className="h-6 w-6" />
               </div>
               {getChangeIcon(stats.expenseGrowth)}
             </div>
            <div>
              <p className="text-sm opacity-90">کل هزینه‌ها</p>
              <p className="text-2xl font-bold">{stats.totalExpenses.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-2">
                {stats.expenseGrowth > 0 ? '+' : ''}{stats.expenseGrowth.toFixed(1)}% نسبت به قبل
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <FaChartLine className="h-6 w-6" />
              </div>
              {getChangeIcon(stats.monthlyGrowth)}
            </div>
            <div>
              <p className="text-sm opacity-90">سود خالص</p>
              <p className="text-2xl font-bold">{stats.netProfit.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-2">
                حاشیه سود: {stats.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <FaDollarSign className="h-6 w-6" />
              </div>
              {getChangeIcon(stats.cashFlow)}
            </div>
            <div>
              <p className="text-sm opacity-90">جریان نقدی</p>
              <p className="text-2xl font-bold">{stats.cashFlow.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-2">
                {stats.cashFlow >= 0 ? 'مثبت' : 'منفی'}
              </p>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">گزارش‌های تفصیلی</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع گزارش
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عنوان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    دوره
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تغییرات
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ ایجاد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaSpinner className="inline-block animate-spin text-purple-500 text-2xl mb-4" />
                      <p className="text-gray-600">در حال بارگذاری گزارش‌ها...</p>
                    </td>
                  </tr>
                ) : reports.length > 0 ? (
                  reports.map((report) => {
                    const IconComponent = getReportTypeIcon(report.type);
                    return (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <IconComponent className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {getReportTypeLabel(report.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{report.title}</p>
                            <p className="text-sm text-gray-500">{report.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{report.period}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="h-4 w-4 text-gray-400" />
                            <span className="font-bold text-gray-900">
                              {report.amount.toLocaleString()} تومان
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getChangeIcon(report.change)}
                            <span className={`text-sm font-medium ${
                              report.change > 0 ? 'text-green-600' : 
                              report.change < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {report.change > 0 ? '+' : ''}{report.change.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                            {report.status === 'positive' ? 'مثبت' : 
                             report.status === 'negative' ? 'منفی' : 'خنثی'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{report.createdAt}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="مشاهده جزئیات"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => exportReport('pdf')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="خروجی PDF"
                            >
                              <FaDownload className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaChartLine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">گزارشی یافت نشد</h3>
                      <p className="text-gray-600">
                        برای دوره انتخاب شده گزارش مالی موجود نیست
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaChartPie className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">تحلیل هزینه‌ها</h3>
            </div>
            <p className="text-gray-600 mb-4">بررسی تفصیلی هزینه‌های شرکت</p>
            <Link
              href="/admin-finance/expense-analysis"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
            >
              <FaEye className="h-4 w-4" />
              مشاهده تحلیل
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaChartBar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">تحلیل درآمد</h3>
            </div>
            <p className="text-gray-600 mb-4">بررسی منابع درآمد و روند رشد</p>
            <Link
              href="/admin-finance/revenue-analysis"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium"
            >
              <FaEye className="h-4 w-4" />
              مشاهده تحلیل
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">هشدارهای مالی</h3>
            </div>
            <p className="text-gray-600 mb-4">نظارت بر مسائل مالی حیاتی</p>
            <Link
              href="/admin-finance/alerts"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
            >
              <FaEye className="h-4 w-4" />
              مشاهده هشدارها
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 