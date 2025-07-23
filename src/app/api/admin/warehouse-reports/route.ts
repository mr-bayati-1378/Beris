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
    const range = searchParams.get('range') || '30days';
    const category = searchParams.get('category') || 'all';

    // محاسبه تاریخ شروع بر اساس بازه انتخابی
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // آمار کلی محصولات
    const [
      totalProducts,
      allProducts,
      lowStockProducts,
      outOfStockProducts,
      recentOrders
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          stock: true,
          price: true,
          categoryL3: {
            select: {
              name: true,
              categoryL2: {
                select: {
                  name: true,
                  categoryL1: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.product.count({
        where: {
          stock: { lte: 10, gt: 0 }
        }
      }),
      prisma.product.count({
        where: { stock: 0 }
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })
    ]);

    // محاسبه ارزش کل موجودی
    const totalValue = allProducts.reduce((sum, product) => 
      sum + (product.stock * parseFloat(product.price.toString())), 0
    );

    // محاسبه گردش موجودی (مثال ساده)
    const totalSoldQuantity = recentOrders.reduce((sum, order) =>
      sum + order.items.reduce((orderSum, item) => orderSum + item.quantity, 0), 0
    );
    const inventoryTurnover = totalProducts > 0 ? totalSoldQuantity / totalProducts : 0;

    // محصولات پرفروش
    const productSales = new Map<number, { product: any, soldQuantity: number }>();
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.soldQuantity += item.quantity;
        } else {
          productSales.set(item.productId, {
            product: item.product,
            soldQuantity: item.quantity
          });
        }
      });
    });

    const fastMovingProducts = Array.from(productSales.values())
      .sort((a, b) => b.soldQuantity - a.soldQuantity)
      .slice(0, 10)
      .map(item => {
        const productInfo = allProducts.find(p => p.id === item.product.id);
        return {
          id: item.product.id,
          name: item.product.name,
          stock: productInfo?.stock || 0,
          price: productInfo?.price || 0,
          category: productInfo?.categoryL3?.categoryL2?.categoryL1?.name || 'نامشخص',
          movementCount: item.soldQuantity,
          lastMovement: new Date().toLocaleDateString('fa-IR')
        };
      });

    // محصولات کندفروش (محصولاتی که فروش کمی داشته‌اند)
    const slowMovingProducts = allProducts
      .filter(product => {
        const sales = productSales.get(product.id);
        return !sales || sales.soldQuantity <= 2;
      })
      .slice(0, 10)
      .map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        price: product.price,
        category: product.categoryL3?.categoryL2?.categoryL1?.name || 'نامشخص',
        movementCount: productSales.get(product.id)?.soldQuantity || 0,
        lastMovement: new Date().toLocaleDateString('fa-IR')
      }));

    // تحلیل دسته‌بندی‌ها
    const categoryAnalysis = new Map<string, {
      totalProducts: number,
      totalValue: number,
      totalStock: number,
      lowStockCount: number
    }>();

    allProducts.forEach(product => {
      const categoryName = product.categoryL3?.categoryL2?.categoryL1?.name || 'نامشخص';
      const existing = categoryAnalysis.get(categoryName);
      const productValue = product.stock * parseFloat(product.price.toString());
      
      if (existing) {
        existing.totalProducts += 1;
        existing.totalValue += productValue;
        existing.totalStock += product.stock;
        if (product.stock <= 10 && product.stock > 0) existing.lowStockCount += 1;
      } else {
        categoryAnalysis.set(categoryName, {
          totalProducts: 1,
          totalValue: productValue,
          totalStock: product.stock,
          lowStockCount: (product.stock <= 10 && product.stock > 0) ? 1 : 0
        });
      }
    });

    const categoryStats = Array.from(categoryAnalysis.entries()).map(([category, stats]) => ({
      category,
      totalProducts: stats.totalProducts,
      totalValue: stats.totalValue,
      averageStock: stats.totalProducts > 0 ? stats.totalStock / stats.totalProducts : 0,
      lowStockCount: stats.lowStockCount
    }));

    // حرکات موجودی (مثال ساده از سفارشات اخیر)
    const stockMovements = recentOrders
      .slice(0, 20)
      .flatMap(order => 
        order.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          type: 'out' as const,
          quantity: item.quantity,
          date: order.createdAt.toLocaleDateString('fa-IR'),
          reason: 'فروش'
        }))
      );

    const report = {
      totalProducts,
      totalValue,
      lowStockProducts,
      outOfStockProducts,
      inStockProducts: totalProducts - outOfStockProducts,
      inventoryTurnover,
      averageInventoryValue: totalProducts > 0 ? totalValue / totalProducts : 0,
      fastMovingProducts,
      slowMovingProducts,
      stockMovements,
      categoryAnalysis: categoryStats
    };

    return NextResponse.json({ report });

  } catch (error) {
    console.error('Error generating warehouse report:', error);
    return NextResponse.json(
      { error: 'خطا در تولید گزارش انبار' },
      { status: 500 }
    );
  }
} 