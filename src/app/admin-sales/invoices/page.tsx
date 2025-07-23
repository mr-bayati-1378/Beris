'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FaFileInvoice,
  FaSearch,
  FaSpinner,
  FaFilter,
  FaSort,
  FaUser,
  FaCalendarAlt,
  FaMoneyBill,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaDownload,
  FaPrint,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

interface Invoice {
  id: number;
  slug: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  orderSource: string;
  salesRep: string | null;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  financeApprovedBy: string | null;
  financeApprovedAt: string | null;
  warehouseApprovedBy: string | null;
  warehouseApprovedAt: string | null;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
    } | null;
    userPack: {
      name: string;
    } | null;
  }>;
  paymentStatus: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchInvoices = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin-sales/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'pending_finance_approval':
        return 'text-blue-600 bg-blue-100';
      case 'finance_approved':
        return 'text-purple-600 bg-purple-100';
      case 'pending_warehouse_approval':
        return 'text-orange-600 bg-orange-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-amber-600 bg-amber-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'در انتظار';
      case 'pending_finance_approval':
        return 'در انتظار تایید مالی';
      case 'finance_approved':
        return 'تایید شده مالی';
      case 'pending_warehouse_approval':
        return 'در انتظار تایید انبار';
      case 'processing':
        return 'در حال پردازش';
      case 'completed':
        return 'تکمیل شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <FaTimesCircle className="h-4 w-4" />;
      case 'pending_finance_approval':
      case 'pending_warehouse_approval':
      case 'pending':
        return <FaExclamationCircle className="h-4 w-4" />;
      case 'finance_approved':
      case 'processing':
        return <FaCheckCircle className="h-4 w-4" />;
      default:
        return <FaExclamationCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">فاکتورهای فروش</h1>
          <p className="text-gray-600">مدیریت و پیگیری فاکتورهای فروش</p>
        </div>
        <Link
          href="/admin-sales/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="h-4 w-4" />
          فاکتور جدید
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در فاکتورها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در انتظار</option>
              <option value="pending_finance_approval">در انتظار تایید مالی</option>
              <option value="finance_approved">تایید شده مالی</option>
              <option value="pending_warehouse_approval">در انتظار تایید انبار</option>
              <option value="processing">در حال پردازش</option>
              <option value="completed">تکمیل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>

            <button
              onClick={() => handleSort('date')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaSort className="h-4 w-4" />
              تاریخ
            </button>

            <button
              onClick={() => handleSort('amount')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaSort className="h-4 w-4" />
              مبلغ
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <FaFileInvoice className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">هیچ فاکتوری یافت نشد</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    شماره سفارش
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    مشتری
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    مسئول فروش
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    تاریخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    مبلغ کل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaFileInvoice className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{invoice.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="h-4 w-4 text-gray-400" />
                        <span>{`${invoice.user.firstName} ${invoice.user.lastName}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="h-4 w-4 text-gray-400" />
                        <span>{invoice.salesRep || 'نامشخص'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                        <span>{new Date(invoice.createdAt).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaMoneyBill className="h-4 w-4 text-gray-400" />
                        <span>{new Intl.NumberFormat('fa-IR').format(invoice.total)} تومان</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span>{getStatusText(invoice.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin-sales/orders/${invoice.slug}`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="مشاهده جزئیات"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                        <button
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="چاپ"
                        >
                          <FaPrint className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 