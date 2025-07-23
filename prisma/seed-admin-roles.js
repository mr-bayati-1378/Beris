const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

const adminRoles = [
  {
    name: 'admin',
    displayName: 'مدیر کل',
    permissions: ['all'],
    isActive: true,
  },
  {
    name: 'sales',
    displayName: 'مدیر فروش',
    permissions: [
      'orders',
      'invoices', 
      'customers',
      'products_view',
      'packs',
      'reports_sales',
      'users_view'
    ],
    isActive: true,
  },
  {
    name: 'supply',
    displayName: 'مدیر تأمین و بازرگانی',
    permissions: [
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
    isActive: true,
  },
  {
    name: 'warehouse',
    displayName: 'مدیر انبار',
    permissions: [
      'inventory',
      'stock',
      'shipping',
      'reports_warehouse',
      'products_view'
    ],
    isActive: true,
  },
  {
    name: 'finance',
    displayName: 'مدیر مالی',
    permissions: [
      'payments',
      'financial_reports',
      'accounting',
      'invoices_view',
      'orders'
    ],
    isActive: true,
  },
];

async function seedAdminRoles() {
  console.log('شروع seed نقش‌های مدیریتی...');
  
  for (const role of adminRoles) {
    await prisma.adminRole.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        permissions: role.permissions,
        isActive: role.isActive,
      },
      create: role,
    });
    console.log(`نقش "${role.displayName}" ایجاد/به‌روزرسانی شد`);
  }
  
  console.log('✅ seed نقش‌های مدیریتی کامل شد');
}

if (require.main === module) {
  seedAdminRoles()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedAdminRoles; 