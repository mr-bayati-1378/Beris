'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaTruck, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaEdit,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaDollarSign,
  FaStar
} from 'react-icons/fa';

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  isActive: boolean;
  rating: number;
  totalOrders: number;
  totalPurchases: number;
  averageDeliveryTime: number;
  lastOrderDate: string;
  productsSupplied: string[];
  paymentTerms: string;
  contractStartDate: string;
  contractEndDate: string;
}

interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  averageRating: number;
  totalPurchaseValue: number;
  averageDeliveryTime: number;
}

export default function SupplySuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0,
    averageRating: 0,
    totalPurchaseValue: 0,
    averageDeliveryTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const itemsPerPage = 20;

  const fetchSuppliersData = async () => {
    try {
      setLoading(true);
      
      // Generate mock data for demonstration
      const mockSuppliers: Supplier[] = [
        {
          id: 1,
          name: 'شرکت تجهیزات پزشکی پارس',
          contactPerson: 'محمد احمدی',
          phone: '021-88901234',
          email: 'info@parsmedical.ir',
          address: 'تهران، خیابان ولیعصر، پلاک 123',
          city: 'تهران',
          isActive: true,
          rating: 4.8,
          totalOrders: 45,
          totalPurchases: 125000000,
          averageDeliveryTime: 3,
          lastOrderDate: '2024-01-15',
          productsSupplied: ['سرنگ تزریق', 'دستکش جراحی', 'ماسک N95'],
          paymentTerms: '30 روز اعتباری',
          contractStartDate: '2023-01-01',
          contractEndDate: '2024-12-31'
        },
        {
          id: 2,
          name: 'شرکت داروسازی کیمیا دارو',
          contactPerson: 'فاطمه رضایی',
          phone: '031-55901234',
          email: 'contact@kimiadaru.com',
          address: 'اصفهان، خیابان چهارباغ، پلاک 456',
          city: 'اصفهان',
          isActive: true,
          rating: 4.5,
          totalOrders: 32,
          totalPurchases: 98000000,
          averageDeliveryTime: 5,
          lastOrderDate: '2024-01-12',
          productsSupplied: ['دارو', 'محلول ضدعفونی', 'آلکل طبی'],
          paymentTerms: '45 روز اعتباری',
          contractStartDate: '2023-03-01',
          contractEndDate: '2024-12-31'
        },
        {
          id: 3,
          name: 'تجهیزات آزمایشگاهی آریا',
          contactPerson: 'علی محمودی',
          phone: '021-77901234',
          email: 'sales@arialab.ir',
          address: 'تهران، خیابان کریمخان، پلاک 789',
          city: 'تهران',
          isActive: true,
          rating: 4.2,
          totalOrders: 18,
          totalPurchases: 67000000,
          averageDeliveryTime: 7,
          lastOrderDate: '2024-01-08',
          productsSupplied: ['لوله آزمایش', 'میکروسکوپ', 'کیت تست'],
          paymentTerms: 'نقدی',
          contractStartDate: '2023-06-01',
          contractEndDate: '2024-12-31'
        },
        {
          id: 4,
          name: 'شرکت نساجی طبی البرز',
          contactPerson: 'مریم کریمی',
          phone: '026-33901234',
          email: 'info@alborztextile.com',
          address: 'کرج، خیابان مطهری، پلاک 321',
          city: 'کرج',
          isActive: false,
          rating: 3.8,
          totalOrders: 12,
          totalPurchases: 23000000,
          averageDeliveryTime: 10,
          lastOrderDate: '2023-11-20',
          productsSupplied: ['گاز طبی', 'بانداژ', 'پارچه استریل'],
          paymentTerms: '15 روز اعتباری',
          contractStartDate: '2023-02-01',
          contractEndDate: '2024-02-01'
        }
      ];

      setSuppliers(mockSuppliers);
      setTotalPages(1);
      
      // محاسبه آمار تامین‌کنندگان
      const activeCount = mockSuppliers.filter(s => s.isActive).length;
      const totalPurchases = mockSuppliers.reduce((sum, s) => sum + s.totalPurchases, 0);
      const avgRating = mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length;
      const avgDelivery = mockSuppliers.reduce((sum, s) => sum + s.averageDeliveryTime, 0) / mockSuppliers.length;

      setStats({
        totalSuppliers: mockSuppliers.length,
        activeSuppliers: activeCount,
        inactiveSuppliers: mockSuppliers.length - activeCount,
        averageRating: avgRating,
        totalPurchaseValue: totalPurchases,
        averageDeliveryTime: avgDelivery
      });
    } catch (error) {
      console.error('خطا در دریافت تامین‌کنندگان:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliersData();
  }, [currentPage, searchTerm, statusFilter, cityFilter, sortBy, sortOrder]);

  const getSupplierStatus = (supplier: Supplier) => {
    if (!supplier.isActive) {
      return {
        status: 'inactive',
        label: 'غیرفعال',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FaTimesCircle
      };
    }
    if (supplier.rating >= 4.5) {
      return {
        status: 'excellent',
        label: 'عالی',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FaCheckCircle
      };
    }
    if (supplier.rating >= 4.0) {
      return {
        status: 'good',
        label: 'خوب',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FaCheckCircle
      };
    }
    return {
      status: 'average',
      label: 'متوسط',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: FaExclamationTriangle
    };
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`h-3 w-3 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600">در حال بارگذاری تامین‌کنندگان...</p>
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
                <FaTruck className="text-blue-600" />
                مدیریت تامین‌کنندگان - تدارکات
              </h1>
              <p className="mt-1 text-gray-600">
                مدیریت تامین‌کنندگان، ارزیابی عملکرد و مدیریت قراردادها
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                بروزرسانی
              </button>
              <a
                href="/admin/supply/suppliers"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="h-4 w-4" />
                افزودن تامین‌کننده
              </a>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaTruck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSuppliers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">کل تامین‌کنندگان</p>
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
                  {stats.activeSuppliers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">فعال</p>
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
                  {stats.inactiveSuppliers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">غیرفعال</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FaStar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">میانگین امتیاز</p>
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
                  {(stats.totalPurchaseValue / 1000000).toFixed(0)}M
                </p>
                <p className="text-sm text-gray-600">کل خریدها (تومان)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaCalendarAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageDeliveryTime.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">متوسط تحویل (روز)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در تامین‌کنندگان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه شهرها</option>
              <option value="تهران">تهران</option>
              <option value="اصفهان">اصفهان</option>
              <option value="کرج">کرج</option>
              <option value="مشهد">مشهد</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">نام</option>
              <option value="rating">امتیاز</option>
              <option value="totalPurchases">حجم خرید</option>
              <option value="averageDeliveryTime">زمان تحویل</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="asc">صعودی</option>
              <option value="desc">نزولی</option>
            </select>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                فهرست تامین‌کنندگان ({stats.totalSuppliers.toLocaleString()})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تامین‌کننده
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تماس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شهر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    امتیاز
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    سفارشات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    حجم خرید
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
                {suppliers.length > 0 ? suppliers.map((supplier) => {
                  const supplierStatus = getSupplierStatus(supplier);
                  const StatusIcon = supplierStatus.icon;
                  return (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.contactPerson}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <FaPhone className="h-3 w-3 text-gray-400" />
                            {supplier.phone}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FaEnvelope className="h-3 w-3 text-gray-400" />
                            {supplier.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FaMapMarkerAlt className="h-3 w-3 text-gray-400" />
                          {supplier.city}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(supplier.rating)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {supplier.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {supplier.totalOrders.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {supplier.averageDeliveryTime} روز تحویل
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {(supplier.totalPurchases / 1000000).toFixed(1)}M تومان
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${supplierStatus.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {supplierStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/supply/suppliers/${supplier.id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800"
                            title="مشاهده جزئیات"
                          >
                            <FaEye className="h-4 w-4" />
                          </a>
                          <a
                            href={`/admin/supply/suppliers/${supplier.id}/edit`}
                            target="_blank"
                            className="text-amber-600 hover:text-amber-800"
                            title="ویرایش"
                          >
                            <FaEdit className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <FaTruck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>تامین‌کننده‌ای یافت نشد</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCheckCircle className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">تامین‌کنندگان فعال</h3>
            </div>
            <p className="text-blue-800 mb-4">
              {stats.activeSuppliers} تامین‌کننده در حال همکاری
            </p>
            <a
              href="/admin-supply/suppliers?status=active"
              className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium"
            >
              <FaEye className="h-4 w-4" />
              مشاهده فعال‌ها
            </a>
          </div>

          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaStar className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-green-900">عملکرد عالی</h3>
            </div>
            <p className="text-green-800 mb-4">
              میانگین امتیاز {stats.averageRating.toFixed(1)} از 5
            </p>
            <a
              href="/admin-supply/suppliers?rating=high"
              className="inline-flex items-center gap-2 text-green-800 hover:text-green-900 font-medium"
            >
              <FaStar className="h-4 w-4" />
              بررسی امتیازها
            </a>
          </div>

          <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaDollarSign className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold text-purple-900">حجم خریدها</h3>
            </div>
            <p className="text-purple-800 mb-4">
              {(stats.totalPurchaseValue / 1000000).toFixed(0)} میلیون تومان
            </p>
            <a
              href="/admin-supply/purchase-orders"
              className="inline-flex items-center gap-2 text-purple-800 hover:text-purple-900 font-medium"
            >
              <FaTruck className="h-4 w-4" />
              سفارشات خرید
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 