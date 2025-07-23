'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaTruck, 
  FaStore, 
  FaDollarSign,
  FaChartLine,
  FaEye,
  FaFileInvoice,
  FaBoxes,
  FaArrowUp,
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTags,
  FaFileAlt,
  FaPlus,
  FaClipboardList
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp as HiTrend } from 'react-icons/hi';

interface SupplyDashboardStats {
  totalSuppliers: number;
  totalPurchaseOrders: number;
  totalPurchaseAmount: number;
  pendingOrders: number;
  monthlyGrowth: number;
  activeSuppliers: number;
  recentPurchaseOrders: Array<{
    id: string;
    supplierName: string;
    total: number;
    status: string;
    date: string;
  }>;
  topSuppliers: Array<{
    id: number;
    name: string;
    totalOrders: number;
    totalAmount: number;
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    stock: number;
    minStock: number;
  }>;
}

export default function SupplyDashboard() {
  const [stats, setStats] = useState<SupplyDashboardStats>({
    totalSuppliers: 0,
    totalPurchaseOrders: 0,
    totalPurchaseAmount: 0,
    pendingOrders: 0,
    monthlyGrowth: 0,
    activeSuppliers: 0,
    recentPurchaseOrders: [],
    topSuppliers: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplyData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard?role=supply');
        if (response.ok) {
          const data = await response.json();
          // Merge با مقادیر پیش‌فرض برای اطمینان از وجود تمام خصوصیات
          setStats(prevStats => ({
            ...prevStats,
            ...data.stats
          }));
        } else {
          console.error('Failed to fetch supply data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching supply data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplyData();
  }, []);

  function getStatusColor(status: string) {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'delivered': return 'تحویل شده';
      case 'processing': return 'در حال پردازش';
      case 'shipped': return 'ارسال شده';
      case 'pending': return 'در انتظار تایید';
      case 'approved': return 'تایید شده';
      default: return status;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری داشبورد تامین...</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                داشبورد تامین و بازرگانی
              </h1>
              <p className="mt-2 text-gray-600 text-lg">مدیریت تامین‌کنندگان و خریدها</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <FaTruck className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">تامین‌کنندگان فعال</span>
                <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                  {stats.activeSuppliers || 0}
                </span>
              </div>
              <Link 
                href="/admin-supply/purchase-orders" 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg"
              >
                <FaClipboardList className="text-sm" />
                <span className="text-sm font-medium">مدیریت سفارشات خرید</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* تامین‌کنندگان */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaTruck className="h-6 w-6" />
                </div>
                <HiSparkles className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل تامین‌کنندگان</p>
                <p className="text-3xl font-bold">{(stats.totalSuppliers || 0).toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">تامین‌کننده فعال</p>
              </div>
            </div>
          </div>

          {/* سفارشات خرید */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaFileAlt className="h-6 w-6" />
                </div>
                <HiTrend className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">سفارشات خرید</p>
                <p className="text-3xl font-bold">{(stats.totalPurchaseOrders || 0).toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FaArrowUp className="text-xs" />
                  <span className="text-xs opacity-75">+{stats.monthlyGrowth || 0}% این ماه</span>
                </div>
              </div>
            </div>
          </div>

          {/* مبلغ خریدها */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaDollarSign className="h-6 w-6" />
                </div>
                <HiTrend className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل مبلغ خریدها</p>
                <p className="text-3xl font-bold">{(stats.totalPurchaseAmount || 0).toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">تومان</p>
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
                <p className="text-sm font-medium opacity-90">در انتظار تایید</p>
                <p className="text-3xl font-bold">{(stats.pendingOrders || 0).toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">سفارش خرید</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Purchase Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">سفارشات خرید اخیر</h3>
                  <Link 
                    href="/admin-supply/purchase-orders" 
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
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
                        تامین‌کننده
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
                    {stats.recentPurchaseOrders.length > 0 ? stats.recentPurchaseOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.supplierName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-semibold">
                            {(order.total || 0).toLocaleString()} تومان
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
                          هنوز سفارش خریدی ثبت نشده است
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions & Top Suppliers */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">دسترسی سریع</h3>
              <div className="space-y-4">
                <Link 
                  href="/admin-supply/purchase-orders" 
                  className="block p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg group-hover:bg-emerald-700 transition-colors">
                      <FaFileAlt className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">سفارشات خرید</h4>
                      <p className="text-sm text-gray-600">مدیریت سفارشات خرید</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-supply/suppliers" 
                  className="block p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                      <FaStore className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">تامین‌کنندگان</h4>
                      <p className="text-sm text-gray-600">مدیریت تامین‌کنندگان</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-supply/pricing" 
                  className="block p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                      <FaTags className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">قیمت‌گذاری</h4>
                      <p className="text-sm text-gray-600">مدیریت قیمت‌ها</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-supply/market-sourcing" 
                  className="block p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-600 rounded-lg group-hover:bg-amber-700 transition-colors">
                      <FaDollarSign className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">تامین از بازار</h4>
                      <p className="text-sm text-gray-600">خرید از بازار</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Top Suppliers */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">برترین تامین‌کنندگان</h3>
              <div className="space-y-4">
                {stats.topSuppliers.length > 0 ? stats.topSuppliers.map((supplier, index) => (
                  <div key={supplier.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{supplier.name}</h4>
                      <p className="text-xs text-gray-600">
                        {supplier.totalOrders || 0} سفارش • {(supplier.totalAmount || 0).toLocaleString()} تومان
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">هنوز تامین‌کننده‌ای ثبت نشده است</p>
                )}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                موجودی پایین
              </h3>
              <div className="space-y-3">
                {stats.lowStockProducts.length > 0 ? stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                    <p className="text-xs text-amber-700">
                      موجودی: {product.stock} • حداقل: {product.minStock}
                    </p>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">همه محصولات موجودی کافی دارند</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 