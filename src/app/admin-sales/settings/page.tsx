'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  FaCog,
  FaUser,
  FaBell,
  FaShieldAlt,
  FaPalette,
  FaLanguage,
  FaDatabase,
  FaEnvelope,
  FaSms,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaEdit,
  FaUpload,
  FaDownload,
  FaTrash,
  FaInfoCircle,
  FaExclamationTriangle,
  FaLock,
  FaPhone,
  FaShoppingCart
} from 'react-icons/fa';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    department: string;
    position: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderAlerts: boolean;
    paymentAlerts: boolean;
    customerAlerts: boolean;
    systemAlerts: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    itemsPerPage: number;
    defaultView: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordLastChanged: string;
  };
}

export default function SalesSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings?role=sales');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || getDefaultSettings());
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getDefaultSettings = (): UserSettings => ({
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'فروش',
      position: 'کارشناس فروش'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderAlerts: true,
      paymentAlerts: true,
      customerAlerts: false,
      systemAlerts: true,
      dailyReports: false,
      weeklyReports: true
    },
    preferences: {
      language: 'fa',
      timezone: 'Asia/Tehran',
      dateFormat: 'jalali',
      currency: 'IRR',
      itemsPerPage: 20,
      defaultView: 'table'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordLastChanged: new Date().toISOString()
    }
  });

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, role: 'sales' })
      });

      if (res.ok) {
        alert('تنظیمات با موفقیت ذخیره شد');
      } else {
        alert('خطا در ذخیره تنظیمات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('رمز عبور جدید و تکرار آن یکسان نیست');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('رمز عبور باید حداقل 8 کاراکتر باشد');
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          role: 'sales'
        })
      });

      if (res.ok) {
        alert('رمز عبور با موفقیت تغییر کرد');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordChange(false);
      } else {
        const data = await res.json();
        alert(data.error || 'خطا در تغییر رمز عبور');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('خطا در تغییر رمز عبور');
    }
  };

  const exportSettings = () => {
    if (!settings) return;

    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'sales-settings.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading || !settings) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">در حال بارگذاری تنظیمات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'پروفایل', icon: FaUser },
    { id: 'notifications', label: 'اعلانات', icon: FaBell },
    { id: 'sales', label: 'تنظیمات فروش', icon: FaShoppingCart },
    { id: 'backup', label: 'پشتیبان‌گیری', icon: FaDatabase }
  ];

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                <FaCog className="h-6 w-6 text-white" />
              </div>
              تنظیمات فروش
            </h1>
            <p className="mt-2 text-gray-600">
              مدیریت تنظیمات شخصی و تنظیمات سیستم
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-4">
            <button
              onClick={exportSettings}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              <FaDownload className="h-4 w-4" />
              دریافت تنظیمات
            </button>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <FaSave className="h-4 w-4" />
              )}
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">اطلاعات پروفایل</h2>
                    <FaEdit className="text-gray-400" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                      <input
                        type="text"
                        value={settings.profile.firstName}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, firstName: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
                      <input
                        type="text"
                        value={settings.profile.lastName}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, lastName: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, email: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">شماره تلفن</label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, phone: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">بخش</label>
                      <input
                        type="text"
                        value={settings.profile.department}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, department: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">سمت</label>
                      <input
                        type="text"
                        value={settings.profile.position}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, position: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">تصویر پروفایل</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        {settings.profile.avatar ? (
                          <Image
                            src={settings.profile.avatar}
                            alt="Avatar"
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <FaUser className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                          <FaUpload className="h-4 w-4" />
                          آپلود تصویر
                        </button>
                        <p className="text-sm text-gray-500 mt-1">JPG, PNG حداکثر 2MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">تنظیمات اعلانات</h2>
                    <FaBell className="text-gray-400" />
                  </div>

                  <div className="space-y-6">
                    {/* General Notifications */}
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FaEnvelope className="text-blue-600" />
                        اعلانات عمومی
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">اعلانات ایمیل</label>
                            <p className="text-sm text-gray-500">دریافت اعلانات از طریق ایمیل</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">اعلانات پیامکی</label>
                            <p className="text-sm text-gray-500">دریافت اعلانات از طریق پیامک</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.smsNotifications}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Specific Alerts */}
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FaExclamationTriangle className="text-orange-600" />
                        هشدارهای خاص
                      </h3>
                      <div className="space-y-4">
                        {[
                          { key: 'orderAlerts', label: 'هشدارهای سفارش', desc: 'سفارشات جدید و تغییرات وضعیت' },
                          { key: 'paymentAlerts', label: 'هشدارهای پرداخت', desc: 'پرداخت‌های موفق و ناموفق' },
                          { key: 'customerAlerts', label: 'هشدارهای مشتری', desc: 'مشتریان جدید و پیام‌ها' },
                          { key: 'systemAlerts', label: 'هشدارهای سیستم', desc: 'اعلانات مهم سیستم' }
                        ].map((alert) => (
                          <div key={alert.key} className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">{alert.label}</label>
                              <p className="text-sm text-gray-500">{alert.desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications[alert.key as keyof typeof settings.notifications] as boolean}
                              onChange={(e) => setSettings({
                                ...settings,
                                notifications: { 
                                  ...settings.notifications, 
                                  [alert.key]: e.target.checked 
                                }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reports */}
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FaDatabase className="text-green-600" />
                        گزارش‌ها
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">گزارش روزانه</label>
                            <p className="text-sm text-gray-500">خلاصه فعالیت‌های روزانه</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.dailyReports}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, dailyReports: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">گزارش هفتگی</label>
                            <p className="text-sm text-gray-500">خلاصه فعالیت‌های هفتگی</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.weeklyReports}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, weeklyReports: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sales Tab */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">تنظیمات فروش</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">کمیسیون پیش‌فرض</label>
                      <input
                        type="number"
                        value={settings.preferences.itemsPerPage}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, itemsPerPage: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تخفیف حداکثر</label>
                      <input
                        type="number"
                        value={settings.preferences.itemsPerPage}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, itemsPerPage: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">تنظیمات عمومی</h2>
                    <FaPalette className="text-gray-400" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">زبان</label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, language: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="fa">فارسی</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">منطقه زمانی</label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, timezone: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Asia/Tehran">تهران (UTC+3:30)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">فرمت تاریخ</label>
                      <select
                        value={settings.preferences.dateFormat}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, dateFormat: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="jalali">شمسی</option>
                        <option value="gregorian">میلادی</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">واحد پول</label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, currency: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="IRR">ریال</option>
                        <option value="IRT">تومان</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تعداد آیتم در صفحه</label>
                      <select
                        value={settings.preferences.itemsPerPage}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, itemsPerPage: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نمایش پیش‌فرض</label>
                      <select
                        value={settings.preferences.defaultView}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, defaultView: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="table">جدولی</option>
                        <option value="grid">شبکه‌ای</option>
                        <option value="list">لیستی</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">تنظیمات امنیتی</h2>
                    <FaShieldAlt className="text-gray-400" />
                  </div>

                  {/* Password Change */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">تغییر رمز عبور</h3>
                        <p className="text-sm text-gray-500">
                          آخرین تغییر: {new Date(settings.security.passwordLastChanged).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <FaKey className="h-4 w-4" />
                        تغییر رمز عبور
                      </button>
                    </div>

                    {showPasswordChange && (
                      <div className="space-y-4 border-t border-gray-200 pt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">رمز عبور فعلی</label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">رمز عبور جدید</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">تکرار رمز عبور جدید</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={changePassword}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                          >
                            <FaCheck className="h-4 w-4" />
                            تایید تغییر
                          </button>
                          <button
                            onClick={() => setShowPasswordChange(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                          >
                            <FaTimes className="h-4 w-4" />
                            انصراف
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two Factor Authentication */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">احراز هویت دو مرحله‌ای</h3>
                        <p className="text-sm text-gray-500">افزایش امنیت حساب کاربری</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, twoFactorEnabled: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Session Timeout */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">مهلت نشست</h3>
                    <div className="flex items-center gap-4">
                      <select
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, sessionTimeout: Number(e.target.value) }
                        })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={15}>15 دقیقه</option>
                        <option value={30}>30 دقیقه</option>
                        <option value={60}>1 ساعت</option>
                        <option value={120}>2 ساعت</option>
                        <option value={480}>8 ساعت</option>
                      </select>
                      <span className="text-sm text-gray-500">خروج خودکار پس از عدم فعالیت</span>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-blue-900">نکات امنیتی</h4>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                          <li>• از رمز عبور قوی استفاده کنید</li>
                          <li>• رمز عبور خود را به صورت منظم تغییر دهید</li>
                          <li>• احراز هویت دو مرحله‌ای را فعال کنید</li>
                          <li>• از شبکه‌های عمومی برای ورود استفاده نکنید</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 