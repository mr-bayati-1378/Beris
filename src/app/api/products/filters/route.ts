import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    // بررسی وضعیت VIP کاربر
    let isUserVip = false;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { isVip: true }
        });
        isUserVip = user?.isVip || false;
      }
    } catch (sessionError) {
      console.log('Session error:', sessionError);
    }

    // Get unique brands from products
    const brands = await prisma.product.findMany({
      where: {
        isActive: true,
        brand: { not: null },
        // فیلتر محصولات VIP
        OR: [
          { isVipOnly: false }, // محصولات عمومی
          ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
        ],
      },
      select: {
        brand: true,
      },
      distinct: ['brand'],
      orderBy: {
        brand: 'asc'
      }
    });

    // Get categories - simplified approach
    const categories = await prisma.categoryL3.findMany({
      where: {
        name: { not: 'نامعلوم' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get price range - simplified
    const priceRange = await prisma.product.aggregate({
      where: {
        isActive: true,
        // فیلتر محصولات VIP
        OR: [
          { isVipOnly: false }, // محصولات عمومی
          ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
        ],
      },
      _min: {
        price: true
      },
      _max: {
        price: true
      }
    });

    // Get product counts - simplified
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true,
        // فیلتر محصولات VIP
        OR: [
          { isVipOnly: false }, // محصولات عمومی
          ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
        ],
      }
    });

    const discountedProducts = await prisma.product.count({
      where: {
        isActive: true,
        hasDiscount: true,
        // فیلتر محصولات VIP
        OR: [
          { isVipOnly: false }, // محصولات عمومی
          ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
        ],
      }
    });

    const inStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        stock: { gt: 0 },
        // فیلتر محصولات VIP
        OR: [
          { isVipOnly: false }, // محصولات عمومی
          ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
        ],
      }
    });

    return NextResponse.json({
      brands: brands
        .filter(brand => brand.brand && brand.brand.trim() !== '')
        .map(brand => brand.brand),
      categories: categories.map(cat => ({
        slug: cat.slug,
        name: cat.name,
        count: 0, // Simplified - can be calculated separately if needed
      })),
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 0
      },
      counts: {
        total: totalProducts,
        discounted: discountedProducts,
        inStock: inStockProducts
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فیلترها' },
      { status: 500 }
    );
  }
} 