'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaDollarSign,
  FaPercentage,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaCalendarAlt,
  FaSyncAlt,
  FaFileExport,
  FaCog
} from 'react-icons/fa';

interface PriceRecord {
  id: number;
  productName: string;
  supplierName: string;
  currentPrice: number;
  previousPrice: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  priceChange: number;
  priceChangePercent: number;
  lastUpdate: string;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
  category: string;
  unit: string;
  currency: 'IRR' | 'USD' | 'EUR';
  status: 'stable' | 'increasing' | 'decreasing';
}

const MOCK_PRICES: PriceRecord[] = [
  {
    id: 1,
    productName: 'دستکش جراحی لاتکس',
    supplierName: 'شرکت پارس مدیکال',
    currentPrice: 85000,
    previousPrice: 80000,
    minPrice: 75000,
    maxPrice: 90000,
    averagePrice: 82500,
    priceChange: 5000,
    priceChangePercent: 6.25,
    lastUpdate: '1403/09/15',
    category: 'لوازم یکبار مصرف',
    unit: 'جفت',
    currency: 'IRR',
    status: 'increasing',
    priceHistory: [
      { date: '1403/08/01', price: 75000 },
      { date: '1403/08/15', price: 78000 },
      { date: '1403/09/01', price: 80000 },
      { date: '1403/09/15', price: 85000 }
    ]
  },
  {
    id: 2,
    productName: 'ماسک N95',
    supplierName: 'توزیع آسیا مد',
    currentPrice: 12000,
    previousPrice: 15000,
    minPrice: 10000,
    maxPrice: 18000,
    averagePrice: 14000,
    priceChange: -3000,
    priceChangePercent: -20,
    lastUpdate: '1403/09/14',
    category: 'تجهیزات حفاظت فردی',
    unit: 'عدد',
    currency: 'IRR',
    status: 'decreasing',
    priceHistory: [
      { date: '1403/08/01', price: 18000 },
      { date: '1403/08/15', price: 16000 },
      { date: '1403/09/01', price: 15000 },
      { date: '1403/09/14', price: 12000 }
    ]
  },
  {
    id: 3,
    productName: 'سرم فیزیولوژی 500ml',
    supplierName: 'واردات گلدن مدیکال',
    currentPrice: 18500,
    previousPrice: 18500,
    minPrice: 17000,
    maxPrice: 20000,
    averagePrice: 18500,
    priceChange: 0,
    priceChangePercent: 0,
    lastUpdate: '1403/09/13',
    category: 'داروها و سرم',
    unit: 'ویال',
    currency: 'IRR',
    status: 'stable',
    priceHistory: [
      { date: '1403/08/01', price: 18000 },
      { date: '1403/08/15', price: 18500 },
      { date: '1403/09/01', price: 18500 },
      { date: '1403/09/13', price: 18500 }
    ]
  }
];

const STATUS_LABELS = {
  'stable': 'ثابت',
  'increasing': 'افزایشی',
  'decreasing': 'کاهشی'
};

export default function PricingPage() {
  const [prices, setPrices] = useState<PriceRecord[]>(MOCK_PRICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priceChangePercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);

  const filteredPrices = prices.filter(price => {
    const matchesSearch = price.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         price.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || price.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || price.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof PriceRecord] as number;
    const bValue = b[sortBy as keyof PriceRecord] as number;
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const categories = [...new Set(prices.map(p => p.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'increasing': return 'bg-red-100 text-red-800 border-red-200';
      case 'decreasing': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable': return <FaEquals className="w-3 h-3" />;
      case 'increasing': return <FaArrowUp className="w-3 h-3" />;
      case 'decreasing': return <FaArrowDown className="w-3 h-3" />;
      default: return <FaEquals className="w-3 h-3" />;
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const formatPrice = (price: number, currency: string = 'IRR') => {
    if (currency === 'IRR') {
      return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  const formatPriceChange = (change: number, percent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('fa-IR').format(change)} تومان (${sign}${percent}%)`;
  };

  // Calculate summary stats
  const totalProducts = prices.length;
  const increasingPrices = prices.filter(p => p.status === 'increasing').length;
  const decreasingPrices = prices.filter(p => p.status === 'decreasing').length;
  const stablePrices = prices.filter(p => p.status === 'stable').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">نظارت قیمت‌ها</h1>
            <p className="mt-2 text-gray-600">مدیریت و نظارت بر قیمت‌های تامین‌کنندگان</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <FaFileExport className="w-4 h-4" />
              خروجی Excel
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <FaSyncAlt className="w-4 h-4" />
              به‌روزرسانی قیمت‌ها
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
              <FaCog className="w-4 h-4" />
              تنظیمات قیمت‌گذاری
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaDollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">کل محصولات ردیابی شده</p>
                <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaArrowUp className="h-8 w-8 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">قیمت‌های افزایشی</p>
                <p className="text-3xl font-bold text-gray-900">{increasingPrices}</p>
                <p className="text-xs text-gray-500">
                  {totalProducts > 0 ? Math.round((increasingPrices / totalProducts) * 100) : 0}% از کل
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaArrowDown className="h-8 w-8 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">قیمت‌های کاهشی</p>
                <p className="text-3xl font-bold text-gray-900">{decreasingPrices}</p>
                <p className="text-xs text-gray-500">
                  {totalProducts > 0 ? Math.round((decreasingPrices / totalProducts) * 100) : 0}% از کل
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaEquals className="h-8 w-8 text-gray-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">قیمت‌های ثابت</p>
                <p className="text-3xl font-bold text-gray-900">{stablePrices}</p>
                <p className="text-xs text-gray-500">
                  {totalProducts > 0 ? Math.round((stablePrices / totalProducts) * 100) : 0}% از کل
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در محصولات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">همه دسته‌ها</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="increasing">افزایشی</option>
              <option value="decreasing">کاهشی</option>
              <option value="stable">ثابت</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="priceChangePercent">درصد تغییر قیمت</option>
              <option value="currentPrice">قیمت فعلی</option>
              <option value="lastUpdate">آخرین به‌روزرسانی</option>
              <option value="productName">نام محصول</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="desc">نزولی</option>
              <option value="asc">صعودی</option>
            </select>
          </div>
        </div>

        {/* Prices Table */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    محصول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تامین‌کننده
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    قیمت فعلی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تغییر قیمت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    محدوده قیمت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخرین به‌روزرسانی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {price.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {price.category} • {price.unit}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{price.supplierName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(price.currentPrice, price.currency)}
                      </div>
                      <div className="text-xs text-gray-500">
                        میانگین: {formatPrice(price.averagePrice, price.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPriceChangeColor(price.priceChange)}`}>
                        {formatPriceChange(price.priceChange, price.priceChangePercent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(price.status)}`}>
                        {getStatusIcon(price.status)}
                        {STATUS_LABELS[price.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPrice(price.minPrice, price.currency)} - {formatPrice(price.maxPrice, price.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                        {price.lastUpdate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FaChartLine className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPrices.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">هیچ رکورد قیمتی یافت نشد.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 