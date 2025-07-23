import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'لطفا وارد شوید' }, { status: 401 });
    }

    // دریافت سفارش‌های کاربر
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: {
                  select: {
                    url: true
                  },
                  take: 1
                },
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // محاسبه محصولات پرتکرار
    const productMap = new Map();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.isActive) {
          const productId = item.product.id;
          if (productMap.has(productId)) {
            const existing = productMap.get(productId);
            existing.purchaseCount += item.quantity;
            existing.lastPurchased = new Date(Math.max(
              existing.lastPurchased.getTime(),
              order.createdAt.getTime()
            ));
          } else {
            productMap.set(productId, {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              price: item.product.price,
              img: item.product.images[0]?.url || '/default-product.png',
              purchaseCount: item.quantity,
              lastPurchased: order.createdAt
            });
          }
        }
      });
    });

    // مرتب‌سازی بر اساس تعداد خرید و انتخاب 4 محصول برتر
    const frequentProducts = Array.from(productMap.values())
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 4);

    return NextResponse.json(frequentProducts);
  } catch (error) {
    console.error('Error fetching frequent purchases:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت خرید‌های مکرر' },
      { status: 500 }
    );
  }
} 