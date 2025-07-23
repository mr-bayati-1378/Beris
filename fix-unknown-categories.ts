import { PrismaClient } from './src/generated/prisma';
import { findCategoryForProduct, getCategoryInfo } from './src/lib/category-matcher';

const prisma = new PrismaClient();

async function fixUnknownCategories() {
  try {
    // پیدا کردن دسته L3 با نام "نامعلوم"
    const unknownCategory = await prisma.categoryL3.findFirst({ where: { name: 'نامعلوم' } });
    if (!unknownCategory) {
      console.log('دسته‌بندی "نامعلوم" پیدا نشد.');
      return;
    }
    // پیدا کردن محصولات با دسته‌بندی "نامعلوم"
    const products = await prisma.product.findMany({ where: { categoryL3Id: unknownCategory.id } });
    if (products.length === 0) {
      console.log('هیچ محصولی با دسته‌بندی "نامعلوم" یافت نشد.');
      return;
    }
    let fixed = 0;
    let failed = 0;
    for (const product of products) {
      try {
        const match = await findCategoryForProduct(product.name);
        if (match && match.categoryL3Id && match.confidence > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryL3Id: match.categoryL3Id }
          });
          const info = await getCategoryInfo(match.categoryL3Id);
          console.log(`✅ ${product.name} → ${info ? `${info.l1} > ${info.l2} > ${info.l3}` : match.categoryL3Id}`);
          fixed++;
        } else {
          console.log(`❌ دسته‌بندی مناسب برای ${product.name} پیدا نشد.`);
          failed++;
        }
      } catch (err: any) {
        console.log(`❌ خطا در پردازش ${product.name}:`, err.message);
        failed++;
      }
    }
    console.log(`\nتعداد محصولات اصلاح‌شده: ${fixed}`);
    console.log(`تعداد محصولات بدون دسته‌بندی: ${failed}`);
  } catch (err) {
    console.error('خطا:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnknownCategories(); 