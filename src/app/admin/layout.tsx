'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import { 
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaImage,
  FaFolderOpen,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBell,
  FaComments,
  FaFileInvoice,
  FaBoxes,
  FaChevronDown,
  FaChevronLeft,
  FaUserTie,
  FaDollarSign,
  FaWarehouse,
  FaClipboardList,
  FaSearch,
  FaUser,
  FaTruck,
  FaFileAlt,
  FaTags,
  FaStore,
  FaCalculator,
  FaCreditCard,
  FaChartPie,
  FaShippingFast,
  FaChartBar,
  FaDownload,
  FaUpload,
  FaMoneyBillWave
} from 'react-icons/fa';
import AdminSessionChecker from '@/components/AdminSessionChecker';
import ChatNotifications from '@/components/admin/ChatNotifications';

// آیکون‌های دینامیک
const iconMap = {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaImage,
  FaFolderOpen,
  FaCog,
  FaComments,
  FaFileInvoice,
  FaBoxes,
  FaUserTie,
  FaDollarSign,
  FaWarehouse,
  FaClipboardList,
  FaTruck,
  FaFileAlt,
  FaTags,
  FaStore,
  FaCalculator,
  FaCreditCard,
  FaChartPie,
  FaShippingFast,
  FaChartBar,
  FaDownload,
  FaUpload,
  FaMoneyBillWave
};

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  children?: NavigationItem[];
}

interface RoleSection {
  name: string;
  icon: string;
  items: NavigationItem[];
}



