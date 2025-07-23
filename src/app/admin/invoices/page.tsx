'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaTrash, 
  FaSearch,
  FaFileInvoice,
  FaCalendarAlt,
  FaUser,
  FaTruck,
  FaCheck,
  FaTimes,
  FaClock,
  FaSpinner,
  FaChartLine
} from 'react-icons/fa';

interface Invoice {
  id: number;
  invoiceNumber: string;
  customer?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  status: string;
  totalAmount: number;
  grossSalesAmount: number;
  settlementType: string;
  salesChannel?: string;
  orderDate: string;
  deliveryDate?: string;
  createdAt: string;
}

const statusMap = {
  OPEN: { name: 'باز', color: 'bg-blue-100 text-blue-800', icon: FaClock },
  UNDER_REVIEW: { name: 'در حال بررسی', color: 'bg-yellow-100 text-yellow-800', icon: FaSpinner },
  APPROVED: { name: 'تایید شده', color: 'bg-green-100 text-green-800', icon: FaCheck },
  PROCESSING: { name: 'در حال پردازش', color: 'bg-purple-100 text-purple-800', icon: FaSpinner },
  DELIVERED: { name: 'تحویل داده شده', color: 'bg-emerald-100 text-emerald-800', icon: FaTruck },
  CANCELLED: { name: 'لغو شده', color: 'bg-red-100 text-red-800', icon: FaTimes },
  RETURNED: { name: 'مرجوعه', color: 'bg-orange-100 text-orange-800', icon: FaTrash },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // بارگذاری فاکتورها
  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        console.error('خطا در دریافت فاکتورها');
      }
    } catch (error) {
      console.error('خطا در دریافت فاکتورها:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // حذف فاکتور
  const handleDeleteInvoice = async (id: number, invoiceNumber: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید فاکتور "${invoiceNumber}" را حذف کنید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/invoices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('فاکتور با موفقیت حذف شد');
        fetchInvoices();
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در حذف فاکتور:', error);
      alert('خطا در حذف فاکتور');
    }
  };

  // فیلتر فاکتورها
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.customer && 
       `${invoice.customer.firstName} ${invoice.customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
      invoice.customer?.phone.includes(searchQuery);
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FaSpinner className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">در حال بارگذاری فاکتورها...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <FaFileInvoice className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مدیریت فاکتورها</h1>
              <p className="text-gray-600">مدیریت و پیگیری فاکتورهای فروش</p>
            </div>
          </div>
          <Link
            href="/admin/invoices/new"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <FaPlus className="h-4 w-4" />
            ثبت فاکتور جدید
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو بر اساس شماره فاکتور، نام مشتری یا شماره تلفن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(statusMap).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FaFileInvoice className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">فاکتوری یافت نشد</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter ? 'فاکتوری با این معیارها یافت نشد' : 'هنوز فاکتوری ثبت نشده است'}
            </p>
            <Link
              href="/admin/invoices/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="h-4 w-4" />
              ثبت اولین فاکتور
            </Link>
          </div>
        ) : (
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
                    نوع تسویه
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    کانال فروش
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ ناخالص
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ کل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ سفارش
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ تحویل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => {
                  const status = statusMap[invoice.status as keyof typeof statusMap] || statusMap.OPEN;
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaFileInvoice className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.customer ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <FaUser className="h-3 w-3 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {invoice.customer.firstName} {invoice.customer.lastName}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">{invoice.customer.phone}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">مشتری حذف شده</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.settlementType === 'cash' ? 'bg-green-100 text-green-800' :
                          invoice.settlementType === 'one_month' ? 'bg-blue-100 text-blue-800' :
                          invoice.settlementType === 'two_month' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.settlementType === 'three_month' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.settlementType === 'cash' ? 'نقدی' :
                           invoice.settlementType === 'one_month' ? 'یک ماهه' :
                           invoice.settlementType === 'two_month' ? 'دو ماهه' :
                           invoice.settlementType === 'three_month' ? 'سه ماهه' :
                           invoice.settlementType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.salesChannel ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.salesChannel === 'divar' ? 'bg-orange-100 text-orange-800' :
                            invoice.salesChannel === 'basalam' ? 'bg-purple-100 text-purple-800' :
                            invoice.salesChannel === 'sheypoor' ? 'bg-blue-100 text-blue-800' :
                            invoice.salesChannel === 'direct' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.salesChannel === 'divar' ? 'دیوار' :
                             invoice.salesChannel === 'basalam' ? 'باسلام' :
                             invoice.salesChannel === 'sheypoor' ? 'شیپور' :
                             invoice.salesChannel === 'direct' ? 'مستقیم' :
                             invoice.salesChannel}
                          </span>
                        ) : (
                          <span className="text-gray-400">تعیین نشده</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{formatCurrency(invoice.grossSalesAmount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900">{formatDate(invoice.orderDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.deliveryDate ? (
                          <div className="flex items-center gap-2">
                            <FaTruck className="h-3 w-3 text-green-500" />
                            <span className="text-gray-900">{formatDate(invoice.deliveryDate)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">تعیین نشده</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/invoices/${invoice.id}`}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="مشاهده جزئیات"
                          >
                            <FaEye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/invoices/${invoice.id}/edit`}
                            className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200 transition-colors"
                            title="ویرایش"
                          >
                            <FaEdit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                            className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition-colors"
                            title="حذف فاکتور"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل فاکتورها</p>
              <p className="text-3xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaFileInvoice className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">در انتظار بررسی</p>
              <p className="text-3xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === 'UNDER_REVIEW').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <FaClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">تحویل شده</p>
              <p className="text-3xl font-bold text-green-600">
                {invoices.filter(inv => inv.status === 'DELIVERED').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaTruck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مجموع فروش</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaChartLine className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 