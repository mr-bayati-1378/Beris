'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FaWarehouse, 
  FaBox, 
  FaSearch, 
  FaFilter,
  FaEdit,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTruck,
  FaDollarSign,
  FaSpinner,
  FaBarcode,
  FaCalendarAlt
} from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  brand?: string;
  categoryL3?: {
    name: string;
    categoryL2: {
      name: string;
      categoryL1: {
        name: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
}

export default function WarehouseInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inStockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('stock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const itemsPerPage = 20;

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
        role: 'warehouse'
      });

      const response = await fetch(`/api/admin/inventory?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setStats(data.stats || {
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          inStockCount: 0
        });
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return {
        status: 'out-of-stock',
        label: 'ناموجود',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FaTimesCircle
      };
    }
    if (product.stock <= (product.lowStockThreshold || 10)) {
      return {
        status: 'low-stock',
        label: 'کم موجود',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: FaExclamationTriangle
      };
    }
    return {
      status: 'in-stock',
      label: 'موجود',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: FaCheckCircle
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
            <p className="text-gray-600">در حال بارگذاری اطلاعات موجودی...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaWarehouse className="text-amber-600" />
                مدیریت موجودی انبار
              </h1>
              <p className="mt-1 text-gray-600">
                کنترل و مدیریت موجودی محصولات، تنظیم حد اقل موجودی و هشدارها
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                بروزرسانی
              </button>
              <a
                href="/admin/products/new"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <FaBox className="h-4 w-4" />
                افزودن محصول
              </a>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaBox className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalProducts || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">کل محصولات</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalValue || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">ارزش کل (تومان)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.inStockCount || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">موجود</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <FaExclamationTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.lowStockCount || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">کم موجود</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <FaTimesCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.outOfStockCount || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">ناموجود</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در محصولات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="in-stock">موجود</option>
              <option value="low-stock">کم موجود</option>
              <option value="out-of-stock">ناموجود</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="stock">موجودی</option>
              <option value="name">نام محصول</option>
              <option value="price">قیمت</option>
              <option value="updatedAt">آخرین بروزرسانی</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="asc">صعودی</option>
              <option value="desc">نزولی</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                موجودی محصولات ({(stats?.totalProducts || 0).toLocaleString()})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    محصول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    دسته‌بندی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    قیمت واحد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    موجودی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ارزش کل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length > 0 ? products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const StatusIcon = stockStatus.icon;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.brand && (
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {product.categoryL3?.categoryL2?.categoryL1?.name}
                          {product.categoryL3?.categoryL2?.name && ` › ${product.categoryL3.categoryL2.name}`}
                          {product.categoryL3?.name && ` › ${product.categoryL3.name}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.price.toLocaleString()} تومان
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-bold ${
                          product.stock === 0 ? 'text-red-600' :
                          product.stock <= 10 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {product.stock.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {(product.price * product.stock).toLocaleString()} تومان
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/products/${product.id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800"
                            title="مشاهده جزئیات"
                          >
                            <FaEye className="h-4 w-4" />
                          </a>
                          <a
                            href={`/admin/products/${product.id}/edit`}
                            target="_blank"
                            className="text-amber-600 hover:text-amber-800"
                            title="ویرایش موجودی"
                          >
                            <FaEdit className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <FaWarehouse className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>محصولی یافت نشد</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  صفحه {currentPage} از {totalPages} ({stats.totalProducts.toLocaleString()} محصول)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900">هشدار موجودی کم</h3>
                <p className="text-sm text-amber-800">
                  {stats.lowStockCount} محصول نیاز به تامین دارند
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="flex items-center gap-3">
              <FaTimesCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">محصولات ناموجود</h3>
                <p className="text-sm text-red-800">
                  {stats.outOfStockCount} محصول ناموجود است
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-3">
              <FaTruck className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">سفارش جدید</h3>
                <p className="text-sm text-blue-800">
                  برای تامین محصولات کم موجود
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 