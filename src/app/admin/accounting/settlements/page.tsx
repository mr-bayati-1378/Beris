'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye,
  FaSearch,
  FaFilter,
  FaUserTie, 
  FaPhone,
  FaEnvelope,
  FaCreditCard,
  FaUniversity,
  FaCalendarCheck,
  FaSpinner
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
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  settlementInfo?: {
    paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER';
    paymentDate: string;
    referenceNumber?: string;
    accountNumber?: string;
    cardNumber?: string;
    notes?: string;
  };
}

export default function SettlementsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    paymentMethod: 'CASH',
    referenceNumber: '',
    accountNumber: '',
    cardNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const response = await fetch('/api/admin/debts?role=finance');
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

  const handleSettlement = async (debtId: string) => {
    try {
      const response = await fetch(`/api/admin/debts/${debtId}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settlementForm,
          paymentDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setShowSettlementModal(false);
        setSelectedDebt(null);
        setSettlementForm({
          paymentMethod: 'CASH',
          referenceNumber: '',
          accountNumber: '',
          cardNumber: '',
          notes: ''
        });
        fetchDebts(); // Refresh the list
        alert('تسویه با موفقیت ثبت شد');
      } else {
        alert('خطا در ثبت تسویه');
      }
    } catch (error) {
      console.error('Error settling debt:', error);
      alert('خطا در ثبت تسویه');
    }
  };

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.customerPhone.includes(searchTerm) ||
                         debt.salesRep.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || debt.status === filterStatus;
    
    return matchesSearch && matchesStatus;
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

  const getStatusColor = (status: string, daysUntilDue: number) => {
    if (status === 'PAID') return 'bg-green-100 text-green-800';
    if (status === 'OVERDUE' || daysUntilDue <= 0) return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (status: string, daysUntilDue: number) => {
    if (status === 'PAID') return 'تسویه شده';
    if (status === 'OVERDUE' || daysUntilDue <= 0) return 'سررسید شده';
    if (daysUntilDue <= 7) return `${daysUntilDue} روز باقی`;
    return `${daysUntilDue} روز باقی`;
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'CASH': return 'نقدی';
      case 'CARD': return 'کارت بانکی';
      case 'BANK_TRANSFER': return 'انتقال بانکی';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                <FaMoneyBillWave />
                تسویه بدهکاری‌ها
              </h1>
              <p className="mt-2 text-gray-600 text-lg">مدیریت و تسویه بدهکاری‌های مشتریان</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                <FaCalendarCheck className="text-green-600" />
                <span className="text-sm font-medium text-green-800">تسویه شده</span>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  {debts.filter(d => d.status === 'PAID').length} مورد
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

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار تسویه</option>
                <option value="PAID">تسویه شده</option>
                <option value="OVERDUE">سررسید شده</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <FaFilter className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {filteredDebts.length} مورد
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
                {filteredDebts.length > 0 ? filteredDebts.map((debt) => (
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(debt.status, debt.daysUntilDue)}`}>
                        {getStatusText(debt.status, debt.daysUntilDue)}
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
                          onClick={() => setSelectedDebt(debt)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        {debt.status === 'PENDING' && (
                          <button 
                            onClick={() => {
                              setSelectedDebt(debt);
                              setShowSettlementModal(true);
                            }}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="تسویه بدهکاری"
                          >
                            <FaCheckCircle className="text-sm" />
                          </button>
                        )}
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

        {/* Settlement Modal */}
        {showSettlementModal && selectedDebt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">تسویه بدهکاری</h3>
                <button 
                  onClick={() => {
                    setShowSettlementModal(false);
                    setSelectedDebt(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">اطلاعات مشتری</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p><strong>نام:</strong> {selectedDebt.customerName}</p>
                    <p><strong>تلفن:</strong> {selectedDebt.customerPhone}</p>
                    <p><strong>مبلغ:</strong> {selectedDebt.amount.toLocaleString()} تومان</p>
                    <p><strong>تاریخ سررسید:</strong> {selectedDebt.dueDate}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">روش پرداخت</h4>
                  <select
                    value={settlementForm.paymentMethod}
                    onChange={(e) => setSettlementForm({...settlementForm, paymentMethod: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CASH">نقدی</option>
                    <option value="CARD">کارت بانکی</option>
                    <option value="BANK_TRANSFER">انتقال بانکی</option>
                  </select>
                </div>

                {settlementForm.paymentMethod === 'CARD' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره کارت
                    </label>
                    <input
                      type="text"
                      value={settlementForm.cardNumber}
                      onChange={(e) => setSettlementForm({...settlementForm, cardNumber: e.target.value})}
                      placeholder="شماره کارت بانکی"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {settlementForm.paymentMethod === 'BANK_TRANSFER' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره حساب
                    </label>
                    <input
                      type="text"
                      value={settlementForm.accountNumber}
                      onChange={(e) => setSettlementForm({...settlementForm, accountNumber: e.target.value})}
                      placeholder="شماره حساب بانکی"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شماره ارجاع
                  </label>
                  <input
                    type="text"
                    value={settlementForm.referenceNumber}
                    onChange={(e) => setSettlementForm({...settlementForm, referenceNumber: e.target.value})}
                    placeholder="شماره ارجاع یا رسید"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    یادداشت
                  </label>
                  <textarea
                    value={settlementForm.notes}
                    onChange={(e) => setSettlementForm({...settlementForm, notes: e.target.value})}
                    rows={3}
                    placeholder="یادداشت‌های اضافی..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSettlement(selectedDebt.id)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      تایید تسویه
                    </button>
                    <button 
                      onClick={() => {
                        setShowSettlementModal(false);
                        setSelectedDebt(null);
                      }}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 