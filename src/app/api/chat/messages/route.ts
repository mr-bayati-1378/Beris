import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const customerPhone = session.user.phone || '';

    // دریافت پیام‌های مشتری و پاسخ‌های ادمین
    const messages = await prisma.customerChat.findMany({
      where: { 
        customerPhone 
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // محدود کردن به 10 پیام آخر
    });

    return NextResponse.json({ 
      success: true, 
      messages: messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        status: msg.status,
        adminReply: msg.adminReply,
        repliedAt: msg.repliedAt,
        repliedBy: msg.repliedBy,
        createdAt: msg.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching customer messages:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پیام‌ها' },
      { status: 500 }
    );
  }
} 