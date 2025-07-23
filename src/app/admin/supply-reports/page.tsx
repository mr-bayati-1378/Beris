'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaTruck,
  FaBoxes,
  FaUsers,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaPrint,
  FaFilter,
  FaCalendar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaChartBar
} from 'react-icons/fa';

interface SupplyData {
  totalPurchases: number;
  purchasesGrowth: number;
  totalSuppliers: number;
  activeSuppliers: number;
  avgDeliveryTime: number;
  deliveryImprovement: number;
  costSavings: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    supplier: string;
    status: 'critical' | 'low' | 'normal';
  }>;
  supplierPerformance: Array<{
    id: string;
    name: string;
    deliveryRate: number;
    qualityScore: number;
    totalOrders: number;
    onTimeDelivery: number;
  }>;
}

export default function SupplyReportsPage() {
  const [supplyData, setSupplyData] = useState<SupplyData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupplyData();
  }, [selectedPeriod]);

  const fetchSupplyData = async () => {
    try {
      setLoading(true);
      
      // شبیه‌سازی داده‌های تامین
      const mockData: SupplyData = {
        totalPurchases: 18750000,
        purchasesGrowth: 8.5,
        totalSuppliers: 24,
        activeSuppliers: 18,
        avgDeliveryTime: 3.2,
        deliveryImprovement: -0.8,
        costSavings: 2150000,
        lowStockItems: [
          { id: '1', name: 'نخ جراحی ویکریل 2-0', currentStock: 15, minStock: 50, supplier: 'پارس طب', status: 'critical' },
          { id: '2', name: 'دستکش جراحی لاتکس سایز 7', currentStock: 35, minStock: 100, supplier: 'مدیکال پلاس', status: 'low' },
          { id: '3', name: 'سرنگ 5 سی‌سی', currentStock: 180, minStock: 200, supplier: 'دانا پلاستیک', status: 'low' },
          { id: '4', name: 'گاز استریل 10×10', currentStock: 25, minStock: 80, supplier: 'بهین نساجی', status: 'critical' },
          { id: '5', name: 'آلکل طبی 70%', currentStock: 8, minStock: 30, supplier: 'شیمی فارمد', status: 'critical' },
        ],
        supplierPerformance: [
          { id: '1', name: 'پارس طب', deliveryRate: 95, qualityScore: 4.8, totalOrders: 42, onTimeDelivery: 40 },
          { id: '2', name: 'مدیکال پلاس', deliveryRate: 88, qualityScore: 4.5, totalOrders: 38, onTimeDelivery: 33 },
          { id: '3', name: 'دانا پلاستیک', deliveryRate: 92, qualityScore: 4.3, totalOrders: 25, onTimeDelivery: 23 },
          { id: '4', name: 'بهین نساجی', deliveryRate: 78, qualityScore: 4.1, totalOrders: 18, onTimeDelivery: 14 },
          { id: '5', name: 'شیمی فارمد', deliveryRate: 85, qualityScore: 4.6, totalOrders: 15, onTimeDelivery: 13 },
        ],
      };

      setTimeout(() => {
        setSupplyData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('خطا در دریافت داده‌های تامین:', error);
      setError('خطا در دریافت گزارش تامین');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <FaExclamationTriangle className="w-3 h-3" />;
      case 'low': return <FaClock className="w-3 h-3" />;
      case 'normal': return <FaCheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری گزارش تامین...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">گزارشات تامین</h1>
            <p className="mt-2 text-gray-600">تحلیل عملکرد زنجیره تامین و مدیریت تامین‌کنندگان</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="thisWeek">این هفته</option>
              <option value="thisMonth">این ماه</option>
              <option value="thisQuarter">این فصل</option>
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
          {/* Total Purchases */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل خریدها</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(supplyData?.totalPurchases || 0)}</p>
                <div className={`mt-1 flex items-center text-sm ${getGrowthColor(supplyData?.purchasesGrowth || 0)}`}>
                  {getGrowthIcon(supplyData?.purchasesGrowth || 0)}
                  <span className="mr-1">{formatGrowth(supplyData?.purchasesGrowth || 0)}</span>
                  <span className="text-gray-500 mr-1">نسبت به دوره قبل</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaDollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Suppliers */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">تامین‌کنندگان فعال</p>
                <p className="text-2xl font-bold text-gray-900">{supplyData?.activeSuppliers || 0}</p>
                <div className="mt-1 text-sm text-gray-500">
                  <span>از {supplyData?.totalSuppliers} تامین‌کننده</span>
                </div>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Average Delivery Time */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">میانگین زمان تحویل</p>
                <p className="text-2xl font-bold text-gray-900">{supplyData?.avgDeliveryTime} روز</p>
                <div className={`mt-1 flex items-center text-sm ${getGrowthColor(supplyData?.deliveryImprovement || 0)}`}>
                  {getGrowthIcon(supplyData?.deliveryImprovement || 0)}
                  <span className="mr-1">{formatGrowth(supplyData?.deliveryImprovement || 0)}</span>
                  <span className="text-gray-500 mr-1">بهبود زمان</span>
                </div>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaTruck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Cost Savings */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">صرفه‌جویی هزینه</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(supplyData?.costSavings || 0)}</p>
                <div className="mt-1 text-sm text-gray-500">
                  <span>در این دوره</span>
                </div>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <FaBoxes className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Low Stock Items */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">اقلام کم موجودی</h3>
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-3">
              {supplyData?.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="ml-3">
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.supplier}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{item.currentStock} / {item.minStock}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status === 'critical' ? 'بحرانی' : item.status === 'low' ? 'کم' : 'عادی'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Performance */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">عملکرد تامین‌کنندگان</h3>
              <FaChartBar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {supplyData?.supplierPerformance.map((supplier) => (
                <div key={supplier.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">{supplier.name}</span>
                    <span className="text-gray-900 font-semibold">{supplier.deliveryRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${supplier.deliveryRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>کیفیت: {supplier.qualityScore}/5</span>
                    <span>{supplier.onTimeDelivery}/{supplier.totalOrders} به‌موقع</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Supply Table */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">جزئیات تامین</h3>
            <div className="flex items-center gap-2">
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
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">تامین‌کننده</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">نرخ تحویل</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">امتیاز کیفیت</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">کل سفارشات</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supplyData?.supplierPerformance.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="py-3 text-sm text-gray-900">{supplier.name}</td>
                    <td className="py-3 text-sm text-gray-900">{supplier.deliveryRate}%</td>
                    <td className="py-3 text-sm text-gray-900">{supplier.qualityScore}/5</td>
                    <td className="py-3 text-sm text-gray-900">{supplier.totalOrders}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.deliveryRate >= 90 ? 'bg-green-100 text-green-800' : 
                        supplier.deliveryRate >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {supplier.deliveryRate >= 90 ? 'عالی' : supplier.deliveryRate >= 80 ? 'خوب' : 'نیاز به بهبود'}
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