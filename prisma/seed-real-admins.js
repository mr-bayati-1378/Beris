const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const managers = [
  {
    username: 'mrbayati1378',
    password: 'Alireza021',
    firstName: 'آقای',
    lastName: 'بیاتی',
    phone: '09354977798',
    email: 'mrbayati1378@beris.com',
    roleName: 'admin',
    isAdmin: true,
    isActive: true,
  },
  {
    username: 'dr.nedaey',
    password: '12345678',
    firstName: 'دکتر',
    lastName: 'ندائی',
    phone: '09123456702',
    email: 'dr.nedaey@beris.com',
    roleName: 'admin',
    isAdmin: true,
    isActive: true,
  },
  {
    username: 'matinmfp',
    password: '12345678',
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
    password: '12345678',
    firstName: 'امیرحسین',
    lastName: 'مدیر فروش',
    phone: '09123456703',
    email: 'amirhossein@beris.com',
    roleName: 'sales',
    isAdmin: true,
    isActive: true,
  },
  {
    username: 'supply',
    password: '12345678',
    firstName: 'مدیر',
    lastName: 'تامین و بازرگانی',
    phone: '09123456705',
    email: 'supply@beris.com',
    roleName: 'supply',
    isAdmin: true,
    isActive: true,
  },
  {
    username: 'kaveh',
    password: '12345678',
    firstName: 'کاوه',
    lastName: 'مدیر انبار',
    phone: '09123456706',
    email: 'kaveh@beris.com',
    roleName: 'warehouse',
    isAdmin: true,
    isActive: true,
  },
];

async function seedRealAdmins() {
  console.log('شروع ایجاد مدیران واقعی...');
  
  // پاک کردن کاربران تست قبلی
  console.log('پاک کردن کاربران تست قبلی...');
  await prisma.user.deleteMany({
    where: {
      OR: [
        { phone: '09111111111' },
        { phone: '09222222222' },
        { phone: '09333333333' },
        { phone: '09444444444' },
        { phone: '09555555555' },
      ]
    }
  });
  
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

      // ایجاد یا آپدیت مدیر
      const user = await prisma.user.upsert({
        where: { phone: manager.phone },
        update: {
          username: manager.username,
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
          username: manager.username,
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
  
  console.log('✅ ایجاد مدیران واقعی کامل شد');
  console.log('\n📋 اطلاعات لاگین:');
  console.log('• مدیر کل (آقای بیاتی): mrbayati1378 / Alireza021');
  console.log('• مدیر کل (دکتر ندائی): dr.nedaey / 12345678');
  console.log('• مدیر مالی (متین): matinmfp / 12345678');
  console.log('• مدیر فروش (امیرحسین): amirhossein / 12345678');
  console.log('• مدیر تامین: supply / 12345678');
  console.log('• مدیر انبار (کاوه): kaveh / 12345678');
}

if (require.main === module) {
  seedRealAdmins()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedRealAdmins; 