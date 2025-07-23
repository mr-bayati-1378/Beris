const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// تابع ایجاد slug صحیح
function generateSlug(text) {
  // تبدیل اعداد فارسی به انگلیسی
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let slug = text;
  
  // تبدیل اعداد
  for (let i = 0; i < 10; i++) {
    slug = slug.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i])
              .replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
  }
  
  // تبدیل حروف فارسی به معادل انگلیسی
  const persianToEnglish = {
    'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j',
    'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
    'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y', 'ئ': 'y'
  };
  
  // تبدیل هر کاراکتر
  slug = slug.split('').map(char => persianToEnglish[char] || char).join('');
  
  // تبدیل به حروف کوچک و جایگزینی کاراکترهای غیر الفبایی با خط تیره
  slug = slug.toLowerCase()
    .replace(/[^\w\s-]/g, '') // حذف کاراکترهای غیر کلمه
    .replace(/[\s_-]+/g, '-') // جایگزینی فاصله و خط زیر با خط تیره
    .replace(/^-+|-+$/g, ''); // حذف خط تیره از ابتدا و انتها
  
  return slug;
}

async function updateCategories() {
  try {
    console.log('🔧 شروع بروزرسانی دسته‌بندی‌ها...');
    
    // یافتن دسته‌بندی تجهیزات پزشکی مصرفی
    const medicalConsumables = await prisma.categoryL1.findFirst({
      where: { name: 'تجهیزات پزشکی مصرفی' }
    });

    if (!medicalConsumables) {
      console.error('❌ دسته‌بندی "تجهیزات پزشکی مصرفی" یافت نشد');
      return;
    }

    // یافتن دسته‌بندی دستکش‌ها
    let glovesCategory = await prisma.categoryL2.findFirst({
      where: { 
        name: 'دستکش‌ها',
        categoryL1Id: medicalConsumables.id
      }
    });

    if (!glovesCategory) {
      // ایجاد دسته‌بندی دستکش‌ها
      glovesCategory = await prisma.categoryL2.create({
        data: {
          name: 'دستکش‌ها',
          slug: generateSlug('دستکش‌ها'),
          categoryL1Id: medicalConsumables.id
        }
      });
      console.log('✅ دسته‌بندی "دستکش‌ها" ایجاد شد');
    }

    // ایجاد دسته‌بندی‌های سطح 3 برای دستکش‌ها
    const gloveCategories = [
      'دستکش جراحی آنتی باکتریال',
      'دستکش جراحی HD',
      'دستکش جراحی MediSmart',
      'دستکش جراحی MediSpo',
      'دستکش جراحی Surgicare',
      'دستکش جراحی NovaSoft',
      'دستکش جراحی HARIR',
      'دستکش جراحی Royalmed',
      'دستکش لاتکس OP-PERFECT',
      'دستکش یکبار مصرف'
    ];

    for (const categoryName of gloveCategories) {
      const existingCategory = await prisma.categoryL3.findFirst({
        where: { 
          name: categoryName,
          categoryL2Id: glovesCategory.id
        }
      });

      if (!existingCategory) {
        await prisma.categoryL3.create({
          data: {
            name: categoryName,
            slug: generateSlug(categoryName),
            categoryL2Id: glovesCategory.id
          }
        });
        console.log(`✅ دسته‌بندی "${categoryName}" ایجاد شد`);
      }
    }

    // یافتن دسته‌بندی سرنگ و نیدل
    let syringesCategory = await prisma.categoryL2.findFirst({
      where: { 
        name: 'سرنگ و نیدل',
        categoryL1Id: medicalConsumables.id
      }
    });

    if (!syringesCategory) {
      syringesCategory = await prisma.categoryL2.create({
        data: {
          name: 'سرنگ و نیدل',
          slug: generateSlug('سرنگ و نیدل'),
          categoryL1Id: medicalConsumables.id
        }
      });
      console.log('✅ دسته‌بندی "سرنگ و نیدل" ایجاد شد');
    }

    // ایجاد دسته‌بندی‌های سطح 3 برای سرنگ و نیدل
    const syringeCategories = [
      'سرنگ آوا',
      'سرنگ بیک',
      'سرنگ حلما',
      'سرنگ BD',
      'نیدل آوا',
      'نیدل بیک',
      'نیدل حلما',
      'نیدل BD',
      'نیدل SUPA',
      'سرسوزن مزوتراپی',
      'سوزن FIT'
    ];

    for (const categoryName of syringeCategories) {
      const existingCategory = await prisma.categoryL3.findFirst({
        where: { 
          name: categoryName,
          categoryL2Id: syringesCategory.id
        }
      });

      if (!existingCategory) {
        await prisma.categoryL3.create({
          data: {
            name: categoryName,
            slug: generateSlug(categoryName),
            categoryL2Id: syringesCategory.id
          }
        });
        console.log(`✅ دسته‌بندی "${categoryName}" ایجاد شد`);
      }
    }

    // یافتن دسته‌بندی ابزار و لوازم
    let toolsCategory = await prisma.categoryL2.findFirst({
      where: { 
        name: 'ابزار و لوازم',
        categoryL1Id: medicalConsumables.id
      }
    });

    if (!toolsCategory) {
      toolsCategory = await prisma.categoryL2.create({
        data: {
          name: 'ابزار و لوازم',
          slug: generateSlug('ابزار و لوازم'),
          categoryL1Id: medicalConsumables.id
        }
      });
      console.log('✅ دسته‌بندی "ابزار و لوازم" ایجاد شد');
    }

    // ایجاد دسته‌بندی‌های سطح 3 برای ابزار و لوازم
    const toolCategories = [
      'تیغ جراحی',
      'نخ جراحی',
      'ست سرم',
      'آب مقطر',
      'اریگاتور',
      'ساک دستی',
      'آبسلانگ',
      'مداد سفید',
      'مارکر جراحی',
      'پنست کوتر',
      'کاغذ صافی',
      'گان جراحی',
      'دروشیت',
      'روتختی',
      'آیس',
      'کانکتور',
      'چسب آنژیوکت',
      'ماسک',
      'سوآپ',
      'پیش بند',
      'سیتانست',
      'کلاه تک',
      'ژیلت',
      'NAJO CAINE'
    ];

    for (const categoryName of toolCategories) {
      const existingCategory = await prisma.categoryL3.findFirst({
        where: { 
          name: categoryName,
          categoryL2Id: toolsCategory.id
        }
      });

      if (!existingCategory) {
        await prisma.categoryL3.create({
          data: {
            name: categoryName,
            slug: generateSlug(categoryName),
            categoryL2Id: toolsCategory.id
          }
        });
        console.log(`✅ دسته‌بندی "${categoryName}" ایجاد شد`);
      }
    }

    // یافتن دسته‌بندی پارچه‌های پزشکی
    let fabricsCategory = await prisma.categoryL2.findFirst({
      where: { 
        name: 'پارچه‌های پزشکی',
        categoryL1Id: medicalConsumables.id
      }
    });

    if (!fabricsCategory) {
      fabricsCategory = await prisma.categoryL2.create({
        data: {
          name: 'پارچه‌های پزشکی',
          slug: generateSlug('پارچه‌های پزشکی'),
          categoryL1Id: medicalConsumables.id
        }
      });
      console.log('✅ دسته‌بندی "پارچه‌های پزشکی" ایجاد شد');
    }

    // ایجاد دسته‌بندی‌های سطح 3 برای پارچه‌های پزشکی
    const fabricCategories = [
      'شان استریل',
      'شان غیر استریل',
      'حوله یکبار مصرف',
      'پوشک',
      'لیدوکائین',
      'سیفتی باکس',
      'ست کامل لباس بیمار',
      'پماد زایلاپی',
      'آمپول اپی نفرین',
      'رنگ مو',
      'شان رولی'
    ];

    for (const categoryName of fabricCategories) {
      const existingCategory = await prisma.categoryL3.findFirst({
        where: { 
          name: categoryName,
          categoryL2Id: fabricsCategory.id
        }
      });

      if (!existingCategory) {
        await prisma.categoryL3.create({
          data: {
            name: categoryName,
            slug: generateSlug(categoryName),
            categoryL2Id: fabricsCategory.id
          }
        });
        console.log(`✅ دسته‌بندی "${categoryName}" ایجاد شد`);
      }
    }

    // یافتن دسته‌بندی محصولات ضدعفونی و بهداشتی
    const hygieneCategory = await prisma.categoryL1.findFirst({
      where: { name: 'محصولات ضدعفونی و بهداشتی' }
    });

    if (hygieneCategory) {
      // یافتن دسته‌بندی الکل و ضدعفونی
      let alcoholCategory = await prisma.categoryL2.findFirst({
        where: { 
          name: 'الکل و ضدعفونی',
          categoryL1Id: hygieneCategory.id
        }
      });

      if (!alcoholCategory) {
        alcoholCategory = await prisma.categoryL2.create({
          data: {
            name: 'الکل و ضدعفونی',
            slug: generateSlug('الکل و ضدعفونی'),
            categoryL1Id: hygieneCategory.id
          }
        });
        console.log('✅ دسته‌بندی "الکل و ضدعفونی" ایجاد شد');
      }

      // یافتن دسته‌بندی چسب و بسته‌بندی
      let adhesiveCategory = await prisma.categoryL2.findFirst({
        where: { 
          name: 'چسب و بسته‌بندی',
          categoryL1Id: hygieneCategory.id
        }
      });

      if (!adhesiveCategory) {
        adhesiveCategory = await prisma.categoryL2.create({
          data: {
            name: 'چسب و بسته‌بندی',
            slug: generateSlug('چسب و بسته‌بندی'),
            categoryL1Id: hygieneCategory.id
          }
        });
        console.log('✅ دسته‌بندی "چسب و بسته‌بندی" ایجاد شد');
      }

      // ایجاد دسته‌بندی‌های سطح 3 برای چسب و بسته‌بندی
      const adhesiveCategories = [
        'چسب اتوکلاو',
        'چسب بخیه',
        'چسب 2.5 ضد حساسیت',
        'تست اتوکلاو',
        'رول پک استریل اتوکلاو'
      ];

      for (const categoryName of adhesiveCategories) {
        const existingCategory = await prisma.categoryL3.findFirst({
          where: { 
            name: categoryName,
            categoryL2Id: adhesiveCategory.id
          }
        });

        if (!existingCategory) {
          await prisma.categoryL3.create({
            data: {
              name: categoryName,
              slug: generateSlug(categoryName),
              categoryL2Id: adhesiveCategory.id
            }
          });
          console.log(`✅ دسته‌بندی "${categoryName}" ایجاد شد`);
        }
      }
    }

    // یافتن دسته‌بندی ابزار زیبایی و درمانی
    const beautyCategory = await prisma.categoryL1.findFirst({
      where: { name: 'ابزار زیبایی و درمانی' }
    });

    if (beautyCategory) {
      // یافتن دسته‌بندی داروها
      let medicineCategory = await prisma.categoryL2.findFirst({
        where: { 
          name: 'داروها',
          categoryL1Id: beautyCategory.id
        }
      });

      if (!medicineCategory) {
        medicineCategory = await prisma.categoryL2.create({
          data: {
            name: 'داروها',
            slug: generateSlug('داروها'),
            categoryL1Id: beautyCategory.id
          }
        });
        console.log('✅ دسته‌بندی "داروها" ایجاد شد');
      }

      // ایجاد دسته‌بندی‌های سطح 3 برای داروها
      const medicineCategories = [
        'TETRACYCLINE 3% OINT',
        'GENTEX OINT OPHTHALMIC 3 mg/1g 3g',
        'MUPIROCIN 2% 15G OINT',
        'TRIAMCINOLONE ACETONIDE 40MG/1ML VIAL',
        'CEFAZOLIN 1 GR VIAL',
        'RINGER 500ML INFUSION',
        'SERUME DEXTROSE 3.33% NACI 0.3% INFUSION 500ML',
        'SODIUM CHLORIDE 0.9% 1000 ML FOR INFUSION',
        'SODIUM CHLORIDE 0.9% 500 ML FOR INFUSION',
        'KETROLAC 30 MG/ML INJ',
        'DEXAMETHASONE 8MG/2ML AMP',
        'DICLOFENAC 100 MG SUPP',
        'PIROXICAM 20MG/ML AMP',
        'NITROGLYCERIN PEARL',
        'SODIUM CHLORIDE 0.9% 1000 ML FOR IRRIGATION',
        'HYDROCORISONE 100MG VIAL 10 N',
        'METOCLOPRAMIDE AMP',
        'TRANEXAMIC ACID PARENTRAL 500MG/5CC 10N',
        'ACETAMINOPHEN CODEINE (300+20) TAB',
        'ALPRAZOLAM 0.5 MG TAB',
        'CAPTOPRIL 25MG TAB',
        'CLONAZEPAM 1MG TAB 100N',
        'FUROSEMIDE 20MG/2ML AMP',
        'ONDANSETRON HCL 4MG/2ML AMP',
        'TRANCID 250 MG CAP',
        'propranolol 10MG',
        'VITAMIN K1 (PHUTOMENADIONE) 1MG/0.5ML AMP',
        'CETIRIZINE 10 mg TAB',
        'CEFIXIME 400 mg TABLET',
        'SODIUM CHLORIDE 0.9% 500 ML FOR IRRIGATION',
        'BEPANOX 500mg/2ml (DEXPANTHENOL) AMPOL',
        'FIROZ Baby Body Shampoo 200 ml',
        'ALMOND OIL',
        'RATAHEAL CAP 3*10'
      ];

      for (const categoryName of medicineCategories) {
        const existingCategory = await prisma.categoryL3.findFirst({
          where: { 
            name: categoryName,
            categoryL2Id: medicineCategory.id
          }
        });

        if (!existingCategory) {
          await prisma.categoryL3.create({
            data: {
              name: categoryName,
              slug: generateSlug(categoryName),
              categoryL2Id: medicineCategory.id
            }
          });
          console.log(`✅ دسته‌بندی "${categoryName}" ایجاد شد`);
        }
      }
    }

    console.log('\n✅ بروزرسانی دسته‌بندی‌ها تکمیل شد');

  } catch (error) {
    console.error('❌ خطا در بروزرسانی دسته‌بندی‌ها:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// اجرای اسکریپت
updateCategories(); 