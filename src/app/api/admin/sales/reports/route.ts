import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin-roles';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';
    
    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'week';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const role = searchParams.get('role');

    // Check permissions
    const hasPermission = await checkAdminPermission('reports_sales');
    if (!hasPermission) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    // Calculate date range
    let dateFilter: any = {};
    const now = new Date();
    
    switch (range) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        dateFilter = { gte: weekStart };
        break;
      case 'month':
        const monthStart = new Date(now);
        monthStart.setDate(1);
        dateFilter = { gte: monthStart };
        break;
      case 'quarter':
        const quarterStart = new Date(now);
        quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
        dateFilter = { gte: quarterStart };
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateFilter = { gte: yearStart };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            gte: new Date(startDate),
            lte: new Date(endDate)
          };
        }
        break;
    }

    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: dateFilter,
        status: 'COMPLETED' // Only count completed orders
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                categoryL3: {
                  include: {
                    categoryL2: {
                      include: {
                        categoryL1: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate daily sales
    const dailySalesMap = new Map<string, { amount: number; count: number }>();
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const existing = dailySalesMap.get(date) || { amount: 0, count: 0 };
      const orderTotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
      dailySalesMap.set(date, {
        amount: existing.amount + orderTotal,
        count: existing.count + 1
      });
    });

    const dailySales = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate top products
    const productSalesMap = new Map<string, { sales: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSalesMap.get(item.product.name) || { sales: 0, revenue: 0 };
        productSalesMap.set(item.product.name, {
          sales: existing.sales + item.quantity,
          revenue: existing.revenue + (Number(item.price) * item.quantity)
        });
      });
    });

    const topProducts = Array.from(productSalesMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate category distribution
    const categoryMap = new Map<string, { sales: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const categoryName = item.product.categoryL3?.categoryL2?.categoryL1?.name || 'نامشخص';
        const existing = categoryMap.get(categoryName) || { sales: 0, revenue: 0 };
        categoryMap.set(categoryName, {
          sales: existing.sales + item.quantity,
          revenue: existing.revenue + (Number(item.price) * item.quantity)
        });
      });
    });

    const totalCategoryRevenue = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.revenue, 0);
    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      sales: data.sales,
      percentage: totalCategoryRevenue > 0 ? Math.round((data.revenue / totalCategoryRevenue) * 100) : 0
    }));

    // Calculate customer stats
    const uniqueCustomers = new Set(orders.map(order => order.userId));
    const newCustomers = orders.filter(order => {
      const customerFirstOrder = orders
        .filter(o => o.userId === order.userId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
      return customerFirstOrder.id === order.id;
    }).length;

    const customerStats = {
      newCustomers,
      returningCustomers: uniqueCustomers.size - newCustomers,
      totalCustomers: uniqueCustomers.size
    };

    // Calculate summary
    const totalSales = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + (Number(item.price) * item.quantity), 0);
    }, 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calculate growth (compared to previous period)
    let previousPeriodStart = new Date();
    switch (range) {
      case 'week':
        previousPeriodStart.setDate(now.getDate() - 14);
        break;
      case 'month':
        previousPeriodStart.setMonth(now.getMonth() - 1);
        break;
      default:
        previousPeriodStart.setDate(now.getDate() - 30);
    }

    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: dateFilter.gte || new Date(0)
        },
        status: 'COMPLETED'
      },
      include: {
        items: true
      }
    });

    const previousRevenue = previousOrders.reduce((sum, order) => {
      return sum + (order.items || []).reduce((itemSum, item) => itemSum + (Number(item.price) * item.quantity), 0);
    }, 0);
    const previousSales = previousOrders.length;

    const salesGrowth = previousSales > 0 ? Math.round(((totalSales - previousSales) / previousSales) * 100) : 0;
    const revenueGrowth = previousRevenue > 0 ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) : 0;

    const summary = {
      totalSales,
      totalRevenue,
      averageOrderValue: Math.round(averageOrderValue),
      salesGrowth,
      revenueGrowth,
      conversionRate: Math.round(Math.random() * 10 + 5) // Mock conversion rate
    };

    return NextResponse.json({
      dailySales,
      topProducts,
      categoryDistribution,
      customerStats,
      summary
    });

  } catch (error) {
    console.error('Error fetching sales reports:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت گزارشات فروش' },
      { status: 500 }
    );
  }
} 