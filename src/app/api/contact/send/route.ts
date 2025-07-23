import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, subject, message } = await request.json();

    // اعتبارسنجی فیلدهای الزامی
    if (!name?.trim() || !phone?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'تمام فیلدهای الزامی را پر کنید' }, { status: 400 });
    }

    // ذخیره پیام در دیتابیس
    const newContactMessage = await prisma.customerChat.create({
      data: {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email?.trim() || '',
        message: `موضوع: ${subject.trim()}\n\nپیام:\n${message.trim()}`,
        status: 'pending',
        source: 'contact_form',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'پیام شما با موفقیت ارسال شد. کارشناسان ما در اسرع وقت پاسخ شما را خواهند داد',
      id: newContactMessage.id 
    });

  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال پیام. لطفا مجددا تلاش کنید' },
      { status: 500 }
    );
  }
} 