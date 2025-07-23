'use client';

import { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaCrown, 
  FaUsers,
  FaSearch,
  FaFilter,
  FaDownload,
  FaTimes,
  FaCheck,
  FaStar,
  FaShoppingCart,
  FaEye
} from 'react-icons/fa';
import { toPersianNumerals, formatPriceWithFont } from '@/lib/utils';

interface VipCustomer {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone: string;
  email?: string;
  isVip: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

export default function VipCustomersManagement() {
  const [customers, setCustomers] = useState<VipCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'vip' | 'regular'>('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vip-customers');
      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات مشتریان');
      }
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      setError('خطا در بارگذاری اطلاعات');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVipStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/vip-customers/${customerId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVip: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('خطا در به‌روزرسانی وضعیت');
      }

      // به‌روزرسانی لیست
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, isVip: !currentStatus } 
            : customer
        )
      );
    } catch (error) {
      console.error('Error updating VIP status:', error);
      alert('خطا در به‌روزرسانی وضعیت مشتری');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'vip' ? customer.isVip :
      filterStatus === 'regular' ? !customer.isVip : true;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.isVip).length,
    regular: customers.filter(c => !c.isVip).length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    vipSpent: customers.filter(c => c.isVip).reduce((sum, c) => sum + c.totalSpent, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری مشتریان...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaCrown className="text-yellow-500" />
                مدیریت مشتریان VIP
              </h1>
              <p className="mt-2 text-gray-600">مدیریت دسترسی مشتریان به محصولات اختصاصی</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {/* Export function */}}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
              >
                <FaDownload className="w-4 h-4" />
                خروجی Excel
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل مشتریان</p>
                <p className="text-2xl font-bold text-gray-900">{toPersianNumerals(stats.total.toString())}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">مشتریان VIP</p>
                <p className="text-2xl font-bold text-yellow-600">{toPersianNumerals(stats.vip.toString())}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <FaCrown className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">مشتریان عادی</p>
                <p className="text-2xl font-bold text-green-600">{toPersianNumerals(stats.regular.toString())}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaUser className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل فروش</p>
                <p className="text-lg font-bold text-purple-600">{formatPriceWithFont(stats.totalSpent)}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">فروش VIP</p>
                <p className="text-lg font-bold text-orange-600">{formatPriceWithFont(stats.vipSpent)}</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <FaStar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام، تلفن یا ایمیل..."
                  className="w-full rounded-lg border border-gray-300 py-2 pr-10 pl-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">همه مشتریان</option>
                <option value="vip">مشتریان VIP</option>
                <option value="regular">مشتریان عادی</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تماس
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت VIP
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آمار خرید
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخرین سفارش
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عضویت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      هیچ مشتری‌ای یافت نشد
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            customer.isVip ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}>
                            {customer.isVip ? (
                              <FaCrown className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <FaUser className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName && customer.lastName 
                                ? `${customer.firstName} ${customer.lastName}`
                                : customer.username || 'بدون نام'
                              }
                            </div>
                            <div className="text-xs text-gray-500">#{customer.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center text-sm text-gray-900">
                            <FaPhone className="h-3 w-3 text-gray-400 ml-2" />
                            {toPersianNumerals(customer.phone)}
                          </div>
                          {customer.email && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <FaEnvelope className="h-3 w-3 text-gray-400 ml-2" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.isVip ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FaCrown className="h-3 w-3 ml-1" />
                            VIP
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <FaUser className="h-3 w-3 ml-1" />
                            عادی
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPriceWithFont(customer.totalSpent)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {toPersianNumerals(customer.totalOrders.toString())} سفارش
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastOrderDate 
                          ? toPersianNumerals(new Date(customer.lastOrderDate).toLocaleDateString('fa-IR'))
                          : 'هرگز'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {toPersianNumerals(new Date(customer.createdAt).toLocaleDateString('fa-IR'))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleVipStatus(customer.id, customer.isVip)}
                            className={`p-1 rounded-md transition-colors ${
                              customer.isVip
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                : 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                            }`}
                            title={customer.isVip ? 'حذف از VIP' : 'اضافه به VIP'}
                          >
                            {customer.isVip ? (
                              <FaTimes className="h-4 w-4" />
                            ) : (
                              <FaCrown className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {/* View details */}}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                            title="مشاهده جزئیات"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 نکات مهم</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• مشتریان VIP دسترسی به محصولات اختصاصی دارند</li>
            <li>• محصولات اختصاصی فقط برای مشتریان VIP قابل مشاهده هستند</li>
            <li>• برای تنظیم محصولات اختصاصی، از فایل اکسل استفاده کنید</li>
            <li>• تغییر وضعیت VIP فوری اعمال می‌شود</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 