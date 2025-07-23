import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { smsService } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'شماره تلفن الزامی است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره تلفن
    if (!smsService.isValidIranianPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'شماره تلفن نامعتبر است' },
        { status: 400 }
      );
    }

    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);

    // بررسی وجود کاربر
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { phoneNumber: formattedPhone },
          { phone: formattedPhone }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این شماره تلفن یافت نشد' },
        { status: 404 }
      );
    }

    // تولید کد بازیابی
    const resetCode = smsService.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقیقه

    // ذخیره کد در دیتابیس
    await prisma.passwordReset.create({
      data: {
        phoneNumber: formattedPhone,
        code: resetCode,
        expiresAt,
        attempts: 0
      }
    });

    // ارسال پیامک
    const smsResult = await smsService.sendPasswordResetCode(formattedPhone, resetCode);

    if (!smsResult) {
      return NextResponse.json(
        { error: 'خطا در ارسال پیامک. لطفاً دوباره تلاش کنید' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'کد بازیابی رمز عبور ارسال شد',
        phoneNumber: formattedPhone
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending password reset code:', error);
    return NextResponse.json(
      { error: 'خطای سرور. لطفاً دوباره تلاش کنید' },
      { status: 500 }
    );
  }
} 