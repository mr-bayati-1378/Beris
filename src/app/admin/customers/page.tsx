'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PersianDate from '@/components/ui/persian-date';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaTrash, 
  FaSearch,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaSpinner,
  FaShoppingCart,
  FaFileInvoice
} from 'react-icons/fa';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  createdAt: string;
  _count?: {
    orders: number;
    customerInvoices: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  // بارگذاری مشتریان
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        console.error('خطا در دریافت مشتریان');
      }
    } catch (error) {
      console.error('خطا در دریافت مشتریان:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // اضافه کردن مشتری جدید
  const handleAddCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
      alert('نام، نام خانوادگی و شماره تلفن الزامی است');
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers([data.customer, ...customers]);
        setNewCustomer({
          firstName: '',
          lastName: '',
          phone: '',
          email: ''
        });
        setShowNewCustomerForm(false);
        alert('مشتری جدید با موفقیت اضافه شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در اضافه کردن مشتری:', error);
      alert('خطا در اضافه کردن مشتری');
    }
  };

  // حذف مشتری
  const handleDeleteCustomer = async (id: number, name: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید مشتری "${name}" را حذف کنید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomers(customers.filter(customer => customer.id !== id));
        alert('مشتری با موفقیت حذف شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در حذف مشتری:', error);
      alert('خطا در حذف مشتری');
    }
  };

  // فیلتر مشتریان
  const filteredCustomers = customers.filter(customer => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(searchTerm) ||
      customer.lastName.toLowerCase().includes(searchTerm) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm))
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FaSpinner className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">در حال بارگذاری مشتریان...</p>
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <FaUsers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مدیریت مشتریان</h1>
              <p className="text-gray-600">مدیریت اطلاعات مشتریان و کاربران</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewCustomerForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <FaPlus className="h-4 w-4" />
            مشتری جدید
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، نام خانوادگی، شماره تلفن یا ایمیل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* New Customer Form */}
      {showNewCustomerForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">اضافه کردن مشتری جدید</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="نام"
              value={newCustomer.firstName}
              onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="نام خانوادگی"
              value={newCustomer.lastName}
              onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="شماره تلفن"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="ایمیل (اختیاری)"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddCustomer}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              افزودن مشتری
            </button>
            <button
              onClick={() => setShowNewCustomerForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* Customers List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">مشتری یافت نشد</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'مشتری با این معیارها یافت نشد' : 'هنوز مشتری ثبت نشده است'}
            </p>
            <button
              onClick={() => setShowNewCustomerForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="h-4 w-4" />
              ثبت اولین مشتری
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شماره تلفن
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ایمیل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تعداد سفارشات
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ عضویت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FaUser className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaPhone className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-900">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.email ? (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900">{customer.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">ثبت نشده</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FaShoppingCart className="h-3 w-3 text-green-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {customer._count?.orders || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaFileInvoice className="h-3 w-3 text-blue-500" />
                                                     <span className="text-sm font-medium text-gray-900">
                             {customer._count?.customerInvoices || 0}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="flex items-center gap-2">
                          <FaCalendarAlt className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900"><PersianDate date={customer.createdAt} /></span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/customers/${customer.id}/edit`}
                          className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200 transition-colors"
                          title="ویرایش"
                        >
                          <FaEdit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id, `${customer.firstName} ${customer.lastName}`)}
                          className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition-colors"
                          title="حذف مشتری"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل مشتریان</p>
              <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مشتریان فعال</p>
              <p className="text-3xl font-bold text-green-600">
                                 {customers.filter(c => c._count && (c._count.orders > 0 || c._count.customerInvoices > 0)).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مشتریان جدید</p>
              <p className="text-3xl font-bold text-purple-600">
                {customers.filter(c => {
                  const createdDate = new Date(c.createdAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return createdDate > thirtyDaysAgo;
                }).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaUser className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 