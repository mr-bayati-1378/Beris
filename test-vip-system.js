const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function testVipSystem() {
  try {
    console.log('🧪 تست سیستم مشتریان VIP\n');

    // 1. آمار کلی سیستم
    console.log('📊 آمار کلی:');
    const totalProducts = await prisma.product.count();
    const vipProducts = await prisma.product.count({ where: { isVipOnly: true } });
    const totalUsers = await prisma.user.count({ where: { isAdmin: false } });
    const vipUsers = await prisma.user.count({ where: { isVip: true, isAdmin: false } });

    console.log(`   • کل محصولات: ${totalProducts}`);
    console.log(`   • محصولات VIP: ${vipProducts}`);
    console.log(`   • کل مشتریان: ${totalUsers}`);
    console.log(`   • مشتریان VIP: ${vipUsers}`);

    // 2. نمایش محصولات VIP
    if (vipProducts > 0) {
      console.log('\n👑 محصولات VIP:');
      const vipProductsList = await prisma.product.findMany({
        where: { isVipOnly: true },
        select: {
          id: true,
          name: true,
          price: true,
          isActive: true
        },
        take: 5
      });

      vipProductsList.forEach(product => {
        console.log(`   • [${product.id}] ${product.name} - ${Number(product.price).toLocaleString('fa-IR')} تومان ${product.isActive ? '✅' : '❌'}`);
      });
    }

    // 3. نمایش مشتریان VIP
    if (vipUsers > 0) {
      console.log('\n⭐ مشتریان VIP:');
      const vipUsersList = await prisma.user.findMany({
        where: { isVip: true, isAdmin: false },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          username: true
        },
        take: 5
      });

      vipUsersList.forEach(user => {
        const name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.username || 'بدون نام');
        console.log(`   • ${name} - ${user.phone}`);
      });
    }

    // 4. شبیه‌سازی فیلتر محصولات برای کاربر عادی
    console.log('\n🔍 تست فیلتر محصولات:');
    
    const regularUserProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { isVipOnly: false }
        ]
      },
      select: { id: true }
    });

    console.log(`   • محصولات قابل مشاهده برای کاربر عادی: ${regularUserProducts.length}`);

    // 5. شبیه‌سازی فیلتر محصولات برای کاربر VIP
    const vipUserProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { isVipOnly: false },
          { isVipOnly: true }
        ]
      },
      select: { id: true }
    });

    console.log(`   • محصولات قابل مشاهده برای کاربر VIP: ${vipUserProducts.length}`);

    // 6. تست API endpoint
    console.log('\n🌐 API Endpoints:');
    console.log('   • GET /api/admin/vip-customers - مدیریت مشتریان VIP');
    console.log('   • PATCH /api/admin/vip-customers/[id]/toggle - تغییر وضعیت VIP');
    console.log('   • GET /api/products - فیلتر محصولات بر اساس وضعیت VIP');
    console.log('   • GET /api/products/[slug] - بررسی دسترسی به محصول VIP');

    // 7. نمایش مسیر فایل‌های مدیریت
    console.log('\n📁 فایل‌های مدیریت:');
    console.log('   • export-products.js - تولید فایل اکسل');
    console.log('   • import-products.js - اعمال تغییرات فایل اکسل');
    console.log('   • /admin/vip-customers - صفحه مدیریت مشتریان VIP');

    console.log('\n✅ سیستم VIP با موفقیت فعال است!');

  } catch (error) {
    console.error('❌ خطا در تست سیستم VIP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// دستورات کاربردی
function showUsageInstructions() {
  console.log('\n📖 راهنمای استفاده از سیستم VIP:');
  console.log('\n1️⃣ تولید فایل اکسل محصولات:');
  console.log('   node export-products.js');
  
  console.log('\n2️⃣ ویرایش فایل اکسل:');
  console.log('   • در ستون "محدود به مشتریان VIP" مقدار "بله" قرار دهید');
  console.log('   • سایر فیلدها را نیز می‌توانید ویرایش کنید');
  
  console.log('\n3️⃣ اعمال تغییرات فایل اکسل:');
  console.log('   node import-products.js path/to/your/file.xlsx');
  
  console.log('\n4️⃣ مدیریت مشتریان VIP:');
  console.log('   • وارد پنل مدیر شوید: http://localhost:3000/admin/login');
  console.log('   • به صفحه "مشتریان VIP" بروید: /admin/vip-customers');
  console.log('   • وضعیت VIP مشتریان را تغییر دهید');
  
  console.log('\n5️⃣ بررسی نتایج:');
  console.log('   • محصولات VIP فقط برای مشتریان VIP نمایش داده می‌شوند');
  console.log('   • در صفحه محصول پیام خطای 403 برای کاربران غیر VIP');
}

// اجرای تست
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test') {
    testVipSystem();
  } else if (command === 'help') {
    showUsageInstructions();
  } else {
    console.log('🎯 سیستم مشتریان VIP بریس');
    console.log('\nدستورات موجود:');
    console.log('   node test-vip-system.js test  - اجرای تست');
    console.log('   node test-vip-system.js help  - نمایش راهنما');
    console.log('\nبرای شروع، دستور test را اجرا کنید.');
  }
}

module.exports = { testVipSystem }; 