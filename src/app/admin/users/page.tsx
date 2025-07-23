'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PersianDate from '@/components/ui/persian-date';
import { 
  FaUsers, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaShoppingCart,
  FaCrown,
  FaEye,
  FaUserCheck,
  FaUserTimes,
  FaCalendarAlt,
  FaSpinner,
  FaBan,
  FaUnlock
} from 'react-icons/fa';
import { checkFinancialPermission } from '@/lib/admin-permissions-client';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    orders: number;
    addresses: number;
  };
  orders: {
    total: number;
  }[];
}

function getStatusColor(isAdmin: boolean) {
  return isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800';
}

function getStatusText(isAdmin: boolean) {
  return isAdmin ? 'مدیر' : 'کاربر عادی';
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [canViewFinancial, setCanViewFinancial] = useState(false);

  useEffect(() => {
    fetchUsers();
    checkFinancialPermissions();
  }, []);

  const checkFinancialPermissions = async () => {
    const hasPermission = await checkFinancialPermission();
    setCanViewFinancial(hasPermission);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('خطا در دریافت کاربران');
      }
    } catch (error) {
      console.error('خطا در دریافت کاربران:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید کاربر "${userName}" را حذف کنید؟\n\nاین عمل غیر قابل برگشت است و تمام اطلاعات کاربر شامل سفارشات و آدرس‌ها حذف خواهد شد.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('کاربر با موفقیت حذف شد');
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در حذف کاربر:', error);
      alert('خطا در حذف کاربر');
    }
  };

  const handleToggleAdmin = async (userId: number, currentAdminStatus: boolean, userName: string) => {
    const action = currentAdminStatus ? 'حذف دسترسی مدیریت' : 'اعطای دسترسی مدیریت';
    if (!confirm(`آیا مطمئن هستید که می‌خواهید ${action} کاربر "${userName}" را انجام دهید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAdmin: !currentAdminStatus,
        }),
      });

      if (response.ok) {
        alert(`${action} با موفقیت انجام شد`);
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در تغییر دسترسی:', error);
      alert('خطا در تغییر دسترسی');
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // محاسبه آمار
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.isAdmin).length;
  const regularUsers = totalUsers - adminUsers;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">مدیریت کاربران</h1>
            <p className="mt-2 text-gray-600">مدیریت کامل حساب‌های کاربری سیستم</p>
          </div>
          <Link
            href="/admin/users/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <FaPlus className="h-4 w-4" />
            افزودن کاربر جدید
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل کاربران</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کاربران عادی</p>
                <p className="text-2xl font-bold text-gray-900">{regularUsers}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">مدیران</p>
                <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaCrown className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>


        </div>

        {/* Users Table */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">لیست کاربران</h3>
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در کاربران..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 py-2 pr-10 pl-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">کاربر</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">اطلاعات تماس</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">نقش</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">تعداد سفارشات</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">تاریخ عضویت</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">#{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaPhone className="h-3 w-3" />
                            {user.phone}
                          </div>
                          {user.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaEnvelope className="h-3 w-3" />
                              {user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.isAdmin)}`}>
                          {user.isAdmin && <FaCrown className="ml-1 h-3 w-3" />}
                          {getStatusText(user.isAdmin)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaShoppingCart className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{user._count.orders}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCalendar className="h-3 w-3" />
                          <PersianDate date={user.createdAt} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="ویرایش"
                          >
                            <FaEdit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleAdmin(user.id, user.isAdmin, `${user.firstName} ${user.lastName}`)}
                            className="rounded-lg bg-yellow-100 p-2 text-yellow-600 hover:bg-yellow-200 transition-colors"
                            title={user.isAdmin ? "حذف دسترسی مدیر" : "اعطای دسترسی مدیر"}
                          >
                            {user.isAdmin ? <FaToggleOff className="h-4 w-4" /> : <FaToggleOn className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                            className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition-colors"
                            title="حذف کاربر"
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

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <FaUsers className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">
                {searchQuery ? 'هیچ کاربری با این مشخصات یافت نشد' : 'هیچ کاربری یافت نشد'}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">عملیات سریع</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button className="rounded-lg bg-blue-600 p-4 text-white hover:bg-blue-700 transition-colors">
              ارسال پیام گروهی
            </button>
            <button className="rounded-lg bg-green-600 p-4 text-white hover:bg-green-700 transition-colors">
              صادرات لیست کاربران
            </button>
            <button className="rounded-lg bg-purple-600 p-4 text-white hover:bg-purple-700 transition-colors">
              گزارش عملکرد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 