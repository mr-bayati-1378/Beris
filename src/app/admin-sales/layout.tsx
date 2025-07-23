'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import { 
  FaHome,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBell,
  FaFileInvoice,
  FaBoxes,
  FaClipboardList,
  FaUser,
  FaCog,
  FaHourglassHalf,
  FaMoneyBillWave
} from 'react-icons/fa';
import AdminSessionChecker from '@/components/AdminSessionChecker';

export default function SalesAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pathname = usePathname();

  const navigationItems = [
    { name: 'داشبورد فروش', href: '/admin-sales', icon: FaHome },
    { name: 'سفارشات', href: '/admin-sales/orders', icon: FaShoppingCart },
    { name: 'سفارشات جدید', href: '/admin-sales/new-orders', icon: FaHourglassHalf },
    { name: 'بدهکاری‌ها', href: '/admin-sales/debts', icon: FaMoneyBillWave },
    { name: 'فاکتورها', href: '/admin-sales/invoices', icon: FaFileInvoice },
    { name: 'مشتریان', href: '/admin-sales/customers', icon: FaUsers },
    { name: 'پک محصولات', href: '/admin-sales/packs', icon: FaBoxes },
    { name: 'گزارشات فروش', href: '/admin-sales/reports', icon: FaChartLine },
  ];

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const response = await fetch('/api/admin/navigation');
        if (response.ok) {
          const data = await response.json();
          setAdminInfo(data.adminInfo);
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };

    loadAdminData();
  }, []);

  const isActiveLink = (href: string) => {
    if (href === '/admin-sales') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('خطا در خروج:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSessionChecker />
      
      {/* Sidebar */}
              <div className={`fixed inset-y-0 right-0 z-[90] w-80 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-l from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <FaClipboardList className="text-blue-600 text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">پنل فروش</h2>
                <p className="text-blue-100 text-sm">مدیریت فروش بریس</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-white hover:bg-blue-800 rounded-lg lg:hidden"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Admin Info */}
          {adminInfo && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {adminInfo.firstName} {adminInfo.lastName}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">مدیر فروش</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActiveLink(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="space-y-2">
              <Link
                href="/admin-sales/notifications"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all"
              >
                <FaBell className="h-5 w-5" />
                <span>اطلاعیه‌ها</span>
                {unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              
              <Link
                href="/admin-sales/settings"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all"
              >
                <FaCog className="h-5 w-5" />
                <span>تنظیمات</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:mr-80">
        {/* Mobile header */}
                  <div className="sticky top-0 z-[85] bg-white border-b border-gray-200 p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaClipboardList className="text-white text-sm" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">پنل فروش</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[85] bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 