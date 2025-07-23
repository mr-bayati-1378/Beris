import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { ensureUploadDirs } from '@/lib/uploads';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'لطفا وارد حساب کاربری خود شوید' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        profileImage: user.profileImage,
        phoneVerified: user.phoneVerified,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'خطا در سرور داخلی' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const data = await request.json();
    const { firstName, lastName, email } = data;

    // Validate input
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'نام و نام خانوادگی الزامی است' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        email: email || undefined,
      },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        }
      }
    });

    return NextResponse.json({ 
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        phoneVerified: updatedUser.phoneVerified,
        isProfileComplete: updatedUser.isProfileComplete,
        createdAt: updatedUser.createdAt,
        addresses: updatedUser.addresses
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'خطا در سرور داخلی' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'لطفا ابتدا وارد حساب کاربری خود شوید' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('profileImage') as File;

    if (!file) {
      return NextResponse.json({ error: 'فایلی انتخاب نشده است' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'فقط فایل‌های تصویری (JPG, PNG, WebP) مجاز هستند' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'حجم فایل باید کمتر از ۵ مگابایت باشد' }, { status: 400 });
    }

    // Get current user to check if they have an existing profile image
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileImage: true }
    });

    // Delete old profile image if exists
    if (currentUser?.profileImage) {
      try {
        const oldImagePath = join(process.cwd(), 'public', currentUser.profileImage);
        await unlink(oldImagePath);
      } catch (error) {
        console.log('Old profile image not found or already deleted:', error);
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directories exist
    ensureUploadDirs();

    // Create unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `profile-${session.user.id}-${Date.now()}.${fileExtension}`;
    const publicPath = join(process.cwd(), 'public', 'uploads', 'profiles');
    const fullPath = join(publicPath, filename);

    // Ensure the directory exists
    const { mkdirSync, existsSync } = await import('fs');
    if (!existsSync(publicPath)) {
      mkdirSync(publicPath, { recursive: true });
    }

    // Write new file
    await writeFile(fullPath, buffer);

    // Update user profile image in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileImage: `/uploads/profiles/${filename}`
      },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        }
      }
    });

    return NextResponse.json({ 
      message: 'تصویر پروفایل با موفقیت آپلود شد',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        phoneVerified: updatedUser.phoneVerified,
        isProfileComplete: updatedUser.isProfileComplete,
        createdAt: updatedUser.createdAt,
        addresses: updatedUser.addresses
      }
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json({ error: 'خطا در آپلود تصویر. لطفا دوباره تلاش کنید' }, { status: 500 });
  }
}
