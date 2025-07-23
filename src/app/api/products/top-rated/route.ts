import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const orderBy = searchParams.get('orderBy') || 'rating'; // rating, sales, recent

    let orderByClause: any = { averageRating: 'desc' };

    switch (orderBy) {
      case 'sales':
        // Order by order count (simulated by created orders)
        orderByClause = {
          orderItems: {
            _count: 'desc'
          }
        };
        break;
      case 'recent':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'rating':
      default:
        orderByClause = { averageRating: 'desc' };
        break;
    }

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

    // Fetch top products with calculated metrics
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        averageRating: {
          gt: 0 // Only products with ratings
        },
        // فیلتر محصولات VIP
        OR: [
          { isVipOnly: false }, // محصولات عمومی
          ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        image: true,
        brand: true,
        averageRating: true,
        hasDiscount: true,
        discountPercent: true,
        _count: {
          select: {
            orderItems: true,
            ratings: true,
            reviews: true
          }
        },
        categoryL3: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: orderByClause,
      take: limit
    });

    // Format response with additional metrics
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      image: product.image || '/default-product.png',
      brand: product.brand,
      averageRating: product.averageRating || 0,
      hasDiscount: product.hasDiscount,
      discountPercent: product.discountPercent,
      salesCount: product._count.orderItems,
      ratingCount: product._count.ratings,
      reviewCount: product._count.reviews,
      category: product.categoryL3.name,
      categorySlug: product.categoryL3.slug,
      // Calculate popularity score (rating * sales + review count)
      popularityScore: (product.averageRating || 0) * product._count.orderItems + product._count.reviews
    }));

    // If ordering by popularity, sort by calculated score
    if (orderBy === 'popular') {
      formattedProducts.sort((a, b) => b.popularityScore - a.popularityScore);
    }

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length,
      orderBy,
      message: 'محصولات برتر با موفقیت دریافت شد'
    });

  } catch (error) {
    console.error('Error fetching top-rated products:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محصولات برتر' },
      { status: 500 }
    );
  }
} 