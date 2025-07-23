import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { smsService } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'شماره تلفن و کد تایید الزامی است' },
        { status: 400 }
      );
    }

    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);

    // بررسی کد تایید
    const verification = await prisma.phoneVerification.findUnique({
      where: { phoneNumber: formattedPhone }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'کد تایید یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی انقضا
    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'کد تایید منقضی شده است' },
        { status: 400 }
      );
    }

    // بررسی تعداد تلاش‌ها
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌های مجاز تمام شده است' },
        { status: 429 }
      );
    }

    // بررسی صحت کد
    if (verification.code !== code) {
      // افزایش تعداد تلاش‌ها
      await prisma.phoneVerification.update({
        where: { phoneNumber: formattedPhone },
        data: { attempts: verification.attempts + 1 }
      });

      return NextResponse.json(
        { error: 'کد تایید اشتباه است' },
        { status: 400 }
      );
    }

    // تایید کد موفق - به‌روزرسانی وضعیت
    await prisma.phoneVerification.update({
      where: { phoneNumber: formattedPhone },
      data: { verified: true }
    });

    // اگر کاربر وجود دارد، شماره‌اش را تایید کن
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { phoneNumber: formattedPhone },
          { phone: formattedPhone }
        ]
      }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          phoneVerified: true,
          phoneNumber: formattedPhone
        }
      });
    }

    return NextResponse.json(
      { 
        message: 'شماره تلفن با موفقیت تایید شد',
        verified: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying phone:', error);
    return NextResponse.json(
      { error: 'خطای سرور. لطفاً دوباره تلاش کنید' },
      { status: 500 }
    );
  }
} 