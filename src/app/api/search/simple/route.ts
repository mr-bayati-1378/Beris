import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '12');

    console.log('🔍 Search API called with query:', query, 'limit:', limit);

    if (!query) {
      console.log('❌ No query provided');
      return NextResponse.json({
        success: false,
        error: 'Query is required',
        products: [],
      });
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

    // سرچ مستقیم در PostgreSQL/MySQL
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { isVipOnly: false }, // محصولات عمومی
              ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
            ],
          },
          {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { brand: { contains: query } },
            ],
          },
        ],
      },
      include: {
        categoryL3: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          select: { url: true },
          take: 1,
        },
        ratings: {
          select: { rating: true },
        },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    console.log(`📦 Found ${products.length} products for query: "${query}"`);

    // تبدیل به فرمت مورد نیاز
    const formattedProducts = products.map(product => {
      const avgRating = product.ratings.length > 0 
        ? product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length 
        : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        brand: product.brand || '',
        price: product.price,
        stock: product.stock,
        slug: product.slug,
        image: product.image || (product.images[0]?.url || ''),
        categoryName: product.categoryL3?.name || '',
        categorySlug: product.categoryL3?.slug || '',
        rating: avgRating,
        isActive: product.isActive,
      };
    });

    console.log(`✅ Returning ${formattedProducts.length} formatted products`);

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length,
    });

  } catch (error) {
    console.error('❌ Simple search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Search error',
      products: [],
    });
  }
} 