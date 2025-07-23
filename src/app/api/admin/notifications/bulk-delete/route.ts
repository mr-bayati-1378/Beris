import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-roles';

// حذف چندین نوتیفیکیشن به صورت دسته‌ای
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { ids, role } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'شناسه‌های نوتیفیکیشن الزامی است' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: 'نقش کاربری الزامی است' },
        { status: 400 }
      );
    }

    // در آینده اینجا نوتیفیکیشن‌های انتخاب شده از دیتابیس حذف می‌شود
    // await prisma.adminNotification.deleteMany({
    //   where: {
    //     id: { in: ids.map(id => parseInt(id)) },
    //     targetRole: role
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: `${ids.length} نوتیفیکیشن حذف شد`
    });

  } catch (error) {
    console.error('Error bulk deleting notifications:', error);
    return NextResponse.json(
      { error: 'خطا در حذف نوتیفیکیشن‌ها' },
      { status: 500 }
    );
  }
} 