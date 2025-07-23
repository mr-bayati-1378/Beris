const { PrismaClient } = require('./src/generated/prisma');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[\u06C0-\u06EF\u0600-\u06FF]/g, '') // حذف حروف فارسی
    .replace(/[^a-z0-9\s-]/g, '') // حذف کاراکترهای خاص
    .replace(/\s+/g, '-') // تبدیل فاصله به خط تیره
    .replace(/-+/g, '-') // حذف خط تیره‌های تکراری
    .trim('-'); // حذف خط تیره از ابتدا و انتها
}

async function importProductsAndCategories(filePath) {
  try {
    console.log('🔄 در حال بارگذاری فایل اکسل...');

    if (!fs.existsSync(filePath)) {
      throw new Error(`فایل ${filePath} یافت نشد!`);
    }

    // خواندن فایل اکسل
    const workbook = XLSX.readFile(filePath);
    
    // بررسی وجود شیت‌ها
    if (!workbook.SheetNames.includes('محصولات')) {
      throw new Error('شیت "محصولات" در فایل یافت نشد!');
    }

    // خواندن داده‌های محصولات
    const productsSheet = workbook.Sheets['محصولات'];
    const productsData = XLSX.utils.sheet_to_json(productsSheet);

    console.log(`📊 ${productsData.length} محصول در فایل یافت شد`);

    let updatedCount = 0;
    let vipProductsCount = 0;
    let errors = [];

    // پردازش محصولات
    for (const row of productsData) {
      try {
        const productId = row['شناسه محصول'];
        const isVipOnly = row['محدود به مشتریان VIP'] === 'بله';
        const isActive = row['فعال'] === 'بله';
        const isFeatured = row['ویژه'] === 'بله';

        if (!productId) {
          console.warn('⚠️ محصولی بدون شناسه رد شد');
          continue;
        }

        // بررسی وجود محصول در دیتابیس
        const existingProduct = await prisma.product.findUnique({
          where: { id: parseInt(productId) }
        });

        if (!existingProduct) {
          errors.push(`محصول با شناسه ${productId} در دیتابیس یافت نشد`);
          continue;
        }

        // به‌روزرسانی محصول
        const updateData = {};

        // فیلدهای قابل به‌روزرسانی
        if (row['نام محصول']) {
          updateData.name = row['نام محصول'];
          updateData.slug = row['اسلاگ محصول'] || slugify(row['نام محصول']);
        }

        if (row['قیمت (تومان)']) {
          updateData.price = parseFloat(row['قیمت (تومان)']);
        }

        if (row['قیمت مقایسه']) {
          updateData.comparePrice = parseFloat(row['قیمت مقایسه']) || null;
        }

        if (row['موجودی'] !== undefined) {
          updateData.stock = parseInt(row['موجودی']) || 0;
        }

        if (row['حداقل موجودی'] !== undefined) {
          updateData.minStock = parseInt(row['حداقل موجودی']) || 0;
        }

        if (row['برند']) {
          updateData.brand = row['برند'];
        }

        if (row['کد محصول']) {
          updateData.sku = row['کد محصول'];
        }

        if (row['توضیحات کوتاه']) {
          updateData.shortDescription = row['توضیحات کوتاه'];
        }

        if (row['توضیحات کامل']) {
          updateData.description = row['توضیحات کامل'];
        }

        if (row['تصویر اصلی']) {
          updateData.img = row['تصویر اصلی'];
        }

        // به‌روزرسانی وضعیت‌ها
        updateData.isActive = isActive;
        updateData.isFeatured = isFeatured;
        updateData.isVipOnly = isVipOnly;

        if (isVipOnly) {
          vipProductsCount++;
        }

        await prisma.product.update({
          where: { id: parseInt(productId) },
          data: updateData
        });

        updatedCount++;

        if (updatedCount % 10 === 0) {
          console.log(`✅ ${updatedCount} محصول به‌روزرسانی شد...`);
        }

      } catch (error) {
        errors.push(`خطا در به‌روزرسانی محصول ${row['شناسه محصول']}: ${error.message}`);
      }
    }

    // پردازش دسته‌بندی‌ها (در صورت وجود)
    let categoriesUpdated = 0;
    if (workbook.SheetNames.includes('دسته‌بندی‌ها')) {
      console.log('\n🔄 در حال پردازش دسته‌بندی‌ها...');
      
      const categoriesSheet = workbook.Sheets['دسته‌بندی‌ها'];
      const categoriesData = XLSX.utils.sheet_to_json(categoriesSheet);

      for (const row of categoriesData) {
        try {
          const l3Id = row['شناسه دسته سطح 3'];
          const isActive = row['فعال'] === 'بله';

          if (!l3Id) continue;

          await prisma.categoryL3.update({
            where: { id: parseInt(l3Id) },
            data: { isActive }
          });

          categoriesUpdated++;
        } catch (error) {
          errors.push(`خطا در به‌روزرسانی دسته‌بندی ${row['شناسه دسته سطح 3']}: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 عملیات تکمیل شد!');
    console.log(`✅ ${updatedCount} محصول به‌روزرسانی شد`);
    console.log(`👑 ${vipProductsCount} محصول به‌عنوان VIP تنظیم شد`);
    
    if (categoriesUpdated > 0) {
      console.log(`📁 ${categoriesUpdated} دسته‌بندی به‌روزرسانی شد`);
    }

    if (errors.length > 0) {
      console.log(`\n⚠️ ${errors.length} خطا رخ داد:`);
      errors.slice(0, 10).forEach(error => console.log(`   • ${error}`));
      if (errors.length > 10) {
        console.log(`   ... و ${errors.length - 10} خطای دیگر`);
      }
    }

    return {
      updatedProducts: updatedCount,
      vipProducts: vipProductsCount,
      updatedCategories: categoriesUpdated,
      errors: errors.length
    };

  } catch (error) {
    console.error('❌ خطا در import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// اجرای اسکریپت
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('❌ لطفاً مسیر فایل اکسل را مشخص کنید:');
    console.error('   node import-products.js path/to/your/file.xlsx');
    process.exit(1);
  }

  importProductsAndCategories(filePath)
    .then(result => {
      console.log(`\n📊 خلاصه نتایج:`);
      console.log(`   • محصولات به‌روزرسانی شده: ${result.updatedProducts}`);
      console.log(`   • محصولات VIP: ${result.vipProducts}`);
      console.log(`   • دسته‌بندی‌های به‌روزرسانی شده: ${result.updatedCategories}`);
      console.log(`   • تعداد خطاها: ${result.errors}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 خطا:', error.message);
      process.exit(1);
    });
}

module.exports = { importProductsAndCategories }; 