import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

// تابع یافتن تصویر محصول از فولدر uploads
async function findProductImage(productId: number, productName: string): Promise<string> {
  try {
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads', 'products');
    
    // بررسی وجود فولدر
    try {
      await fs.access(uploadsPath);
    } catch {
      return '/default-product.svg';
    }
    
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
    
    return '/default-product.svg';
  } catch (error) {
    console.log('Error finding product image:', error);
    return '/default-product.svg';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const orderBy = searchParams.get('orderBy') || 'sold'; // sold, rating, recent

    // برای شروع، محصولات فعال را به عنوان پرفروش در نظر می‌گیریم
    // بعداً می‌توانید منطق واقعی فروش را اضافه کنید
    let orderByClause: any = { createdAt: 'desc' };

    switch (orderBy) {
      case 'sold':
        // فعلاً بر اساس تاریخ ایجاد مرتب می‌کنیم
        // بعداً می‌توانید بر اساس تعداد فروش واقعی مرتب کنید
        orderByClause = { createdAt: 'desc' };
        break;
      case 'rating':
        orderByClause = { averageRating: 'desc' };
        break;
      case 'recent':
        orderByClause = { createdAt: 'desc' };
        break;
      default:
        orderByClause = { createdAt: 'desc' };
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

    // دریافت محصولات فعال
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        categoryL3: {
          name: { not: 'نامعلوم' },
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
        brand: true,
        averageRating: true,
        hasDiscount: true,
        discountPercent: true,
        stock: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
        categoryL3: {
          select: {
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            orderItems: true,
            ratings: true,
            reviews: true
          }
        }
      },
      orderBy: orderByClause,
      take: limit
    });

    // فرمت کردن محصولات با تصاویر
    const formattedProducts = await Promise.all(products.map(async (product) => {
      let image = '/default-product.svg';
      
      // اولویت اول: تصاویر از دیتابیس
      if (product.images.length > 0) {
        image = product.images[0].url;
      } else {
        // اولویت دوم: جستجو در فولدر uploads
        image = await findProductImage(product.id, product.name);
      }

      // محاسبه قیمت نهایی و اصلی
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
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: finalPrice,
        comparePrice: originalPrice > finalPrice ? originalPrice : null,
        image: image,
        brand: product.brand,
        averageRating: product.averageRating || 0,
        hasDiscount: hasDiscount,
        discountPercent: product.discountPercent,
        salesCount: product._count.orderItems,
        ratingCount: product._count.ratings,
        reviewCount: product._count.reviews,
        category: product.categoryL3.name,
        categorySlug: product.categoryL3.slug,
        stock: product.stock,
        inStock: product.stock > 0,
        // محاسبه امتیاز محبوبیت (rating * فروش + تعداد نظرات)
        popularityScore: (product.averageRating || 0) * product._count.orderItems + product._count.reviews
      };
    }));

    // اگر ترتیب بر اساس محبوبیت باشد، بر اساس امتیاز محاسبه شده مرتب کنیم
    if (orderBy === 'popular') {
      formattedProducts.sort((a, b) => b.popularityScore - a.popularityScore);
    }

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length,
      orderBy,
      message: 'محصولات پرفروش با موفقیت دریافت شد'
    });

  } catch (error) {
    console.error('Error fetching best-selling products:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محصولات پرفروش' },
      { status: 500 }
    );
  }
} 