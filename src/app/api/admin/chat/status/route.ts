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
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { messageId, status } = await request.json();

    if (!messageId || !status) {
      return NextResponse.json({ error: 'اطلاعات ناقص' }, { status: 400 });
    }

    // بروزرسانی وضعیت پیام
    const updatedMessage = await prisma.customerChat.update({
      where: { id: parseInt(messageId) },
      data: { status }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'وضعیت بروزرسانی شد',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Error updating chat message status:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی وضعیت' },
      { status: 500 }
    );
  }
} 