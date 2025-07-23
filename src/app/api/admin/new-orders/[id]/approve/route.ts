import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // جابجایی به ابتدای تابع
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

    console.log('Current admin:', currentAdmin);
    console.log('Current admin id type:', typeof currentAdmin.id);
    console.log('Current admin id value:', currentAdmin.id);
    console.log('Current admin id as string:', String(currentAdmin.id));
    console.log('Order id:', id);

    const body = await request.json();
    const { salesRepName } = body; // نام مسئول فروش که تایید می‌کند

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

    console.log('Order found:', order);

    if (order.status !== 'PENDING' && order.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ error: 'این سفارش قبلاً تایید یا رد شده است' }, { status: 400 });
    }

    // تعیین وضعیت بعدی بر اساس منبع سفارش
    let nextStatus: 'PENDING_FINANCE_APPROVAL' = 'PENDING_FINANCE_APPROVAL';
    let orderSource: 'WEBSITE' | 'SALES_REP' = 'WEBSITE';
    
    // اگر مسئول فروش انتخاب شده، سفارش از نوع SALES_REP است
    if (salesRepName) {
      orderSource = 'SALES_REP';
    }
    
    // به‌روزرسانی وضعیت سفارش
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status: nextStatus,
        approvedBy: String(currentAdmin.id),
        approvedAt: new Date(),
        salesRep: salesRepName || `${currentAdmin.firstName} ${currentAdmin.lastName}`, // نام مسئول فروش که تایید کرده
        notes: body.notes || `تایید شده توسط ${currentAdmin.firstName} ${currentAdmin.lastName}`,
        orderSource: orderSource,
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
    //     action: 'APPROVE_ORDER',
    //     entityType: 'ORDER',
    //     entityId: id,
    //     description: `تایید سفارش مشتری ${order.user.firstName} ${order.user.lastName}`,
    //     details: {
    //       salesRepName: salesRepName || `${currentAdmin.firstName} ${currentAdmin.lastName}`,
    //       notes: body.notes,
    //     },
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت تایید شد',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error approving order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 