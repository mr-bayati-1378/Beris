import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { smsService } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    // اعتبارسنجی شماره تلفن
    if (!phoneNumber || !smsService.isValidIranianPhoneNumber(phoneNumber)) {
      return Response.json(
        { error: 'شماره تلفن نامعتبر است' },
        { status: 400 }
      );
    }

    // فرمت کردن شماره تلفن
    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);

    // تولید کد تایید
    const verificationCode = smsService.generateVerificationCode();

    try {
      // ارسال پیامک
      const smsResult = await smsService.sendVerificationCode(formattedPhone, verificationCode);

      if (!smsResult) {
        return Response.json(
          { error: 'خطا در ارسال پیامک' },
          { status: 500 }
        );
      }

             // ذخیره کد تایید در دیتابیس
       const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه
       
       // پیدا کردن یا ایجاد رکورد تایید
       await prisma.phoneVerification.upsert({
         where: { phoneNumber: formattedPhone },
         update: {
           code: verificationCode,
           expiresAt,
           verified: false,
           attempts: 0,
         },
         create: {
           phoneNumber: formattedPhone,
           code: verificationCode,
           expiresAt,
           verified: false,
           attempts: 0,
         },
       });

      return Response.json({
        success: true,
        message: 'کد تایید ارسال شد',
      });

    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      return Response.json(
        { error: 'خطا در ارسال پیامک' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send verification error:', error);
    return Response.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
} 