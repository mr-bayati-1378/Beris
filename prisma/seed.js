const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_PRICE = 100000; // 100,000 تومان به عنوان قیمت پیش‌فرض
const DEFAULT_STOCK = 10; // موجودی پیش‌فرض

// دسته‌بندی‌های سطح 1 - دقیقاً مطابق اطلاعات ارائه شده
const categoryL1Data = [
  { id: 0, name: 'نامعلوم', slug: 'unknown' },
  { id: 1, name: 'تزریقی زیبایی', slug: 'beauty-injection' },
  { id: 2, name: 'نخ بخیه', slug: 'suture' },
  { id: 3, name: 'ملزومات جراحی', slug: 'surgical-supplies' },
  { id: 4, name: 'بی حسی', slug: 'anesthesia' },
  { id: 5, name: 'منسوجات پزشکی و سلولوزی', slug: 'medical-textiles' },
  { id: 6, name: 'گاز طبی غیر استریل', slug: 'non-sterile-medical-gas' },
  { id: 7, name: 'تزریقات', slug: 'injections' },
  { id: 8, name: 'آنتی باکتریال و ضد عفونی', slug: 'antibacterial' },
  { id: 9, name: 'تجهیزات آزمایشگاهی', slug: 'laboratory-equipment' },
];

// دسته‌بندی‌های سطح 2 - دقیقاً مطابق اطلاعات ارائه شده
const categoryL2Data = [
  { id: 0, name: 'نامعلوم', parentId: 0 },
  { id: 1, name: 'تزریقی زیبایی', parentId: 1 },
  { id: 2, name: 'نخ ویکریل', parentId: 2 },
  { id: 3, name: 'نخ نایلون', parentId: 2 },
  { id: 4, name: 'ملزومات جراحی', parentId: 3 },
  { id: 5, name: 'بی حسی', parentId: 4 },
  { id: 6, name: 'البسه', parentId: 5 },
  { id: 7, name: 'گاز طبی غیر استریل', parentId: 6 },
  { id: 8, name: 'داروی تزریقی', parentId: 7 },
  { id: 9, name: 'منسوجات یکبار مصرف', parentId: 5 },
  { id: 10, name: 'سرنگ تزریق', parentId: 7 },
  { id: 11, name: 'سرسوزن تزریق', parentId: 7 },
  { id: 12, name: 'باند و پانسمان', parentId: 5 },
  { id: 13, name: 'ست تزریق', parentId: 7 },
  { id: 14, name: 'دستکش نایلونی', parentId: 5 },
  { id: 15, name: 'دستکش لاتکس', parentId: 5 },
  { id: 16, name: 'دستکش جراحی', parentId: 5 },
  { id: 17, name: 'تیغ جراحی', parentId: 3 },
  { id: 18, name: 'البسه یکبار مصرف', parentId: 5 },
  { id: 19, name: 'محلول ضد عفونی کننده', parentId: 8 },
  { id: 20, name: 'شستشوی تزریق', parentId: 7 },
  { id: 21, name: 'لوازم جانبی آزمایشگاهی', parentId: 9 },
];

