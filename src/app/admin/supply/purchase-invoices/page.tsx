'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaFileInvoice,
  FaCalendarAlt,
  FaFileDownload,
  FaCheck,
  FaTimes,
  FaClock,
  FaExclamationTriangle,
  FaDollarSign,
  FaPrint,
  FaFileExport
} from 'react-icons/fa';

interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  supplierName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  paymentMethod?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
}

const MOCK_INVOICES: PurchaseInvoice[] = [
  {
    id: 1,
    invoiceNumber: 'PI-2024-001',
    supplierName: 'شرکت پارس مدیکال',
    issueDate: '1403/09/15',
    dueDate: '1403/10/15',
    totalAmount: 8500000,
    paidAmount: 8500000,
    remainingAmount: 0,
    status: 'paid',
    items: [
      { productName: 'دستکش جراحی لاتکس', quantity: 100, unitPrice: 85000, total: 8500000 }
    ],
    paymentMethod: 'چک',
    createdAt: '1403/09/15'
  },
  {
    id: 2,
    invoiceNumber: 'PI-2024-002',
    supplierName: 'توزیع آسیا مد',
    issueDate: '1403/09/12',
    dueDate: '1403/10/12',
    totalAmount: 6000000,
    paidAmount: 3000000,
    remainingAmount: 3000000,
    status: 'partial',
    items: [
      { productName: 'ماسک N95', quantity: 500, unitPrice: 12000, total: 6000000 }
    ],
    paymentMethod: 'نقد',
    notes: 'پرداخت نیمه اول انجام شده',
    createdAt: '1403/09/12'
  },
  {
    id: 3,
    invoiceNumber: 'PI-2024-003',
    supplierName: 'واردات گلدن مدیکال',
    issueDate: '1403/09/01',
    dueDate: '1403/09/30',
    totalAmount: 9250000,
    paidAmount: 0,
    remainingAmount: 9250000,
    status: 'overdue',
    items: [
      { productName: 'سرم فیزیولوژی 500ml', quantity: 500, unitPrice: 18500, total: 9250000 }
    ],
    notes: 'فاکتور معوقه - نیاز به پیگیری',
    createdAt: '1403/09/01'
  },
  {
    id: 4,
    invoiceNumber: 'PI-2024-004',
    supplierName: 'تامین تجهیزات البرز',
    issueDate: '1403/09/20',
    dueDate: '1403/10/20',
    totalAmount: 4500000,
    paidAmount: 0,
    remainingAmount: 4500000,
    status: 'pending',
    items: [
      { productName: 'ترمومتر دیجیتال', quantity: 50, unitPrice: 90000, total: 4500000 }
    ],
    createdAt: '1403/09/20'
  }
];

const STATUS_LABELS = {
  'pending': 'در انتظار پرداخت',
  'partial': 'پرداخت جزئی',
  'paid': 'پرداخت شده',
  'overdue': 'معوقه',
  'cancelled': 'لغو شده'
};

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>(MOCK_INVOICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    // TODO: Add date filtering logic
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FaCheck className="w-3 h-3" />;
      case 'pending': return <FaClock className="w-3 h-3" />;
      case 'partial': return <FaClock className="w-3 h-3" />;
      case 'overdue': return <FaExclamationTriangle className="w-3 h-3" />;
      case 'cancelled': return <FaTimes className="w-3 h-3" />;
      default: return <FaClock className="w-3 h-3" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  // Calculate summary stats
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pendingAmount = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">فاکتورهای خرید</h1>
            <p className="mt-2 text-gray-600">مدیریت فاکتورهای خرید از تامین‌کنندگان</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <FaFileExport className="w-4 h-4" />
              خروجی Excel
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
              <FaPlus className="w-4 h-4" />
              فاکتور جدید
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaFileInvoice className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">کل فاکتورها</p>
                <p className="text-3xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaDollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">مبلغ کل</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">پرداخت شده</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(paidAmount)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaClock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">در انتظار پرداخت</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(pendingAmount)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">فاکتورهای معوقه</p>
                <p className="text-3xl font-bold text-gray-900">{overdueInvoices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو شماره فاکتور یا تامین‌کننده..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در انتظار پرداخت</option>
              <option value="partial">پرداخت جزئی</option>
              <option value="paid">پرداخت شده</option>
              <option value="overdue">معوقه</option>
              <option value="cancelled">لغو شده</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">همه تاریخ‌ها</option>
              <option value="this_week">این هفته</option>
              <option value="this_month">این ماه</option>
              <option value="last_month">ماه گذشته</option>
              <option value="this_quarter">این فصل</option>
            </select>

            <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors">
              <FaFilter className="w-4 h-4" />
              فیلترهای بیشتر
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شماره فاکتور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تامین‌کننده
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ کل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    پرداخت شده
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مانده
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ سررسید
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaFileInvoice className="w-4 h-4 text-gray-400 ml-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            صادر شده: {invoice.issueDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.supplierName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(invoice.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPrice(invoice.paidAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${invoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatPrice(invoice.remainingAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {STATUS_LABELS[invoice.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                        {invoice.dueDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900" title="مشاهده">
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="ویرایش">
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="چاپ">
                          <FaPrint className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900" title="دانلود">
                          <FaFileDownload className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="p-12 text-center">
              <FaFileInvoice className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">هیچ فاکتور خریدی یافت نشد.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 