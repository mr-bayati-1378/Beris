import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'وارد حساب کاربری خود شوید' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'پیام الزامی است' }, { status: 400 });
    }

    // ذخیره پیام در دیتابیس
    const newChat = await prisma.customerChat.create({
      data: {
        customerName: `${session.user.firstName} ${session.user.lastName}`,
        customerPhone: session.user.phone || '',
        message: message.trim(),
        status: 'pending',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'پیام شما ارسال شد',
      id: newChat.id 
    });

  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال پیام' },
      { status: 500 }
    );
  }
} 