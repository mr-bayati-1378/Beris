import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'شناسه محصول نامعتبر است' }, { status: 400 });
    }

    // بررسی وجود محصول
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'هیچ فایلی انتخاب نشده' }, { status: 400 });
    }

    const uploadedImages = [];

    // ایجاد پوشه آپلود در صورت عدم وجود
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      // بررسی نوع فایل
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: `فرمت فایل ${file.name} مجاز نیست. فقط JPG, PNG و WebP پشتیبانی می‌شود` 
        }, { status: 400 });
      }

      // بررسی اندازه فایل (حداکثر 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ 
          error: `حجم فایل ${file.name} بیش از 5 مگابایت است` 
        }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // تولید نام فایل منحصر به فرد
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filename = `product_${productId}_${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filepath = join(uploadDir, filename);

      // ذخیره فایل
      await writeFile(filepath, buffer);

      // URL عمومی فایل
      const fileUrl = `/uploads/products/${filename}`;

      // ذخیره اطلاعات تصویر در دیتابیس
      const savedImage = await prisma.productImage.create({
        data: {
          url: fileUrl,
          productId: productId
        }
      });

      uploadedImages.push({
        id: savedImage.id,
        url: fileUrl,
        filename: filename
      });
    }

    return NextResponse.json({ 
      message: `${uploadedImages.length} تصویر با موفقیت آپلود شد`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('خطا در آپلود تصاویر:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود تصاویر' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// دریافت تصاویر یک محصول
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'شناسه محصول نامعتبر است' }, { status: 400 });
    }

    const images = await prisma.productImage.findMany({
      where: { productId: productId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ images });

  } catch (error) {
    console.error('خطا در دریافت تصاویر:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تصاویر' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 