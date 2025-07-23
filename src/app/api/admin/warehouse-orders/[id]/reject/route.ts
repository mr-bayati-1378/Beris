import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // بررسی admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');

    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current admin user
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

    const body = await request.json();
    const { notes } = body;

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

    if (order.status !== 'PENDING_WAREHOUSE_APPROVAL') {
      return NextResponse.json({ error: 'این سفارش در مرحله تایید انبار نیست' }, { status: 400 });
    }

    // به‌روزرسانی وضعیت سفارش به رد شده
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status: 'REJECTED',
        warehouseRejectedBy: String(currentAdmin.id),
        warehouseRejectedAt: new Date(),
        warehouseNotes: notes || `رد انبار توسط ${currentAdmin.firstName} ${currentAdmin.lastName}`,
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

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت رد انبار شد',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error rejecting warehouse order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 