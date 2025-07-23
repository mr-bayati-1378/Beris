import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// دریافت تنظیمات کاربر
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      // ایجاد تنظیمات پیش‌فرض اگر وجود نداشته باشد
      const defaultPreferences = await prisma.userPreference.create({
        data: {
          userId: session.user.id,
        },
      });
      return NextResponse.json(defaultPreferences);
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات کاربر' },
      { status: 500 }
    );
  }
}

// بروزرسانی تنظیمات کاربر
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { emailNotifications, smsNotifications, theme } = data;

    const preferences = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications,
        smsNotifications,
        theme,
      },
      create: {
        userId: session.user.id,
        emailNotifications,
        smsNotifications,
        theme,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی تنظیمات کاربر' },
      { status: 500 }
    );
  }
}
