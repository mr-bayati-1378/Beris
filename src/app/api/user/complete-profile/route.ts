import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const {
      firstName,
      lastName,
      city,
      address,
      postCode,
      latitude,
      longitude
    } = await request.json();

    // اعتبارسنجی داده‌های ورودی
    if (!firstName || !lastName || !city || !address || !postCode) {
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدهای اجباری را پر کنید' },
        { status: 400 }
      );
    }

    // به‌روزرسانی اطلاعات کاربر
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        ...(latitude && longitude ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) } : {}),
        isProfileComplete: true,
        addresses: {
          create: {
            title: 'آدرس اصلی',
            address,
            city,
            state: city, // استفاده از شهر به عنوان استان
            zipCode: postCode,
            isDefault: true
          }
        }
      },
      include: {
        addresses: true
      }
    });

    return NextResponse.json({
      message: 'پروفایل با موفقیت تکمیل شد',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
        isProfileComplete: updatedUser.isProfileComplete,
        address: updatedUser.addresses[0]
      }
    });

  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json(
      { error: 'خطا در تکمیل پروفایل' },
      { status: 500 }
    );
  }
}
