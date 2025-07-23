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
    const role = searchParams.get('role') || 'admin';

    // Get basic stats
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalCustomers = await prisma.user.count({
      where: {
        orders: {
          some: {}
        }
      }
    });
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: 'COMPLETED'
      }
    });

    // Get debts stats
    const debts = await prisma.debt.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          }
        },
        payments: true
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 10 // Get top 10 debts by due date
    });

    // Process debts
    const processedDebts = debts.map(debt => {
      const totalPaid = debt.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const remaining = Number(debt.amount) - totalPaid;
      
      return {
        id: debt.id,
        customerName: `${debt.customer.firstName} ${debt.customer.lastName}`,
        customerPhone: debt.customer.phone,
        amount: Number(debt.amount),
        remainingAmount: remaining,
        dueDate: debt.dueDate,
        status: debt.status,
        isOverdue: debt.dueDate < new Date() && remaining > 0,
        daysUntilDue: Math.ceil((debt.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      };
    });

    // Get new orders
    const newOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Process new orders
    const processedNewOrders = newOrders.map(order => ({
      id: order.id,
      orderNumber: order.slug,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerPhone: order.user.phone,
      customerEmail: order.user.email,
      total: Number(order.total),
      date: order.createdAt,
      source: 'WEBSITE',
      status: 'PENDING_APPROVAL',
      items: order.items.map(item => ({
        name: item.product?.name || 'محصول نامشخص',
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity,
      }))
    }));

    // Calculate debt statistics
    const totalDebts = await prisma.debt.count();
    const totalDebtAmount = await prisma.debt.aggregate({
      _sum: {
        amount: true
      }
    });
    const overdueDebts = processedDebts.filter(debt => debt.isOverdue);
    const totalOverdueAmount = overdueDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);

    return NextResponse.json({
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue: totalRevenue._sum.total || 0,
        totalDebts,
        totalDebtAmount: totalDebtAmount._sum.amount || 0,
        overdueDebts: overdueDebts.length,
        totalOverdueAmount,
      },
      debts: processedDebts,
      newOrders: processedNewOrders,
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 