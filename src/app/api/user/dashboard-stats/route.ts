import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'لطفا وارد شوید' }, { status: 401 });
    }

    // دریافت تعداد سفارش‌ها
    const ordersCount = await prisma.order.count({
      where: {
        user: {
          id: session.user.id
        }
      }
    });

    // دریافت تعداد آدرس‌ها
    const addressesCount = await prisma.address.count({
      where: {
        userId: session.user.id
      }
    });

    // محاسبه مجموع مبلغ سفارش‌های تحویل شده
    const totalSpent = await prisma.order.aggregate({
      where: {
        user: {
          id: session.user.id
        },
        status: 'COMPLETED'
      },
      _sum: {
        total: true
      }
    });

    return NextResponse.json({
      orders: ordersCount,
      addresses: addressesCount,
      totalSpent: totalSpent._sum.total || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آمار داشبورد' },
      { status: 500 }
    );
  }
} 