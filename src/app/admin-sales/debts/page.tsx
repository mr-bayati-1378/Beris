'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaCalendarCheck, 
  FaUserTie, 
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

interface Debt {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  dueDate: string;
  paymentType: 'CASH' | 'ONE_MONTH' | 'TWO_MONTH' | 'THREE_MONTH';
  daysUntilDue: number;
  salesRep: string;
  orderId: string;
  createdAt: string;
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        // در اینجا API بدهکاری‌ها را صدا می‌زنیم
        const response = await fetch('/api/admin/debts?role=sales');
        if (response.ok) {
          const data = await response.json();
          setDebts(data.debts || []);
        } else {
          console.error('Failed to fetch debts:', response.status);
        }
      } catch (error) {
        console.error('Error fetching debts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebts();
  }, []);

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.customerPhone.includes(searchTerm) ||
                         debt.salesRep.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'overdue' && debt.daysUntilDue <= 0) ||
                         (filterType === 'due_soon' && debt.daysUntilDue > 0 && debt.daysUntilDue <= 7) ||
                         (filterType === 'future' && debt.daysUntilDue > 7);
    
    return matchesSearch && matchesFilter;
  });

  const sortedDebts = [...filteredDebts].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return a.daysUntilDue - b.daysUntilDue;
      case 'amount':
        return b.amount - a.amount;
      case 'customerName':
        return a.customerName.localeCompare(b.customerName);
      default:
        return 0;
    }
  });

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'CASH': return 'نقدی';
      case 'ONE_MONTH': return 'یک ماهه';
      case 'TWO_MONTH': return 'دو ماهه';
      case 'THREE_MONTH': return 'سه ماهه';
      default: return type;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'CASH': return 'bg-green-100 text-green-800';
      case 'ONE_MONTH': return 'bg-blue-100 text-blue-800';
      case 'TWO_MONTH': return 'bg-yellow-100 text-yellow-800';
      case 'THREE_MONTH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (daysUntilDue: number) => {
    if (daysUntilDue <= 0) return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (daysUntilDue: number) => {
    if (daysUntilDue <= 0) return 'سررسید شده';
    if (daysUntilDue <= 7) return `${daysUntilDue} روز باقی`;
    return `${daysUntilDue} روز باقی`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری بدهکاری‌ها...</p>
            </div>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <FaMoneyBillWave />
                بدهکاری‌ها
              </h1>
              <p className="mt-2 text-gray-600 text-lg">مدیریت و پیگیری بدهکاری‌های مشتریان</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-200">
                <FaCalendarCheck className="text-red-600" />
                <span className="text-sm font-medium text-red-800">سررسید نزدیک</span>
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {debts.filter(d => d.daysUntilDue <= 7 && d.daysUntilDue > 0).length} مورد
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در مشتریان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">همه بدهکاری‌ها</option>
                <option value="overdue">سررسید شده</option>
                <option value="due_soon">سررسید نزدیک</option>
                <option value="future">آینده</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="dueDate">مرتب بر اساس تاریخ سررسید</option>
                <option value="amount">مرتب بر اساس مبلغ</option>
                <option value="customerName">مرتب بر اساس نام مشتری</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <FaFilter className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {sortedDebts.length} مورد
              </span>
            </div>
          </div>
        </div>

        {/* Debts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع تسویه
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ سررسید
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    فروشنده
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedDebts.length > 0 ? sortedDebts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{debt.customerName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <FaPhone className="text-xs text-gray-400" />
                        <span className="text-xs text-gray-500">{debt.customerPhone}</span>
                      </div>
                      {debt.customerEmail && (
                        <div className="flex items-center gap-2 mt-1">
                          <FaEnvelope className="text-xs text-gray-400" />
                          <span className="text-xs text-gray-500">{debt.customerEmail}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-semibold">
                        {debt.amount.toLocaleString()} تومان
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(debt.paymentType)}`}>
                        {getPaymentTypeText(debt.paymentType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{debt.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(debt.daysUntilDue)}`}>
                        {getStatusText(debt.daysUntilDue)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-gray-400 text-sm" />
                        <span className="text-sm text-gray-900">{debt.salesRep}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button 
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="تماس با مشتری"
                        >
                          <FaPhone className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      بدهکاری‌ای یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 