import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

// تابع یافتن تصویر محصول از فولدر uploads
async function findProductImage(productId: number, productName: string): Promise<string> {
  try {
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads', 'products');
    const files = await fs.readdir(uploadsPath);
    
    // ابتدا فایل‌هایی که شامل ID محصول هستند را چک کنیم
    const idBasedFiles = files.filter(file => file.includes(productId.toString()));
    if (idBasedFiles.length > 0) {
      return `/uploads/products/${idBasedFiles[0]}`;
    }
    
    // تنظیم نام محصول برای جستجو
    const productNameLower = productName.toLowerCase().trim();
    
    // جستجوی دقیق: نام کامل محصول در نام فایل
    const exactMatch = files.find(file => {
      const fileName = file.toLowerCase();
      return fileName.includes(productNameLower);
    });
    
    if (exactMatch) {
      return `/uploads/products/${exactMatch}`;
    }
    
    // جستجوی کلمه کلیدی: بر اساس کلمات کلیدی
    const keywords = productNameLower.split(/[\s\-\_]+/).filter(word => word.length > 2);
    let bestMatch = '';
    let maxMatches = 0;
    
    for (const file of files) {
      const fileName = file.toLowerCase();
      let matches = 0;
      
      for (const keyword of keywords) {
        if (fileName.includes(keyword)) {
          matches++;
        }
      }
      
      if (matches > maxMatches && matches > 0) {
        maxMatches = matches;
        bestMatch = file;
      }
    }
    
    if (bestMatch) {
      return `/uploads/products/${bestMatch}`;
    }
    
    // جستجوی فازی: بر اساس کلمات مشابه
    const commonWords = ['سرنگ', 'دستکش', 'شان', 'گاز', 'آب', 'چسب', 'نخ', 'آنژیوکت', 'مقطر', 'استریل'];
    
    for (const word of commonWords) {
      if (productNameLower.includes(word)) {
        const fuzzyMatch = files.find(file => file.toLowerCase().includes(word));
        if (fuzzyMatch) {
          return `/uploads/products/${fuzzyMatch}`;
        }
      }
    }
    
    // در صورت عدم یافتن، تصویر پیش‌فرض
    return '/default-product.svg';
  } catch (error) {
    console.log('Error finding product image:', error);
    return '/default-product.svg';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  let timeoutId: NodeJS.Timeout | undefined;
  
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand');
    const rating = searchParams.get('rating');
    const inStock = searchParams.get('inStock') === 'true';
    const hasDiscount = searchParams.get('hasDiscount') === 'true';

    // Add timeout handling
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const skip = (page - 1) * limit;

    // Build price filter
    const priceFilter: any = {};
    if (minPrice) priceFilter.gte = parseInt(minPrice);
    if (maxPrice) priceFilter.lte = parseInt(maxPrice);

    // Build rating filter (products with rating >= specified)
    const ratingFilter = rating ? parseFloat(rating) : undefined;

    // Build brand filter
    const brandFilter = brand ? { contains: brand } : undefined;

    // Build orderBy based on sortBy parameter
    let orderBy: any = { createdAt: 'desc' }; // پیش‌فرض: جدیدترین
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'popular':
        // در آینده می‌توان بر اساس تعداد فروش مرتب کرد
        orderBy = { createdAt: 'desc' };
        break;
      case 'discount':
        // در آینده می‌توان بر اساس درصد تخفیف مرتب کرد
        orderBy = { createdAt: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Get products based on category level
    let products: any[] = [];
    let categoryInfo: any = {};

    // First try Level 3 category
    const categoryL3 = await prisma.categoryL3.findUnique({
      where: { slug: params.slug },
      include: {
        categoryL2: {
          include: {
            categoryL1: true
          }
        }
      }
    });

    if (categoryL3) {
      categoryInfo = {
        id: categoryL3.id,
        name: categoryL3.name,
        slug: categoryL3.slug,
        level: 3,
        parent: {
          id: categoryL3.categoryL2.id,
          name: categoryL3.categoryL2.name,
          slug: categoryL3.categoryL2.slug,
          parent: {
            id: categoryL3.categoryL2.categoryL1.id,
            name: categoryL3.categoryL2.categoryL1.name,
            slug: categoryL3.categoryL2.categoryL1.slug,
          }
        }
      };

      const whereClause: any = {
        categoryL3Id: categoryL3.id,
        isActive: true,
        // فیلتر محصولات VIP
        OR: [
          { isVipOnly: false }, // محصولات عمومی
          ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
        ],
      };

      if (Object.keys(priceFilter).length > 0) whereClause.price = priceFilter;
      if (brandFilter) whereClause.brand = brandFilter;
      if (inStock) whereClause.stock = { gt: 0 };
      if (hasDiscount) whereClause.hasDiscount = true;

      products = await prisma.product.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            select: { url: true },
            take: 1
          },
          categoryL3: true,
          ratings: {
            select: { rating: true }
          },
          reviews: {
            select: { rating: true }
          }
        }
      });
    } else {
      // Try Level 2 category
      const categoryL2 = await prisma.categoryL2.findUnique({
        where: { slug: params.slug },
        include: {
          categoryL1: true,
          categoryL3s: true
        }
      });

      if (categoryL2) {
        categoryInfo = {
          id: categoryL2.id,
          name: categoryL2.name,
          slug: categoryL2.slug,
          level: 2,
          parent: {
            id: categoryL2.categoryL1.id,
            name: categoryL2.categoryL1.name,
            slug: categoryL2.categoryL1.slug,
          },
          subcategories: categoryL2.categoryL3s.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
          }))
        };

        const whereClause: any = {
          categoryL3: {
            categoryL2Id: categoryL2.id
          },
          isActive: true,
          // فیلتر محصولات VIP
          OR: [
            { isVipOnly: false }, // محصولات عمومی
            ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
          ],
        };

        if (Object.keys(priceFilter).length > 0) whereClause.price = priceFilter;
        if (brandFilter) whereClause.brand = brandFilter;
        if (inStock) whereClause.stock = { gt: 0 };
        if (hasDiscount) whereClause.hasDiscount = true;

        products = await prisma.product.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
          include: {
            images: {
              select: { url: true },
              take: 1
            },
            categoryL3: true,
            ratings: {
              select: { rating: true }
            },
            reviews: {
              select: { rating: true }
            }
          }
        });
      } else {
        // Try Level 1 category
        const categoryL1 = await prisma.categoryL1.findUnique({
          where: { slug: params.slug },
          include: {
            categoryL2s: {
              include: {
                categoryL3s: true
              }
            }
          }
        });

        if (categoryL1) {
          categoryInfo = {
            id: categoryL1.id,
            name: categoryL1.name,
            slug: categoryL1.slug,
            level: 1,
            subcategories: categoryL1.categoryL2s.map(cat => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              subcategories: cat.categoryL3s.map(subcat => ({
                id: subcat.id,
                name: subcat.name,
                slug: subcat.slug,
              }))
            }))
          };

          const whereClause: any = {
            categoryL3: {
              categoryL2: {
                categoryL1Id: categoryL1.id
              }
            },
            isActive: true
          };

          if (Object.keys(priceFilter).length > 0) whereClause.price = priceFilter;
          if (brandFilter) whereClause.brand = brandFilter;
          if (inStock) whereClause.stock = { gt: 0 };
          if (hasDiscount) whereClause.hasDiscount = true;

          products = await prisma.product.findMany({
            where: whereClause,
            orderBy,
            skip,
            take: limit,
            include: {
              images: {
                select: { url: true },
                take: 1
              },
              categoryL3: true,
              ratings: {
                select: { rating: true }
              },
              reviews: {
                select: { rating: true }
              }
            }
          });
        }
      }
    }

    if (!categoryInfo.id) {
      console.log('Category not found for slug:', params.slug);
      
      // Try to find any category with this slug in any level
      const allCategories = await Promise.all([
        prisma.categoryL1.findMany({ select: { slug: true, name: true } }),
        prisma.categoryL2.findMany({ select: { slug: true, name: true } }),
        prisma.categoryL3.findMany({ select: { slug: true, name: true } })
      ]);
      
      console.log('Available L1 slugs:', allCategories[0].map(c => c.slug));
      console.log('Available L2 slugs:', allCategories[1].map(c => c.slug));
      console.log('Available L3 slugs:', allCategories[2].map(c => c.slug));
      
      return NextResponse.json(
        { error: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    // If this is L1 or L2 category and user wants to see subcategories instead of products
    if (categoryInfo.level <= 2 && categoryInfo.subcategories && products.length === 0) {
      return NextResponse.json({
        type: categoryInfo.level === 1 ? 'L1' : 'L2',
        category: categoryInfo,
        children: categoryInfo.subcategories,
        filters: { brands: [], priceRange: { min: 0, max: 0 } },
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });
    }

    // Get total count for pagination (with filters applied)
    let totalProducts = 0;
    if (categoryInfo.level === 3) {
      const countWhereClause: any = {
        categoryL3Id: categoryInfo.id,
        isActive: true
      };
      if (Object.keys(priceFilter).length > 0) countWhereClause.price = priceFilter;
      if (brandFilter) countWhereClause.brand = brandFilter;
      if (inStock) countWhereClause.stock = { gt: 0 };
      if (hasDiscount) countWhereClause.hasDiscount = true;
      
      totalProducts = await prisma.product.count({ where: countWhereClause });
    } else if (categoryInfo.level === 2) {
      const countWhereClause: any = {
        categoryL3: { categoryL2Id: categoryInfo.id },
        isActive: true
      };
      if (Object.keys(priceFilter).length > 0) countWhereClause.price = priceFilter;
      if (brandFilter) countWhereClause.brand = brandFilter;
      if (inStock) countWhereClause.stock = { gt: 0 };
      if (hasDiscount) countWhereClause.hasDiscount = true;
      
      totalProducts = await prisma.product.count({ where: countWhereClause });
    } else if (categoryInfo.level === 1) {
      const countWhereClause: any = {
        categoryL3: { categoryL2: { categoryL1Id: categoryInfo.id } },
        isActive: true
      };
      if (Object.keys(priceFilter).length > 0) countWhereClause.price = priceFilter;
      if (brandFilter) countWhereClause.brand = brandFilter;
      if (inStock) countWhereClause.stock = { gt: 0 };
      if (hasDiscount) countWhereClause.hasDiscount = true;
      
      totalProducts = await prisma.product.count({ where: countWhereClause });
    }

    // Format products with images, ratings, and proper pricing
    const formattedProducts = await Promise.all(products.map(async (product: any) => {
      let img = '/default-product.svg';
      
      // اولویت اول: تصاویر از دیتابیس
      if (product.images.length > 0) {
        img = product.images[0].url;
      } else {
        // اولویت دوم: جستجو در فولدر uploads
        img = await findProductImage(product.id, product.name);
      }

      // Calculate average rating
      const allRatings = [...(product.ratings || []), ...(product.reviews || [])];
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / allRatings.length 
        : 0;

      // Apply rating filter if specified
      if (ratingFilter && averageRating < ratingFilter) {
        return null; // This product doesn't meet rating criteria
      }

      // Calculate correct pricing
      let finalPrice = Number(product.price);
      let originalPrice = Number(product.price);
      let hasDiscount = product.hasDiscount && product.discountPercent > 0;

      if (hasDiscount && product.discountPercent > 0) {
        finalPrice = Number(product.price);
        originalPrice = Math.round(finalPrice / (1 - product.discountPercent / 100));
      } else if (product.comparePrice && product.comparePrice > product.price) {
        originalPrice = Number(product.comparePrice);
        finalPrice = Number(product.price);
        hasDiscount = true;
        const calculatedDiscount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
        product.discountPercent = product.discountPercent || calculatedDiscount;
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        brand: product.brand,
        price: originalPrice,
        finalPrice: finalPrice,
        originalPrice: originalPrice,
        comparePrice: product.comparePrice,
        img,
        images: [img],
        stock: product.stock,
        hasDiscount: hasDiscount,
        discountPercent: product.discountPercent,
        averageRating,
        reviewCount: allRatings.length,
        category: product.categoryL3,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    }));

    // Filter out null products (those that didn't meet rating criteria)
    const validProducts = formattedProducts.filter(product => product !== null);

    // Generate filters information for frontend
    let allProductsForFilters: any[] = [];
    
    // Get all products in this category for filter generation (without current filters applied)
    if (categoryInfo.level === 3) {
      allProductsForFilters = await prisma.product.findMany({
        where: { categoryL3Id: categoryInfo.id, isActive: true },
        select: { brand: true, price: true, comparePrice: true }
      });
    } else if (categoryInfo.level === 2) {
      allProductsForFilters = await prisma.product.findMany({
        where: { categoryL3: { categoryL2Id: categoryInfo.id }, isActive: true },
        select: { brand: true, price: true, comparePrice: true }
      });
    } else if (categoryInfo.level === 1) {
      allProductsForFilters = await prisma.product.findMany({
        where: { categoryL3: { categoryL2: { categoryL1Id: categoryInfo.id } }, isActive: true },
        select: { brand: true, price: true, comparePrice: true }
      });
    }

    // Extract unique brands
    const brands = [...new Set(allProductsForFilters.map(p => p.brand).filter(Boolean))];
    
    // Calculate price range
    const prices = allProductsForFilters.map(p => Number(p.price));
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0
    };

    const filters = {
      brands,
      priceRange
    };

    clearTimeout(timeoutId);
    return NextResponse.json({
      category: categoryInfo,
      products: validProducts,
      filters,
      pagination: {
        page,
        limit,
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit)
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching category:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'درخواست با مشکل مواجه شد. لطفاً دوباره تلاش کنید.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات دسته‌بندی' },
      { status: 500 }
    );
  }
}