// دسته‌بندی‌های سطح 3 - دقیقاً مطابق اطلاعات ارائه شده
const categoryL3Data = [
  { id: 0, name: 'نامعلوم', parentId: 0 },
  { id: 1, name: 'هیرفیلر', parentId: 1 },
  { id: 2, name: 'نخ ویکریل کات', parentId: 2 },
  { id: 3, name: 'نخ نایلون کات', parentId: 3 },
  { id: 4, name: 'مارکر', parentId: 4 },
  { id: 5, name: 'لیدوکائین', parentId: 5 },
  { id: 6, name: 'گان', parentId: 6 },
  { id: 7, name: 'گاز طبی غیر استریل 8 لایه', parentId: 7 },
  { id: 8, name: 'گاز طبی غیر استریل 16 لایه', parentId: 7 },
  { id: 9, name: 'گاز طبی دندانپزشکی', parentId: 7 },
  { id: 10, name: 'کوکتل مزوتراپی', parentId: 1 },
  { id: 11, name: 'کاغذ صافی', parentId: 21 },
  { id: 12, name: 'کارپول', parentId: 8 },
  { id: 13, name: 'شان یکبار مصرف', parentId: 9 },
  { id: 14, name: 'سیفتی باکس', parentId: 21 },
  { id: 15, name: 'سوزن پانچ', parentId: 0 },
  { id: 16, name: 'سرنگ انسولین', parentId: 10 },
  { id: 17, name: 'سرنگ 5', parentId: 10 },
  { id: 18, name: 'سرنگ 3', parentId: 10 },
  { id: 19, name: 'سرنگ 10', parentId: 10 },
  { id: 20, name: 'سرسوزن گیج 30', parentId: 11 },
  { id: 21, name: 'سرسوزن گیج 27', parentId: 11 },
  { id: 22, name: 'سرسوزن گیج 25', parentId: 11 },
  { id: 23, name: 'سرسوزن گیج 23', parentId: 11 },
  { id: 24, name: 'سرسوزن گیج 18', parentId: 11 },
  { id: 25, name: 'سرجی فیکس', parentId: 12 },
  { id: 26, name: 'ست سرم', parentId: 13 },
  { id: 27, name: 'روتختی', parentId: 9 },
  { id: 28, name: 'دستکش یکبار مصرف', parentId: 14 },
  { id: 29, name: 'دستکش لاتکس', parentId: 15 },
  { id: 30, name: 'دستکش جراحی سایز 8', parentId: 16 },
  { id: 31, name: 'دستکش جراحی سایز 7.5', parentId: 16 },
  { id: 32, name: 'دستکش جراحی سایز 7', parentId: 16 },
  { id: 33, name: 'دستکش جراحی سایز 6.5', parentId: 16 },
  { id: 34, name: 'چسب پزشکی', parentId: 0 },
  { id: 35, name: 'تیغ ساده', parentId: 17 },
  { id: 36, name: 'تیغ بیستوری', parentId: 17 },
  { id: 37, name: 'تیغ SP91', parentId: 17 },
  { id: 38, name: 'تیغ SP90', parentId: 17 },
  { id: 39, name: 'پوست و مو و لیزر', parentId: 0 },
  { id: 40, name: 'پک البسه', parentId: 18 },
  { id: 41, name: 'بوتاکس', parentId: 1 },
  { id: 42, name: 'بتادین', parentId: 19 },
  { id: 43, name: 'آنژیوکت', parentId: 0 },
  { id: 44, name: 'آب مقطر', parentId: 0 },
  { id: 45, name: 'الکل', parentId: 19 },
  { id: 46, name: 'اپی نفرین', parentId: 5 },
  { id: 47, name: 'SEPTOCIDINE', parentId: 19 },
  { id: 48, name: 'پوشک', parentId: 9 },
];

