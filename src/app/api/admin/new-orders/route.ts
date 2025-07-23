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

    // دریافت سفارشات جدید از دیتابیس
    let newOrders = [];
    try {
      newOrders = await prisma.order.findMany({
        where: {
          status: 'PENDING',
          orderSource: 'WEBSITE',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // آخرین 30 روز
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            }
          },
          items: {
            select: {
              price: true,
              quantity: true,
              product: {
                select: {
                  name: true,
                }
              },
              userPack: {
                select: {
                  name: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        }
      });
    } catch (error) {
      console.error('Error fetching new orders:', error);
      newOrders = [];
    }

    // پردازش سفارشات جدید
    const processedNewOrders = newOrders.map(order => {
      const total = order.items.reduce((sum, item) => 
        sum + (parseFloat(item.price.toString()) * item.quantity), 0);

      return {
        id: order.id,
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        customerPhone: order.user.phone,
        customerEmail: order.user.email || '',
        total: total,
        date: new Intl.DateTimeFormat('fa-IR').format(order.createdAt),
        source: 'WEBSITE' as const,
        salesRep: order.salesRep || undefined, // اگر مسئول فروش ثبت شده باشد
        status: 'PENDING_APPROVAL' as const,
        items: order.items.map(item => ({
          name: item.product?.name || item.userPack?.name || 'نامشخص',
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * parseFloat(item.price.toString())
        }))
      };
    });

    return NextResponse.json({
      success: true,
      newOrders: processedNewOrders
    });

  } catch (error) {
    console.error('Error fetching new orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 