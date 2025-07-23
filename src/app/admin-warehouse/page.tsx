'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaWarehouse, 
  FaBox, 
  FaFolderOpen,
  FaShippingFast,
  FaImage,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaEye,
  FaPlus,
  FaCalendarAlt,
  FaTruck,
  FaClipboardList,
  FaChartBar
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp } from 'react-icons/hi';

interface WarehouseDashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingShipments: number;
  completedShipments: number;
  monthlyMovement: number;
  recentProducts: Array<{
    id: number;
    name: string;
    stock: number;
    status: string;
    category: string;
    lastUpdated: string;
  }>;
  lowStockItems: Array<{
    id: number;
    name: string;
    currentStock: number;
    minStock: number;
    category: string;
  }>;
  recentShipments: Array<{
    id: string;
    destination: string;
    products: number;
    status: string;
    date: string;
  }>;
  categoryStats: Array<{
    name: string;
    productCount: number;
    stockValue: number;
  }>;
}

export default function WarehouseDashboard() {
  const [stats, setStats] = useState<WarehouseDashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalStock: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    pendingShipments: 0,
    completedShipments: 0,
    monthlyMovement: 0,
    recentProducts: [],
    lowStockItems: [],
    recentShipments: [],
    categoryStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard?role=warehouse');
        if (response.ok) {
          const data = await response.json();
          // Merge با مقادیر پیش‌فرض برای اطمینان از وجود تمام خصوصیات
          setStats(prevStats => ({
            ...prevStats,
            ...data.stats
          }));
        } else {
          console.error('Failed to fetch warehouse data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching warehouse data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, []);

  function getStockStatusColor(currentStock: number, minStock: number) {
    if (currentStock === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (currentStock <= minStock) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }

  function getStockStatusText(currentStock: number, minStock: number) {
    if (currentStock === 0) return 'ناموجود';
    if (currentStock <= minStock) return 'موجودی کم';
    return 'موجود';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری داشبورد انبار...</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                داشبورد انبار
              </h1>
              <p className="mt-2 text-gray-600 text-lg">مدیریت موجودی و انبار</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
                <FaWarehouse className="text-amber-600" />
                <span className="text-sm font-medium text-amber-800">کل موجودی</span>
                <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                  {stats.totalStock.toLocaleString()}
                </span>
              </div>
              <Link 
                href="/admin-warehouse/products" 
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg"
              >
                <FaBox className="text-sm" />
                <span className="text-sm font-medium">مدیریت محصولات</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* کل محصولات */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaBox className="h-6 w-6" />
                </div>
                <HiSparkles className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل محصولات</p>
                <p className="text-3xl font-bold">{stats.totalProducts.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">محصول فعال</p>
              </div>
            </div>
          </div>

          {/* کل موجودی */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaWarehouse className="h-6 w-6" />
                </div>
                <HiTrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل موجودی</p>
                <p className="text-3xl font-bold">{stats.totalStock.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FaArrowUp className="text-xs" />
                  <span className="text-xs opacity-75">+{stats.monthlyMovement}% این ماه</span>
                </div>
              </div>
            </div>
          </div>

          {/* موجودی کم */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaExclamationTriangle className="h-6 w-6" />
                </div>
                <FaArrowDown className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">موجودی کم</p>
                <p className="text-3xl font-bold">{stats.lowStockProducts.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">نیاز به تامین</p>
              </div>
            </div>
          </div>

          {/* حمل و نقل */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaShippingFast className="h-6 w-6" />
                </div>
                <FaTruck className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">در حال ارسال</p>
                <p className="text-3xl font-bold">{stats.pendingShipments.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">محموله</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">محصولات اخیر</h3>
                  <Link 
                    href="/admin-warehouse/products" 
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
                  >
                    مشاهده همه
                    <FaEye className="text-xs" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {stats.recentProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{product.stock} عدد</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock === 0 
                              ? 'bg-red-100 text-red-800'
                              : product.stock <= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {product.stock === 0 ? 'ناموجود' : product.stock <= 10 ? 'موجودی کم' : 'موجود'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">هنوز محصولی ثبت نشده است</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">دسترسی سریع</h3>
              <div className="space-y-4">
                <Link 
                  href="/admin-warehouse/products" 
                  className="block p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                      <FaBox className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">مدیریت محصولات</h4>
                      <p className="text-sm text-gray-600">افزودن و ویرایش محصولات</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-warehouse/categories" 
                  className="block p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg group-hover:bg-emerald-700 transition-colors">
                      <FaFolderOpen className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">دسته‌بندی‌ها</h4>
                      <p className="text-sm text-gray-600">مدیریت دسته‌بندی محصولات</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-warehouse/inventory" 
                  className="block p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-600 rounded-lg group-hover:bg-amber-700 transition-colors">
                      <FaWarehouse className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">موجودی انبار</h4>
                      <p className="text-sm text-gray-600">کنترل و بروزرسانی موجودی</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin-warehouse/orders" 
                  className="block p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                      <FaShippingFast className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">حمل و نقل</h4>
                      <p className="text-sm text-gray-600">مدیریت ارسال‌ها</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                هشدار موجودی کم
              </h3>
              <div className="space-y-3">
                {stats.lowStockItems.length > 0 ? stats.lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-amber-700 font-semibold">
                          {item.currentStock} / {item.minStock}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">همه محصولات موجودی کافی دارند</p>
                )}
                {stats.lowStockItems.length > 5 && (
                  <Link 
                    href="/admin-warehouse/inventory?filter=low-stock"
                    className="block text-center text-amber-600 hover:text-amber-700 text-sm font-medium mt-3"
                  >
                    مشاهده {stats.lowStockItems.length - 5} مورد دیگر
                  </Link>
                )}
              </div>
            </div>

            {/* Category Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">آمار دسته‌بندی‌ها</h3>
              <div className="space-y-4">
                {stats.categoryStats.length > 0 ? stats.categoryStats.map((category, index) => (
                  <div key={category.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{category.name}</h4>
                      <p className="text-xs text-gray-600">
                        {category.productCount} محصول
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">هنوز دسته‌بندی‌ای ثبت نشده است</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 