import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - دریافت سفارشات کاربر
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                slug: true,
              }
            },
            userPack: {
              select: {
                id: true,
                name: true,
                totalPrice: true,
              }
            }
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform orders to match dashboard interface
    const transformedOrders = orders.map(order => {
      // Calculate total from items
      const total = order.items.reduce((sum, item) => {
        let price = 0;
        if (item.product) price = Number(item.product.price);
        else if (item.userPack) price = Number(item.userPack.totalPrice);
        return sum + (price * item.quantity);
      }, 0);

      return {
        id: order.id,
        orderNumber: order.slug,
        status: order.status.toLowerCase(),
        totalAmount: total,
        createdAt: order.createdAt,
        itemCount: order._count.items,
        slug: order.slug,
        // Add additional fields for consistency
        total,
        address: order.deliveryAddress,
        city: order.deliveryCity,
        state: order.deliveryState,
        zipCode: order.deliveryZipCode,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.product ? Number(item.product.price) : Number(item.userPack?.totalPrice || 0),
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: Number(item.product.price),
            image: item.product.image,
          } : null,
          userPack: item.userPack ? {
            id: item.userPack.id,
            name: item.userPack.name,
            totalPrice: Number(item.userPack.totalPrice),
          } : null,
        }))
      };
    });

    console.log('🔍 User Orders API called');
    console.log('📊 Found', orders.length, 'orders for user:', session.user.id);
    console.log('✅ Returning transformed orders');

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 