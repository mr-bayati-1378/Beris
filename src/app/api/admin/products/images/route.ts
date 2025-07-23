import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'فایل انتخاب نشده' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'فرمت فایل مجاز نیست. فقط JPG, PNG و WebP پشتیبانی می‌شود' 
      }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'حجم فایل بیش از 5 مگابایت است' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/products/${filename}`;

    return NextResponse.json({ 
      message: 'فایل با موفقیت آپلود شد',
      url: fileUrl,
      filename: filename
    });

  } catch (error) {
    console.error('خطا در آپلود فایل:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود فایل' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return list of uploaded images
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products');
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ images: [] });
    }

    const fs = require('fs');
    const files = fs.readdirSync(uploadsDir);
    const images = files
      .filter((file: string) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map((file: string) => ({
        filename: file,
        url: `/uploads/products/${file}`,
        uploadedAt: fs.statSync(join(uploadsDir, file)).mtime
      }))
      .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({ images });

  } catch (error) {
    console.error('خطا در دریافت لیست تصاویر:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست تصاویر' },
      { status: 500 }
    );
  }
}
