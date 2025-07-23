'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaTruck, 
  FaDollarSign, 
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaDownload,
  FaPrint,
  FaSearch,
  FaBoxOpen,
  FaShippingFast,
  FaClock,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

interface SupplyReport {
  totalSuppliers: number;
  activeSuppliers: number;
  totalPurchases: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageDeliveryTime: number;
  averageOrderValue: number;
  topSuppliers: Supplier[];
  recentOrders: PurchaseOrder[];
  categoryPurchases: CategoryPurchase[];
  monthlyTrends: MonthlyTrend[];
  supplierPerformance: SupplierPerformance[];
}

interface Supplier {
  id: number;
  name: string;
  totalPurchases: number;
  orderCount: number;
  averageDelivery: number;
  rating: number;
}

interface PurchaseOrder {
  id: string;
  supplierName: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  expectedDelivery: string;
  items: number;
}

interface CategoryPurchase {
  category: string;
  totalSpent: number;
  orderCount: number;
  averagePrice: number;
}

interface MonthlyTrend {
  month: string;
  purchases: number;
  orders: number;
  avgDelivery: number;
}

interface SupplierPerformance {
  supplier: string;
  onTimeDelivery: number;
  qualityRating: number;
  costEfficiency: number;
  responseTime: number;
}

export default function SupplyReportsPage() {
  const [report, setReport] = useState<SupplyReport>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalPurchases: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageDeliveryTime: 0,
    averageOrderValue: 0,
    topSuppliers: [],
    recentOrders: [],
    categoryPurchases: [],
    monthlyTrends: [],
    supplierPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchSupplyReport = async () => {
    try {
      setLoading(true);
      
      // Generate mock data for demonstration
      const mockReport: SupplyReport = {
        totalSuppliers: 24,
        activeSuppliers: 18,
        totalPurchases: 485000000,
        pendingOrders: 12,
        completedOrders: 87,
        cancelledOrders: 3,
        averageDeliveryTime: 4.5,
        averageOrderValue: 5570000,
        topSuppliers: [
          { id: 1, name: 'شرکت تجهیزات پزشکی پارس', totalPurchases: 125000000, orderCount: 28, averageDelivery: 3, rating: 4.8 },
          { id: 2, name: 'شرکت داروسازی کیمیا دارو', totalPurchases: 98000000, orderCount: 22, averageDelivery: 5, rating: 4.5 },
          { id: 3, name: 'تجهیزات آزمایشگاهی آریا', totalPurchases: 67000000, orderCount: 15, averageDelivery: 7, rating: 4.2 },
          { id: 4, name: 'شرکت نساجی طبی البرز', totalPurchases: 45000000, orderCount: 12, averageDelivery: 6, rating: 4.0 },
          { id: 5, name: 'تامین کنندگان پزشکی مهر', totalPurchases: 38000000, orderCount: 18, averageDelivery: 4, rating: 4.3 }
        ],
        recentOrders: [
          { id: 'PO-2024-001', supplierName: 'شرکت تجهیزات پزشکی پارس', totalAmount: 15000000, status: 'delivered', orderDate: '2024-01-15', expectedDelivery: '2024-01-18', items: 5 },
          { id: 'PO-2024-002', supplierName: 'شرکت داروسازی کیمیا دارو', totalAmount: 8500000, status: 'pending', orderDate: '2024-01-14', expectedDelivery: '2024-01-19', items: 3 },
          { id: 'PO-2024-003', supplierName: 'تجهیزات آزمایشگاهی آریا', totalAmount: 12000000, status: 'shipped', orderDate: '2024-01-13', expectedDelivery: '2024-01-20', items: 8 },
          { id: 'PO-2024-004', supplierName: 'شرکت نساجی طبی البرز', totalAmount: 6700000, status: 'processing', orderDate: '2024-01-12', expectedDelivery: '2024-01-18', items: 12 },
          { id: 'PO-2024-005', supplierName: 'تامین کنندگان پزشکی مهر', totalAmount: 9200000, status: 'delivered', orderDate: '2024-01-11', expectedDelivery: '2024-01-15', items: 7 }
        ],
        categoryPurchases: [
          { category: 'تزریقات', totalSpent: 125000000, orderCount: 35, averagePrice: 3571000 },
          { category: 'ملزومات جراحی', totalSpent: 98000000, orderCount: 28, averagePrice: 3500000 },
          { category: 'تجهیزات آزمایشگاهی', totalSpent: 87000000, orderCount: 15, averagePrice: 5800000 },
          { category: 'منسوجات پزشکی', totalSpent: 65000000, orderCount: 25, averagePrice: 2600000 },
          { category: 'داروها', totalSpent: 55000000, orderCount: 18, averagePrice: 3056000 },
          { category: 'ضدعفونی کننده', totalSpent: 32000000, orderCount: 22, averagePrice: 1455000 }
        ],
        monthlyTrends: [
          { month: 'آذر', purchases: 45000000, orders: 15, avgDelivery: 5.2 },
          { month: 'دی', purchases: 52000000, orders: 18, avgDelivery: 4.8 },
          { month: 'بهمن', purchases: 38000000, orders: 12, avgDelivery: 5.1 },
          { month: 'اسفند', purchases: 48000000, orders: 16, avgDelivery: 4.3 },
          { month: 'فروردین', purchases: 56000000, orders: 19, avgDelivery: 4.1 },
          { month: 'اردیبهشت', purchases: 62000000, orders: 22, avgDelivery: 4.5 }
        ],
        supplierPerformance: [
          { supplier: 'شرکت تجهیزات پزشکی پارس', onTimeDelivery: 95, qualityRating: 4.8, costEfficiency: 4.5, responseTime: 4.9 },
          { supplier: 'شرکت داروسازی کیمیا دارو', onTimeDelivery: 88, qualityRating: 4.5, costEfficiency: 4.2, responseTime: 4.3 },
          { supplier: 'تجهیزات آزمایشگاهی آریا', onTimeDelivery: 82, qualityRating: 4.2, costEfficiency: 4.0, responseTime: 4.1 },
          { supplier: 'شرکت نساجی طبی البرز', onTimeDelivery: 75, qualityRating: 4.0, costEfficiency: 4.3, responseTime: 3.8 }
        ]
      };

      setReport(mockReport);
    } catch (error) {
      console.error('خطا در دریافت گزارش تدارکات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplyReport();
  }, [dateRange, selectedCategory]);

  const getOrderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'در انتظار', color: 'bg-amber-100 text-amber-800', icon: FaClock };
      case 'processing':
        return { label: 'در حال پردازش', color: 'bg-blue-100 text-blue-800', icon: FaBoxOpen };
      case 'shipped':
        return { label: 'ارسال شده', color: 'bg-purple-100 text-purple-800', icon: FaShippingFast };
      case 'delivered':
        return { label: 'تحویل شده', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'cancelled':
        return { label: 'لغو شده', color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  const exportReport = () => {
    console.log('Exporting supply report...');
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600">در حال تولید گزارش تدارکات...</p>
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
                <FaChartBar className="text-blue-600" />
                گزارشات تدارکات
              </h1>
              <p className="mt-1 text-gray-600">
                تحلیل عملکرد تامین‌کنندگان، خریدها و روند تدارکات
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaTruck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {report.totalSuppliers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">کل تامین‌کنندگان</p>
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
                  {(report.totalPurchases / 1000000).toFixed(0)}M
                </p>
                <p className="text-sm text-gray-600">کل خریدها (تومان)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaClipboardList className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {report.completedOrders.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">سفارشات تکمیل شده</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <FaClock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {report.averageDeliveryTime.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">متوسط تحویل (روز)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Suppliers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaArrowUp className="text-green-600" />
              برترین تامین‌کنندگان
            </h3>
            <div className="space-y-3">
              {report.topSuppliers.map((supplier, index) => (
                <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-500">{supplier.orderCount} سفارش</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{(supplier.totalPurchases / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-gray-500">امتیاز: {supplier.rating.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Spending */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              خرید بر اساس دسته‌بندی
            </h3>
            <div className="space-y-3">
              {report.categoryPurchases.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{category.category}</p>
                    <p className="text-sm text-gray-500">{category.orderCount} سفارش</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{(category.totalSpent / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-gray-500">میانگین: {(category.averagePrice / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">عملکرد تامین‌کنندگان</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تامین‌کننده</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تحویل به موقع (%)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کیفیت</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">بهره‌وری هزینه</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">پاسخگویی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.supplierPerformance.map((perf, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{perf.supplier}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${perf.onTimeDelivery}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{perf.onTimeDelivery}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          perf.qualityRating >= 4.5 ? 'bg-green-100 text-green-800' :
                          perf.qualityRating >= 4.0 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {perf.qualityRating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          perf.costEfficiency >= 4.5 ? 'bg-green-100 text-green-800' :
                          perf.costEfficiency >= 4.0 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {perf.costEfficiency.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          perf.responseTime >= 4.5 ? 'bg-green-100 text-green-800' :
                          perf.responseTime >= 4.0 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {perf.responseTime.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">آخرین سفارشات خرید</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره سفارش</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تامین‌کننده</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مبلغ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ سفارش</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تحویل مورد انتظار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.recentOrders.map((order) => {
                    const orderStatus = getOrderStatus(order.status);
                    const StatusIcon = orderStatus.icon;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-gray-900">{order.supplierName}</td>
                        <td className="px-6 py-4 text-gray-900">{(order.totalAmount / 1000000).toFixed(1)}M تومان</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${orderStatus.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {orderStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {new Date(order.orderDate).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {new Date(order.expectedDelivery).toLocaleDateString('fa-IR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">روند ماهانه خریدها</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {report.monthlyTrends.map((trend, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">{trend.month}</p>
                  <p className="text-lg font-bold text-gray-900">{(trend.purchases / 1000000).toFixed(0)}M</p>
                  <p className="text-xs text-gray-500">{trend.orders} سفارش</p>
                  <p className="text-xs text-gray-500">{trend.avgDelivery.toFixed(1)} روز تحویل</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaClipboardList className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">سفارشات در انتظار</h3>
            </div>
            <p className="text-blue-800 mb-4">
              {report.pendingOrders} سفارش نیاز به پیگیری دارند
            </p>
            <a
              href="/admin-supply/purchase-orders?status=pending"
              className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium"
            >
              <FaSearch className="h-4 w-4" />
              مشاهده سفارشات در انتظار
            </a>
          </div>

          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-green-900">عملکرد مطلوب</h3>
            </div>
            <p className="text-green-800 mb-4">
              {report.activeSuppliers} تامین‌کننده فعال
            </p>
            <a
              href="/admin-supply/suppliers?status=active"
              className="inline-flex items-center gap-2 text-green-800 hover:text-green-900 font-medium"
            >
              <FaTruck className="h-4 w-4" />
              مشاهده تامین‌کنندگان فعال
            </a>
          </div>

          <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaDollarSign className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold text-purple-900">هزینه‌ها</h3>
            </div>
            <p className="text-purple-800 mb-4">
              {(report.totalPurchases / 1000000).toFixed(0)} میلیون تومان خرید
            </p>
            <a
              href="/admin-supply/purchase-invoices"
              className="inline-flex items-center gap-2 text-purple-800 hover:text-purple-900 font-medium"
            >
              <FaClipboardList className="h-4 w-4" />
              مشاهده فاکتورها
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 