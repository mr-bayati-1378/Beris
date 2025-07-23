'use client';

import { useState, useEffect, useCallback } from 'react';
import PersianDateInput from '@/components/ui/persian-date-input';
import { 
  FaHistory,
  FaUser,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaClock,
  FaCalendarAlt,
  FaSpinner
} from 'react-icons/fa';

interface AdminActivity {
  id: number;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
    adminRole?: {
      displayName: string;
    };
  };
}

const actionMap = {
  create: { name: 'ایجاد', color: 'bg-green-100 text-green-800', icon: FaPlus },
  update: { name: 'ویرایش', color: 'bg-blue-100 text-blue-800', icon: FaEdit },
  delete: { name: 'حذف', color: 'bg-red-100 text-red-800', icon: FaTrash },
  view: { name: 'مشاهده', color: 'bg-gray-100 text-gray-800', icon: FaEye },
  login: { name: 'ورود', color: 'bg-purple-100 text-purple-800', icon: FaUser },
  logout: { name: 'خروج', color: 'bg-orange-100 text-orange-800', icon: FaUser },
};

const entityMap = {
  user: 'کاربر',
  customer: 'مشتری',
  product: 'محصول',
  category: 'دسته‌بندی',
  order: 'سفارش',
  invoice: 'فاکتور',
  pack: 'پک محصول',
  payment: 'پرداخت',
  admin: 'ادمین',
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entity', entityFilter);
      if (userFilter) params.append('user', userFilter);
      if (dateRange.from) params.append('dateFrom', dateRange.from);
      if (dateRange.to) params.append('dateTo', dateRange.to);

      const response = await fetch(`/api/admin/activities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        console.error('خطا در دریافت فعالیت‌ها');
      }
    } catch (error) {
      console.error('خطا در دریافت فعالیت‌ها:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, actionFilter, entityFilter, userFilter, dateRange]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueUsers = () => {
    const users = activities.map(activity => activity.user);
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u.phone === user.phone)
    );
    return uniqueUsers;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FaSpinner className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">در حال بارگذاری فعالیت‌ها...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
            <FaHistory className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لاگ فعالیت‌های ادمین</h1>
            <p className="text-gray-600">پیگیری و بررسی تمام اقدامات انجام شده توسط ادمین‌ها</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در توضیحات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">همه اقدامات</option>
              {Object.entries(actionMap).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">همه موجودیت‌ها</option>
              {Object.entries(entityMap).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">همه کاربران</option>
              {getUniqueUsers().map((user) => (
                <option key={user.phone} value={user.phone}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">از تاریخ</label>
            <PersianDateInput
              value={dateRange.from}
              onChange={(value) => setDateRange({ ...dateRange, from: value })}
              placeholder="از تاریخ"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تا تاریخ</label>
            <PersianDateInput
              value={dateRange.to}
              onChange={(value) => setDateRange({ ...dateRange, to: value })}
              placeholder="تا تاریخ"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">فعالیتی یافت نشد</h3>
            <p className="text-gray-600">
              {searchQuery || actionFilter || entityFilter || userFilter || dateRange.from || dateRange.to
                ? 'فعالیتی با این معیارها یافت نشد'
                : 'هنوز فعالیتی ثبت نشده است'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => {
              const actionInfo = actionMap[activity.action as keyof typeof actionMap] || 
                { name: activity.action, color: 'bg-gray-100 text-gray-800', icon: FaClock };
              const ActionIcon = actionInfo.icon;
              
              return (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Action Icon */}
                    <div className={`p-3 rounded-xl ${actionInfo.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                      <ActionIcon className="h-5 w-5" />
                    </div>

                    {/* Activity Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${actionInfo.color}`}>
                            {actionInfo.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {entityMap[activity.entity as keyof typeof entityMap] || activity.entity}
                          </span>
                          {activity.entityId && (
                            <span className="text-sm text-gray-400">#{activity.entityId}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaCalendarAlt className="h-3 w-3" />
                          {formatDate(activity.createdAt)}
                        </div>
                      </div>

                      <p className="text-gray-900 mb-3">{activity.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <FaUser className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {activity.user.firstName} {activity.user.lastName}
                            </span>
                          </div>
                          {activity.user.adminRole && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {activity.user.adminRole.displayName}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {activity.ipAddress && (
                            <span>IP: {activity.ipAddress}</span>
                          )}
                          <span>{activity.user.phone}</span>
                        </div>
                      </div>

                      {activity.userAgent && (
                        <details className="mt-3">
                          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                            اطلاعات مرورگر
                          </summary>
                          <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-50 p-2 rounded">
                            {activity.userAgent}
                          </p>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل فعالیت‌ها</p>
              <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-xl">
              <FaHistory className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">فعالیت‌های ایجاد</p>
              <p className="text-3xl font-bold text-green-600">
                {activities.filter(a => a.action === 'create').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaPlus className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">فعالیت‌های ویرایش</p>
              <p className="text-3xl font-bold text-blue-600">
                {activities.filter(a => a.action === 'update').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaEdit className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کاربران فعال</p>
              <p className="text-3xl font-bold text-purple-600">
                {getUniqueUsers().length}
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