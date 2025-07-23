import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current admin user - use the logged in user
    const currentAdmin = await prisma.user.findFirst({
      where: {
        isAdmin: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    const { id } = params;
    const body = await request.json();

    // بررسی وجود سفارش
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    if (order.status !== 'PENDING' && order.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ error: 'این سفارش قبلاً تایید یا رد شده است' }, { status: 400 });
    }

    // به‌روزرسانی وضعیت سفارش
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status: 'REJECTED',
        rejectedBy: String(currentAdmin.id),
        rejectedAt: new Date(),
        notes: body.notes || `رد شده توسط ${currentAdmin.firstName} ${currentAdmin.lastName}`,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          }
        }
      }
    });

    // لاگ فعالیت - موقتاً غیرفعال
    // await prisma.adminActivity.create({
    //   data: { 
    //     userId: currentAdmin.id,
    //     action: 'REJECT_ORDER',
    //     entityType: 'ORDER',
    //     entityId: id,
    //     description: `رد سفارش مشتری ${order.user.firstName} ${order.user.lastName}`,
    //     details: {
    //       notes: body.notes,
    //     },
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت رد شد',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error rejecting order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 