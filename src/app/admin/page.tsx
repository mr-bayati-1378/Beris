'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaDollarSign,
  FaChartLine,
  FaEye,
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaArrowUp,
  FaArrowDown,
  FaBell,
  FaCog,
  FaCalendarAlt,
  FaTruck,
  FaExclamationTriangle,
  FaFolderOpen
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp, HiClock } from 'react-icons/hi';
import { checkFinancialPermission } from '@/lib/admin-permissions-client';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  monthlyGrowth: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    date: string;
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    stock: number;
    minStock: number;
  }>;
  categoryStats: Array<{
    name: string;
    productCount: number;
    stockValue: number;
  }>;
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch('/api/admin/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    const data = await response.json();
    
    // اطمینان از وجود و صحت ساختار داده‌ها
    const stats = data.stats || {};
    
    return {
      totalProducts: stats.totalProducts || 0,
      totalCategories: stats.totalCategories || 0,
      totalOrders: stats.totalOrders || 0,
      totalRevenue: stats.totalRevenue || 0,
      totalUsers: stats.totalUsers || 0,
      monthlyGrowth: stats.monthlyGrowth || 0,
      recentOrders: Array.isArray(stats.recentOrders) ? stats.recentOrders : [],
      lowStockProducts: Array.isArray(stats.lowStockProducts) ? stats.lowStockProducts : [],
      categoryStats: Array.isArray(stats.categoryStats) ? stats.categoryStats : []
    };
  } catch (error) {
    console.error('خطا در دریافت آمار dashboard:', error);
    // در صورت خطا، داده‌های پیش‌فرض برگردان
    return {
      totalProducts: 0,
      totalCategories: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      monthlyGrowth: 0,
      recentOrders: [],
      lowStockProducts: [],
      categoryStats: []
    };
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'delivered': return 'تحویل شده';
    case 'processing': return 'در حال پردازش';
    case 'shipped': return 'ارسال شده';
    case 'pending': return 'در انتظار';
    case 'completed': return 'تکمیل شده';
    default: return status;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    monthlyGrowth: 0,
    recentOrders: [],
    lowStockProducts: [],
    categoryStats: []
  });
  const [canViewFinancial, setCanViewFinancial] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, financialPermission] = await Promise.all([
          getDashboardStats(),
          checkFinancialPermission()
        ]);
        
        // Merge با مقادیر پیش‌فرض برای اطمینان از وجود تمام خصوصیات
        setStats(prevStats => ({
          ...prevStats,
          ...dashboardStats
        }));
        setCanViewFinancial(financialPermission);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری داشبورد...</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                پنل مدیریت بریس
              </h1>
              <p className="mt-2 text-gray-600 text-lg">داشبورد مدیریت فروشگاه تجهیزات پزشکی</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <Link href="/admin/notifications" className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <FaBell className="text-blue-600" />
                <span className="text-sm font-medium">اطلاعیه‌ها</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg">
                <FaCog className="text-sm" />
                <span className="text-sm font-medium">تنظیمات</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* محصولات */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaBox className="h-6 w-6" />
                </div>
                <HiSparkles className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل محصولات</p>
                <p className="text-3xl font-bold">{(stats.totalProducts || 0).toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-1">محصول فعال</p>
              </div>
            </div>
          </div>

          {/* سفارشات */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaShoppingCart className="h-6 w-6" />
                </div>
                <HiTrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل سفارشات</p>
                <p className="text-3xl font-bold">{(stats.totalOrders || 0).toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                                      {(stats.monthlyGrowth || 0) >= 0 ? (
                      <FaArrowUp className="h-3 w-3 text-green-200" />
                    ) : (
                      <FaArrowDown className="h-3 w-3 text-red-200" />
                    )}
                    <span className="text-xs opacity-75">
                      {Math.abs(stats.monthlyGrowth || 0)}% از ماه قبل
                    </span>
                </div>
              </div>
            </div>
          </div>



          {/* کاربران */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaUsers className="h-6 w-6" />
                </div>
                <HiClock className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">کل کاربران</p>
                <p className="text-3xl font-bold">{(stats.totalUsers || 0).toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-1">کاربر ثبت‌شده</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          <Link href="/admin/products/new" className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <FaPlus className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">افزودن محصول</span>
          </Link>

          <Link href="/admin/orders" className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <FaTruck className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">مدیریت سفارشات</span>
          </Link>

          <Link href="/admin/categories" className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <FaBox className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">دسته‌بندی‌ها</span>
          </Link>

          <Link href="/admin/users" className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <FaUsers className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">مدیریت کاربران</span>
          </Link>

          <Link href="/admin/media" className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <FaImage className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">مدیریت رسانه</span>
          </Link>

          <Link href="/admin/reports" className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <FaChartLine className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">گزارشات</span>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">سفارشات اخیر</h3>
                <Link href="/admin/orders" className="text-blue-100 hover:text-white text-sm flex items-center gap-1">
                  <FaEye className="h-4 w-4" />
                  مشاهده همه
                </Link>
              </div>
            </div>
            <div className="p-6">
              {(!Array.isArray(stats.recentOrders) || stats.recentOrders.length === 0) ? (
                <div className="text-center py-8">
                  <FaShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">هیچ سفارشی یافت نشد</p>
                </div>
              ) : (
                <div className="space-y-4">
                                    {Array.isArray(stats.recentOrders) ? stats.recentOrders.map((order, index) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    )) : null}
                  </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaExclamationTriangle className="h-5 w-5" />
                  محصولات کم‌موجود
                </h3>
                <Link href="/admin/products" className="text-orange-100 hover:text-white text-sm flex items-center gap-1">
                  <FaEye className="h-4 w-4" />
                  مشاهده همه
                </Link>
              </div>
            </div>
            <div className="p-6">
              {(!Array.isArray(stats.lowStockProducts) || stats.lowStockProducts.length === 0) ? (
                <div className="text-center py-8">
                  <FaBox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">همه محصولات موجودی کافی دارند</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(stats.lowStockProducts) ? stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">{product.name}</p>
                        <p className="text-sm text-gray-600">حد مجاز: {product.minStock}</p>
                      </div>
                      <div className="text-left">
                        <span className="inline-block px-3 py-2 bg-red-100 text-red-800 rounded-xl font-bold">
                          {product.stock} باقی‌مانده
                        </span>
                      </div>
                    </div>
                  )) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaChartLine className="h-5 w-5" />
              آمار و تحلیل
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">سفارشات امروز</h4>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaTruck className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">در حال ارسال</h4>
                <p className="text-2xl font-bold text-emerald-600">8</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiTrendingUp className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">رشد فروش</h4>
                <p className="text-2xl font-bold text-purple-600">+{stats.monthlyGrowth}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Statistics */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaFolderOpen className="h-5 w-5" />
                آمار دسته‌بندی‌ها ({stats.totalCategories} دسته‌بندی)
              </h3>
              <Link href="/admin/categories" className="text-green-100 hover:text-white text-sm flex items-center gap-1">
                <FaEye className="h-4 w-4" />
                مدیریت دسته‌بندی‌ها
              </Link>
            </div>
          </div>
          <div className="p-6">
            {(!Array.isArray(stats.categoryStats) || stats.categoryStats.length === 0) ? (
              <div className="text-center py-8">
                <FaFolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">هیچ دسته‌بندی‌ای یافت نشد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.categoryStats.map((category, index) => (
                  <div key={category.name} className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-teal-50 transition-all duration-300 border border-gray-200 hover:border-green-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">
                          {category.name}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">تعداد محصولات:</span>
                        <span className="font-bold text-green-600">{category.productCount}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ارزش موجودی:</span>
                        <span className="font-bold text-blue-600">
                          {new Intl.NumberFormat('fa-IR').format(category.stockValue)} تومان
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((category.productCount / Math.max(...stats.categoryStats.map(c => c.productCount))) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 