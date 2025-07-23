import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getSearchSuggestions } from '@/lib/search-indexer';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const brand = searchParams.get('brand') || '';
    const sortBy = searchParams.get('sortBy') || 'rating:desc';
    const suggestions = searchParams.get('suggestions') === 'true';

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

    // اگر فقط پیشنهادات می‌خواد
    if (suggestions) {
      const result = await getSearchSuggestions(query, limit);
      return NextResponse.json(result);
    }

    // ساخت فیلترها
    let filters = '';
    const filterParts = [];

    if (category) {
      filterParts.push(`categorySlug:${category}`);
    }

    if (brand) {
      filterParts.push(`brand:${brand}`);
    }

    if (minPrice && maxPrice) {
      filterParts.push(`price:[${minPrice}..${maxPrice}]`);
    } else if (minPrice) {
      filterParts.push(`price:>=${minPrice}`);
    } else if (maxPrice) {
      filterParts.push(`price:<=${maxPrice}`);
    }

    // اضافه کردن فیلتر VIP
    if (!isUserVip) {
      filterParts.push('isVipOnly:false');
    }
    
    if (filterParts.length > 0) {
      filters = filterParts.join(' && ');
    }

    // جستجو
    const result = await searchProducts(query, {
      page,
      limit,
      filters,
      sortBy,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        products: result.products,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          limit,
        },
      });
    } else {
      throw new Error(result.error?.toString() || 'Search failed');
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در جستجو',
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit: 12,
        },
      },
      { status: 500 }
    );
  }
} 