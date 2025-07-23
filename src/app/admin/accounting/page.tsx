"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PersianDateInput from '@/components/ui/persian-date-input';

export default function AccountingPage() {
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  useEffect(() => {
    fetchAccountingData();
  }, []);

  const fetchAccountingData = async () => {
    try {
      const response = await fetch('/api/admin/accounting', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('خطا در دریافت اطلاعات حسابداری:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality
    alert('قابلیت صادرات به زودی اضافه خواهد شد');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">حسابداری</h1>
        <Button onClick={handleExport}>
          صادرات گزارش
        </Button>
      </div>

      {/* فیلترها */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">از تاریخ</label>
            <PersianDateInput
              value={dateRange.from}
              onChange={(value) => setDateRange(prev => ({ ...prev, from: value }))}
              placeholder="از تاریخ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">تا تاریخ</label>
            <PersianDateInput
              value={dateRange.to}
              onChange={(value) => setDateRange(prev => ({ ...prev, to: value }))}
              placeholder="تا تاریخ"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchAccountingData} className="w-full">
              جستجو
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">در حال بارگذاری...</div>
      ) : (
        <>
          {/* کارت‌های آماری */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">درآمد کل</h3>
              <p className="text-2xl font-bold text-green-600">
                {data.totalIncome.toLocaleString('fa-IR')} تومان
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">هزینه کل</h3>
              <p className="text-2xl font-bold text-red-600">
                {data.totalExpenses.toLocaleString('fa-IR')} تومان
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">سود خالص</h3>
              <p className="text-2xl font-bold text-blue-600">
                {data.netProfit.toLocaleString('fa-IR')} تومان
              </p>
            </div>
          </div>

          {/* جدول تراکنش‌ها */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">تراکنش‌های اخیر</h2>
            </div>
            <div className="p-6">
              {data.recentTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">تراکنشی یافت نشد</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4">تاریخ</th>
                        <th className="text-right py-3 px-4">نوع</th>
                        <th className="text-right py-3 px-4">مبلغ</th>
                        <th className="text-right py-3 px-4">شرح</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTransactions.map((transaction: any, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4">{transaction.date}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              transaction.type === 'income' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'income' ? 'درآمد' : 'هزینه'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{transaction.amount?.toLocaleString('fa-IR')} تومان</td>
                          <td className="py-3 px-4">{transaction.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 