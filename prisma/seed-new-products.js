const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

// Helper function to create slug from Persian text
function createSlug(text) {
  return text
    .replace(/[^\u0600-\u06FF\s\w]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function seedNewProducts() {
  console.log('🌱 Seeding new products...');

  try {
    // Create categories (groups) as L1 categories
    const categories = [
      'مزوتراپی', 'الکل', 'دستکش جراحی 6.5', 'سرسوزن', 'دستکش جراحی 7', 
      'دستکش جراحی 7.5', 'دستکش جراحی 8', 'مارکر', 'بوتاکس', 'محلول ضد عفونی',
      'دستکش لاتکس', 'گاز غیر استریل', 'تیغ جراحی', 'نخ بخیه', 'رنگ مو',
      'شان', 'چسب', 'پوشک', 'بی حس کننده', 'سیفتی باکس', 'البسه', 'لوازم تزریق',
      'پماد', 'آب مقطر', 'دارویی', 'کاغذ صافی', 'سوزن پانچ', 'روتختی',
      'دستکش یکبار مصرف', 'زیرانداز', 'آیس', 'ساک دستی', 'پانسمان',
      'حوله', 'ژیلت', 'ساکشن و کانکتور', 'ماسک', 'آبسلانگ', 'سوآپ',
      'پیش بند', 'پد الکلی', 'سرم', 'اسپری', 'کانولا', 'مکمل', 'تجهیزات زیبایی',
      'رول پک', 'کلاه', 'فیلر'
    ];

    const categoryMap = new Map();

    // Create L1 categories
    for (const categoryName of categories) {
      const category = await prisma.categoryL1.upsert({
        where: { slug: createSlug(categoryName) },
        update: { name: categoryName },
        create: {
          name: categoryName,
          slug: createSlug(categoryName),
        },
      });
      categoryMap.set(categoryName, category.id);
      console.log(`✓ Created category: ${categoryName}`);
    }

    // Create a default L2 and L3 category for each L1
    for (const [categoryName, l1Id] of categoryMap) {
      const l2Category = await prisma.categoryL2.upsert({
        where: { slug: createSlug(`${categoryName}-sub`) },
        update: { name: `${categoryName} - زیرمجموعه` },
        create: {
          name: `${categoryName} - زیرمجموعه`,
          slug: createSlug(`${categoryName}-sub`),
          categoryL1Id: l1Id,
        },
      });

      const l3Category = await prisma.categoryL3.upsert({
        where: { slug: createSlug(`${categoryName}-products`) },
        update: { name: `${categoryName} - محصولات` },
        create: {
          name: `${categoryName} - محصولات`,
          slug: createSlug(`${categoryName}-products`),
          categoryL2Id: l2Category.id,
        },
      });

      categoryMap.set(categoryName, l3Category.id);
    }

    console.log('✅ Categories created successfully!');
    console.log('Now creating products...');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedNewProducts()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 