// محصولات - دقیقاً مطابق لیست ارائه شده
const productsData = [
  { name: 'هیرفیلر', categoryL3Id: 1 },
  { name: 'نخ ویکریل 5.0', categoryL3Id: 2 },
  { name: 'نخ ویکریل 6.0', categoryL3Id: 2 },
  { name: 'نخ SMI 6.0', categoryL3Id: 3 },
  { name: 'نخ نایلون 3.0 SUTURES', categoryL3Id: 3 },
  { name: 'نخ نایلون 3.0', categoryL3Id: 3 },
  { name: 'نخ نایلون 5.0', categoryL3Id: 3 },
  { name: 'نخ نایلون 6.0', categoryL3Id: 3 },
  { name: 'نخ نایلون 4.0', categoryL3Id: 3 },
  { name: 'مارکر جراحی خط کش دار', categoryL3Id: 4 },
  { name: 'لیدوکائین شیشه ای', categoryL3Id: 5 },
  { name: 'لیدوکائین پلاستیکی', categoryL3Id: 5 },
  { name: 'گان جراح', categoryL3Id: 6 },
  { name: 'گان تک بیمار', categoryL3Id: 6 },
  { name: 'گاز طبی 400 گرمی 8 لایه', categoryL3Id: 7 },
  { name: 'گاز طبی 400 گرمی 16 لایه', categoryL3Id: 8 },
  { name: 'گاز طبی دندانپزشکی اسپادانا', categoryL3Id: 9 },
  { name: 'کوکتل مزوتراپی MesoLike HariPlus', categoryL3Id: 10 },
  { name: 'کوکتل مزوتراپی فیوژن', categoryL3Id: 10 },
  { name: 'کاغذ صافی ورقه ای 58*58', categoryL3Id: 11 },
  { name: 'کارپول بسته 50 عددی', categoryL3Id: 12 },
  { name: 'شان رولی عرض 80', categoryL3Id: 13 },
  { name: 'شان استریل 1*1', categoryL3Id: 13 },
  { name: 'شان استریل پرفوره 1*1', categoryL3Id: 13 },
  { name: 'شان پرفوره 0.5*0.5 استریل', categoryL3Id: 13 },
  { name: 'شان غیر استریل 1*1', categoryL3Id: 13 },
  { name: 'شان استریل پرفوره 50*50', categoryL3Id: 13 },
  { name: 'شان استریل 50*50', categoryL3Id: 13 },
  { name: 'سیفتی باکس 3 لیتری', categoryL3Id: 14 },
  { name: 'سوزن FIT 1.0 بسته 100 تایی', categoryL3Id: 15 },
  { name: 'سوزن FIT 0.9 بسته 100 تایی', categoryL3Id: 15 },
  { name: 'سوزن FIT 0.8 بسته 100 تایی', categoryL3Id: 15 },
  { name: 'سوزن FIT 1.1 بسته 100 تایی', categoryL3Id: 15 },
  { name: 'سرنگ انسولین حلما سرپیچ', categoryL3Id: 16 },
  { name: 'سرنگ انسولین حلما 1ml', categoryL3Id: 16 },
  { name: 'سرنگ انسولین بیک0.5ml', categoryL3Id: 16 },
  { name: 'سرنگ 5 آوا لوئر لاک', categoryL3Id: 17 },
  { name: 'سرنگ 5 بیک لوئر لاک', categoryL3Id: 17 },
  { name: 'سرنگ 3 آوا لوئر لاک', categoryL3Id: 18 },
  { name: 'سرنگ 3 بیک لوئر لاک', categoryL3Id: 18 },
  { name: 'سرنگ 10 آوا', categoryL3Id: 19 },
  { name: 'سرنگ 10 بیک لوئر لاک', categoryL3Id: 19 },
  { name: 'سرسوزن مزوتراپی آوا 30 4', categoryL3Id: 20 },
  { name: 'سرسوزن مزوتراپی حلما 30 4', categoryL3Id: 20 },
  { name: 'نیدل طوسی آوا', categoryL3Id: 21 },
  { name: 'نیدل طوسی حلما', categoryL3Id: 21 },
  { name: 'نیدل طوسی SUPA', categoryL3Id: 21 },
  { name: 'نیدل نارنجی آوا 25 25', categoryL3Id: 22 },
  { name: 'نیدل آبی آوا', categoryL3Id: 23 },
  { name: 'نیدل آبی SUPA', categoryL3Id: 23 },
  { name: 'نیدل آبی حلما', categoryL3Id: 23 },
  { name: 'نیدل صورتی حلما', categoryL3Id: 24 },
  { name: 'نیدل صورتی آوا', categoryL3Id: 24 },
  { name: 'سرجی فیکس سر CITO', categoryL3Id: 25 },
  { name: 'ست سرم HD', categoryL3Id: 26 },
  { name: 'روتختی دو سر کش 80*220 سفید', categoryL3Id: 27 },
  { name: 'روتختی دو سر کش 80*220 آبی', categoryL3Id: 27 },
  { name: 'دستکش یکبار مصرف لایت', categoryL3Id: 28 },
  { name: 'دستکش یکبار مصرف جمیل', categoryL3Id: 28 },
  { name: 'دستکش لاتکس بدون پودر OP-PERFECT مدیوم', categoryL3Id: 29 },
  { name: 'دستکش لاتکس بدون پودر OP-PERFECT لارج', categoryL3Id: 29 },
  { name: 'دستکش جراحی آنتی باکتریال سایز 8', categoryL3Id: 30 },
  { name: 'دستکش جراحی HD بدون پودر 8', categoryL3Id: 30 },
  { name: 'دستکش جراحی MediSmart کم پودر 8', categoryL3Id: 30 },
  { name: 'دستکش جراحی Surgicare کم پودر 8', categoryL3Id: 30 },
  { name: 'دستکش جراحی آنتی باکتریال سایز 7.5', categoryL3Id: 31 },
  { name: 'دستکش جراحی HD بدون پودر 7.5', categoryL3Id: 31 },
  { name: 'دستکش جراحی MediSpo بدون پودر 7.5', categoryL3Id: 31 },
  { name: 'دستکش جراحی MediSpo کم پودر 7.5', categoryL3Id: 31 },
  { name: 'دستکش جراحی MediSmart کم پودر 7.5', categoryL3Id: 31 },
  { name: 'دستکش جراحی HARIR بدون پودر 7.5', categoryL3Id: 31 },
  { name: 'دستکش جراحی MediSmart بدون پودر 7.5', categoryL3Id: 31 },
  { name: 'دستکش جراحی آنتی باکتریال سایز 7', categoryL3Id: 32 },
  { name: 'دستکش جراحی MediSpo کم پودر 7', categoryL3Id: 32 },
  { name: 'دستکش جراحی HD بدون پودر 7', categoryL3Id: 32 },
  { name: 'دستکش جراحی MediSmart کم پودر 7', categoryL3Id: 32 },
  { name: 'دستکش جراحی MediSpo بدون پودر 7', categoryL3Id: 32 },
  { name: 'دستکش جراحی Surgicare کم پودر 7', categoryL3Id: 32 },
  { name: 'دستکش جراحی HARIR بدون پودر 7', categoryL3Id: 32 },
  { name: 'دستکش جراحی NovaSoft بدون پودر 7', categoryL3Id: 32 },
  { name: 'دستکش جراحی Surgicare کم پودر 6.5', categoryL3Id: 33 },
  { name: 'دستکش جراحی آنتی باکتریال سایز 6.5', categoryL3Id: 33 },
  { name: 'دستکش جراحی HD بدون پودر 6.5', categoryL3Id: 33 },
  { name: 'دستکش جراحی MediSmart بدون پودر 6.5', categoryL3Id: 33 },
  { name: 'دستکش جراحی MediSpo بدون پودر 6.5', categoryL3Id: 33 },
  { name: 'دستکش جراحی MediSmart کم پودر 6.5', categoryL3Id: 33 },
  { name: 'دستکش جراحی MediSpo کم پودر 6.5', categoryL3Id: 33 },
  { name: 'دستکش جراحی NovaSoft بدون پودر 6.5', categoryL3Id: 33 },
  { name: 'چسب بخیه', categoryL3Id: 34 },
  { name: 'چسب اتوکلاو', categoryL3Id: 34 },
  { name: 'چسب 2.5 ضد حساسیت', categoryL3Id: 34 },
  { name: 'چسب آنژیوکت', categoryL3Id: 34 },
  { name: 'تیغ ساده', categoryL3Id: 35 },
  { name: 'تیغ ریبل 11 قرمز', categoryL3Id: 36 },
  { name: 'تیغ ریبل 10 آبی', categoryL3Id: 36 },
  { name: 'تیغ ریبل 15 آبی', categoryL3Id: 36 },
  { name: 'تیغ ریبل 10 قرمز', categoryL3Id: 36 },
  { name: 'تیغ ریبل 11 آبی', categoryL3Id: 36 },
  { name: 'تیغ SP91 بسته 25 تایی paramount', categoryL3Id: 37 },
  { name: 'تیغ SP90 بسته 25 تایی HMD', categoryL3Id: 38 },
  { name: 'پماد زایلاپی', categoryL3Id: 39 },
  { name: 'ست کامل لباس بیمار 38 گرم', categoryL3Id: 40 },
  { name: 'MASPORT (BOTULISM TOXIN) 500IU VIAL', categoryL3Id: 41 },
  { name: 'بتادین یک لیتری', categoryL3Id: 42 },
  { name: 'بتادین 60 میل', categoryL3Id: 42 },
  { name: 'آنژیوکت آبی', categoryL3Id: 43 },
  { name: 'آب مقطر 5 لیتری', categoryL3Id: 44 },
  { name: 'الکل 20 لیتری', categoryL3Id: 45 },
  { name: 'آمپول اپی نفرین', categoryL3Id: 46 },
  { name: 'محلول ضدعفونی SEPTOCIDINE', categoryL3Id: 47 },
  { name: 'پوشک سایز بزرگ', categoryL3Id: 48 },
  { name: 'مداد سفید', categoryL3Id: 0 },
  { name: 'اریگاتور', categoryL3Id: 0 },
];

