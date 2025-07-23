'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaBoxes,
  FaWarehouse,
  FaTruck,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaPrint,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaEye
} from 'react-icons/fa';

interface WarehouseData {
  totalStock: number;
  stockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  turnoverRate: number;
  avgFulfillmentTime: number;
  topMovingItems: Array<{
    id: string;
    name: string;
    currentStock: number;
    outgoingMovement: number;
    incomingMovement: number;
    category: string;
  }>;
  stockAlerts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    alertLevel: 'critical' | 'warning' | 'normal';
    lastOrder: string;
  }>;
}

export default function WarehouseReportsPage() {
  const [warehouseData, setWarehouseData] = useState<WarehouseData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouseData();
  }, [selectedPeriod]);

  const fetchWarehouseData = async () => {
    try {
      setLoading(true);
      
      // شبیه‌سازی داده‌های انبار
      const mockData: WarehouseData = {
        totalStock: 15420,
        stockValue: 425000000,
        lowStockItems: 12,
        outOfStockItems: 3,
        turnoverRate: 4.2,
        avgFulfillmentTime: 1.8,
        topMovingItems: [
          { id: '1', name: 'دستکش جراحی لاتکس', currentStock: 2580, outgoingMovement: 450, incomingMovement: 200, category: 'ملزومات جراحی' },
          { id: '2', name: 'ماسک جراحی', currentStock: 5200, outgoingMovement: 800, incomingMovement: 1000, category: 'منسوجات پزشکی' },
          { id: '3', name: 'سرنگ یکبار مصرف 5 سی‌سی', currentStock: 1850, outgoingMovement: 320, incomingMovement: 500, category: 'تزریقات' },
          { id: '4', name: 'نخ جراحی ویکریل 2-0', currentStock: 420, outgoingMovement: 85, incomingMovement: 100, category: 'نخ بخیه' },
          { id: '5', name: 'گاز استریل 10×10', currentStock: 850, outgoingMovement: 180, incomingMovement: 200, category: 'منسوجات پزشکی' },
        ],
        stockAlerts: [
          { id: '1', name: 'آلکل طبی 70%', currentStock: 8, minStock: 50, alertLevel: 'critical', lastOrder: '5 روز پیش' },
          { id: '2', name: 'نخ جراحی نایلون 3-0', currentStock: 15, minStock: 40, alertLevel: 'critical', lastOrder: '3 روز پیش' },
          { id: '3', name: 'چسب پزشکی', currentStock: 25, minStock: 60, alertLevel: 'warning', lastOrder: '1 روز پیش' },
          { id: '4', name: 'سرم فیزیولوژی', currentStock: 35, minStock: 80, alertLevel: 'warning', lastOrder: '2 روز پیش' },
          { id: '5', name: 'پنبه طبی استریل', currentStock: 45, minStock: 100, alertLevel: 'warning', lastOrder: '4 روز پیش' },
        ],
      };

      setTimeout(() => {
        setWarehouseData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('خطا در دریافت داده‌های انبار:', error);
      setError('خطا در دریافت گزارش انبار');
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' تومان';
  };

  const getAlertColor = (alertLevel: string) => {
    switch (alertLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (alertLevel: string) => {
    switch (alertLevel) {
      case 'critical': return <FaExclamationTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <FaExclamationTriangle className="w-4 h-4 text-yellow-600" />;
      case 'normal': return <FaCheckCircle className="w-4 h-4 text-green-600" />;
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
              <p className="text-gray-600">در حال بارگذاری گزارش انبار...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">گزارشات انبار</h1>
            <p className="mt-2 text-gray-600">مدیریت موجودی و تحلیل عملکرد انبار</p>
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
          {/* Total Stock */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل موجودی</p>
                <p className="text-2xl font-bold text-gray-900">{warehouseData?.totalStock.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500">قلم کالا</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaBoxes className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Stock Value */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ارزش موجودی</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(warehouseData?.stockValue || 0)}</p>
                <p className="text-sm text-gray-500">کل ارزش انبار</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaWarehouse className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Turnover Rate */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">نرخ گردش موجودی</p>
                <p className="text-2xl font-bold text-gray-900">{warehouseData?.turnoverRate}×</p>
                <p className="text-sm text-gray-500">در سال</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaChartBar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Fulfillment Time */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">زمان تکمیل سفارش</p>
                <p className="text-2xl font-bold text-gray-900">{warehouseData?.avgFulfillmentTime} ساعت</p>
                <p className="text-sm text-gray-500">میانگین</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <FaTruck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">هشدارهای موجودی</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-red-600 font-medium">{warehouseData?.outOfStockItems} کالا ناموجود</span>
              <span className="text-sm text-yellow-600 font-medium">{warehouseData?.lowStockItems} کالا کم موجود</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {warehouseData?.stockAlerts.map((alert) => (
              <div key={alert.id} className={`rounded-lg border p-4 ${getAlertColor(alert.alertLevel)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getAlertIcon(alert.alertLevel)}
                      <h4 className="font-medium text-gray-900">{alert.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      موجودی: {alert.currentStock} / حداقل: {alert.minStock}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      آخرین سفارش: {alert.lastOrder}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Top Moving Items */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">اقلام پرتردد</h3>
              <FaEye className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {warehouseData?.topMovingItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">موجودی: {item.currentStock}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span className="text-red-600">خروجی: {item.outgoingMovement}</span>
                      <span className="text-green-600">ورودی: {item.incomingMovement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Movement Chart */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">حرکت موجودی</h3>
              <FaChartBar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex h-48 items-center justify-center text-gray-500">
              <div className="text-center">
                <FaChartBar className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p>نمودار در حال توسعه</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Inventory Table */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">جزئیات موجودی</h3>
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
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">کالا</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">دسته‌بندی</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">موجودی فعلی</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">ورودی</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">خروجی</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {warehouseData?.topMovingItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm text-gray-900">{item.name}</td>
                    <td className="py-3 text-sm text-gray-500">{item.category}</td>
                    <td className="py-3 text-sm text-gray-900 font-semibold">{item.currentStock}</td>
                    <td className="py-3 text-sm text-green-600">+{item.incomingMovement}</td>
                    <td className="py-3 text-sm text-red-600">-{item.outgoingMovement}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        موجود
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