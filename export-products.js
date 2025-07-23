const { PrismaClient } = require('./src/generated/prisma');
const XLSX = require('xlsx');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportProductsAndCategories() {
  try {
    console.log('🔄 در حال استخراج اطلاعات از دیتابیس...');

    // دریافت تمام دسته‌بندی‌ها
    const categoryL1s = await prisma.categoryL1.findMany({
      include: {
        categoryL2s: {
          include: {
            categoryL3s: {
              include: {
                _count: {
                  select: { products: true }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // دریافت تمام محصولات
    const products = await prisma.product.findMany({
      include: {
        categoryL3: {
          include: {
            categoryL2: {
              include: {
                categoryL1: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 یافت شد: ${categoryL1s.length} دسته سطح 1، ${products.length} محصول`);

    // آماده‌سازی داده‌های دسته‌بندی‌ها
    const categoriesData = [];
    
    categoryL1s.forEach(l1 => {
      l1.categoryL2s.forEach(l2 => {
        l2.categoryL3s.forEach(l3 => {
          categoriesData.push({
            'شناسه دسته سطح 1': l1.id,
            'نام دسته سطح 1': l1.name,
            'اسلاگ دسته سطح 1': l1.slug,
            'شناسه دسته سطح 2': l2.id,
            'نام دسته سطح 2': l2.name,
            'اسلاگ دسته سطح 2': l2.slug,
            'شناسه دسته سطح 3': l3.id,
            'نام دسته سطح 3': l3.name,
            'اسلاگ دسته سطح 3': l3.slug,
            'تعداد محصولات': l3._count.products,
            'فعال': l1.isActive && l2.isActive && l3.isActive ? 'بله' : 'خیر'
          });
        });
      });
    });

    // آماده‌سازی داده‌های محصولات
    const productsData = products.map(product => ({
      'شناسه محصول': product.id,
      'نام محصول': product.name,
      'اسلاگ محصول': product.slug,
      'قیمت (تومان)': product.price,
      'قیمت مقایسه': product.comparePrice || '',
      'موجودی': product.stock,
      'حداقل موجودی': product.minStock,
      'وزن (گرم)': product.weight || '',
      'برند': product.brand || '',
      'کد محصول': product.sku || '',
      'توضیحات کوتاه': product.shortDescription || '',
      'توضیحات کامل': product.description || '',
      'تصویر اصلی': product.img || '',
      'دسته سطح 1': product.categoryL3?.categoryL2?.categoryL1?.name || '',
      'دسته سطح 2': product.categoryL3?.categoryL2?.name || '',
      'دسته سطح 3': product.categoryL3?.name || '',
      'شناسه دسته سطح 3': product.categoryL3Id,
      'فعال': product.isActive ? 'بله' : 'خیر',
      'ویژه': product.isFeatured ? 'بله' : 'خیر',
      'محدود به مشتریان VIP': 'خیر', // فیلد جدید برای تعیین محصولات اختصاصی
      'یادداشت': '', // فیلد اضافی برای یادداشت‌ها
      'تاریخ ایجاد': product.createdAt.toLocaleDateString('fa-IR'),
      'تاریخ به‌روزرسانی': product.updatedAt.toLocaleDateString('fa-IR')
    }));

    // ایجاد workbook جدید
    const workbook = XLSX.utils.book_new();

    // اضافه کردن sheet دسته‌بندی‌ها
    const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'دسته‌بندی‌ها');

    // اضافه کردن sheet محصولات
    const productsSheet = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'محصولات');

    // اضافه کردن sheet راهنما
    const guideData = [
      {
        'فیلد': 'محدود به مشتریان VIP',
        'توضیح': 'اگر "بله" باشد، فقط مشتریان VIP این محصول را می‌بینند',
        'مقادیر مجاز': 'بله / خیر'
      },
      {
        'فیلد': 'فعال',
        'توضیح': 'وضعیت نمایش محصول یا دسته‌بندی',
        'مقادیر مجاز': 'بله / خیر'
      },
      {
        'فیلد': 'ویژه',
        'توضیح': 'آیا محصول در بخش محصولات ویژه نمایش داده شود',
        'مقادیر مجاز': 'بله / خیر'
      }
    ];
    const guideSheet = XLSX.utils.json_to_sheet(guideData);
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'راهنما');

    // ذخیره فایل
    const fileName = `beris-products-categories-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    console.log(`✅ فایل اکسل با موفقیت ایجاد شد: ${fileName}`);
    console.log(`📁 محتویات فایل:`);
    console.log(`   • ${categoriesData.length} دسته‌بندی در sheet "دسته‌بندی‌ها"`);
    console.log(`   • ${productsData.length} محصول در sheet "محصولات"`);
    console.log(`   • راهنمای ویرایش در sheet "راهنما"`);
    
    return fileName;

  } catch (error) {
    console.error('❌ خطا در استخراج اطلاعات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// اجرای اسکریپت
if (require.main === module) {
  exportProductsAndCategories()
    .then(fileName => {
      console.log(`\n🎉 عملیات تکمیل شد!`);
      console.log(`📧 فایل ${fileName} آماده ویرایش است.`);
      console.log(`\n📝 نکات مهم:`);
      console.log(`   • در ستون "محدود به مشتریان VIP" محصولات اختصاصی را "بله" کنید`);
      console.log(`   • فقط فیلدهای قابل ویرایش را تغییر دهید`);
      console.log(`   • شناسه‌ها (ID) را تغییر ندهید`);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 خطا:', error.message);
      process.exit(1);
    });
}

module.exports = { exportProductsAndCategories }; 