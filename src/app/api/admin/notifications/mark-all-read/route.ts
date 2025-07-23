import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-roles';

// علامت‌گذاری تمام نوتیفیکیشن‌ها به عنوان خوانده شده
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: 'نقش کاربری الزامی است' },
        { status: 400 }
      );
    }

    // در آینده اینجا همه نوتیفیکیشن‌های نقش مربوطه در دیتابیس به‌روزرسانی می‌شود
    // await prisma.adminNotification.updateMany({
    //   where: {
    //     targetRole: role,
    //     isRead: false
    //   },
    //   data: {
    //     isRead: true
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'تمام نوتیفیکیشن‌ها به عنوان خوانده شده علامت‌گذاری شدند'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی نوتیفیکیشن‌ها' },
      { status: 500 }
    );
  }
} 