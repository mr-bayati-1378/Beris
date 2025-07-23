'use client';

import { useState, useEffect } from 'react';
import { 
  FaFileInvoice, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaDownload,
  FaPrint,
  FaCalendarAlt,
  FaBuilding,
  FaDollarSign,
  FaCheck,
  FaClock,
  FaTimes
} from 'react-icons/fa';

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  supplierCode: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  items: number;
  notes?: string;
}

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<PurchaseInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Sample data
  const sampleInvoices: PurchaseInvoice[] = [
    {
      id: '1',
      invoiceNumber: 'PI-2024-001',
      supplier: 'شرکت دارو پخش',
      supplierCode: 'SUP-001',
      date: '1403/01/15',
      dueDate: '1403/02/15',
      totalAmount: 15000000,
      paidAmount: 15000000,
      status: 'paid',
      items: 25
    },
    {
      id: '2',
      invoiceNumber: 'PI-2024-002',
      supplier: 'تامین کنندگان طب',
      supplierCode: 'SUP-002',
      date: '1403/01/20',
      dueDate: '1403/02/20',
      totalAmount: 8500000,
      paidAmount: 5000000,
      status: 'partial',
      items: 18
    },
    {
      id: '3',
      invoiceNumber: 'PI-2024-003',
      supplier: 'شرکت دارویی سینا',
      supplierCode: 'SUP-003',
      date: '1403/01/25',
      dueDate: '1403/02/25',
      totalAmount: 12000000,
      paidAmount: 0,
      status: 'pending',
      items: 32
    },
    {
      id: '4',
      invoiceNumber: 'PI-2024-004',
      supplier: 'تجهیزات پزشکی آریا',
      supplierCode: 'SUP-004',
      date: '1403/01/10',
      dueDate: '1403/02/10',
      totalAmount: 6500000,
      paidAmount: 0,
      status: 'overdue',
      items: 12
    }
  ];

  useEffect(() => {
    setInvoices(sampleInvoices);
    setFilteredInvoices(sampleInvoices);
  }, [sampleInvoices]);

  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FaCheck className="h-4 w-4" />;
      case 'partial': return <FaClock className="h-4 w-4" />;
      case 'pending': return <FaClock className="h-4 w-4" />;
      case 'overdue': return <FaTimes className="h-4 w-4" />;
      default: return <FaClock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'پرداخت شده';
      case 'partial': return 'پرداخت جزئی';
      case 'pending': return 'در انتظار';
      case 'overdue': return 'سررسید گذشته';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const stats = [
    {
      title: 'کل فاکتورها',
      value: invoices.length.toString(),
      icon: FaFileInvoice,
      color: 'bg-blue-500'
    },
    {
      title: 'مبلغ کل',
      value: formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)),
      icon: FaDollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'پرداخت شده',
      value: formatCurrency(invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)),
      icon: FaCheck,
      color: 'bg-emerald-500'
    },
    {
      title: 'باقی‌مانده',
      value: formatCurrency(invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)),
      icon: FaClock,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
              <FaFileInvoice className="h-6 w-6 text-white" />
            </div>
            فاکتورهای خرید
          </h1>
          <p className="mt-2 text-gray-600">
            مدیریت و پیگیری فاکتورهای خرید از تامین‌کنندگان
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 ${stat.color} rounded-xl`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="جستجو در فاکتورها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-[200px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="partial">پرداخت جزئی</option>
                <option value="paid">پرداخت شده</option>
                <option value="overdue">سررسید گذشته</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="min-w-[200px]">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">همه تاریخ‌ها</option>
                <option value="today">امروز</option>
                <option value="week">این هفته</option>
                <option value="month">این ماه</option>
              </select>
            </div>

            {/* Add Invoice Button */}
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
              <FaPlus className="h-4 w-4" />
              فاکتور جدید
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">شماره فاکتور</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">تامین‌کننده</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">تاریخ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">سررسید</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">مبلغ کل</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">پرداخت شده</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">وضعیت</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{invoice.items} قلم</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.supplier}</div>
                      <div className="text-sm text-gray-500">{invoice.supplierCode}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.dueDate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(invoice.paidAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <FaDownload className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <FaPrint className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FaFileInvoice className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">هیچ فاکتوری یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 