async function main() {
  console.log('Starting comprehensive seed...');
  try {
    // پاک کردن دیتابیس قبلی
    console.log('Cleaning previous data...');
    await prisma.adminActivity.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.productPackItem.deleteMany();
    await prisma.pack.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
    await prisma.categoryL3.deleteMany();
    await prisma.categoryL2.deleteMany();
    await prisma.categoryL1.deleteMany();
    await prisma.adminRole.deleteMany();

    // ایجاد نقش‌های ادمین
    console.log('Creating admin roles...');
    const adminRoles = [
      {
        name: 'admin',
        displayName: 'مدیر کل',
        permissions: ['all'],
      },
      {
        name: 'sales',
        displayName: 'مدیر فروش',
        permissions: ['sales'],
      },
      {
        name: 'warehouse',
        displayName: 'مدیر انبار',
        permissions: ['warehouse'],
      },
    ];

    const createdRoles = await Promise.all(
      adminRoles.map(role =>
        prisma.adminRole.create({
          data: role,
        })
      )
    );

    // ایجاد دسته‌بندی‌های سطح 1
    console.log('Creating L1 categories...');
    const l1s = await Promise.all(
      categoryL1Data.map(cat =>
        prisma.categoryL1.create({
          data: {
            name: cat.name,
            slug: cat.slug,
          },
        })
      )
    );

    // ایجاد دسته‌بندی‌های سطح 2
    console.log('Creating L2 categories...');
    const l2s = await Promise.all(
      categoryL2Data.map(cat =>
        prisma.categoryL2.create({
          data: {
            name: cat.name,
            slug: cat.name.replace(/ /g, '-').toLowerCase(),
            categoryL1Id: l1s[cat.parentId].id,
          },
        })
      )
    );

    // ایجاد دسته‌بندی‌های سطح 3
    console.log('Creating L3 categories...');
    const l3s = await Promise.all(
      categoryL3Data.map(cat =>
        prisma.categoryL3.create({
          data: {
            name: cat.name,
            slug: cat.name.replace(/ /g, '-').toLowerCase(),
            categoryL2Id: l2s[cat.parentId].id,
          },
        })
      )
    );

    // ایجاد محصولات
    console.log('Creating products...');
    await Promise.all(
      productsData.map(product =>
        prisma.product.create({
          data: {
            name: product.name,
            slug: product.name.replace(/ /g, '-').toLowerCase(),
            description: `توضیحات محصول ${product.name}`,
            price: DEFAULT_PRICE,
            stock: DEFAULT_STOCK,
            categoryId: l3s[product.categoryL3Id].id,
          },
        })
      )
    );

    // ایجاد کاربر ادمین
    console.log('Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '09123456789',
        password: await bcrypt.hash('admin123', 10),
        isAdmin: true,
        adminRoleId: createdRoles[0].id, // نقش مدیر کل
      },
    });

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 