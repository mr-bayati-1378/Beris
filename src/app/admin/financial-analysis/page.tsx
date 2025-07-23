'use client';

import { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaDollarSign, 
  FaArrowUp, 
  FaArrowDown,
  FaCalendarAlt,
  FaDownload,
  FaSpinner,
  FaChartBar,
  FaChartPie,
  FaCreditCard,
  FaFileInvoice,
  FaShoppingCart,

  FaPercent
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

interface FinancialData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  expenses: {
    current: number;
    previous: number;
    growth: number;
  };
  profit: {
    current: number;
    previous: number;
    growth: number;
  };
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  topCategories: {
    name: string;
    revenue: number;
    percentage: number;
  }[];
  cashFlow: {
    date: string;
    inflow: number;
    outflow: number;
    net: number;
  }[];
}

export default function FinancialAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinancialData | null>(null);
  const [period, setPeriod] = useState('month'); // month, quarter, year
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, [period]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app this would come from API
      const mockData: FinancialData = {
        revenue: {
          current: 45000000,
          previous: 38000000,
          growth: 18.4
        },
        expenses: {
          current: 32000000,
          previous: 29000000,
          growth: 10.3
        },
        profit: {
          current: 13000000,
          previous: 9000000,
          growth: 44.4
        },
        monthlyData: [
          { month: 'فروردین', revenue: 35000000, expenses: 25000000, profit: 10000000 },
          { month: 'اردیبهشت', revenue: 38000000, expenses: 27000000, profit: 11000000 },
          { month: 'خرداد', revenue: 42000000, expenses: 30000000, profit: 12000000 },
          { month: 'تیر', revenue: 45000000, expenses: 32000000, profit: 13000000 },
          { month: 'مرداد', revenue: 40000000, expenses: 28000000, profit: 12000000 },
          { month: 'شهریور', revenue: 48000000, expenses: 34000000, profit: 14000000 }
        ],
        topCategories: [
          { name: 'الکترونیک', revenue: 15000000, percentage: 33.3 },
          { name: 'پوشاک', revenue: 12000000, percentage: 26.7 },
          { name: 'خانه و آشپزخانه', revenue: 8000000, percentage: 17.8 },
          { name: 'کتاب و نشریات', revenue: 6000000, percentage: 13.3 },
          { name: 'سایر', revenue: 4000000, percentage: 8.9 }
        ],
        cashFlow: [
          { date: '۱۴۰۳/۰۱/۰۱', inflow: 5000000, outflow: 3000000, net: 2000000 },
          { date: '۱۴۰۳/۰۱/۰۲', inflow: 6000000, outflow: 4000000, net: 2000000 },
          { date: '۱۴۰۳/۰۱/۰۳', inflow: 4500000, outflow: 3500000, net: 1000000 },
          { date: '۱۴۰۳/۰۱/۰۴', inflow: 7000000, outflow: 5000000, net: 2000000 },
          { date: '۱۴۰۳/۰۱/۰۵', inflow: 8000000, outflow: 6000000, net: 2000000 }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Mock export functionality
      const csvContent = `Period,Revenue,Expenses,Profit
Current,${data?.revenue.current},${data?.expenses.current},${data?.profit.current}
Previous,${data?.revenue.previous},${data?.expenses.previous},${data?.profit.previous}`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-analysis-${period}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">در حال بارگذاری تحلیل مالی...</p>
          </div>
        </div>
      </div>
    );
  }

  // Chart configurations
  const revenueChartData = {
    labels: data.monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'درآمد',
        data: data.monthlyData.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'هزینه‌ها',
        data: data.monthlyData.map(item => item.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'سود',
        data: data.monthlyData.map(item => item.profit),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const categoryChartData = {
    labels: data.topCategories.map(cat => cat.name),
    datasets: [
      {
        data: data.topCategories.map(cat => cat.percentage),
        backgroundColor: [
          '#3B82F6',
          '#EF4444',
          '#10B981',
          '#F59E0B',
          '#8B5CF6'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('fa-IR').format(value);
          }
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
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <FaChartLine className="h-6 w-6 text-white" />
              </div>
              تحلیل مالی
            </h1>
            <p className="mt-2 text-gray-600">
              تحلیل جامع وضعیت مالی، درآمد، هزینه‌ها و سودآوری
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="month">ماهانه</option>
              <option value="quarter">فصلی</option>
              <option value="year">سالانه</option>
            </select>

            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exportLoading ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <FaDownload className="h-4 w-4" />
              )}
              صادرات گزارش
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-100">کل درآمد</div>
              <FaDollarSign className="text-blue-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {data.revenue.current.toLocaleString()} تومان
            </div>
            <div className="flex items-center gap-2">
              {data.revenue.growth > 0 ? (
                <FaArrowUp className="text-green-300" />
              ) : (
                <FaArrowDown className="text-red-300" />
              )}
              <span className={`text-sm ${data.revenue.growth > 0 ? 'text-green-300' : 'text-red-300'}`}>
                {Math.abs(data.revenue.growth)}% نسبت به دوره قبل
              </span>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-red-100">کل هزینه‌ها</div>
              <FaCreditCard className="text-red-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {data.expenses.current.toLocaleString()} تومان
            </div>
            <div className="flex items-center gap-2">
              {data.expenses.growth > 0 ? (
                <FaArrowUp className="text-red-300" />
              ) : (
                <FaArrowDown className="text-green-300" />
              )}
              <span className={`text-sm ${data.expenses.growth > 0 ? 'text-red-300' : 'text-green-300'}`}>
                {Math.abs(data.expenses.growth)}% نسبت به دوره قبل
              </span>
            </div>
          </div>

          {/* Profit Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-green-100">سود خالص</div>
                             <FaChartLine className="text-green-200 h-8 w-8" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {data.profit.current.toLocaleString()} تومان
            </div>
            <div className="flex items-center gap-2">
              {data.profit.growth > 0 ? (
                <FaArrowUp className="text-green-300" />
              ) : (
                <FaArrowDown className="text-red-300" />
              )}
              <span className={`text-sm ${data.profit.growth > 0 ? 'text-green-300' : 'text-red-300'}`}>
                {Math.abs(data.profit.growth)}% نسبت به دوره قبل
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FaChartLine className="text-blue-500" />
                روند درآمد و هزینه‌ها
              </h3>
            </div>
            <div className="h-80">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FaChartPie className="text-purple-500" />
                توزیع درآمد بر اساس دسته‌بندی
              </h3>
            </div>
            <div className="h-80">
              <Doughnut data={categoryChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                }
              }} />
            </div>
          </div>
        </div>

        {/* Financial Ratios */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FaPercent className="text-amber-500" />
            نسبت‌های مالی کلیدی
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {((data.profit.current / data.revenue.current) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">حاشیه سود</div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {((data.expenses.current / data.revenue.current) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">نسبت هزینه به درآمد</div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {data.revenue.growth > 0 ? '+' : ''}{data.revenue.growth.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">رشد درآمد</div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {(data.revenue.current / data.monthlyData.length).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">میانگین درآمد ماهانه</div>
            </div>
          </div>
        </div>

        {/* Top Categories Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FaShoppingCart className="text-green-500" />
            برترین دسته‌بندی‌ها بر اساس درآمد
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">دسته‌بندی</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">درآمد</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">درصد</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">نمودار</th>
                </tr>
              </thead>
              <tbody>
                {data.topCategories.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{category.name}</td>
                    <td className="py-3 px-4">{category.revenue.toLocaleString()} تومان</td>
                    <td className="py-3 px-4">{category.percentage}%</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 