'use client';

import { useState, useEffect } from 'react';
import { 
  FaTruck, 
  FaFileInvoice, 
  FaStore, 
  FaTags, 
  FaBoxes,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaEye
} from 'react-icons/fa';

interface SupplyStats {
  totalSuppliers: number;
  activePurchaseOrders: number;
  pendingInvoices: number;
  totalPurchaseValue: number;
  monthlySpend: number;
  avgDeliveryTime: number;
}

export default function SupplyDashboard() {
  const [stats, setStats] = useState<SupplyStats>({
    totalSuppliers: 0,
    activePurchaseOrders: 0,
    pendingInvoices: 0,
    totalPurchaseValue: 0,
    monthlySpend: 0,
    avgDeliveryTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with actual API call
    setTimeout(() => {
      setStats({
        totalSuppliers: 45,
        activePurchaseOrders: 12,
        pendingInvoices: 8,
        totalPurchaseValue: 150000000,
        monthlySpend: 25000000,
        avgDeliveryTime: 7
      });
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('ریال', 'تومان');
  };

  const quickActions = [
    {
      title: 'سفارش خرید جدید',
      icon: FaPlus,
      href: '/admin/supply/purchase-orders/new',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'ایجاد سفارش خرید جدید'
    },
    {
      title: 'فاکتور خرید جدید',
      icon: FaFileInvoice,
      href: '/admin/supply/purchase-invoices/new',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'ثبت فاکتور خرید'
    },
    {
      title: 'تامین‌کننده جدید',
      icon: FaTruck,
      href: '/admin/supply/suppliers/new',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'افزودن تامین‌کننده'
    },
    {
      title: 'گزارش خرید',
      icon: FaChartLine,
      href: '/admin/supply/reports',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'مشاهده گزارشات'
    }
  ];

  const recentActivities = [
    { action: 'سفارش خرید #PO-2024-001 تایید شد', time: '2 ساعت پیش', type: 'success' },
    { action: 'فاکتور خرید #INV-2024-045 ثبت شد', time: '4 ساعت پیش', type: 'info' },
    { action: 'تامین‌کننده جدید پارس طب اضافه شد', time: '1 روز پیش', type: 'success' },
    { action: 'سفارش خرید #PO-2024-002 در انتظار تایید', time: '2 روز پیش', type: 'warning' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                داشبورد تامین بازرگانی
              </h1>
              <p className="text-gray-600">
                مدیریت تامین‌کنندگان، سفارشات خرید و فاکتورها
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <FaTruck className="mr-2 h-4 w-4" />
                فعال
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">تامین‌کنندگان</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaTruck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">سفارشات فعال</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePurchaseOrders}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaBoxes className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">فاکتورهای معلق</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <FaFileInvoice className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ارزش کل خرید</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalPurchaseValue)}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaTags className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">خرید ماهانه</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.monthlySpend)}</p>
                <div className="flex items-center mt-1">
                  <FaArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">12%</span>
                </div>
              </div>
              <div className="rounded-full bg-teal-100 p-3">
                <FaChartLine className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">میانگین تحویل</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime}</p>
                <p className="text-xs text-gray-500">روز</p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <FaStore className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">اقدامات سریع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={`${action.color} text-white rounded-xl p-6 transition-all duration-200 transform hover:scale-105 shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <action.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activities & Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">فعالیت‌های اخیر</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                مشاهده همه
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 space-x-reverse">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">منوی تامین بازرگانی</h2>
            <div className="space-y-3">
              <a
                href="/admin/supply/suppliers"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <FaTruck className="h-5 w-5 text-gray-600 group-hover:text-blue-600 mr-3" />
                  <span className="text-gray-900 group-hover:text-blue-600">تامین‌کنندگان</span>
                </div>
                <FaEye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </a>
              
              <a
                href="/admin/supply/purchase-orders"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <FaBoxes className="h-5 w-5 text-gray-600 group-hover:text-blue-600 mr-3" />
                  <span className="text-gray-900 group-hover:text-blue-600">سفارشات خرید</span>
                </div>
                <FaEye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </a>
              
              <a
                href="/admin/supply/purchase-invoices"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <FaFileInvoice className="h-5 w-5 text-gray-600 group-hover:text-blue-600 mr-3" />
                  <span className="text-gray-900 group-hover:text-blue-600">فاکتورهای خرید</span>
                </div>
                <FaEye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </a>
              
              <a
                href="/admin/supply/pricing"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <FaTags className="h-5 w-5 text-gray-600 group-hover:text-blue-600 mr-3" />
                  <span className="text-gray-900 group-hover:text-blue-600">قیمت‌گذاری خرید</span>
                </div>
                <FaEye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </a>
              
              <a
                href="/admin/supply/market-sourcing"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <FaStore className="h-5 w-5 text-gray-600 group-hover:text-blue-600 mr-3" />
                  <span className="text-gray-900 group-hover:text-blue-600">تهیه از بازار</span>
                </div>
                <FaEye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 