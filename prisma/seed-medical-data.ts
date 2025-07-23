import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Helper function to create slug from Persian text
function createSlug(text: string, id?: number): string {
  // Remove special characters and replace spaces with hyphens
  let slug = text
    .replace(/[^\u0600-\u06FF\s\w]/g, '') // Keep Persian characters, spaces, and alphanumeric
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  
  // If slug is empty or only contains non-ASCII characters, use fallback
  if (!slug || slug.length < 2) {
    slug = `item-${id || Math.random().toString(36).substr(2, 9)}`;
  }
  
  return slug;
}

async function seedMedicalData() {
  console.log('🌱 Seeding medical supply data...');

  try {
    // Level 1 Categories Data
    const level1Data = [
      { id: 0, name: 'نامعلوم' },
      { id: 1, name: 'تزریقی زیبایی' },
      { id: 2, name: 'نخ بخیه' },
      { id: 3, name: 'ملزومات جراحی' },
      { id: 4, name: 'بی حسی' },
      { id: 5, name: 'منسوجات پزشکی و سلولوزی' },
      { id: 6, name: 'گاز طبی غیر استریل' },
      { id: 7, name: 'تزریقات' },
      { id: 8, name: 'آنتی باکتریال و ضد عفونی' },
      { id: 9, name: 'تجهیزات آزمایشگاهی' }
    ];

    // Level 2 Categories Data
    const level2Data = [
      { id: 0, name: 'نامعلوم', level1_id: 0 },
      { id: 1, name: 'تزریقی زیبایی', level1_id: 1 },
      { id: 2, name: 'نخ ویکریل', level1_id: 2 },
      { id: 3, name: 'نخ نایلون', level1_id: 2 },
      { id: 4, name: 'ملزومات جراحی', level1_id: 3 },
      { id: 5, name: 'بی حسی', level1_id: 4 },
      { id: 6, name: 'البسه', level1_id: 5 },
      { id: 7, name: 'گاز طبی غیر استریل', level1_id: 6 },
      { id: 8, name: 'داروی تزریقی', level1_id: 7 },
      { id: 9, name: 'منسوجات یکبار مصرف', level1_id: 5 },
      { id: 10, name: 'سرنگ تزریق', level1_id: 7 },
      { id: 11, name: 'سرسوزن تزریق', level1_id: 7 },
      { id: 12, name: 'باند و پانسمان', level1_id: 5 },
      { id: 13, name: 'ست تزریق', level1_id: 7 },
      { id: 14, name: 'دستکش نایلونی', level1_id: 5 },
      { id: 15, name: 'دستکش لاتکس', level1_id: 5 },
      { id: 16, name: 'دستکش جراحی', level1_id: 5 },
      { id: 17, name: 'تیغ جراحی', level1_id: 3 },
      { id: 18, name: 'البسه یکبار مصرف', level1_id: 5 },
      { id: 19, name: 'محلول ضد عفونی کننده', level1_id: 8 },
      { id: 20, name: 'شستشوی تزریق', level1_id: 7 },
      { id: 21, name: 'لوازم جانبی آزمایشگاهی', level1_id: 9 }
    ];

    // Level 3 Categories Data
    const level3Data = [
      { id: 0, name: 'نامعلوم', level2_id: 0 },
      { id: 1, name: 'هیرفیلر', level2_id: 1 },
      { id: 2, name: 'نخ ویکریل کات', level2_id: 2 },
      { id: 3, name: 'نخ نایلون کات', level2_id: 3 },
      { id: 4, name: 'مارکر', level2_id: 4 },
      { id: 5, name: 'لیدوکائین', level2_id: 5 },
      { id: 6, name: 'گان', level2_id: 6 },
      { id: 7, name: 'گاز طبی غیر استریل 8 لایه', level2_id: 7 },
      { id: 8, name: 'گاز طبی غیر استریل 16 لایه', level2_id: 7 },
      { id: 9, name: 'گاز طبی دندانپزشکی', level2_id: 7 },
      { id: 10, name: 'کوکتل مزوتراپی', level2_id: 1 },
      { id: 11, name: 'کاغذ صافی', level2_id: 21 },
      { id: 12, name: 'کارپول', level2_id: 8 },
      { id: 13, name: 'شان یکبار مصرف', level2_id: 9 },
      { id: 14, name: 'سیفتی باکس', level2_id: 21 },
      { id: 15, name: 'سوزن پانچ', level2_id: 11 },
      { id: 16, name: 'سرنگ انسولین', level2_id: 10 },
      { id: 17, name: 'سرنگ 5', level2_id: 10 },
      { id: 18, name: 'سرنگ 3', level2_id: 10 },
      { id: 19, name: 'سرنگ 10', level2_id: 10 },
      { id: 20, name: 'سرسوزن گیج 30', level2_id: 11 },
      { id: 21, name: 'سرسوزن گیج 27', level2_id: 11 },
      { id: 22, name: 'سرسوزن گیج 25', level2_id: 11 },
      { id: 23, name: 'سرسوزن گیج 23', level2_id: 11 },
      { id: 24, name: 'سرسوزن گیج 18', level2_id: 11 },
      { id: 25, name: 'سرجی فیکس', level2_id: 12 },
      { id: 26, name: 'ست سرم', level2_id: 13 },
      { id: 27, name: 'روتختی', level2_id: 9 },
      { id: 28, name: 'دستکش یکبار مصرف', level2_id: 14 },
      { id: 29, name: 'دستکش لاتکس', level2_id: 15 },
      { id: 30, name: 'دستکش جراحی سایز 8', level2_id: 16 },
      { id: 31, name: 'دستکش جراحی سایز 7.5', level2_id: 16 },
      { id: 32, name: 'دستکش جراحی سایز 7', level2_id: 16 },
      { id: 33, name: 'دستکش جراحی سایز 6.5', level2_id: 16 },
      { id: 34, name: 'چسب پزشکی', level2_id: 12 },
      { id: 35, name: 'تیغ ساده', level2_id: 17 },
      { id: 36, name: 'تیغ بیستوری', level2_id: 17 },
      { id: 37, name: 'تیغ SP91', level2_id: 17 },
      { id: 38, name: 'تیغ SP90', level2_id: 17 },
      { id: 39, name: 'پوست و مو و لیزر', level2_id: 19 },
      { id: 40, name: 'پک البسه', level2_id: 18 },
      { id: 41, name: 'بوتاکس', level2_id: 1 },
      { id: 42, name: 'بتادین', level2_id: 19 },
      { id: 43, name: 'آنژیوکت', level2_id: 8 },
      { id: 44, name: 'آب مقطر', level2_id: 19 },
      { id: 45, name: 'الکل', level2_id: 19 },
      { id: 46, name: 'اپی نفرین', level2_id: 5 },
      { id: 47, name: 'SEPTOCIDINE', level2_id: 19 },
      { id: 48, name: 'پوشک', level2_id: 9 }
    ];

    // Products Data
    const productsData = [
      { name: 'هیرفیلر', level1_id: 1, level2_id: 1, level3_id: 1 },
      { name: 'نخ ویکریل 5.0', level1_id: 2, level2_id: 2, level3_id: 2 },
      { name: 'نخ ویکریل 6.0', level1_id: 2, level2_id: 2, level3_id: 2 },
      { name: 'نخ SMI 6.0', level1_id: 2, level2_id: 3, level3_id: 3 },
      { name: 'نخ نایلون 3.0 SUTURES', level1_id: 2, level2_id: 3, level3_id: 3 },
      { name: 'نخ نایلون 3.0', level1_id: 2, level2_id: 3, level3_id: 3 },
      { name: 'نخ نایلون 5.0', level1_id: 2, level2_id: 3, level3_id: 3 },
      { name: 'نخ نایلون 6.0', level1_id: 2, level2_id: 3, level3_id: 3 },
      { name: 'نخ نایلون 4.0', level1_id: 2, level2_id: 3, level3_id: 3 },
      { name: 'مارکر جراحی خط کش دار', level1_id: 3, level2_id: 4, level3_id: 4 },
      { name: 'لیدوکائین شیشه ای', level1_id: 4, level2_id: 5, level3_id: 5 },
      { name: 'لیدوکائین پلاستیکی', level1_id: 4, level2_id: 5, level3_id: 5 },
      { name: 'گان جراح', level1_id: 5, level2_id: 6, level3_id: 6 },
      { name: 'گان تک بیمار', level1_id: 5, level2_id: 6, level3_id: 6 },
      { name: 'گاز طبی 400 گرمی 8 لایه', level1_id: 6, level2_id: 7, level3_id: 7 },
      { name: 'گاز طبی 400 گرمی 16 لایه', level1_id: 6, level2_id: 7, level3_id: 8 },
      { name: 'گاز طبی دندانپزشکی اسپادانا', level1_id: 6, level2_id: 7, level3_id: 9 },
      { name: 'کوکتل مزوتراپی MesoLike HariPlus', level1_id: 1, level2_id: 1, level3_id: 10 },
      { name: 'کوکتل مزوتراپی فیوژن', level1_id: 1, level2_id: 1, level3_id: 10 },
      { name: 'کاغذ صافی ورقه ای 58*58', level1_id: 9, level2_id: 21, level3_id: 11 },
      { name: 'کارپول بسته 50 عددی', level1_id: 7, level2_id: 8, level3_id: 12 },
      { name: 'شان رولی عرض 80', level1_id: 5, level2_id: 9, level3_id: 13 },
      { name: 'شان استریل 1*1', level1_id: 5, level2_id: 9, level3_id: 13 },
      { name: 'شان استریل پرفوره 1*1', level1_id: 5, level2_id: 9, level3_id: 13 },
      { name: 'شان پرفوره 0.5*0.5 استریل', level1_id: 5, level2_id: 9, level3_id: 13 },
      { name: 'شان غیر استریل 1*1', level1_id: 5, level2_id: 9, level3_id: 13 },
      { name: 'شان استریل پرفوره 50*50', level1_id: 5, level2_id: 9, level3_id: 13 },
      { name: 'شان استریل 50*50', level1_id: 5, level2_id: 9, level3_id: 13 },
      { name: 'سیفتی باکس 3 لیتری', level1_id: 9, level2_id: 21, level3_id: 14 },
      { name: 'سوزن FIT 1.0 بسته 100 تایی', level1_id: 0, level2_id: 0, level3_id: 15 },
      { name: 'سوزن FIT 0.9 بسته 100 تایی', level1_id: 0, level2_id: 0, level3_id: 15 },
      { name: 'سوزن FIT 0.8 بسته 100 تایی', level1_id: 0, level2_id: 0, level3_id: 15 },
      { name: 'سوزن FIT 1.1 بسته 100 تایی', level1_id: 0, level2_id: 0, level3_id: 15 },
      { name: 'سرنگ انسولین حلما سرپیچ', level1_id: 7, level2_id: 10, level3_id: 16 },
      { name: 'سرنگ انسولین حلما 1ml', level1_id: 7, level2_id: 10, level3_id: 16 },
      { name: 'سرنگ انسولین بیک0.5ml', level1_id: 7, level2_id: 10, level3_id: 16 },
      { name: 'سرنگ 5 آوا لوئر لاک', level1_id: 7, level2_id: 10, level3_id: 17 },
      { name: 'سرنگ 5 بیک لوئر لاک', level1_id: 7, level2_id: 10, level3_id: 17 },
      { name: 'سرنگ 3 آوا لوئر لاک', level1_id: 7, level2_id: 10, level3_id: 18 },
      { name: 'سرنگ 3 بیک لوئر لاک', level1_id: 7, level2_id: 10, level3_id: 18 },
      { name: 'سرنگ 10 آوا', level1_id: 7, level2_id: 10, level3_id: 19 },
      { name: 'سرنگ 10 بیک لوئر لاک', level1_id: 7, level2_id: 10, level3_id: 19 },
      { name: 'سرسوزن مزوتراپی آوا 30 4', level1_id: 7, level2_id: 11, level3_id: 20 },
      { name: 'سرسوزن مزوتراپی حلما 30 4', level1_id: 7, level2_id: 11, level3_id: 20 },
      { name: 'نیدل طوسی آوا', level1_id: 7, level2_id: 11, level3_id: 21 },
      { name: 'نیدل طوسی حلما', level1_id: 7, level2_id: 11, level3_id: 21 },
      { name: 'نیدل طوسی SUPA', level1_id: 7, level2_id: 11, level3_id: 21 },
      { name: 'نیدل نارنجی آوا 25 25', level1_id: 7, level2_id: 11, level3_id: 22 },
      { name: 'نیدل آبی آوا', level1_id: 7, level2_id: 11, level3_id: 23 },
      { name: 'نیدل آبی SUPA', level1_id: 7, level2_id: 11, level3_id: 23 },
      { name: 'نیدل آبی حلما', level1_id: 7, level2_id: 11, level3_id: 23 },
      { name: 'نیدل صورتی حلما', level1_id: 7, level2_id: 11, level3_id: 24 },
      { name: 'نیدل صورتی آوا', level1_id: 7, level2_id: 11, level3_id: 24 },
      { name: 'سرجی فیکس سر CITO', level1_id: 0, level2_id: 12, level3_id: 25 },
      { name: 'ست سرم HD', level1_id: 7, level2_id: 13, level3_id: 26 },
      { name: 'روتختی دو سر کش 80*220 سفید', level1_id: 5, level2_id: 9, level3_id: 27 },
      { name: 'روتختی دو سر کش 80*220 آبی', level1_id: 5, level2_id: 9, level3_id: 27 },
      { name: 'دستکش یکبار مصرف لایت', level1_id: 0, level2_id: 14, level3_id: 28 },
      { name: 'دستکش یکبار مصرف جمیل', level1_id: 0, level2_id: 14, level3_id: 28 },
      { name: 'دستکش لاتکس بدون پودر OP-PERFECT مدیوم', level1_id: 0, level2_id: 15, level3_id: 29 },
      { name: 'دستکش لاتکس بدون پودر OP-PERFECT لارج', level1_id: 0, level2_id: 15, level3_id: 29 },
      { name: 'دستکش جراحی آنتی باکتریال سایز 8', level1_id: 0, level2_id: 16, level3_id: 30 },
      { name: 'دستکش جراحی HD بدون پودر 8', level1_id: 0, level2_id: 16, level3_id: 30 },
      { name: 'دستکش جراحی MediSmart کم پودر 8', level1_id: 0, level2_id: 16, level3_id: 30 },
      { name: 'دستکش جراحی Surgicare کم پودر 8', level1_id: 0, level2_id: 16, level3_id: 30 },
      { name: 'دستکش جراحی آنتی باکتریال سایز 7.5', level1_id: 0, level2_id: 16, level3_id: 31 },
      { name: 'دستکش جراحی HD بدون پودر 7.5', level1_id: 0, level2_id: 16, level3_id: 31 },
      { name: 'دستکش جراحی MediSpo بدون پودر 7.5', level1_id: 0, level2_id: 16, level3_id: 31 },
      { name: 'دستکش جراحی MediSpo کم پودر 7.5', level1_id: 0, level2_id: 16, level3_id: 31 },
      { name: 'دستکش جراحی MediSmart کم پودر 7.5', level1_id: 0, level2_id: 16, level3_id: 31 },
      { name: 'دستکش جراحی HARIR بدون پودر 7.5', level1_id: 0, level2_id: 16, level3_id: 31 },
      { name: 'دستکش جراحی MediSmart بدون پودر 7.5', level1_id: 0, level2_id: 16, level3_id: 31 },
      { name: 'دستکش جراحی آنتی باکتریال سایز 7', level1_id: 0, level2_id: 16, level3_id: 32 },
      { name: 'دستکش جراحی MediSpo کم پودر 7', level1_id: 0, level2_id: 16, level3_id: 32 },
      { name: 'دستکش جراحی HD بدون پودر 7', level1_id: 0, level2_id: 16, level3_id: 32 },
      { name: 'دستکش جراحی MediSmart کم پودر 7', level1_id: 0, level2_id: 16, level3_id: 32 },
      { name: 'دستکش جراحی MediSpo بدون پودر 7', level1_id: 0, level2_id: 16, level3_id: 32 },
      { name: 'دستکش جراحی Surgicare کم پودر 7', level1_id: 0, level2_id: 16, level3_id: 32 },
      { name: 'دستکش جراحی HARIR بدون پودر 7', level1_id: 0, level2_id: 16, level3_id: 32 },
      { name: 'دستکش جراحی NovaSoft بدون پودر 7', level1_id: 0, level2_id: 16, level3_id: 32 },
      { name: 'دستکش جراحی Surgicare کم پودر 6.5', level1_id: 0, level2_id: 16, level3_id: 33 },
      { name: 'دستکش جراحی آنتی باکتریال سایز 6.5', level1_id: 0, level2_id: 16, level3_id: 33 },
      { name: 'دستکش جراحی HD بدون پودر 6.5', level1_id: 0, level2_id: 16, level3_id: 33 },
      { name: 'دستکش جراحی MediSmart بدون پودر 6.5', level1_id: 0, level2_id: 16, level3_id: 33 },
      { name: 'دستکش جراحی MediSpo بدون پودر 6.5', level1_id: 0, level2_id: 16, level3_id: 33 },
      { name: 'دستکش جراحی MediSmart کم پودر 6.5', level1_id: 0, level2_id: 16, level3_id: 33 },
      { name: 'دستکش جراحی MediSpo کم پودر 6.5', level1_id: 0, level2_id: 16, level3_id: 33 },
      { name: 'دستکش جراحی NovaSoft بدون پودر 6.5', level1_id: 0, level2_id: 16, level3_id: 33 },
      { name: 'چسب بخیه', level1_id: 0, level2_id: 0, level3_id: 34 },
      { name: 'چسب اتوکلاو', level1_id: 0, level2_id: 0, level3_id: 34 },
      { name: 'چسب 2.5 ضد حساسیت', level1_id: 0, level2_id: 0, level3_id: 34 },
      { name: 'چسب آنژیوکت', level1_id: 0, level2_id: 0, level3_id: 34 },
      { name: 'تیغ ساده', level1_id: 0, level2_id: 17, level3_id: 35 },
      { name: 'تیغ ریبل 11 قرمز', level1_id: 0, level2_id: 17, level3_id: 36 },
      { name: 'تیغ ریبل 10 آبی', level1_id: 0, level2_id: 17, level3_id: 36 },
      { name: 'تیغ ریبل 15 آبی', level1_id: 0, level2_id: 17, level3_id: 36 },
      { name: 'تیغ ریبل 10 قرمز', level1_id: 0, level2_id: 17, level3_id: 36 },
      { name: 'تیغ ریبل 11 آبی', level1_id: 0, level2_id: 17, level3_id: 36 },
      { name: 'تیغ SP91 بسته 25 تایی paramount', level1_id: 0, level2_id: 17, level3_id: 37 },
      { name: 'تیغ SP90 بسته 25 تایی HMD', level1_id: 0, level2_id: 17, level3_id: 38 },
      { name: 'پماد زایلاپی', level1_id: 0, level2_id: 0, level3_id: 39 },
      { name: 'ست کامل لباس بیمار 38 گرم', level1_id: 5, level2_id: 18, level3_id: 40 },
      { name: 'MASPORT (BOTULISM TOXIN) 500IU VIAL', level1_id: 1, level2_id: 1, level3_id: 41 },
      { name: 'بتادین یک لیتری', level1_id: 8, level2_id: 19, level3_id: 42 },
      { name: 'بتادین 60 میل', level1_id: 8, level2_id: 19, level3_id: 42 },
      { name: 'آنژیوکت آبی', level1_id: 7, level2_id: 0, level3_id: 43 },
      { name: 'آب مقطر 5 لیتری', level1_id: 0, level2_id: 0, level3_id: 44 },
      { name: 'الکل 20 لیتری', level1_id: 8, level2_id: 19, level3_id: 45 },
      { name: 'آمپول اپی نفرین', level1_id: 4, level2_id: 5, level3_id: 46 },
      { name: 'محلول ضدعفونی SEPTOCIDINE', level1_id: 8, level2_id: 19, level3_id: 47 },
      { name: 'پوشک سایز بزرگ', level1_id: 5, level2_id: 9, level3_id: 48 },
      { name: 'مداد سفید', level1_id: 0, level2_id: 0, level3_id: 0 },
      { name: 'اریگاتور', level1_id: 7, level2_id: 20, level3_id: 0 }
    ];

    // Store category mappings for foreign key relationships
    const level1Map = new Map();
    const level2Map = new Map();
    const level3Map = new Map();

    // Create Level 1 Categories
    console.log('Creating Level 1 categories...');
    for (const l1 of level1Data) {
      const category = await prisma.categoryL1.upsert({
        where: { slug: createSlug(l1.name, l1.id) },
        update: { name: l1.name },
        create: {
          name: l1.name,
          slug: createSlug(l1.name, l1.id),
        },
      });
      level1Map.set(l1.id, category.id);
      console.log(`✓ Created L1: ${l1.name}`);
    }

    // Create Level 2 Categories
    console.log('Creating Level 2 categories...');
    for (const l2 of level2Data) {
      const category = await prisma.categoryL2.upsert({
        where: { slug: createSlug(l2.name, l2.id) },
        update: { 
          name: l2.name,
          categoryL1Id: level1Map.get(l2.level1_id) 
        },
        create: {
          name: l2.name,
          slug: createSlug(l2.name, l2.id),
          categoryL1Id: level1Map.get(l2.level1_id),
        },
      });
      level2Map.set(l2.id, category.id);
      console.log(`✓ Created L2: ${l2.name}`);
    }

    // Create Level 3 Categories
    console.log('Creating Level 3 categories...');
    for (const l3 of level3Data) {
      const category = await prisma.categoryL3.upsert({
        where: { slug: createSlug(l3.name, l3.id) },
        update: { 
          name: l3.name,
          categoryL2Id: level2Map.get(l3.level2_id) 
        },
        create: {
          name: l3.name,
          slug: createSlug(l3.name, l3.id),
          categoryL2Id: level2Map.get(l3.level2_id),
        },
      });
      level3Map.set(l3.id, category.id);
      console.log(`✓ Created L3: ${l3.name}`);
    }

    // Create Products
    console.log('Creating products...');
    for (const product of productsData) {
      const categoryL3Id = level3Map.get(product.level3_id);
      
      if (!categoryL3Id) {
        console.warn(`⚠️ Category L3 not found for product: ${product.name}`);
        continue;
      }

      await prisma.product.upsert({
        where: { slug: createSlug(product.name) },
        update: { 
          name: product.name,
          categoryL3Id: categoryL3Id,
          price: 0, // Default price - should be updated later
          stock: 0  // Default stock - should be updated later
        },
        create: {
          name: product.name,
          slug: createSlug(product.name),
          categoryL3Id: categoryL3Id,
          price: 0, // Default price - should be updated later
          stock: 0, // Default stock - should be updated later
          description: `محصول پزشکی: ${product.name}`,
        },
      });
      console.log(`✓ Created Product: ${product.name}`);
    }

    console.log('✅ Medical supply data seeding completed successfully!');
    console.log(`✓ ${level1Data.length} Level 1 categories created`);
    console.log(`✓ ${level2Data.length} Level 2 categories created`);
    console.log(`✓ ${level3Data.length} Level 3 categories created`);
    console.log(`✓ ${productsData.length} products created`);

  } catch (error) {
    console.error('❌ Error seeding medical data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedMedicalData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedMedicalData; 