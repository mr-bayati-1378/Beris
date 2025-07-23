import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-roles';

// علامت‌گذاری نوتیفیکیشن به عنوان خوانده شده
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { isRead, role } = await request.json();
    const notificationId = params.id;

    // در آینده اینجا نوتیفیکیشن در دیتابیس به‌روزرسانی می‌شود
    // await prisma.adminNotification.updateMany({
    //   where: {
    //     id: parseInt(notificationId),
    //     targetRole: role
    //   },
    //   data: {
    //     isRead: isRead
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'وضعیت نوتیفیکیشن به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی نوتیفیکیشن' },
      { status: 500 }
    );
  }
}

// حذف نوتیفیکیشن
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { role } = await request.json();
    const notificationId = params.id;

    // در آینده اینجا نوتیفیکیشن از دیتابیس حذف می‌شود
    // await prisma.adminNotification.deleteMany({
    //   where: {
    //     id: parseInt(notificationId),
    //     targetRole: role
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'نوتیفیکیشن حذف شد'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'خطا در حذف نوتیفیکیشن' },
      { status: 500 }
    );
  }
} 