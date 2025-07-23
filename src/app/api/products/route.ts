import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

// تابع یافتن تصویر محصول از فولدر uploads
async function findProductImage(productId: number, productName: string): Promise<string> {
  try {
    // اولویت اول: جستجو در پوشه Pic
    const picPath = path.join(process.cwd(), 'Pic');
    
    try {
      await fs.access(picPath);
      const picFiles = await fs.readdir(picPath);
      
      // ابتدا فایل‌هایی که شامل ID محصول هستند را چک کنیم
      const idBasedFiles = picFiles.filter(file => file.includes(productId.toString()));
      if (idBasedFiles.length > 0) {
        return `/Pic/${idBasedFiles[0]}`;
      }
      
      // جستجو بر اساس نام محصول
      const productNameLower = productName.toLowerCase().trim();
      const nameBasedFiles = picFiles.filter(file => {
        const fileName = file.toLowerCase();
        return fileName.includes(productNameLower);
      });
      
      if (nameBasedFiles.length > 0) {
        return `/Pic/${nameBasedFiles[0]}`;
      }
    } catch (picError) {
      console.log('Pic folder not accessible:', picError);
    }
    
    // اولویت دوم: جستجو در پوشه uploads (برای سازگاری)
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads', 'products');
    
    try {
      await fs.access(uploadsPath);
      const uploadsFiles = await fs.readdir(uploadsPath);
      
      // ابتدا فایل‌هایی که شامل ID محصول هستند را چک کنیم
      const idBasedFiles = uploadsFiles.filter(file => file.includes(productId.toString()));
      if (idBasedFiles.length > 0) {
        return `/uploads/products/${idBasedFiles[0]}`;
      }
      
      // تنظیم نام محصول برای جستجو
      const productNameLower = productName.toLowerCase().trim();
      
      // جستجوی دقیق: نام کامل محصول در نام فایل
      const exactMatch = uploadsFiles.find(file => {
        const fileName = file.toLowerCase();
        return fileName.includes(productNameLower);
      });
      
      if (exactMatch) {
        return `/uploads/products/${exactMatch}`;
      }
    } catch (uploadsError) {
      console.log('Uploads folder not accessible:', uploadsError);
    }
    
    // در صورت عدم یافتن، تصویر پیش‌فرض
    return '/default-product.svg';
  } catch (error) {
    console.log('Error finding product image:', error);
    return '/default-product.svg';
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 API Products called');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = searchParams.get('limit') || '12';
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy');
    const hasDiscount = searchParams.get('hasDiscount') === 'true';
    const inStock = searchParams.get('inStock') === 'true';
    const brand = searchParams.get('brand');

    // If limit is 'all', get all products without pagination
    const isGetAll = limit === 'all';
    const take = isGetAll ? undefined : parseInt(limit);
    const skip = isGetAll ? undefined : (page - 1) * (take || 12);

    console.log('📊 Query params:', { page, limit, category, search, sortBy, isGetAll });

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
      console.log('Session check error (non-critical):', sessionError);
    }

    // Build where clause
    const where: any = {
      isActive: true,
      // فیلتر محصولات VIP
      OR: [
        { isVipOnly: false }, // محصولات عمومی
        ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
      ],
    };

    // فیلتر دسته‌بندی
    if (category) {
      where.categoryL3 = { 
        slug: category,
      };
    }
    // حذف موقت فیلتر "نامعلوم" تا همه محصولات نمایش داده شوند
    // where.categoryL3 = {
    //   name: { not: 'نامعلوم' },
    // };

    if (hasDiscount) {
      where.hasDiscount = true;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (brand) {
      where.brand = { contains: brand };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (hasDiscount) {
      // برای محصولات تخفیف‌دار، بر اساس زمان باقی‌مانده مرتب کن
      orderBy = { discountEndDate: 'asc' };
    }

    console.log('🔍 Querying database with where:', JSON.stringify(where, null, 2));

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          price: true,
          comparePrice: true,
          slug: true,
          brand: true,
          description: true,
          stock: true,
          isActive: true,
          hasDiscount: true,
          discountPercent: true,
          discountStartDate: true,
          discountEndDate: true,
          categoryL3: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            select: { url: true },
            take: 1,
          },
        },
      }),
      isGetAll ? Promise.resolve(0) : prisma.product.count({ where }),
    ]);

    console.log(`📦 Found ${products.length} products${isGetAll ? '' : ` out of ${total} total`}`);

    // Add images and correct pricing to products
    const productsWithImages = await Promise.all(products.map(async (product) => {
      let img = '/default-product.svg';
      
      // اولویت اول: تصاویر از دیتابیس
      if (product.images.length > 0) {
        img = product.images[0].url;
      } else {
        // اولویت دوم: جستجو در فولدر uploads
        img = await findProductImage(product.id, product.name);
      }

      // Calculate correct pricing
      let finalPrice = Number(product.price);
      let originalPrice = Number(product.price);
      let hasDiscount = product.hasDiscount && product.discountPercent > 0;

      if (hasDiscount && product.discountPercent > 0) {
        // If has discount, the price field is the final price after discount
        finalPrice = Number(product.price);
        // Calculate original price from final price and discount percent
        originalPrice = Math.round(finalPrice / (1 - product.discountPercent / 100));
      } else if (product.comparePrice && product.comparePrice > product.price) {
        // If comparePrice is set and higher than price, use it as original
        originalPrice = Number(product.comparePrice);
        finalPrice = Number(product.price);
        hasDiscount = true;
        // Calculate discount percent if not set
        const calculatedDiscount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
        product.discountPercent = product.discountPercent || calculatedDiscount;
      }

      return { 
        ...product, 
        img,
        images: [img], // Convert to array format expected by components
        averageRating: 0, // Default rating
        reviewCount: 0, // Default review count
        category: product.categoryL3, // For backward compatibility
        price: originalPrice, // Display original price
        finalPrice: finalPrice, // Actual selling price
        originalPrice: originalPrice,
        hasDiscount: hasDiscount,
        discountPercent: product.discountPercent || 0,
      };
    }));

    return NextResponse.json({
      products: productsWithImages,
      total: isGetAll ? products.length : total,
      page: isGetAll ? 1 : page,
      totalPages: isGetAll ? 1 : Math.ceil(total / (take || 12)),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محصولات' },
      { status: 500 }
    );
  }
}
