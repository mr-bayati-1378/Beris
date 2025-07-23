import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check admin session cookie
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin-session');
    const adminUserId = cookieStore.get('admin-user-id');
    
    if (!adminSession || adminSession.value !== 'authenticated' || !adminUserId) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: adminUserId.value },
      select: { isAdmin: true, firstName: true, lastName: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { messageId, reply } = await request.json();

    if (!messageId || !reply?.trim()) {
      return NextResponse.json({ error: 'اطلاعات ناقص' }, { status: 400 });
    }

    // بروزرسانی پیام با پاسخ ادمین
    const updatedMessage = await prisma.customerChat.update({
      where: { id: parseInt(messageId) },
      data: {
        adminReply: reply.trim(),
        status: 'replied',
        repliedAt: new Date(),
        repliedBy: `${user.firstName} ${user.lastName}`.trim() || 'ادمین'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'پاسخ ارسال شد',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Error replying to chat message:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال پاسخ' },
      { status: 500 }
    );
  }
} 