'use client';

import { useState } from 'react';
import { FaCog, FaUser, FaBell, FaTruck, FaDatabase, FaSave } from 'react-icons/fa';

export default function SupplySettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'پروفایل', icon: FaUser },
    { id: 'notifications', label: 'اطلاعیه‌ها', icon: FaBell },
    { id: 'supply', label: 'تنظیمات تامین', icon: FaTruck },
    { id: 'backup', label: 'پشتیبان‌گیری', icon: FaDatabase }
  ];

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
              <FaCog className="h-6 w-6 text-white" />
            </div>
            تنظیمات تامین
          </h1>
          <p className="mt-2 text-gray-600">مدیریت تنظیمات سیستم تامین</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">اطلاعات شخصی</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'supply' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">تنظیمات تامین</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تامین‌کننده پیش‌فرض</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500">
                        <option>شرکت دارو پخش</option>
                        <option>تامین کنندگان طب</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                  <FaSave className="h-4 w-4" />
                  ذخیره تنظیمات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 