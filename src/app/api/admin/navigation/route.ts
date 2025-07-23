import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-roles';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const permissions = admin.adminRole?.permissions as string[] || [];
    const hasPermission = (perm: string) => 
      permissions.includes('all') || permissions.includes(perm);
    
    const userRole = admin.adminRole?.name || 'admin';
    const baseUrl = userRole === 'admin' ? '/admin' : `/admin-${userRole}`;

    const navigationItems = [];

    // همیشه داشبورد
    navigationItems.push({ name: 'داشبورد', href: baseUrl, icon: 'FaHome' });

    // محصولات
    if (hasPermission('products') || hasPermission('products_view')) {
      navigationItems.push({ name: 'محصولات', href: `${baseUrl}/products`, icon: 'FaBox' });
    }

    // دسته‌بندی‌ها
    if (hasPermission('categories')) {
      navigationItems.push({ name: 'دسته‌بندی‌ها', href: `${baseUrl}/categories`, icon: 'FaFolderOpen' });
    }

    // سفارشات - برای همه ادمین‌ها
      navigationItems.push({ name: 'سفارشات', href: `${baseUrl}/orders`, icon: 'FaShoppingCart' });

    // فاکتورها
    if (hasPermission('invoices') || hasPermission('invoices_view')) {
      navigationItems.push({ name: 'فاکتورها', href: `${baseUrl}/invoices`, icon: 'FaFileInvoice' });
    }

    // پک‌های محصول
    if (hasPermission('packs')) {
      navigationItems.push({ name: 'پک‌های محصول', href: `${baseUrl}/packs`, icon: 'FaBoxes' });
    }

    // کاربران
    if (hasPermission('customers') || hasPermission('users')) {
      navigationItems.push({ name: 'کاربران', href: `${baseUrl}/users`, icon: 'FaUsers' });
    }

    // چت
    if (hasPermission('chat')) {
      navigationItems.push({ name: 'چت با مشتریان', href: `${baseUrl}/chat`, icon: 'FaComments' });
    }

    // گزارشات
    if (hasPermission('reports_sales') || hasPermission('reports_supply') || 
        hasPermission('reports_warehouse') || hasPermission('financial_reports')) {
      navigationItems.push({ name: 'گزارشات', href: `${baseUrl}/reports`, icon: 'FaChartLine' });
    }

    // رسانه
    if (hasPermission('media')) {
      navigationItems.push({ name: 'رسانه', href: `${baseUrl}/media`, icon: 'FaImage' });
    }

    // تنظیمات
    if (hasPermission('settings')) {
      navigationItems.push({ name: 'تنظیمات', href: `${baseUrl}/settings`, icon: 'FaCog' });
    }

    // تامین بازرگانی
    if (hasPermission('procurement') || hasPermission('purchase_orders') || 
        hasPermission('supplier_management') || hasPermission('purchase_pricing')) {
      navigationItems.push({ name: 'تامین بازرگانی', href: `${baseUrl}/supply`, icon: 'FaTruck' });
    }

    // ورودی کالا - برای همه ادمین‌ها
    navigationItems.push({ name: 'ورودی کالا', href: `${baseUrl}/inbound`, icon: 'FaDownload' });

    // خروجی کالا - برای همه ادمین‌ها  
    navigationItems.push({ name: 'خروجی کالا', href: `${baseUrl}/outbound`, icon: 'FaUpload' });

    return NextResponse.json({
      navigationItems,
      adminInfo: {
        id: admin.id,
        username: admin.username || admin.phone,
        firstName: admin.firstName,
        lastName: admin.lastName,
        phone: admin.phone,
        adminRole: admin.adminRole,
      },
    });
  } catch (error) {
    console.error('Error getting admin navigation:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
} 