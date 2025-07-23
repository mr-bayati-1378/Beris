import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const managers = [
  {
    username: 'mrbayati1378',
    password: 'Alireza021',
    firstName: 'آقای',
    lastName: 'بیاتی',
    phone: '09123456701',
    email: 'mrbayati1378@beris.com',
    roleName: 'admin',
    isAdmin: true,
    isActive: true,
  },
  {
    username: 'drnedaey',
    password: '123456789',
    firstName: 'دکتر',
    lastName: 'ندائی',
    phone: '09123456702',
    email: 'drnedaey@beris.com',
    roleName: 'admin',
    isAdmin: true,
    isActive: true,
  },
  {
    username: 'matinmfp',
    password: '123456789',
    firstName: 'متین',
    lastName: 'مدیر مالی',
    phone: '09123456704',
    email: 'matinmfp@beris.com',
    roleName: 'finance',
    isAdmin: true,
    isActive: true,
  },
  {
    username: 'amirhossein',
    password: '123456789',
    firstName: 'امیرحسین',
    lastName: 'مدیر فروش',
    phone: '09123456703',
    email: 'amirhossein@beris.com',
    roleName: 'sales',
    isAdmin: true,
    isActive: true,
  },
  {
    username: 'suply',
    password: '123456789',
    firstName: 'مدیر',
    lastName: 'تامین و بازرگانی',
    phone: '09123456705',
    email: 'supply@beris.com',
    roleName: 'supply',
    isAdmin: true,
    isActive: true,
  },
];

export async function seedManagers() {
  console.log('شروع ایجاد مدیران...');
  
  for (const manager of managers) {
    try {
      // دریافت نقش ادمین
      const adminRole = await prisma.adminRole.findUnique({
        where: { name: manager.roleName }
      });

      if (!adminRole) {
        console.error(`نقش ${manager.roleName} یافت نشد`);
        continue;
      }

      // هش کردن رمز عبور
      const hashedPassword = await bcrypt.hash(manager.password, 10);

      // ایجاد مدیر
      const user = await prisma.user.upsert({
        where: { phone: manager.phone },
        update: {
          firstName: manager.firstName,
          lastName: manager.lastName,
          email: manager.email,
          password: hashedPassword,
          isAdmin: manager.isAdmin,
          isActive: manager.isActive,
          adminRoleId: adminRole.id,
          phoneVerified: true,
          isProfileComplete: true,
        },
        create: {
          firstName: manager.firstName,
          lastName: manager.lastName,
          phone: manager.phone,
          email: manager.email,
          password: hashedPassword,
          isAdmin: manager.isAdmin,
          isActive: manager.isActive,
          adminRoleId: adminRole.id,
          phoneVerified: true,
          isProfileComplete: true,
        },
      });

      console.log(`✅ مدیر "${manager.firstName} ${manager.lastName}" (${manager.username}) با نقش "${adminRole.displayName}" ایجاد/به‌روزرسانی شد`);
    } catch (error) {
      console.error(`❌ خطا در ایجاد مدیر ${manager.username}:`, error);
    }
  }
  
  console.log('✅ ایجاد مدیران کامل شد');
}

if (require.main === module) {
  seedManagers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedManagers; 