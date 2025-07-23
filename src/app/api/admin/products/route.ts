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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 1000);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const stockFilter = searchParams.get('stockFilter') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const categoryL3Id = searchParams.get('categoryL3Id') || searchParams.get('category');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      // Normalize search text by replacing Arabic characters with Persian equivalents
      const normalizedSearch = search
        .replace(/ي/g, 'ی')  // Replace Arabic Ya with Persian Ya
        .replace(/ك/g, 'ک')  // Replace Arabic Kaf with Persian Kaf
        .replace(/ة/g, 'ه')  // Replace Arabic Ta Marbuta with Persian Ha
        .trim();

      // Simple search in name only
      where.name = {
        contains: normalizedSearch
      };
    }

    if (categoryL3Id && categoryL3Id !== 'all') {
      where.categoryL3Id = parseInt(categoryL3Id);
    } else if (category && category !== 'all') {
      where.categoryL3 = {
        categoryL2: {
          categoryL1: {
            name: category
          }
        }
      };
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (stockFilter && stockFilter !== 'all') {
      switch (stockFilter) {
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

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    
    if (sortBy && sortBy !== 'createdAt') {
      switch (sortBy) {
        case 'name':
          orderBy = { name: sortOrder };
          break;
        case 'price':
          orderBy = { price: sortOrder };
          break;
        case 'stock':
          orderBy = { stock: sortOrder };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    } else {
      orderBy = { createdAt: sortOrder };
    }

    const [products, total] = await Promise.all([
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
          },
          images: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            select: {
              id: true,
              url: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Format products for frontend
    const formattedProducts = products.map(product => ({
      ...product,
      createdAt: new Intl.DateTimeFormat('fa-IR').format(product.createdAt),
      // Only use image field if no images exist in images array
      image: product.images.length === 0 && product.image ? `${product.image}?t=${product.updatedAt.getTime()}` : null,
      images: product.images.map(img => ({
        ...img,
        url: `${img.url}?t=${product.updatedAt.getTime()}`
      }))
    }));

    const response = NextResponse.json({
      products: formattedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    });

    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('خطا در دریافت محصولات:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محصولات' },
      { status: 500 }
    );
  }
}

// ایجاد محصول جدید
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }
    const body = await request.json();
    const {
      name,
      description,
      price,
      stock,
      brand,
      categoryL3Id,
      imageUrls = []
    } = body;

    // Validate required fields
    if (!name || typeof price !== 'number' || typeof stock !== 'number' || !categoryL3Id) {
      console.error('خطای اعتبارسنجی:', { name, price, stock, categoryL3Id });
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدهای ضروری را پر کنید' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.categoryL3.findUnique({
      where: { id: parseInt(categoryL3Id) }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'دسته‌بندی انتخاب شده معتبر نیست' },
        { status: 400 }
      );
    }

    // Generate slug from product name
    function generateSlug(text: string): string {
      // Convert Persian/Arabic numbers to English
      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      
      let slug = text;
      
      // Convert numbers
      for (let i = 0; i < 10; i++) {
        slug = slug.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i])
                  .replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
      }
      
      // Convert Persian/Arabic characters to English equivalents
      const persianToEnglish: { [key: string]: string } = {
        'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j',
        'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
        'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
        'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l',
        'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y', 'ئ': 'y'
      };
      
      // Convert each character
      slug = slug.split('').map(char => persianToEnglish[char] || char).join('');
      
      // Convert to lowercase and replace non-alphanumeric characters with dash
      slug = slug.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with dash
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
      
      return slug;
    }

    // Generate base slug
    let baseSlug = generateSlug(name);

    // Check if the slug exists
    const existingProduct = await prisma.product.findFirst({
      where: { slug: baseSlug }
    });

    // If slug exists, append a timestamp to make it unique
    const slug = existingProduct ? `${baseSlug}-${Date.now()}` : baseSlug;

    // شروع تراکنش
    const result = await prisma.$transaction(async (tx) => {
      // ایجاد محصول
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          price: parseFloat(price.toString()),
          stock: parseInt(stock.toString()),
          brand,
          categoryL3Id: parseInt(categoryL3Id.toString()),
          isActive: true
        }
      });

      // اضافه کردن تصاویر
      if (imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: imageUrls.map((url: string) => ({
            url,
            productId: product.id
          }))
        });
      }

      return product;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('خطا در ایجاد محصول:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد محصول' },
      { status: 500 }
    );
  }
}
