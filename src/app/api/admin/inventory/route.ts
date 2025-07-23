import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'stock';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const skip = (page - 1) * limit;

    // ساخت شرایط جستجو
    const where: any = {};

    if (search) {
      where.name = {
        contains: search
      };
    }

    if (status && status !== 'all') {
      switch (status) {
        case 'out-of-stock':
          where.stock = 0;
          break;
        case 'low-stock':
          where.stock = { gt: 0, lte: 10 };
          break;
        case 'in-stock':
          where.stock = { gt: 10 };
          break;
      }
    }

    // ساخت شرایط مرتب‌سازی
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'stock':
        orderBy = { stock: sortOrder };
        break;
      case 'price':
        orderBy = { price: sortOrder };
        break;
      default:
        orderBy = { stock: sortOrder };
    }

    // دریافت محصولات با pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
        }
      }),
      prisma.product.count({ where })
    ]);

    // دریافت آمار کامل موجودی
    const [
      totalProducts,
      allProducts,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      // تعداد کل محصولات
      prisma.product.count(),
      
      // همه محصولات برای محاسبه ارزش کل
      prisma.product.findMany({
        select: {
          stock: true,
          price: true
        }
      }),
      
      // محصولات کم موجود (1-10 عدد)
      prisma.product.count({
        where: {
          stock: {
            gt: 0,
            lte: 10
          }
        }
      }),
      
      // محصولات ناموجود (0 عدد)
      prisma.product.count({
        where: {
          stock: 0
        }
      })
    ]);

    // محاسبه ارزش کل موجودی
    const totalValue = allProducts.reduce((sum, product) => 
      sum + (product.stock * parseFloat(product.price.toString())), 0
    );

    // آمار دسته‌بندی‌ها
    const categoryStats = await prisma.categoryL1.findMany({
      include: {
        categoryL2s: {
          include: {
            categoryL3s: {
              include: {
                products: {
                  select: {
                    stock: true,
                    price: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // پردازش آمار دسته‌بندی‌ها
    const processedCategoryStats = categoryStats.map(l1 => {
      let totalProducts = 0;
      let totalValue = 0;
      let totalStock = 0;

      l1.categoryL2s.forEach(l2 => {
        l2.categoryL3s.forEach(l3 => {
          l3.products.forEach(product => {
            totalProducts++;
            totalStock += product.stock;
            totalValue += product.stock * parseFloat(product.price.toString());
          });
        });
      });

      return {
        categoryName: l1.name,
        totalProducts,
        totalStock,
        totalValue,
        averageValue: totalProducts > 0 ? totalValue / totalProducts : 0
      };
    }).filter(cat => cat.totalProducts > 0);

    // فرمت کردن محصولات
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price.toString()),
      stock: product.stock,
      lowStockThreshold: 10, // می‌توانید این را از دیتابیس بخوانید
      isActive: product.isActive,
      brand: product.brand,
      categoryL3: product.categoryL3,
      createdAt: product.createdAt.toLocaleDateString('fa-IR'),
      updatedAt: product.updatedAt.toLocaleDateString('fa-IR')
    }));

    return NextResponse.json({
      products: formattedProducts,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      total: totalCount,
      stats: {
        totalProducts,
        totalValue,
        lowStockCount: lowStockProducts,
        outOfStockCount: outOfStockProducts,
        inStockCount: totalProducts - outOfStockProducts
      },
      categoryStats: processedCategoryStats
    });

  } catch (error) {
    console.error('خطا در دریافت آمار موجودی:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آمار موجودی' },
      { status: 500 }
    );
  }
} 