import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// دریافت یک محصول
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'شناسه محصول نامعتبر است' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          select: {
            id: true,
            url: true
          }
        },
        categoryL3: {
          include: {
            categoryL2: {
              include: {
                categoryL1: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('خطا در دریافت محصول:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محصول' },
      { status: 500 }
    );
  }
}

// به‌روزرسانی محصول
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'شناسه محصول نامعتبر است' },
        { status: 400 }
      );
    }

    // Check if product exists
    const productExists = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!productExists) {
      return NextResponse.json(
        { error: 'محصول مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      discountPercent,
      hasDiscount,
      discountStartDate,
      discountEndDate,
      stock,
      brand,
      categoryL3Id,
      isActive,
      newImageUrls,
      imagesToDelete
    } = body;

    // Validate required fields with specific error messages
    const validationErrors: string[] = [];
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      validationErrors.push('نام محصول الزامی است');
    }
    
    if (typeof price !== 'number' || price <= 0) {
      validationErrors.push('قیمت باید عددی مثبت باشد');
    }
    
    if (typeof stock !== 'number' || stock < 0) {
      validationErrors.push('موجودی باید عدد صفر یا مثبت باشد');
    }
    
    if (!categoryL3Id || typeof categoryL3Id !== 'number' || categoryL3Id <= 0) {
      validationErrors.push('انتخاب دسته‌بندی الزامی است');
    }

    // محاسبه comparePrice برای محصولات تخفیف‌دار
    let calculatedComparePrice = comparePrice;
    if (hasDiscount) {
      if (!discountPercent || typeof discountPercent !== 'number' || discountPercent <= 0 || discountPercent >= 100) {
        validationErrors.push('درصد تخفیف باید بین 1 تا 99 باشد');
      }
      
      // اعتبارسنجی تاریخ‌های تخفیف
      if (discountStartDate && discountEndDate) {
        const startDate = new Date(discountStartDate);
        const endDate = new Date(discountEndDate);
        const now = new Date();
        
        if (startDate >= endDate) {
          validationErrors.push('تاریخ شروع تخفیف باید قبل از تاریخ پایان باشد');
        }
        
        if (endDate <= now) {
          validationErrors.push('تاریخ پایان تخفیف باید در آینده باشد');
        }
      } else if (discountStartDate || discountEndDate) {
        validationErrors.push('هر دو تاریخ شروع و پایان تخفیف باید وارد شوند');
      }
      
      // محاسبه comparePrice از price و discountPercent
      // price = قیمت نهایی، comparePrice = قیمت اصلی
      if (price && discountPercent) {
        calculatedComparePrice = Math.round(price / (1 - discountPercent / 100));
      }
    }

    if (validationErrors.length > 0) {
      console.error('خطای اعتبارسنجی:', { name, price, stock, categoryL3Id, validationErrors });
      return NextResponse.json(
        { error: 'خطاهای اعتبارسنجی:\n• ' + validationErrors.join('\n• ') },
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

    // Check if the slug exists for any other product
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug: baseSlug,
        id: { not: productId }
      }
    });

    // If slug exists, append the product ID to make it unique
    const slug = existingProduct ? `${baseSlug}-${productId}` : baseSlug;

    // شروع تراکنش
    const result = await prisma.$transaction(async (tx) => {
      // به‌روزرسانی محصول
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          slug,
          description,
          price: parseFloat(price.toString()),
          comparePrice: calculatedComparePrice ? parseFloat(calculatedComparePrice.toString()) : null,
          discountPercent: discountPercent ? parseInt(discountPercent.toString()) : null,
          hasDiscount: hasDiscount || false,
          discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
          discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
          stock: parseInt(stock.toString()),
          brand,
          categoryL3Id: parseInt(categoryL3Id.toString()),
          isActive
        }
      });

      // حذف تصاویر انتخاب شده
      if (imagesToDelete && imagesToDelete.length > 0) {
        await tx.productImage.deleteMany({
          where: {
            id: { in: imagesToDelete },
            productId: productId
          }
        });
      }

      // اضافه کردن تصاویر جدید
      if (newImageUrls && newImageUrls.length > 0) {
        await tx.productImage.createMany({
          data: newImageUrls.map((url: string) => ({
            url,
            productId: productId
          }))
        });
      }

      // Update the main image field with the first image
      const updatedImages = await tx.productImage.findMany({
        where: { productId: productId },
        orderBy: { id: 'asc' }
      });

      if (updatedImages.length > 0) {
        await tx.product.update({
          where: { id: productId },
          data: {
            image: updatedImages[0].url
          }
        });
      }

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('خطا در به‌روزرسانی محصول:', error);
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'خطا در به‌روزرسانی محصول';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// حذف محصول
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'شناسه محصول نامعتبر است' },
        { status: 400 }
      );
    }

    // بررسی وجود محصول
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    // حذف محصول و تصاویر مرتبط در transaction
    await prisma.$transaction(async (tx) => {
      // حذف تصاویر محصول
      await tx.productImage.deleteMany({
        where: { productId: productId }
      });

      // حذف محصول
      await tx.product.delete({
        where: { id: productId }
      });
    });

    return NextResponse.json({ message: 'محصول با موفقیت حذف شد' });
  } catch (error) {
    console.error('خطا در حذف محصول:', error);
    
    // بررسی خطای constraint برای پیام بهتر
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'این محصول در سفارشات استفاده شده و قابل حذف نیست' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'خطا در حذف محصول' },
      { status: 500 }
    );
  }
} 