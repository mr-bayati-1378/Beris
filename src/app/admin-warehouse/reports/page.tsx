'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FaChartBar, 
  FaBox, 
  FaWarehouse, 
  FaTruck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaDownload,
  FaPrint,
  FaSearch,
  FaFilter,
  FaLayerGroup
} from 'react-icons/fa';

interface WarehouseReport {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inStockProducts: number;
  inventoryTurnover: number;
  averageInventoryValue: number;
  fastMovingProducts: Product[];
  slowMovingProducts: Product[];
  stockMovements: StockMovement[];
  categoryAnalysis: CategoryStock[];
}

interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
  category: string;
  movementCount: number;
  lastMovement: string;
}

interface StockMovement {
  id: number;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
}

interface CategoryStock {
  category: string;
  totalProducts: number;
  totalValue: number;
  averageStock: number;
  lowStockCount: number;
}

export default function WarehouseReportsPage() {
  const [report, setReport] = useState<WarehouseReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchWarehouseReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        range: dateRange,
        category: selectedCategory,
        role: 'warehouse'
      });
      
      const response = await fetch(`/api/admin/warehouse-reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      }
    } catch (error) {
      console.error('Error fetching warehouse report:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedCategory]);

  useEffect(() => {
    fetchWarehouseReport();
  }, [fetchWarehouseReport]);

  const exportReport = () => {
    // Implementation for exporting report
    console.log('Exporting warehouse report...');
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
            <p className="text-gray-600">در حال تولید گزارش انبار...</p>
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
                <FaChartBar className="text-amber-600" />
                گزارشات انبار
              </h1>
              <p className="mt-1 text-gray-600">
                تحلیل عملکرد انبار، موجودی، گردش کالا و تحلیل دسته‌بندی‌ها
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="7days">7 روز گذشته</option>
                <option value="30days">30 روز گذشته</option>
                <option value="90days">3 ماه گذشته</option>
                <option value="1year">یک سال گذشته</option>
              </select>
              <button
                onClick={exportReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="h-4 w-4" />
                خروجی Excel
              </button>
              <button
                onClick={printReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPrint className="h-4 w-4" />
                چاپ گزارش
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaBox className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {report?.totalProducts.toLocaleString() || ''}
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
                  {(report?.totalValue / 1000000).toFixed(1) || ''}M
                </p>
                <p className="text-sm text-gray-600">ارزش موجودی</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
                             <div className="p-3 bg-purple-100 rounded-xl">
                 <FaChartLine className="h-6 w-6 text-purple-600" />
               </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {report?.inventoryTurnover.toFixed(1) || ''}
                </p>
                <p className="text-sm text-gray-600">گردش موجودی</p>
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
                  {report?.lowStockProducts.toLocaleString() || ''}
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
                  {report?.outOfStockProducts.toLocaleString() || ''}
                </p>
                <p className="text-sm text-gray-600">ناموجود</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fast Moving Products */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaArrowUp className="text-green-600" />
              محصولات پرفروش
            </h3>
            <div className="space-y-3">
              {report?.fastMovingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{product.movementCount} حرکت</p>
                    <p className="text-sm text-gray-500">موجودی: {product.stock}</p>
                  </div>
                </div>
              )) || ''}
            </div>
          </div>

          {/* Slow Moving Products */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaArrowDown className="text-red-600" />
              محصولات کم‌فروش
            </h3>
            <div className="space-y-3">
              {report?.slowMovingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{product.movementCount} حرکت</p>
                    <p className="text-sm text-gray-500">موجودی: {product.stock}</p>
                  </div>
                </div>
              )) || ''}
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">تحلیل دسته‌بندی محصولات</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">دسته‌بندی</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تعداد محصولات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ارزش کل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">میانگین موجودی</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کم موجود</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report?.categoryAnalysis.map((category, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{category.category}</td>
                      <td className="px-6 py-4 text-gray-900">{category.totalProducts.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-900">{(category.totalValue / 1000000).toFixed(1)}M تومان</td>
                      <td className="px-6 py-4 text-gray-900">{category.averageStock.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          category.lowStockCount > 0 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {category.lowStockCount} محصول
                        </span>
                      </td>
                    </tr>
                  )) || ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">آخرین حرکات موجودی</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">محصول</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مقدار</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">دلیل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report?.stockMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{movement.productName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          movement.type === 'in' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type === 'in' ? (
                            <>
                              <FaArrowUp className="h-3 w-3" />
                              ورود
                            </>
                          ) : (
                            <>
                              <FaArrowDown className="h-3 w-3" />
                              خروج
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{movement.quantity.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {new Date(movement.date).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{movement.reason}</td>
                    </tr>
                  )) || ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="h-6 w-6 text-amber-600" />
              <h3 className="font-semibold text-amber-900">هشدار موجودی</h3>
            </div>
            <p className="text-amber-800 mb-4">
              {report?.lowStockProducts} محصول نیاز به تامین دارند
            </p>
            <a
              href="/admin-warehouse/inventory?status=low-stock"
              className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 font-medium"
            >
              <FaSearch className="h-4 w-4" />
              مشاهده محصولات کم موجود
            </a>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaTimesCircle className="h-6 w-6 text-red-600" />
              <h3 className="font-semibold text-red-900">اقلام ناموجود</h3>
            </div>
            <p className="text-red-800 mb-4">
              {report?.outOfStockProducts} محصول ناموجود است
            </p>
            <a
              href="/admin-warehouse/inventory?status=out-of-stock"
              className="inline-flex items-center gap-2 text-red-800 hover:text-red-900 font-medium"
            >
              <FaSearch className="h-4 w-4" />
              مشاهده محصولات ناموجود
            </a>
          </div>

          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-green-900">عملکرد مطلوب</h3>
            </div>
            <p className="text-green-800 mb-4">
              گردش موجودی {report?.inventoryTurnover.toFixed(1) || ''} مناسب است
            </p>
                         <a
               href="/admin-warehouse/products"
               className="inline-flex items-center gap-2 text-green-800 hover:text-green-900 font-medium"
             >
               <FaChartLine className="h-4 w-4" />
               مشاهده همه محصولات
             </a>
          </div>
        </div>
      </div>
    </div>
  );
} 