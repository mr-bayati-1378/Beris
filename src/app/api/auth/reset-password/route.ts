import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { smsService } from '@/lib/sms';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code, newPassword } = await request.json();

    if (!phoneNumber || !code || !newPassword) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی است' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور باید حداقل 6 کاراکتر باشد' },
        { status: 400 }
      );
    }

    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);

    // بررسی کد بازیابی
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { 
        phoneNumber: formattedPhone,
        code,
        used: false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'کد بازیابی نامعتبر است' },
        { status: 400 }
      );
    }

    // بررسی انقضا
    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'کد بازیابی منقضی شده است' },
        { status: 400 }
      );
    }

    // بررسی تعداد تلاش‌ها
    if (resetRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌های مجاز تمام شده است' },
        { status: 429 }
      );
    }

    // پیدا کردن کاربر
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
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // هش کردن رمز عبور جدید
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // به‌روزرسانی رمز عبور
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // علامت‌گذاری کد به عنوان استفاده شده
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    });

    return NextResponse.json(
      { message: 'رمز عبور با موفقیت تغییر یافت' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'خطای سرور. لطفاً دوباره تلاش کنید' },
      { status: 500 }
    );
  }
} 