import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/search-indexer';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const tags = searchParams.get('tags')?.split(',');
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // استفاده از Typesense برای جستجو
    if (query) {
      try {
        // ساخت فیلترها برای Typesense
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
        
        const filters = filterParts.length > 0 ? filterParts.join(' && ') : '';
        
        // تبدیل sort به فرمت Typesense
        let sortBy = 'rating:desc';
        switch (sort) {
          case 'price_asc':
            sortBy = 'price:asc';
            break;
          case 'price_desc':
            sortBy = 'price:desc';
            break;
          case 'newest':
            sortBy = 'rating:desc'; // چون createdAt نداریم
            break;
          case 'popular':
            sortBy = 'rating:desc'; // چون views نداریم
            break;
        }

        const searchResult = await searchProducts(query, {
          page,
          limit,
          filters,
          sortBy,
        });

        if (searchResult.success) {
          return NextResponse.json({
            products: searchResult.products,
            pagination: {
              total: searchResult.totalCount,
              pages: searchResult.totalPages,
              currentPage: searchResult.currentPage,
              limit,
            },
            filters: {
              brands: [],
              tags: [],
              priceRange: { min: 0, max: 0 },
            },
          });
        }
      } catch (typesenseError) {
        console.log('Typesense search failed, falling back to PostgreSQL:', typesenseError);
        // ادامه به PostgreSQL fallback
      }
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

    // ساخت شرط‌های جستجو
    const where: any = {
      isActive: true,
      // فیلتر محصولات VIP
      OR: [
        { isVipOnly: false }, // محصولات عمومی
        ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
      ],
    };

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { brand: { contains: query } },
      ];
    }

    // فیلتر دسته‌بندی
    if (category) {
      where.categoryL3Id = category;
    }

    // فیلتر برند
    if (brand) {
      where.brand = brand;
    }

    // فیلتر قیمت
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // فیلتر تگ‌ها
    if (tags?.length) {
      where.tags = { hasSome: tags };
    }

    // مرتب‌سازی
    let orderBy: any = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      default:
        // مرتب‌سازی پیش‌فرض
        orderBy = { createdAt: 'desc' };
    }

    // محاسبه تعداد کل نتایج
    const total = await prisma.product.count({ where });

    // دریافت محصولات
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categoryL3: true,
        images: true,
      },
    });

    // دریافت برندهای موجود در نتایج
    const brands = await prisma.product.findMany({
      where,
      select: { brand: true },
      distinct: ['brand'],
    });

    // دریافت تگ‌های موجود در نتایج
    const availableTags = await prisma.product.findMany({
      where,
      select: { tags: true },
    });

    const uniqueTags = Array.from(
      new Set(availableTags.flatMap(p => p.tags))
    ).filter(Boolean);

    // محاسبه محدوده قیمت
    const priceRange = await prisma.product.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    });

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      filters: {
        brands: brands.map(b => b.brand).filter(Boolean),
        tags: uniqueTags,
        priceRange: {
          min: priceRange._min.price || 0,
          max: priceRange._max.price || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'خطا در جستجوی محصولات' },
      { status: 500 }
    );
  }
}
