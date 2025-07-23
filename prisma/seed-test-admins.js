const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedRealAdmins() {
  console.log('شروع seed کاربران واقعی مدیریتی...');
  
  // دریافت نقش‌ها
  const roles = await prisma.adminRole.findMany();
  
  const realAdmins = [
    {
      firstName: 'علیرضا',
      lastName: 'بیاتی',
      username: 'mrbayati1378',
      phone: '09123456701',
      email: 'mrbayati1378@beris.com',
      password: await bcrypt.hash('Alireza021', 10),
      isAdmin: true,
      isActive: true,
      isProfileComplete: true,
      phoneVerified: true,
      adminRoleId: roles.find(r => r.name === 'admin')?.id
    },
    {
      firstName: 'دکتر',
      lastName: 'ندائی',
      username: 'dr.nedaey',
      phone: '09123456702',
      email: 'dr.nedaey@beris.com',
      password: await bcrypt.hash('12345678', 10),
      isAdmin: true,
      isActive: true,
      isProfileComplete: true,
      phoneVerified: true,
      adminRoleId: roles.find(r => r.name === 'admin')?.id
    },
    {
      firstName: 'مدیر',
      lastName: 'تامین',
      username: 'supply',
      phone: '09123456703',
      email: 'supply@beris.com',
      password: await bcrypt.hash('12345678', 10),
      isAdmin: true,
      isActive: true,
      isProfileComplete: true,
      phoneVerified: true,
      adminRoleId: roles.find(r => r.name === 'supply')?.id
    },
    {
      firstName: 'امیرحسین',
      lastName: 'مدیر فروش',
      username: 'amirhossein',
      phone: '09123456704',
      email: 'amirhossein@beris.com',
      password: await bcrypt.hash('12345678', 10),
      isAdmin: true,
      isActive: true,
      isProfileComplete: true,
      phoneVerified: true,
      adminRoleId: roles.find(r => r.name === 'sales')?.id
    },
    {
      firstName: 'کاوه',
      lastName: 'مدیر انبار',
      username: 'kaveh',
      phone: '09123456705',
      email: 'kaveh@beris.com',
      password: await bcrypt.hash('12345678', 10),
      isAdmin: true,
      isActive: true,
      isProfileComplete: true,
      phoneVerified: true,
      adminRoleId: roles.find(r => r.name === 'warehouse')?.id
    },
    {
      firstName: 'متین',
      lastName: 'مدیر مالی',
      username: 'matinmfp',
      phone: '09123456706',
      email: 'matinmfp@beris.com',
      password: await bcrypt.hash('12345678', 10),
      isAdmin: true,
      isActive: true,
      isProfileComplete: true,
      phoneVerified: true,
      adminRoleId: roles.find(r => r.name === 'finance')?.id
    }
  ];
  
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
        { email: { contains: '@beris.com' } }
      ]
    }
  });
  
  for (const admin of realAdmins) {
    try {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: admin.phone },
            { email: admin.email }
          ]
        }
      });
      
      if (existing) {
        // آپدیت کاربر موجود
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            firstName: admin.firstName,
            lastName: admin.lastName,
            password: admin.password,
            isAdmin: true,
            adminRoleId: admin.adminRoleId,
            isActive: true,
            isProfileComplete: true,
            phoneVerified: true,
          }
        });
        console.log(`کاربر "${admin.firstName} ${admin.lastName}" به‌روزرسانی شد`);
      } else {
        // ایجاد کاربر جدید
        await prisma.user.create({
          data: admin
        });
        console.log(`کاربر "${admin.firstName} ${admin.lastName}" ایجاد شد`);
      }
    } catch (error) {
      console.error(`خطا در ایجاد/به‌روزرسانی کاربر ${admin.firstName} ${admin.lastName}:`, error);
    }
  }
  
  console.log('✅ seed کاربران واقعی مدیریتی کامل شد');
  console.log('\n📋 اطلاعات لاگین:');
  console.log('• مدیر کل (علیرضا بیاتی): mrbayati1378 / Alireza021');
  console.log('• مدیر کل (دکتر ندائی): dr.nedaey / 12345678');
  console.log('• مدیر تامین: supply / 12345678');
  console.log('• مدیر فروش (امیرحسین): amirhossein / 12345678');
  console.log('• مدیر انبار (کاوه): kaveh / 12345678');
  console.log('• مدیر مالی (متین): matinmfp / 12345678');
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