import { cookies } from 'next/headers';
import prisma from './prisma';
import { auth } from '@/lib/auth';

export interface AdminPermissions {
  // عمومی
  all?: boolean;
  
  // فروش
  orders?: boolean;
  invoices?: boolean;
  customers?: boolean;
  packs?: boolean;
  reports_sales?: boolean;
  
  // محصولات و تأمین
  products?: boolean;
  products_view?: boolean;
  categories?: boolean;
  suppliers?: boolean;
  inventory?: boolean;
  reports_supply?: boolean;
  
  // تامین بازرگانی (جدید)
  procurement?: boolean;
  purchase_orders?: boolean;
  purchase_invoices?: boolean;
  supplier_management?: boolean;
  purchase_pricing?: boolean;
  market_sourcing?: boolean;
  
  // انبار
  stock?: boolean;
  shipping?: boolean;
  reports_warehouse?: boolean;
  
  // مالی
  payments?: boolean;
  financial_reports?: boolean;
  accounting?: boolean;
  invoices_view?: boolean;
  
  // کاربران
  users?: boolean;
  users_view?: boolean;
  
  // رسانه
  media?: boolean;
  
  // تنظیمات
  settings?: boolean;
  
  // چت
  chat?: boolean;
}

export const ADMIN_ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  SUPPLY: 'supply',
  WAREHOUSE: 'warehouse',
  FINANCE: 'finance',
} as const;

export const ADMIN_ROLE_NAMES = {
  admin: 'مدیر کل',
  sales: 'مدیر فروش',
  supply: 'مدیر تأمین و بازرگانی',
  warehouse: 'مدیر انبار',
  finance: 'مدیر مالی',
} as const;

export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  admin: ['all'],
  sales: [
    'orders',
    'invoices', 
    'customers',
    'products_view',
    'packs',
    'reports_sales',
    'users_view'
  ],
  supply: [
    'products',
    'categories',
    'suppliers',
    'inventory',
    'reports_supply',
    'media',
    'procurement',
    'purchase_orders',
    'purchase_invoices',
    'supplier_management',
    'purchase_pricing',
    'market_sourcing'
  ],
  warehouse: [
    'inventory',
    'stock',
    'shipping',
    'reports_warehouse',
    'products_view'
  ],
  finance: [
    'payments',
    'financial_reports',
    'accounting',
    'invoices_view',
    'orders'
  ],
};

// دریافت کاربر ادمین فعلی
export async function getCurrentAdmin() {
  try {
    // First try to get from NextAuth session
    const session = await auth();
    
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        include: {
          adminRole: true,
        },
      });
      
      if (user && user.isAdmin && user.isActive) {
        return user;
      }
    }

    // Fallback to cookie-based auth for admin routes
    const cookieStore = cookies();
    const adminUserId = cookieStore.get('admin-user-id');
    
    if (!adminUserId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: adminUserId.value,
      },
      include: {
        adminRole: true,
      },
    });

    if (user && user.isAdmin && user.isActive) {
      return user;
    }

    return null;
  } catch (error) {
    console.error('Error getting current admin:', error);
    return null;
  }
}

// بررسی مجوز ادمین
export async function checkAdminPermission(permission: keyof AdminPermissions): Promise<boolean> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return false;
    }

    // اگر نقش ندارد، فقط ادمین کل باشد
    if (!admin.adminRole) {
      return admin.isAdmin;
    }

    const permissions = admin.adminRole.permissions as string[];
    
    // اگر دسترسی کامل دارد
    if (permissions.includes('all')) {
      return true;
    }

    // بررسی مجوز خاص
    return permissions.includes(permission);
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return false;
  }
}

// ثبت فعالیت ادمین
export async function logAdminActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  description?: string,
  req?: any
) {
  try {
    await prisma.adminActivity.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || '',
        details: description || `${action} ${entityType}`,
      },
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}

// تولید شماره فاکتور خودکار
export async function generateInvoiceNumber(): Promise<string> {
  try {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // پیدا کردن آخرین شماره فاکتور امروز
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}${month}`,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `INV-${year}${month}-${sequence.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    return `INV-${Date.now()}`;
  }
}

// دریافت منوهای قابل دسترسی برای ادمین
export async function getAdminNavigationItems() {
  const admin = await getCurrentAdmin();
  
  if (!admin) {
    return [];
  }

  const permissions = admin.adminRole?.permissions as string[] || [];
  const hasPermission = (perm: string) => 
    permissions.includes('all') || permissions.includes(perm);

  const items = [];

  // همیشه داشبورد
  items.push({ name: 'داشبورد', href: '/admin', icon: 'FaHome' });

  // محصولات
  if (hasPermission('products') || hasPermission('products_view')) {
    items.push({ name: 'محصولات', href: '/admin/products', icon: 'FaBox' });
  }

  // دسته‌بندی‌ها
  if (hasPermission('categories')) {
    items.push({ name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: 'FaFolderOpen' });
  }

  // سفارشات
  if (hasPermission('orders')) {
    items.push({ name: 'سفارشات', href: '/admin/orders', icon: 'FaShoppingCart' });
  }

  // فاکتورها
  if (hasPermission('invoices') || hasPermission('invoices_view')) {
    items.push({ name: 'فاکتورها', href: '/admin/invoices', icon: 'FaFileInvoice' });
  }

  // پک‌های محصول
  if (hasPermission('packs')) {
    items.push({ name: 'پک‌های محصول', href: '/admin/packs', icon: 'FaBoxes' });
  }

  // کاربران
  if (hasPermission('customers') || hasPermission('users')) {
    items.push({ name: 'کاربران', href: '/admin/users', icon: 'FaUsers' });
  }

  // چت با مشتریان
  if (hasPermission('chat') || hasPermission('all')) {
    items.push({ name: 'چت با مشتریان', href: '/admin/chat', icon: 'FaComments' });
  }

  // گزارشات
  if (hasPermission('reports_sales') || hasPermission('reports_supply') || 
      hasPermission('reports_warehouse') || hasPermission('financial_reports')) {
    items.push({ name: 'گزارشات', href: '/admin/reports', icon: 'FaChartLine' });
  }

  // رسانه
  if (hasPermission('media')) {
    items.push({ name: 'رسانه', href: '/admin/media', icon: 'FaImage' });
  }

  // تنظیمات
  if (hasPermission('settings')) {
    items.push({ name: 'تنظیمات', href: '/admin/settings', icon: 'FaCog' });
  }

  return items;
}

// middleware برای بررسی دسترسی
export function createPermissionMiddleware(requiredPermission: keyof AdminPermissions) {
  return async (req: any, res: any, next: any) => {
    const hasPermission = await checkAdminPermission(requiredPermission);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }
    
    next();
  };
} 