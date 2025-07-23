"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PersianDateInput from '@/components/ui/persian-date-input';

interface Payment {
  id: number;
  amount: number;
  status: string;
  transactionId: string;
  createdAt: string;
  order: {
    id: string;
    slug: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  gateway: {
    displayName: string;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    gateway: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const result = await response.json();
        setPayments(result.payments || []);
      }
    } catch (error) {
      console.error('خطا در دریافت پرداخت‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'موفق';
      case 'failed':
        return 'ناموفق';
      case 'pending':
        return 'در انتظار';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">پرداخت‌ها</h1>
        <Button onClick={fetchPayments}>
          بروزرسانی
        </Button>
      </div>

      {/* فیلترها */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">وضعیت</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">همه</option>
              <option value="success">موفق</option>
              <option value="failed">ناموفق</option>
              <option value="pending">در انتظار</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">از تاریخ</label>
            <PersianDateInput
              value={filters.fromDate}
              onChange={(value) => setFilters(prev => ({ ...prev, fromDate: value }))}
              placeholder="از تاریخ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">تا تاریخ</label>
            <PersianDateInput
              value={filters.toDate}
              onChange={(value) => setFilters(prev => ({ ...prev, toDate: value }))}
              placeholder="تا تاریخ"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchPayments} className="w-full">
              جستجو
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">در حال بارگذاری...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">لیست پرداخت‌ها</h2>
          </div>
          <div className="overflow-x-auto">
            {payments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">پرداختی یافت نشد</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right py-3 px-4">شناسه تراکنش</th>
                    <th className="text-right py-3 px-4">مبلغ</th>
                    <th className="text-right py-3 px-4">وضعیت</th>
                    <th className="text-right py-3 px-4">سفارش</th>
                    <th className="text-right py-3 px-4">مشتری</th>
                    <th className="text-right py-3 px-4">گیت‌وی</th>
                    <th className="text-right py-3 px-4">تاریخ</th>
                    <th className="text-right py-3 px-4">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">
                        {payment.transactionId || 'ندارد'}
                      </td>
                      <td className="py-3 px-4">
                        {payment.amount.toLocaleString('fa-IR')} تومان
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <a 
                          href={`/admin/orders/${payment.order?.slug}`}
                          className="text-blue-600 hover:underline"
                        >
                          {payment.order?.slug}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        {payment.order?.user ? 
                          `${payment.order.user.firstName} ${payment.order.user.lastName}` : 
                          'نامشخص'
                        }
                      </td>
                      <td className="py-3 px-4">
                        {payment.gateway?.displayName || 'نامشخص'}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(payment.createdAt).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert('جزئیات پرداخت')}
                        >
                          جزئیات
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 