export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [roleSections, setRoleSections] = useState<RoleSection[]>([]);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pathname = usePathname();

  // بارگذاری منوها و اطلاعات ادمین
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const response = await fetch('/api/admin/navigation');
        if (response.ok) {
          const data = await response.json();
          setAdminInfo(data.adminInfo);
          
          // ساختار جدید نقش محور
          const userRole = data.adminInfo?.adminRole?.name;
          const permissions = data.adminInfo?.adminRole?.permissions as string[] || [];
          const hasAllPermissions = permissions.includes('all');
          

          
          if (hasAllPermissions) {
            // مدیرکل - دسترسی به همه بخش‌ها
            setRoleSections([
              {
                name: 'مدیریت کلی',
                icon: 'FaHome',
                items: [
                  { name: 'داشبورد', href: '/admin', icon: 'FaHome' },
                  { name: 'چت با مشتریان', href: '/admin/chat', icon: 'FaComments' },
                  { name: 'پیام‌رسانی', href: '/admin/messaging', icon: 'FaComments' },
                  { name: 'تنظیمات', href: '/admin/settings', icon: 'FaCog' }
                ]
              },
              {
                name: 'بخش فروش',
                icon: 'FaClipboardList',
                items: [
                  { name: 'سفارشات', href: '/admin/orders', icon: 'FaShoppingCart' },
                  { name: 'فاکتورها', href: '/admin/invoices', icon: 'FaFileInvoice' },
                  { name: 'مشتریان', href: '/admin/customers', icon: 'FaUsers' },
                  { name: 'پک محصولات', href: '/admin/packs', icon: 'FaBoxes' },
                  { name: 'درخواست‌های محصول', href: '/admin/product-requests', icon: 'FaClipboardList' },
                  { name: 'ورودی کالا', href: '/admin/inbound', icon: 'FaDownload' },
                  { name: 'خروجی کالا', href: '/admin/outbound', icon: 'FaUpload' },
                  { name: 'گزارشات فروش', href: '/admin/sales-reports', icon: 'FaChartLine' }
                ]
              },
              {
                name: 'بخش مالی',
                icon: 'FaDollarSign',
                items: [
                  { name: 'گزارشات مالی', href: '/admin/reports', icon: 'FaChartLine' },
                  { name: 'حسابداری', href: '/admin/accounting', icon: 'FaCalculator' },
                  { name: 'تسویه بدهکاری‌ها', href: '/admin/accounting/settlements', icon: 'FaMoneyBillWave' },
                  { name: 'پرداخت‌ها', href: '/admin/payments', icon: 'FaCreditCard' },
                  { name: 'ورودی کالا', href: '/admin/inbound', icon: 'FaDownload' },
                  { name: 'خروجی کالا', href: '/admin/outbound', icon: 'FaUpload' },
                  { name: 'تحلیل مالی', href: '/admin/financial-analysis', icon: 'FaChartPie' }
                ]
              },
              {
                name: 'بخش تامین بازرگانی',
                icon: 'FaTruck',
                items: [
                  { name: 'سفارشات خرید', href: '/admin/supply/purchase-orders', icon: 'FaFileAlt' },
                  { name: 'تامین‌کنندگان', href: '/admin/supply/suppliers', icon: 'FaTruck' },
                  { name: 'فاکتورهای خرید', href: '/admin/supply/purchase-invoices', icon: 'FaFileInvoice' },
                  { name: 'قیمت‌گذاری خرید', href: '/admin/supply/pricing', icon: 'FaTags' },
                  { name: 'تهیه از بازار', href: '/admin/supply/market-sourcing', icon: 'FaStore' },
                  { name: 'ورودی کالا', href: '/admin/inbound', icon: 'FaDownload' },
                  { name: 'خروجی کالا', href: '/admin/outbound', icon: 'FaUpload' },
                  { name: 'گزارشات تامین', href: '/admin/supply-reports', icon: 'FaClipboardList' }
                ]
              },
              {
                name: 'بخش انبار',
                icon: 'FaWarehouse',
                items: [
                  { name: 'محصولات', href: '/admin/products', icon: 'FaBox' },
                  { name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: 'FaFolderOpen' },
                  { name: 'موجودی انبار', href: '/admin/inventory', icon: 'FaWarehouse' },
                  { name: 'ورودی کالا', href: '/admin/inbound', icon: 'FaDownload' },
                  { name: 'خروجی کالا', href: '/admin/outbound', icon: 'FaUpload' },
                  { name: 'حمل و نقل', href: '/admin/shipping', icon: 'FaShippingFast' },
                  { name: 'رسانه', href: '/admin/media', icon: 'FaImage' },
                  { name: 'گزارشات انبار', href: '/admin/warehouse-reports', icon: 'FaChartBar' }
                ]
              },
              {
                name: 'بخش کاربران',
                icon: 'FaUserTie',
                items: [
                  { name: 'کاربران', href: '/admin/users', icon: 'FaUsers' },
                  { name: 'مشتریان VIP', href: '/admin/vip-customers', icon: 'FaUserTie' },
                  { name: 'فعالیت‌ها', href: '/admin/activities', icon: 'FaClipboardList' }
                ]
              },
              {
                name: 'پنل‌های سیستم',
                icon: 'FaCog',
                items: []
              }
            ]);
          } else {
            // سایر نقش‌ها - فقط بخش مربوط به نقششان
            const roleMenus = {
              sales: {
                name: 'بخش فروش',
                icon: 'FaClipboardList',
                items: [
                  { name: 'داشبورد', href: '/admin', icon: 'FaHome' },
                  { name: 'سفارشات', href: '/admin/orders', icon: 'FaShoppingCart' },
                  { name: 'فاکتورها', href: '/admin/invoices', icon: 'FaFileInvoice' },
                  { name: 'مشتریان', href: '/admin/customers', icon: 'FaUsers' },
                  { name: 'پک محصولات', href: '/admin/packs', icon: 'FaBoxes' },
                  { name: 'ورودی کالا', href: '/admin/inbound', icon: 'FaDownload' },
                  { name: 'خروجی کالا', href: '/admin/outbound', icon: 'FaUpload' }
                ]
              },
              finance: {
                name: 'بخش مالی',
                icon: 'FaDollarSign',
                items: [
                  { name: 'داشبورد', href: '/admin', icon: 'FaHome' },
                  { name: 'سفارشات', href: '/admin/orders', icon: 'FaShoppingCart' },
                  { name: 'گزارشات مالی', href: '/admin/reports', icon: 'FaChartLine' }
                ]
              },
              warehouse: {
                name: 'بخش انبار',
                icon: 'FaWarehouse',
                items: [
                  { name: 'داشبورد', href: '/admin', icon: 'FaHome' },
                  { name: 'سفارشات', href: '/admin/orders', icon: 'FaShoppingCart' },
                  { name: 'محصولات', href: '/admin/products', icon: 'FaBox' },
                  { name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: 'FaFolderOpen' },
                  { name: 'ورودی کالا', href: '/admin/inbound', icon: 'FaDownload' },
                  { name: 'خروجی کالا', href: '/admin/outbound', icon: 'FaUpload' },
                  { name: 'رسانه', href: '/admin/media', icon: 'FaImage' }
                ]
              },
              supply: {
                name: 'بخش تامین بازرگانی',
                icon: 'FaTruck',
                items: [
                  { name: 'داشبورد', href: '/admin', icon: 'FaHome' },
                  { name: 'سفارشات', href: '/admin/orders', icon: 'FaShoppingCart' },
                  { name: 'سفارشات خرید', href: '/admin/supply/purchase-orders', icon: 'FaFileAlt' },
                  { name: 'تامین‌کنندگان', href: '/admin/supply/suppliers', icon: 'FaTruck' },
                  { name: 'فاکتورهای خرید', href: '/admin/supply/purchase-invoices', icon: 'FaFileInvoice' },
                  { name: 'قیمت‌گذاری خرید', href: '/admin/supply/pricing', icon: 'FaTags' },
                  { name: 'تهیه از بازار', href: '/admin/supply/market-sourcing', icon: 'FaStore' },
                  { name: 'محصولات', href: '/admin/products', icon: 'FaBox' },
                  { name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: 'FaFolderOpen' },
                  { name: 'رسانه', href: '/admin/media', icon: 'FaImage' }
                ]
              }
            };
            
            const userRole = data.adminInfo?.adminRole?.name;
            if (userRole && roleMenus[userRole as keyof typeof roleMenus]) {
              setRoleSections([roleMenus[userRole as keyof typeof roleMenus]]);
              // باز کردن خودکار بخش مربوطه
              setExpandedSections({[roleMenus[userRole as keyof typeof roleMenus].name]: true});
            }
          }
          
          // بارگذاری تعداد اطلاعیه‌های خوانده‌نشده
          if (data.adminInfo?.adminRole?.name === 'admin') {
            setUnreadNotifications(3); // مقدار نمونه - باید از API بیاید
          }
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
        // منوهای پیش‌فرض
        setRoleSections([
          {
            name: 'مدیریت کلی',
            icon: 'FaHome',
            items: [
              { name: 'داشبورد', href: '/admin', icon: 'FaHome' }
            ]
          }
        ]);
      }
    };

    loadAdminData();
  }, []);

  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      // Clear localStorage
      localStorage.removeItem('adminAuth');
      // Redirect to login
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage even if API fails
      localStorage.removeItem('adminAuth');
      window.location.href = '/admin/login';
    }
  };

  const renderIcon = (iconName: string, className: string = '') => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className={className} /> : <FaHome className={className} />;
  };

  return (
    <div className="admin-layout">
      <AdminSessionChecker />
      
      <div className="flex h-screen overflow-hidden bg-gray-100">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 right-0 z-[90] w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex h-full flex-col">
            {/* Header سایدبار */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <Link href="/admin" className="flex items-center gap-3">
                <Image 
                  src="/beris-logo.png" 
                  alt="بریس" 
                  width={40} 
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <span className="text-lg font-bold text-gray-900">پنل بریس</span>
                  <p className="text-xs text-gray-500">مدیریت</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
              {roleSections.map((section) => (
                <div key={section.name} className="mb-4">
                  <button
                    onClick={() => toggleSection(section.name)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      {renderIcon(section.icon, 'h-5 w-5 text-gray-500')}
                      <span>{section.name}</span>
                    </div>
                    {expandedSections[section.name] ? (
                      <FaChevronDown className="h-4 w-4" />
                    ) : (
                      <FaChevronLeft className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections[section.name] && (
                    <div className="mt-2 space-y-1 pr-6">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActiveLink(item.href)
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {renderIcon(item.icon, 'h-4 w-4')}
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Footer سایدبار */}
            <div className="border-t border-gray-200 p-4">
              {adminInfo && (
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <FaUser className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {adminInfo.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {adminInfo.adminRole?.displayName}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <FaBars className="h-5 w-5" />
                </button>
                
                <div className="hidden lg:block">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {roleSections.find(section => 
                      section.items.some(item => isActiveLink(item.href))
                    )?.items.find(item => isActiveLink(item.href))?.name || 'پنل مدیریت'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ChatNotifications />
                {/* Search */}
                <div className="hidden md:block">
                  <div className="relative">
                    <FaSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="جستجو..."
                      className="w-64 rounded-lg border border-gray-300 py-2 pr-10 pl-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {/* Notifications */}
                <Link 
                  href="/admin/notifications"
                  className="relative rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FaBell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* Profile Menu */}
                <div className="flex items-center gap-3">
                  <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                    مشاهده سایت
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[85] bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 