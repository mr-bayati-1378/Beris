const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function moveProductsToCategories() {
  try {
    console.log('🔧 شروع انتقال محصولات به دسته‌بندی‌های مناسب...');
    
    let movedCount = 0;
    let errorCount = 0;

    // انتقال دستکش‌ها
    const gloveMappings = [
      { productName: 'دستکش جراحی آنتی باکتریال سایز', categoryName: 'دستکش جراحی آنتی باکتریال' },
      { productName: 'دستکش جراحی HD بدون پودر', categoryName: 'دستکش جراحی HD' },
      { productName: 'دستکش جراحی MediSmart بدون پودر', categoryName: 'دستکش جراحی MediSmart' },
      { productName: 'دستکش جراحی MediSmart کم پودر', categoryName: 'دستکش جراحی MediSmart' },
      { productName: 'دستکش جراحی MediSpo بدون پودر', categoryName: 'دستکش جراحی MediSpo' },
      { productName: 'دستکش جراحی MediSpo کم پودر', categoryName: 'دستکش جراحی MediSpo' },
      { productName: 'دستکش جراحی Surgicare کم پودر', categoryName: 'دستکش جراحی Surgicare' },
      { productName: 'دستکش جراحی NovaSoft بدون پودر', categoryName: 'دستکش جراحی NovaSoft' },
      { productName: 'دستکش جراحی HARIR بدون پودر', categoryName: 'دستکش جراحی HARIR' },
      { productName: 'دستکش جراحی Royalmed بدون پودر', categoryName: 'دستکش جراحی Royalmed' },
      { productName: 'دستکش لاتکس بدون پودر OP-PERFECT', categoryName: 'دستکش لاتکس OP-PERFECT' },
      { productName: 'دستکش یکبار مصرف', categoryName: 'دستکش یکبار مصرف' }
    ];

    for (const mapping of gloveMappings) {
      try {
        // یافتن دسته‌بندی
        const category = await prisma.categoryL3.findFirst({
          where: { name: mapping.categoryName }
        });

        if (!category) {
          console.log(`⚠️ دسته‌بندی "${mapping.categoryName}" یافت نشد`);
          continue;
        }

        // یافتن و انتقال محصولات
        const products = await prisma.product.findMany({
          where: {
            name: { contains: mapping.productName },
            categoryL3: { name: 'نامعلوم' }
          }
        });

        for (const product of products) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryL3Id: category.id }
          });
          console.log(`✅ "${product.name}" → "${mapping.categoryName}"`);
          movedCount++;
        }

      } catch (error) {
        console.log(`❌ خطا در انتقال دستکش‌ها:`, error.message);
        errorCount++;
      }
    }

    // انتقال سرنگ‌ها و نیدل‌ها
    const syringeMappings = [
      { productName: 'سرنگ آوا', categoryName: 'سرنگ آوا' },
      { productName: 'سرنگ بیک', categoryName: 'سرنگ بیک' },
      { productName: 'سرنگ حلما', categoryName: 'سرنگ حلما' },
      { productName: 'سرنگ BD', categoryName: 'سرنگ BD' },
      { productName: 'نیدل آبی آوا', categoryName: 'نیدل آوا' },
      { productName: 'نیدل نارنجی آوا', categoryName: 'نیدل آوا' },
      { productName: 'نیدل طوسی آوا', categoryName: 'نیدل آوا' },
      { productName: 'نیدل صورتی آوا', categoryName: 'نیدل آوا' },
      { productName: 'نیدل آبی بیک', categoryName: 'نیدل بیک' },
      { productName: 'نیدل آبی حلما', categoryName: 'نیدل حلما' },
      { productName: 'نیدل صورتی حلما', categoryName: 'نیدل حلما' },
      { productName: 'نیدل طوسی حلما', categoryName: 'نیدل حلما' },
      { productName: 'نیدل نارنجی حلما', categoryName: 'نیدل حلما' },
      { productName: 'نیدل آبی BD', categoryName: 'نیدل BD' },
      { productName: 'نیدل آبی SUPA', categoryName: 'نیدل SUPA' },
      { productName: 'نیدل طوسی SUPA', categoryName: 'نیدل SUPA' },
      { productName: 'سرسوزن مزوتراپی', categoryName: 'سرسوزن مزوتراپی' },
      { productName: 'سوزن FIT', categoryName: 'سوزن FIT' }
    ];

    for (const mapping of syringeMappings) {
      try {
        const category = await prisma.categoryL3.findFirst({
          where: { name: mapping.categoryName }
        });

        if (!category) {
          console.log(`⚠️ دسته‌بندی "${mapping.categoryName}" یافت نشد`);
          continue;
        }

        const products = await prisma.product.findMany({
          where: {
            name: { contains: mapping.productName },
            categoryL3: { name: 'نامعلوم' }
          }
        });

        for (const product of products) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryL3Id: category.id }
          });
          console.log(`✅ "${product.name}" → "${mapping.categoryName}"`);
          movedCount++;
        }

      } catch (error) {
        console.log(`❌ خطا در انتقال سرنگ‌ها:`, error.message);
        errorCount++;
      }
    }

    // انتقال ابزار و لوازم
    const toolMappings = [
      { productName: 'تیغ ریبل', categoryName: 'تیغ جراحی' },
      { productName: 'تیغ SP90', categoryName: 'تیغ جراحی' },
      { productName: 'تیغ SP91', categoryName: 'تیغ جراحی' },
      { productName: 'تیغ SWAN-MORTON', categoryName: 'تیغ جراحی' },
      { productName: 'تیغ ساده', categoryName: 'تیغ جراحی' },
      { productName: 'نخ نایلون', categoryName: 'نخ جراحی' },
      { productName: 'نخ ویکریل', categoryName: 'نخ جراحی' },
      { productName: 'نخ کرومیک', categoryName: 'نخ جراحی' },
      { productName: 'نخ SMI', categoryName: 'نخ جراحی' },
      { productName: 'ست سرم', categoryName: 'ست سرم' },
      { productName: 'آب مقطر', categoryName: 'آب مقطر' },
      { productName: 'اریگاتور', categoryName: 'اریگاتور' },
      { productName: 'ساک دستی', categoryName: 'ساک دستی' },
      { productName: 'آبسلانگ', categoryName: 'آبسلانگ' },
      { productName: 'مداد سفید', categoryName: 'مداد سفید' },
      { productName: 'مارکر جراحی', categoryName: 'مارکر جراحی' },
      { productName: 'پنست کوتر', categoryName: 'پنست کوتر' },
      { productName: 'کاغذ صافی', categoryName: 'کاغذ صافی' },
      { productName: 'گان جراح', categoryName: 'گان جراحی' },
      { productName: 'دروشیت', categoryName: 'دروشیت' },
      { productName: 'روتختی', categoryName: 'روتختی' },
      { productName: 'آیس', categoryName: 'آیس' },
      { productName: 'کانکتور', categoryName: 'کانکتور' },
      { productName: 'چسب آنژیوکت', categoryName: 'چسب آنژیوکت' },
      { productName: 'ماسک', categoryName: 'ماسک' },
      { productName: 'سوآپ', categoryName: 'سوآپ' },
      { productName: 'پیش بند', categoryName: 'پیش بند' },
      { productName: 'سیتانست', categoryName: 'سیتانست' },
      { productName: 'کلاه تک', categoryName: 'کلاه تک' },
      { productName: 'ژیلت', categoryName: 'ژیلت' },
      { productName: 'NAJO CAINE', categoryName: 'NAJO CAINE' }
    ];

    for (const mapping of toolMappings) {
      try {
        const category = await prisma.categoryL3.findFirst({
          where: { name: mapping.categoryName }
        });

        if (!category) {
          console.log(`⚠️ دسته‌بندی "${mapping.categoryName}" یافت نشد`);
          continue;
        }

        const products = await prisma.product.findMany({
          where: {
            name: { contains: mapping.productName },
            categoryL3: { name: 'نامعلوم' }
          }
        });

        for (const product of products) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryL3Id: category.id }
          });
          console.log(`✅ "${product.name}" → "${mapping.categoryName}"`);
          movedCount++;
        }

      } catch (error) {
        console.log(`❌ خطا در انتقال ابزار:`, error.message);
        errorCount++;
      }
    }

    // انتقال پارچه‌های پزشکی
    const fabricMappings = [
      { productName: 'شان استریل', categoryName: 'شان استریل' },
      { productName: 'شان غیر استریل', categoryName: 'شان غیر استریل' },
      { productName: 'حوله یکبار مصرف', categoryName: 'حوله یکبار مصرف' },
      { productName: 'پوشک', categoryName: 'پوشک' },
      { productName: 'لیدوکائین', categoryName: 'لیدوکائین' },
      { productName: 'سیفتی باکس', categoryName: 'سیفتی باکس' },
      { productName: 'ست کامل لباس بیمار', categoryName: 'ست کامل لباس بیمار' },
      { productName: 'پماد زایلاپی', categoryName: 'پماد زایلاپی' },
      { productName: 'آمپول اپی نفرین', categoryName: 'آمپول اپی نفرین' },
      { productName: 'رنگ مو', categoryName: 'رنگ مو' },
      { productName: 'شان رولی', categoryName: 'شان رولی' }
    ];

    for (const mapping of fabricMappings) {
      try {
        const category = await prisma.categoryL3.findFirst({
          where: { name: mapping.categoryName }
        });

        if (!category) {
          console.log(`⚠️ دسته‌بندی "${mapping.categoryName}" یافت نشد`);
          continue;
        }

        const products = await prisma.product.findMany({
          where: {
            name: { contains: mapping.productName },
            categoryL3: { name: 'نامعلوم' }
          }
        });

        for (const product of products) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryL3Id: category.id }
          });
          console.log(`✅ "${product.name}" → "${mapping.categoryName}"`);
          movedCount++;
        }

      } catch (error) {
        console.log(`❌ خطا در انتقال پارچه‌ها:`, error.message);
        errorCount++;
      }
    }

    // انتقال محصولات ضدعفونی
    const hygieneMappings = [
      { productName: 'چسب اتوکلاو', categoryName: 'چسب اتوکلاو' },
      { productName: 'چسب بخیه', categoryName: 'چسب بخیه' },
      { productName: 'چسب 2.5 ضد حساسیت', categoryName: 'چسب 2.5 ضد حساسیت' },
      { productName: 'تست اتو کلاو', categoryName: 'تست اتوکلاو' },
      { productName: 'رول پک استریل اتوکلاو', categoryName: 'رول پک استریل اتوکلاو' }
    ];

    for (const mapping of hygieneMappings) {
      try {
        const category = await prisma.categoryL3.findFirst({
          where: { name: mapping.categoryName }
        });

        if (!category) {
          console.log(`⚠️ دسته‌بندی "${mapping.categoryName}" یافت نشد`);
          continue;
        }

        const products = await prisma.product.findMany({
          where: {
            name: { contains: mapping.productName },
            categoryL3: { name: 'نامعلوم' }
          }
        });

        for (const product of products) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryL3Id: category.id }
          });
          console.log(`✅ "${product.name}" → "${mapping.categoryName}"`);
          movedCount++;
        }

      } catch (error) {
        console.log(`❌ خطا در انتقال محصولات ضدعفونی:`, error.message);
        errorCount++;
      }
    }

    // انتقال داروها
    const medicineMappings = [
      { productName: 'TETRACYCLINE 3% OINT', categoryName: 'TETRACYCLINE 3% OINT' },
      { productName: 'GENTEX OINT OPHTHALMIC 3 mg/1g 3g', categoryName: 'GENTEX OINT OPHTHALMIC 3 mg/1g 3g' },
      { productName: 'MUPIROCIN 2% 15G OINT', categoryName: 'MUPIROCIN 2% 15G OINT' },
      { productName: 'TRIAMCINOLONE ACETONIDE 40MG/1ML VIAL', categoryName: 'TRIAMCINOLONE ACETONIDE 40MG/1ML VIAL' },
      { productName: 'CEFAZOLIN 1 GR VIAL', categoryName: 'CEFAZOLIN 1 GR VIAL' },
      { productName: 'RINGER 500ML INFUSION', categoryName: 'RINGER 500ML INFUSION' },
      { productName: 'SERUME DEXTROSE 3.33% NACI 0.3% INFUSION 500ML', categoryName: 'SERUME DEXTROSE 3.33% NACI 0.3% INFUSION 500ML' },
      { productName: 'SODIUM CHLORIDE 0.9% 1000 ML FOR INFUSION', categoryName: 'SODIUM CHLORIDE 0.9% 1000 ML FOR INFUSION' },
      { productName: 'SODIUM CHLORIDE 0.9% 500 ML FOR INFUSION', categoryName: 'SODIUM CHLORIDE 0.9% 500 ML FOR INFUSION' },
      { productName: 'KETROLAC 30 MG/ML INJ', categoryName: 'KETROLAC 30 MG/ML INJ' },
      { productName: 'DEXAMETHASONE 8MG/2ML AMP', categoryName: 'DEXAMETHASONE 8MG/2ML AMP' },
      { productName: 'DICLOFENAC 100 MG SUPP', categoryName: 'DICLOFENAC 100 MG SUPP' },
      { productName: 'PIROXICAM 20MG/ML AMP', categoryName: 'PIROXICAM 20MG/ML AMP' },
      { productName: 'NITROGLYCERIN PEARL', categoryName: 'NITROGLYCERIN PEARL' },
      { productName: 'SODIUM CHLORIDE 0.9% 1000 ML FOR IRRIGATION', categoryName: 'SODIUM CHLORIDE 0.9% 1000 ML FOR IRRIGATION' },
      { productName: 'HYDROCORISONE 100MG VIAL 10 N', categoryName: 'HYDROCORISONE 100MG VIAL 10 N' },
      { productName: 'METOCLOPRAMIDE AMP', categoryName: 'METOCLOPRAMIDE AMP' },
      { productName: 'TRANEXAMIC ACID PARENTRAL 500MG/5CC 10N', categoryName: 'TRANEXAMIC ACID PARENTRAL 500MG/5CC 10N' },
      { productName: 'ACETAMINOPHEN CODEINE (300+20) TAB', categoryName: 'ACETAMINOPHEN CODEINE (300+20) TAB' },
      { productName: 'ALPRAZOLAM 0.5 MG TAB', categoryName: 'ALPRAZOLAM 0.5 MG TAB' },
      { productName: 'CAPTOPRIL 25MG TAB', categoryName: 'CAPTOPRIL 25MG TAB' },
      { productName: 'CLONAZEPAM 1MG TAB 100N', categoryName: 'CLONAZEPAM 1MG TAB 100N' },
      { productName: 'FUROSEMIDE 20MG/2ML AMP', categoryName: 'FUROSEMIDE 20MG/2ML AMP' },
      { productName: 'ONDANSETRON HCL 4MG/2ML AMP', categoryName: 'ONDANSETRON HCL 4MG/2ML AMP' },
      { productName: 'TRANCID 250 MG CAP', categoryName: 'TRANCID 250 MG CAP' },
      { productName: 'propranolol 10MG', categoryName: 'propranolol 10MG' },
      { productName: 'VITAMIN K1 (PHUTOMENADIONE) 1MG/0.5ML AMP', categoryName: 'VITAMIN K1 (PHUTOMENADIONE) 1MG/0.5ML AMP' },
      { productName: 'CETIRIZINE 10 mg TAB', categoryName: 'CETIRIZINE 10 mg TAB' },
      { productName: 'CEFIXIME 400 mg TABLET', categoryName: 'CEFIXIME 400 mg TABLET' },
      { productName: 'SODIUM CHLORIDE 0.9% 500 ML FOR IRRIGATION', categoryName: 'SODIUM CHLORIDE 0.9% 500 ML FOR IRRIGATION' },
      { productName: 'BEPANOX 500mg/2ml (DEXPANTHENOL) AMPOL', categoryName: 'BEPANOX 500mg/2ml (DEXPANTHENOL) AMPOL' },
      { productName: 'FIROZ Baby Body Shampoo 200 ml', categoryName: 'FIROZ Baby Body Shampoo 200 ml' },
      { productName: 'ALMOND OIL', categoryName: 'ALMOND OIL' },
      { productName: 'RATAHEAL CAP 3*10', categoryName: 'RATAHEAL CAP 3*10' }
    ];

    for (const mapping of medicineMappings) {
      try {
        const category = await prisma.categoryL3.findFirst({
          where: { name: mapping.categoryName }
        });

        if (!category) {
          console.log(`⚠️ دسته‌بندی "${mapping.categoryName}" یافت نشد`);
          continue;
        }

        const products = await prisma.product.findMany({
          where: {
            name: { contains: mapping.productName },
            categoryL3: { name: 'نامعلوم' }
          }
        });

        for (const product of products) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryL3Id: category.id }
          });
          console.log(`✅ "${product.name}" → "${mapping.categoryName}"`);
          movedCount++;
        }

      } catch (error) {
        console.log(`❌ خطا در انتقال داروها:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 خلاصه:');
    console.log(`✅ تعداد محصولات منتقل شده: ${movedCount}`);
    console.log(`❌ تعداد خطاها: ${errorCount}`);

  } catch (error) {
    console.error('❌ خطا در انتقال محصولات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// اجرای اسکریپت
moveProductsToCategories(); 