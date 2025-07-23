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
      title,
      city,
      address,
      state,
      postCode,
      zipCode,
      latitude,
      longitude
    } = await request.json();

    // Handle both postCode and zipCode for compatibility
    const finalPostCode = postCode || zipCode;

    // اعتبارسنجی داده‌های ورودی
    if (!city || !address || !finalPostCode) {
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدهای اجباری را پر کنید' },
        { status: 400 }
      );
    }

    // بررسی اینکه آیا کاربر آدرس قبلی دارد یا نه
    const existingAddresses = await prisma.address.findMany({
      where: { userId: session.user.id }
    });

    // اضافه کردن آدرس جدید
    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        title: title || (existingAddresses.length === 0 ? 'آدرس اصلی' : `آدرس ${existingAddresses.length + 1}`),
        address,
        city,
        state: state || city, // استفاده از state اگر ارسال شده، در غیر این صورت از شهر
        zipCode: finalPostCode,
        isDefault: existingAddresses.length === 0 // اولین آدرس پیش‌فرض می‌شود
      }
    });

    // اگر موقعیت جغرافیایی ارسال شده، آن را در پروفایل کاربر ذخیره کن
    if (latitude && longitude) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          latitude: parseFloat(latitude), 
          longitude: parseFloat(longitude) 
        }
      });
    }

    return NextResponse.json({
      message: 'آدرس با موفقیت اضافه شد',
      address: newAddress
    });

  } catch (error) {
    console.error('Add address error:', error);
    return NextResponse.json(
      { error: 'خطا در اضافه کردن آدرس' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const { addressId, setAsDefault } = await request.json();

    if (!addressId) {
      return NextResponse.json(
        { error: 'شناسه آدرس الزامی است' },
        { status: 400 }
      );
    }

    // بررسی اینکه آدرس به این کاربر تعلق دارد
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id
      }
    });

    if (!address) {
      return NextResponse.json(
        { error: 'آدرس یافت نشد' },
        { status: 404 }
      );
    }

    if (setAsDefault) {
      // ابتدا همه آدرس‌های کاربر را غیرپیش‌فرض کن
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });

      // سپس آدرس انتخاب شده را پیش‌فرض کن
      await prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true }
      });
    }

    return NextResponse.json({
      message: 'آدرس با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی آدرس' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' }
    });

    return NextResponse.json({ addresses });

  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آدرس‌ها' },
      { status: 500 }
    );
  }
} 