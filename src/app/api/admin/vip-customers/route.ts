import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // دریافت مشتریان با اطلاعات خرید
    const customers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        phone: true,
        email: true,
        isVip: true,
        createdAt: true,
        orders: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            total: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      where: {
        isAdmin: false // فقط مشتریان، نه ادمین‌ها
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // محاسبه آمار برای هر مشتری
    const customersWithStats = customers.map(customer => {
      const completedOrders = customer.orders;
      const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = completedOrders.length;
      const lastOrderDate = completedOrders.length > 0 ? completedOrders[0].createdAt : null;

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        username: customer.username,
        phone: customer.phone,
        email: customer.email,
        isVip: customer.isVip,
        totalOrders,
        totalSpent,
        lastOrderDate,
        createdAt: customer.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      customers: customersWithStats
    });
  } catch (error) {
    console.error('Error fetching VIP customers:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات مشتریان' },
      { status: 500 }
    );
  }
} 