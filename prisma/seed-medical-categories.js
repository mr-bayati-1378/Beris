const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

const medicalData = [
  {
    "category": "زیبایی و تخصصی",
    "subcategories": [
      {
        "subcategory": "مزوتراپی",
        "items": [
          "هیرفیلر",
          "کوکتل مزوتراپی MesoLike HariPlus",
          "کوکتل فیوژن",
          "جوانساز پروفایلو",
          "جوانساز جالپرو کلاسیک",
          "جوانساز جالپرو سوپرهایدرو"
        ]
      },
      {
        "subcategory": "بوتاکس و فیلر",
        "items": [
          "بوتاکس MASPORT",
          "فیلر رووفیل",
          "فیلر نورافیل",
          "فیلر نورامیس",
          "فیلر زیر چشم",
          "فیلر زیشل",
          "فیلر هیرفیلر دوتر CYG"
        ]
      },
      {
        "subcategory": "آنزیم درمانی",
        "items": ["آنزیم بینی"]
      }
    ]
  },
  {
    "category": "دارویی و درمانی",
    "subcategories": [
      {
        "subcategory": "داروهای تزریقی",
        "items": [
          "آمپول اپی‌نفرین",
          "تریامسینولون",
          "سفالازولین",
          "کترولاک",
          "دگزامتازون",
          "دی‌کلوفناک",
          "پيروکسیکام",
          "نیتروگلیسیرین",
          "متوکل‌پرامید",
          "ترانکزامیک اسید",
          "فوروزماید",
          "ویتامین K1"
        ]
      },
      {
        "subcategory": "داروهای خوراکی",
        "items": [
          "استامینوفن–کدئین",
          "سیتریزین",
          "سفیکسیم",
          "آلپرازولام",
          "کاپتوپریل",
          "کلونازپام",
          "پروپرانولول"
        ]
      }
    ]
  },
  {
    "category": "مواد مصرفی و پانسمان",
    "subcategories": [
      {
        "subcategory": "پانسمان و گاز",
        "items": ["گاز طبی", "ست پانسمان", "سرجی فیکس"]
      },
      {
        "subcategory": "چسب‌ها",
        "items": [
          "چسب بخیه",
          "چسب اتوکلاو",
          "چسب آنژیوکت",
          "چسب لوکوپلاست",
          "چسب شفاف"
        ]
      },
      {
        "subcategory": "رول پک و استریل",
        "items": ["رول پک استریل اتوکلاو"]
      }
    ]
  },
  {
    "category": "تزریق و سرسوزن",
    "subcategories": [
      {
        "subcategory": "سرنگ و تجهیزات تزریق",
        "items": [
          "سرنگ انسولین",
          "سرنگ ۳ml",
          "سرنگ ۵ml",
          "سرنگ ۱۰ml",
          "ست سرم",
          "ست تزریق"
        ]
      },
      {
        "subcategory": "سرسوزن و نیدل",
        "items": [
          "سرسوزن مزوتراپی",
          "سوزن پانچ",
          "نیدل کانولا",
          "نیدل درای نیدلینگ"
        ]
      }
    ]
  },
  {
    "category": "ملزومات پزشکی و جراحی",
    "subcategories": [
      {
        "subcategory": "دستکش",
        "items": [
          "دستکش جراحی",
          "دستکش لاتکس کم‌پودر",
          "دستکش آنتی‌باکتریال",
          "دستکش نایلونی"
        ]
      },
      {
        "subcategory": "شان و ملحفه",
        "items": [
          "شان استریل",
          "شان غیر استریل",
          "شان پرفوره",
          "روتختی یکبار مصرف",
          "زیرانداز بهداشتی"
        ]
      },
      {
        "subcategory": "ابزار جراحی",
        "items": ["تیغ جراحی", "ژیلت جراحی", "کانکتور ساکشن"]
      },
      {
        "subcategory": "مواد ضدعفونی",
        "items": [
          "الکل 20 لیتری",
          "محلول ضدعفونی",
          "پد الکلی",
          "سوآپ",
          "آب مقطر"
        ]
      },
      {
        "subcategory": "ماسک و محافظ",
        "items": ["ماسک سه‌لایه", "پیش‌بند یکبار مصرف"]
      }
    ]
  },
  {
    "category": "لوازم مصرفی عمومی",
    "subcategories": [
      {
        "subcategory": "پوشش‌ها و حوله",
        "items": ["حوله یکبار مصرف", "پوشک"]
      },
      {
        "subcategory": "بسته‌بندی و حمل",
        "items": ["ساک دستی"]
      },
      {
        "subcategory": "سردکننده‌ها",
        "items": ["آیس پک"]
      },
      {
        "subcategory": "آرایشی/بهداشتی",
        "items": ["رنگ مو"]
      }
    ]
  },
  {
    "category": "مکمل و تغذیه",
    "subcategories": [
      {
        "subcategory": "مکمل‌های ویتامینی",
        "items": ["HAIR-VIT", "DAANA ZINC", "BIOTINIX", "BEPANOX"]
      },
      {
        "subcategory": "محصولات مراقبت شخصی",
        "items": ["ALMOND OIL", "FIROZ Baby Shampoo"]
      }
    ]
  }
];

// Helper function to create slug from Persian text
function createSlug(text) {
  return text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .trim();
}

async function seedMedicalData() {
  console.log('🌱 Starting medical data seeding...');

  try {
    let totalProducts = 0;

    for (const categoryData of medicalData) {
      // Create L1 Category
      const l1Category = await prisma.categoryL1.create({
        data: {
          name: categoryData.category,
          slug: createSlug(categoryData.category)
        }
      });

      console.log(`✅ Created L1 Category: ${categoryData.category}`);

      for (const subcategoryData of categoryData.subcategories) {
        // Create L2 Category
        const l2Category = await prisma.categoryL2.create({
          data: {
            name: subcategoryData.subcategory,
            slug: createSlug(subcategoryData.subcategory),
            categoryL1Id: l1Category.id
          }
        });

        console.log(`  ✅ Created L2 Category: ${subcategoryData.subcategory}`);

        for (const item of subcategoryData.items) {
          // Create L3 Category
          const l3Category = await prisma.categoryL3.create({
            data: {
              name: item,
              slug: createSlug(item),
              categoryL2Id: l2Category.id
            }
          });

          // Create Product
          const product = await prisma.product.create({
            data: {
              name: item,
              slug: createSlug(item),
              description: `محصول ${item} - کیفیت بالا و قابل اعتماد`,
              price: Math.floor(Math.random() * 500000) + 50000, // 50,000 to 550,000
              comparePrice: Math.floor(Math.random() * 600000) + 60000, // 60,000 to 660,000
              stock: Math.floor(Math.random() * 100) + 10, // 10 to 110
              isActive: true,
              isVipOnly: false,
              hasDiscount: Math.random() > 0.7, // 30% chance of having discount
              discountPercent: Math.floor(Math.random() * 30) + 10, // 10% to 40%
              discountEndDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
              categoryL3Id: l3Category.id,
              brand: "برند معتبر"
            }
          });

          totalProducts++;
          console.log(`    ✅ Created Product: ${item}`);
        }
      }
    }

    console.log(`🎉 Seeding completed! Created ${totalProducts} products.`);

  } catch (error) {
    console.error('❌ Error seeding medical data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMedicalData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 