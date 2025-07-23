import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

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
  try {
    // بررسی وضعیت VIP کاربر
    const session = await auth();
    const isUserVip = session?.user?.id ? (
      await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isVip: true }
      })
    )?.isVip || false : false;

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        categoryL3: {
          include: {
            categoryL2: {
              include: {
                categoryL1: true,
              },
            },
          },
        },
        images: {
          select: {
            url: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        ratings: {
          select: {
            rating: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }

    // بررسی دسترسی به محصولات VIP
    if (product.isVipOnly && !isUserVip) {
      return NextResponse.json({ 
        error: 'این محصول فقط برای مشتریان VIP در دسترس است' 
      }, { status: 403 });
    }

    // Get related products (products from the same category)
    let relatedProducts = await prisma.product.findMany({
      where: {
        categoryL3Id: product.categoryL3Id,
        id: { not: product.id },
        isActive: true,
      },
      take: 8,
      select: {
        id: true,
        name: true,
        price: true,
        comparePrice: true,
        slug: true,
        brand: true,
        description: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If no products in same L3 category, try L2 category
    if (relatedProducts.length < 4) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          categoryL3: {
            categoryL2Id: product.categoryL3.categoryL2Id,
          },
          id: { 
            not: product.id,
            notIn: relatedProducts.map(p => p.id)
          },
          isActive: true,
        },
        take: 8 - relatedProducts.length,
        select: {
          id: true,
          name: true,
          price: true,
          comparePrice: true,
          slug: true,
          brand: true,
          description: true,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      relatedProducts = [...relatedProducts, ...additionalProducts];
    }

    // If still not enough, get popular products
    if (relatedProducts.length < 4) {
      const popularProducts = await prisma.product.findMany({
        where: {
          id: { 
            not: product.id,
            notIn: relatedProducts.map(p => p.id)
          },
          isActive: true,
        },
        take: 8 - relatedProducts.length,
        select: {
          id: true,
          name: true,
          price: true,
          comparePrice: true,
          slug: true,
          brand: true,
          description: true,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      relatedProducts = [...relatedProducts, ...popularProducts];
    }

    // Prepare images array for main product
    const productImages: any[] = [];
    
    // اولویت اول: تصاویر از دیتابیس
    if (product.images.length > 0) {
      productImages.push(...product.images.map(img => img.url));
    } else {
      // اولویت دوم: جستجو در فولدر uploads
      const foundImage = await findProductImage(product.id, product.name);
      productImages.push(foundImage);
    }

    // If no images, add default
    if (productImages.length === 0) {
      productImages.push('/default-product.svg');
    }

    // Calculate average rating
    const allRatings = [...(product.ratings || []), ...(product.reviews || [])];
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
      : 0;

    // Calculate final price and original price based on discount
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

    // Format the response
    const formattedProduct = {
      ...product,
      price: originalPrice, // This becomes the display original price
      finalPrice: finalPrice, // This is the actual selling price
      originalPrice: originalPrice,
      hasDiscount: hasDiscount,
      category: {
        id: product.categoryL3.id,
        name: product.categoryL3.name,
        slug: product.categoryL3.slug,
      },
      rating: {
        average: Math.round(averageRating * 10) / 10,
        count: allRatings.length,
      },
      specifications: {
        'دسته‌بندی اصلی': product.categoryL3.categoryL2.categoryL1.name,
        'دسته‌بندی فرعی': product.categoryL3.categoryL2.name,
        دسته‌بندی: product.categoryL3.name,
        برند: product.brand || 'بدون برند',
      },
      images: productImages,
    };

    // Add images and calculate final prices for related products
    const formattedRelatedProducts = await Promise.all(relatedProducts.map(async (p) => {
      let img = '/default-product.svg';
      
      // اولویت اول: تصاویر از دیتابیس
      if (p.images.length > 0) {
        img = p.images[0].url;
      } else {
        // اولویت دوم: جستجو در فولدر uploads
        img = await findProductImage(p.id, p.name);
      }

      const finalPrice = Number(p.price);
      const originalPrice = p.comparePrice ? Number(p.comparePrice) : null;

      return { 
        ...p, 
        img,
        price: finalPrice,
        originalPrice,
        finalPrice
      };
    }));

    const response = NextResponse.json({
      product: formattedProduct,
      relatedProducts: formattedRelatedProducts,
    });

    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات محصول' },
      { status: 500 }
    );
  }
}
