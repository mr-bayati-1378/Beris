import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - دریافت سفارشات پک کاربر
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

    const orders = await prisma.userPackOrder.findMany({
      where,
      include: {
        userPack: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
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

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching user pack orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - ایجاد سفارش پک جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userPackId, notes } = body;

    if (!userPackId) {
      return NextResponse.json({ error: 'User pack ID is required' }, { status: 400 });
    }

    // بررسی وجود پک
    const userPack = await prisma.userPack.findFirst({
      where: {
        id: userPackId,
        userId: session.user.id,
        isActive: true
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!userPack) {
      return NextResponse.json({ error: 'User pack not found or inactive' }, { status: 404 });
    }

    // محاسبه قیمت کل
    const totalAmount = userPack.items.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // ایجاد شماره سفارش
    const orderNumber = `UPO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // ایجاد سفارش
    const newOrder = await prisma.userPackOrder.create({
      data: {
        orderNumber,
        userId: session.user.id,
        userPackId: userPack.id,
        totalAmount,
        notes,
        status: 'PENDING',
        items: {
          create: userPack.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(item.product.price),
            totalPrice: Number(item.product.price) * item.quantity
          }))
        }
      },
      include: {
        userPack: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
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
            }
          }
        }
      }
    });

    return NextResponse.json({
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        totalAmount: newOrder.totalAmount,
        notes: newOrder.notes,
        createdAt: newOrder.createdAt,
        userPack: newOrder.userPack,
        items: newOrder.items
      }
    });
  } catch (error) {
    console.error('Error creating user pack order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 