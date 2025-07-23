import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check admin session cookie
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin-session');
    const adminUserId = cookieStore.get('admin-user-id');
    
    if (!adminSession || adminSession.value !== 'authenticated' || !adminUserId) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز - وارد پنل ادمین شوید' }, { status: 401 });
    }

    // Verify admin user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: adminUserId.value },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    // دریافت پیام‌های چت
    const messages = await prisma.customerChat.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // محاسبه تعداد پیام‌های خوانده نشده
    const unreadCount = messages.filter(msg => msg.status === 'pending').length;

    // تهیه نوتیفیکیشن‌ها برای پیام‌های جدید
    const notifications = messages
      .filter(msg => msg.status === 'pending')
      .map(msg => ({
        id: msg.id,
        type: 'message',
        title: 'پیام جدید از مشتری',
        content: msg.message.substring(0, 100) + (msg.message.length > 100 ? '...' : ''),
        customerName: msg.customerName,
        customerPhone: msg.customerPhone,
        createdAt: msg.createdAt
      }));

    return NextResponse.json({ 
      success: true, 
      messages,
      unreadCount,
      notifications
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پیام‌ها' },
      { status: 500 }
    );
  }
} 