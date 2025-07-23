import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

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
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'time_remaining';

    const skip = (page - 1) * limit;

    console.log('🔍 API Discount Products called');
    console.log('📊 Query params:', { page, limit, sortBy });

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

    // Build where clause for discount products
    const where: any = {
      isActive: true,
      hasDiscount: true,
      discountEndDate: {
        gt: new Date() // Only products with future end dates
      },
      // فیلتر محصولات VIP
      OR: [
        { isVipOnly: false }, // محصولات عمومی
        ...(isUserVip ? [{ isVipOnly: true }] : []) // محصولات VIP فقط برای کاربران VIP
      ],
      // فیلتر کلی برای حذف محصولات "نامعلوم"
      categoryL3: {
        name: { not: 'نامعلوم' },
      },
    };

    // Build orderBy clause based on sortBy
    let orderBy: any = { discountEndDate: 'asc' }; // Default: sort by remaining time
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'discount_percent') {
      orderBy = { discountPercent: 'desc' };
    } else if (sortBy === 'time_remaining') {
      orderBy = { discountEndDate: 'asc' };
    }

    console.log('🔍 Querying database with where:', JSON.stringify(where, null, 2));

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
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
      prisma.product.count({ where }),
    ]);

    console.log(`📦 Found ${products.length} discount products out of ${total} total`);

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

      // Calculate remaining time for sorting
      const now = new Date().getTime();
      const endTime = product.discountEndDate ? new Date(product.discountEndDate).getTime() : 0;
      const remainingTime = endTime - now;

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
        remainingTime: remainingTime > 0 ? remainingTime : 0,
      };
    }));

    // Sort by remaining time if that's the requested sort
    if (sortBy === 'time_remaining') {
      productsWithImages.sort((a, b) => {
        // Products with no end date go to the end
        if (!a.discountEndDate && !b.discountEndDate) return 0;
        if (!a.discountEndDate) return 1;
        if (!b.discountEndDate) return -1;
        
        // Sort by remaining time (shortest first)
        return a.remainingTime - b.remainingTime;
      });
    }

    console.log('✅ Discount products processed successfully');

    return NextResponse.json({
      products: productsWithImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('💥 Error fetching discount products:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'خطا در دریافت محصولات تخفیف‌دار',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
} 