const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategoriesStructure() {
  try {
    console.log('🔍 بررسی ساختار دسته‌بندی‌ها...');
    
    // دریافت تمام دسته‌بندی‌های سطح 1
    const l1Categories = await prisma.categoryL1.findMany({
      include: {
        categoryL2s: {
          include: {
            categoryL3s: {
              include: {
                _count: {
                  select: { products: true }
                }
              }
            },
            _count: {
              select: { categoryL3s: true }
            }
          }
        },
        _count: {
          select: { categoryL2s: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 تعداد دسته‌بندی‌های سطح 1: ${l1Categories.length}`);
    
    l1Categories.forEach(l1 => {
      console.log(`\n📁 ${l1.name} (${l1.slug})`);
      console.log(`   تعداد زیرمجموعه: ${l1._count.categoryL2s}`);
      
      l1.categoryL2s.forEach(l2 => {
        console.log(`  📂 ${l2.name} (${l2.slug})`);
        console.log(`     تعداد زیرمجموعه: ${l2._count.categoryL3s}`);
        
        l2.categoryL3s.forEach(l3 => {
          console.log(`    📄 ${l3.name} (${l3.slug}) - ${l3._count.products} محصول`);
        });
      });
    });

    // بررسی محصولات بدون دسته‌بندی
    const productsWithoutCategory = await prisma.product.findMany({
      where: {
        categoryL3: {
          name: 'نامعلوم'
        }
      },
      select: {
        id: true,
        name: true,
        brand: true
      }
    });

    console.log(`\n⚠️ محصولات بدون دسته‌بندی مناسب: ${productsWithoutCategory.length}`);
    productsWithoutCategory.forEach(p => {
      console.log(`  - ${p.name} (${p.brand})`);
    });

  } catch (error) {
    console.error('❌ خطا در بررسی دسته‌بندی‌ها:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoriesStructure(); 