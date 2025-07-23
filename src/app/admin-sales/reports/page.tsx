'use client';

import { useState, useEffect, useCallback } from 'react';
import PersianDateInput from '@/components/ui/persian-date-input';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaDownload,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaBoxes,
  FaUsers,
  FaDollarSign,
  FaShoppingCart,
  FaFileExcel,
  FaFilePdf,
  FaEye,
  FaPercentage,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesData {
  dailySales: {
    date: string;
    amount: number;
    count: number;
  }[];
  topProducts: {
    name: string;
    sales: number;
    revenue: number;
  }[];
  categoryDistribution: {
    category: string;
    percentage: number;
    sales: number;
  }[];
  customerStats: {
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
  };
  summary: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    salesGrowth: number;
    revenueGrowth: number;
    conversionRate: number;
  };
}

interface CategoryL1 {
  id: number;
  name: string;
  slug: string;
  categoryL2s?: {
    id: number;
    name: string;
    slug: string;
    categoryL3s?: {
      id: number;
      name: string;
      slug: string;
      _count?: {
        products: number;
      };
    }[];
  }[];
}

export default function SalesReportsPage() {
  const [dateRange, setDateRange] = useState('week'); // week, month, quarter, year, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders'>('revenue'); // revenue, orders, customers
  const [exportLoading, setExportLoading] = useState(false);
  const [reportType, setReportType] = useState('overview'); // overview, products, customers, trends
  const [categoryL1s, setCategoryL1s] = useState<CategoryL1[]>([]);

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/sales/reports?range=${dateRange}&role=sales`;
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSalesData(data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories/tree');
      if (response.ok) {
        const data = await response.json();
        setCategoryL1s(data);
      }
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', error);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
    fetchCategories();
  }, [fetchSalesData, fetchCategories]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      let url = `/api/admin/sales/reports/export?range=${dateRange}&format=${format}&role=sales`;
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = `sales-report-${dateRange}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(fileUrl);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading || !salesData) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">در حال بارگذاری گزارشات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chart configurations
  const lineChartData = {
    labels: salesData.dailySales.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: selectedMetric === 'revenue' ? 'درآمد (تومان)' : 'تعداد سفارش',
        data: salesData.dailySales.map(item => 
          selectedMetric === 'revenue' ? item.amount : item.count
        ),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      }
    ]
  };

  const barChartData = {
    labels: salesData.topProducts.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name),
    datasets: [
      {
        label: 'تعداد فروش',
        data: salesData.topProducts.map(item => item.sales),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'درآمد (تومان)',
        data: salesData.topProducts.map(item => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };

  const doughnutChartData = {
    labels: salesData.categoryDistribution.map(item => item.category),
    datasets: [
      {
        data: salesData.categoryDistribution.map(item => item.percentage),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <FaChartLine className="h-6 w-6 text-white" />
              </div>
              گزارشات فروش
            </h1>
            <p className="mt-2 text-gray-600">
              تحلیل جامع آمار فروش و عملکرد تیم
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">هفته جاری</option>
                <option value="month">ماه جاری</option>
                <option value="quarter">سه ماه اخیر</option>
                <option value="year">سال جاری</option>
                <option value="custom">بازه دلخواه</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <PersianDateInput
                  value={customStartDate}
                  onChange={(value) => setCustomStartDate(value)}
                  placeholder="تاریخ شروع"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">تا</span>
                <PersianDateInput
                  value={customEndDate}
                  onChange={(value) => setCustomEndDate(value)}
                  placeholder="تاریخ پایان"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('excel')}
                disabled={exportLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {exportLoading ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaFileExcel className="h-4 w-4" />
                )}
                Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exportLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <FaFilePdf className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-100">کل فروش</div>
              <FaShoppingCart className="text-blue-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {salesData.summary.totalSales.toLocaleString()}
            </div>
                         <div className="flex items-center text-blue-100">
               {salesData.summary.salesGrowth >= 0 ? (
                 <FaArrowUp className="h-4 w-4 mr-1" />
               ) : (
                 <FaArrowDown className="h-4 w-4 mr-1" />
               )}
               {Math.abs(salesData.summary.salesGrowth)}% نسبت به دوره قبل
             </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-green-100">درآمد کل</div>
              <FaDollarSign className="text-green-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {salesData.summary.totalRevenue.toLocaleString()} تومان
            </div>
                         <div className="flex items-center text-green-100">
               {salesData.summary.revenueGrowth >= 0 ? (
                 <FaArrowUp className="h-4 w-4 mr-1" />
               ) : (
                 <FaArrowDown className="h-4 w-4 mr-1" />
               )}
               {Math.abs(salesData.summary.revenueGrowth)}% نسبت به دوره قبل
             </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-purple-100">میانگین سفارش</div>
              <FaChartBar className="text-purple-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {salesData.summary.averageOrderValue.toLocaleString()} تومان
            </div>
            <div className="flex items-center text-purple-100">
              <FaPercentage className="h-4 w-4 mr-1" />
              نرخ تبدیل: {salesData.summary.conversionRate}%
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-orange-100">مشتریان</div>
              <FaUsers className="text-orange-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {(salesData.customerStats?.totalCustomers || 0).toLocaleString()}
            </div>
            <div className="flex items-center text-orange-100">
              <FaUsers className="h-4 w-4 mr-1" />
              جدید: {salesData.customerStats?.newCustomers || 0} | برگشتی: {salesData.customerStats?.returningCustomers || 0}
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 space-x-reverse">
              {[
                { id: 'overview', label: 'نمای کلی', icon: FaChartLine },
                { id: 'products', label: 'محصولات', icon: FaBoxes },
                { id: 'customers', label: 'مشتریان', icon: FaUsers },
                                 { id: 'trends', label: 'روندها', icon: FaArrowUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    reportType === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Charts Section */}
        {reportType === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Sales Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">روند فروش</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as 'revenue' | 'orders')}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="revenue">درآمد</option>
                    <option value="orders">تعداد سفارش</option>
                  </select>
                </div>
              </div>
              <div className="h-80">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">توزیع دسته‌بندی</h2>
              <div className="h-80">
                <Doughnut 
                  data={doughnutChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        position: 'bottom' as const,
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {reportType === 'products' && (
          <div className="space-y-8">
            {/* Category Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">فیلتر دسته‌بندی</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryL1s.map((l1) => (
                  <div key={l1.id} className="space-y-2">
                    <h3 className="font-medium text-gray-800">{l1.name}</h3>
                    {l1.categoryL2s?.map((l2) => (
                      <div key={l2.id} className="pl-4">
                        <h4 className="text-sm text-gray-600">{l2.name}</h4>
                        <div className="pl-4">
                          {l2.categoryL3s?.map((l3) => (
                            <div key={l3.id} className="text-sm text-gray-500">
                              {l3.name} ({l3._count?.products || 0})
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">محصولات پرفروش</h2>
              <div className="h-96">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">جزئیات محصولات</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        محصول
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تعداد فروش
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        درآمد
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.sales.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.revenue.toLocaleString()} تومان</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                            <FaEye className="h-4 w-4" />
                            مشاهده
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === 'customers' && (
          <div className="space-y-8">
            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-600">مشتریان جدید</div>
                  <FaUsers className="text-green-500 h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {(salesData.customerStats?.newCustomers || 0).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  در این دوره
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-600">مشتریان برگشتی</div>
                  <FaUsers className="text-blue-500 h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {(salesData.customerStats?.returningCustomers || 0).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  خرید مجدد
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-600">نرخ بازگشت</div>
                  <FaPercentage className="text-purple-500 h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {(salesData.customerStats?.totalCustomers || 0) > 0 
                    ? (((salesData.customerStats?.returningCustomers || 0) / (salesData.customerStats?.totalCustomers || 1)) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  از کل مشتریان
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'trends' && (
          <div className="space-y-8">
            {/* Trend Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">تحلیل روندها</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                                     <div className="flex items-center justify-between mb-2">
                     <h3 className="font-medium text-green-800">رشد فروش</h3>
                     <FaArrowUp className="text-green-600" />
                   </div>
                  <div className="text-2xl font-bold text-green-900">
                    {salesData.summary.salesGrowth >= 0 ? '+' : ''}{salesData.summary.salesGrowth}%
                  </div>
                  <p className="text-sm text-green-700 mt-1">نسبت به دوره قبل</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-blue-800">رشد درآمد</h3>
                    <FaDollarSign className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {salesData.summary.revenueGrowth >= 0 ? '+' : ''}{salesData.summary.revenueGrowth}%
                  </div>
                  <p className="text-sm text-blue-700 mt-1">نسبت به دوره قبل</p>
                </div>
              </div>

              <div className="mt-6 h-80">
                <Line 
                  data={{
                    ...lineChartData,
                    datasets: [
                      {
                        ...lineChartData.datasets[0],
                        label: 'روند فروش',
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      }
                    ]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">عملیات سریع</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <FaChartLine className="text-blue-600 h-6 w-6" />
              <div className="text-right">
                <div className="font-medium text-gray-900">گزارش تفصیلی</div>
                <div className="text-sm text-gray-500">مشاهده گزارش کامل</div>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors">
              <FaDownload className="text-green-600 h-6 w-6" />
              <div className="text-right">
                <div className="font-medium text-gray-900">دانلود گزارش</div>
                <div className="text-sm text-gray-500">Excel یا PDF</div>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <FaFilter className="text-purple-600 h-6 w-6" />
              <div className="text-right">
                <div className="font-medium text-gray-900">فیلتر پیشرفته</div>
                <div className="text-sm text-gray-500">تنظیمات بیشتر</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 