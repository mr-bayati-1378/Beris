'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaShoppingCart,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaPrint,
  FaFilter,
  FaCalendar,
  FaEye,
  FaSearch
} from 'react-icons/fa';

interface SalesData {
  totalSales: number;
  salesGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  avgOrderValue: number;
  avgGrowth: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    orders: number;
    revenue: number;
  }>;
  salesByChannel: Array<{
    channel: string;
    sales: number;
    percentage: number;
  }>;
}

export default function SalesReportsPage() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      // شبیه‌سازی داده‌های فروش
      const mockData: SalesData = {
        totalSales: 34250000,
        salesGrowth: 15.8,
        totalOrders: 1247,
        ordersGrowth: 12.3,
        avgOrderValue: 27500,
        avgGrowth: 3.1,
        conversionRate: 4.2,
        topProducts: [
          { id: '1', name: 'نخ جراحی ویکریل', sales: 145, orders: 89, revenue: 8450000 },
          { id: '2', name: 'دستکش جراحی لاتکس', sales: 230, orders: 156, revenue: 6900000 },
          { id: '3', name: 'سرنگ یکبار مصرف', sales: 340, orders: 201, revenue: 5100000 },
          { id: '4', name: 'گاز استریل', sales: 180, orders: 98, revenue: 3600000 },
          { id: '5', name: 'ماسک جراحی', sales: 520, orders: 278, revenue: 2800000 },
        ],
        salesByChannel: [
          { channel: 'وب‌سایت', sales: 20550000, percentage: 60 },
          { channel: 'تلفنی', sales: 10280000, percentage: 30 },
          { channel: 'حضوری', sales: 3420000, percentage: 10 },
        ],
      };

      setTimeout(() => {
        setSalesData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('خطا در دریافت داده‌های فروش:', error);
      setError('خطا در دریافت گزارش فروش');
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' تومان';
  };

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری گزارش فروش...</p>
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
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">گزارشات فروش</h1>
            <p className="mt-2 text-gray-600">تحلیل جامع عملکرد فروش و روندهای بازار</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="today">امروز</option>
              <option value="thisWeek">این هفته</option>
              <option value="thisMonth">این ماه</option>
              <option value="thisYear">امسال</option>
            </select>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
              <FaDownload className="mr-2 inline h-4 w-4" />
              دانلود گزارش
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Sales */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل فروش</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesData?.totalSales || 0)}</p>
                <div className={`mt-1 flex items-center text-sm ${getGrowthColor(salesData?.salesGrowth || 0)}`}>
                  {getGrowthIcon(salesData?.salesGrowth || 0)}
                  <span className="mr-1">{formatGrowth(salesData?.salesGrowth || 0)}</span>
                  <span className="text-gray-500 mr-1">نسبت به دوره قبل</span>
                </div>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaDollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">تعداد سفارشات</p>
                <p className="text-2xl font-bold text-gray-900">{salesData?.totalOrders.toLocaleString() || 0}</p>
                <div className={`mt-1 flex items-center text-sm ${getGrowthColor(salesData?.ordersGrowth || 0)}`}>
                  {getGrowthIcon(salesData?.ordersGrowth || 0)}
                  <span className="mr-1">{formatGrowth(salesData?.ordersGrowth || 0)}</span>
                  <span className="text-gray-500 mr-1">نسبت به دوره قبل</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">میانگین ارزش سفارش</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesData?.avgOrderValue || 0)}</p>
                <div className={`mt-1 flex items-center text-sm ${getGrowthColor(salesData?.avgGrowth || 0)}`}>
                  {getGrowthIcon(salesData?.avgGrowth || 0)}
                  <span className="mr-1">{formatGrowth(salesData?.avgGrowth || 0)}</span>
                  <span className="text-gray-500 mr-1">نسبت به دوره قبل</span>
                </div>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaChartLine className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">نرخ تبدیل</p>
                <p className="text-2xl font-bold text-gray-900">{salesData?.conversionRate}%</p>
                <div className="mt-1 text-sm text-gray-500">
                  <span>از بازدیدکنندگان به مشتری</span>
                </div>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <FaUsers className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Top Products */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">محصولات پرفروش</h3>
              <FaEye className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {salesData?.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.orders} سفارش</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                    <p className="text-sm text-gray-500">{product.sales} فروش</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Channel */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">فروش بر اساس کانال</h3>
              <FaChartLine className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {salesData?.salesByChannel.map((channel, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">{channel.channel}</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(channel.sales)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${channel.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500 text-left">
                    {channel.percentage}% از کل فروش
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Sales Table */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">جزئیات فروش</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200">
                <FaFilter className="mr-1 inline h-3 w-3" />
                فیلتر
              </button>
              <button className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200">
                <FaPrint className="mr-1 inline h-3 w-3" />
                چاپ
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">محصول</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">تعداد فروش</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">سفارشات</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">درآمد</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salesData?.topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="py-3 text-sm text-gray-900">{product.sales}</td>
                    <td className="py-3 text-sm text-gray-900">{product.orders}</td>
                    <td className="py-3 text-sm text-green-600 font-semibold">{formatCurrency(product.revenue)}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        فعال
                      </span>
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