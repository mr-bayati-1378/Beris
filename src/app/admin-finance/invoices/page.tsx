'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FaFileInvoice, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaCalendarAlt,
  FaDollarSign,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock
} from 'react-icons/fa';

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  items: number;
}

export default function FinanceInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        role: 'finance'
      });
      
      const response = await fetch(`/api/admin/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { 
        label: 'پرداخت شده', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FaCheckCircle
      },
      pending: { 
        label: 'در انتظار پرداخت', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FaClock
      },
      overdue: { 
        label: 'سررسید گذشته', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FaExclamationCircle
      },
      cancelled: { 
        label: 'لغو شده', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FaTrash
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/invoices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInvoices(invoices.filter(invoice => invoice.id !== id));
        alert('فاکتور با موفقیت حذف شد');
      } else {
        alert('خطا در حذف فاکتور');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('خطا در حذف فاکتور');
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                <FaFileInvoice className="h-6 w-6 text-white" />
              </div>
              مدیریت فاکتورهای مالی
            </h1>
            <p className="mt-2 text-gray-600">
              مدیریت و نظارت بر فاکتورها و پرداخت‌ها
            </p>
          </div>
          <Link
            href="/admin-finance/invoices/new"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            <FaPlus className="h-4 w-4" />
            فاکتور جدید
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو بر اساس شماره فاکتور، نام مشتری..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="paid">پرداخت شده</option>
                <option value="pending">در انتظار پرداخت</option>
                <option value="overdue">سررسید گذشته</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>

            <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
              <FaDownload className="h-4 w-4" />
              خروجی Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">پرداخت شده</p>
                <p className="text-2xl font-bold">
                  {invoices.filter(i => i.status === 'paid').length}
                </p>
              </div>
              <FaCheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">در انتظار</p>
                <p className="text-2xl font-bold">
                  {invoices.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <FaClock className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">سررسید گذشته</p>
                <p className="text-2xl font-bold">
                  {invoices.filter(i => i.status === 'overdue').length}
                </p>
              </div>
              <FaExclamationCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">مجموع مبلغ</p>
                <p className="text-2xl font-bold">
                  {invoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                </p>
              </div>
              <FaDollarSign className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شماره فاکتور
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    سررسید
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ ایجاد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FaSpinner className="inline-block animate-spin text-purple-500 text-2xl mb-4" />
                      <p className="text-gray-600">در حال بارگذاری فاکتورها...</p>
                    </td>
                  </tr>
                ) : invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FaFileInvoice className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500">{invoice.items} آیتم</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{invoice.customerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-bold text-gray-900">
                            {invoice.amount.toLocaleString()} تومان
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{invoice.dueDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{invoice.createdAt}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin-finance/invoices/${invoice.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="مشاهده جزئیات"
                          >
                            <FaEye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin-finance/invoices/${invoice.id}/edit`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="ویرایش فاکتور"
                          >
                            <FaEdit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف فاکتور"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FaFileInvoice className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">فاکتوری یافت نشد</h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'فاکتوری با این معیارها یافت نشد' 
                          : 'هنوز فاکتوری ثبت نشده است'
                        }
                      </p>
                      <Link
                        href="/admin-finance/invoices/new"
                        className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
                      >
                        <FaPlus className="h-4 w-4" />
                        ایجاد فاکتور جدید
                      </Link>
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
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  قبلی
                </button>
                <span className="text-sm text-gray-700">
                  صفحه {currentPage} از {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 