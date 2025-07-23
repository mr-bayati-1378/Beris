import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // بررسی admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');

    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // دریافت سفارشات در انتظار تایید انبار
    const orders = await prisma.order.findMany({
      where: {
        status: 'PENDING_WAREHOUSE_APPROVAL'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // تبدیل داده‌ها به فرمت مورد نیاز
    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerPhone: order.user.phone,
      customerEmail: order.user.email,
      total: Number(order.total),
      date: order.createdAt.toISOString(),
      source: order.orderSource === 'SALES_REP' ? 'SALES_REP' : 'WEBSITE',
      salesRep: order.salesRep,
      status: order.status,
      items: [],
      notes: order.notes,
      approvedBy: order.approvedBy,
      approvedAt: order.approvedAt,
      financeApprovedBy: order.financeApprovedBy,
      financeApprovedAt: order.financeApprovedAt,
      financeNotes: order.financeNotes,
      salesRepName: order.salesRep
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length
    });

  } catch (error) {
    console.error('Error fetching warehouse orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 