'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import PersianDate from '@/components/ui/persian-date';
import { 
  FaUser, 
  FaPhone,
  FaEnvelope,
  FaSave,
  FaArrowLeft,
  FaCrown,
  FaLock,
  FaArrowRight,
  FaCalendarAlt,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    isAdmin: false,
  });

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone,
          email: data.user.email || '',
          isAdmin: data.user.isAdmin,
        });
      } else {
        console.error('خطا در دریافت اطلاعات کاربر');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('خطا در دریافت اطلاعات کاربر:', error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('اطلاعات کاربر با موفقیت بروزرسانی شد');
        router.push('/admin/users');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در بروزرسانی کاربر:', error);
      alert('خطا در بروزرسانی کاربر');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-gray-500">کاربر یافت نشد</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ویرایش کاربر</h1>
            <p className="mt-2 text-gray-600">ویرایش اطلاعات کاربر #{user.id}</p>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700"
          >
            <FaArrowLeft className="h-4 w-4" />
            بازگشت
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  عضو از <PersianDate date={user.createdAt} />
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* نام */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام
                  </label>
                  <div className="relative">
                    <FaUser className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 py-3 pr-10 pl-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="نام"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام خانوادگی
                  </label>
                  <div className="relative">
                    <FaUser className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 py-3 pr-10 pl-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="نام خانوادگی"
                    />
                  </div>
                </div>
              </div>

              {/* شماره تلفن */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره تلفن
                </label>
                <div className="relative">
                  <FaPhone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 py-3 pr-10 pl-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="09123456789"
                  />
                </div>
              </div>

              {/* ایمیل */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل (اختیاری)
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 py-3 pr-10 pl-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              {/* دسترسی مدیر */}
              <div className="rounded-lg bg-gray-50 p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <FaCrown className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-gray-900">دسترسی مدیریت</span>
                  </div>
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  با فعال کردن این گزینه، کاربر دسترسی کامل به پنل مدیریت خواهد داشت.
                </p>
              </div>
            </div>

            {/* دکمه‌های عمل */}
            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave className="h-4 w-4" />
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
              
              <Link
                href="/admin/users"
                className="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700"
              >
                انصراف
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 