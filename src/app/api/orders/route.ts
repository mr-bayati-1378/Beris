import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// GET - دریافت سفارشات کاربر
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

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
                slug: true,
                price: true,
                image: true,
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
        purchaseComment: {
          select: {
            id: true,
            rating: true,
            comment: true,
            isApproved: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
    });

    // Transform orders to match frontend interface
    const transformedOrders = orders.map(order => {
      // Calculate total from items
      const total = order.items.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      return {
        id: order.id,
        slug: order.slug,
        status: order.status.toLowerCase(),
        total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        address: order.deliveryAddress,
        city: order.deliveryCity,
        state: order.deliveryState,
        zipCode: order.deliveryZipCode,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
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
        })),
        purchaseComment: order.purchaseComment
      };
    });

    console.log('🔍 Orders API called');
    console.log('📊 Found', orders.length, 'orders for user:', session.user.id);
    console.log('✅ Returning transformed orders');

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سفارشات' },
      { status: 500 }
    );
  }
}

// Create new order
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { items, addressId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 });
    }

    if (!addressId) {
      return NextResponse.json(
        { error: 'آدرس تحویل الزامی است' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      return NextResponse.json({ error: 'آدرس نامعتبر است' }, { status: 400 });
    }

    // Get cart items to verify quantities
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ error: 'سبد خرید یافت نشد' }, { status: 404 });
    }

    // Verify items and calculate total
    let total = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const cartItem = cart.items.find(ci => ci.productId === item.productId);
      if (!cartItem) {
        return NextResponse.json(
          { error: 'محصول در سبد خرید یافت نشد' },
          { status: 400 }
        );
      }

      if (cartItem.quantity < item.quantity) {
        return NextResponse.json(
          { error: 'تعداد درخواستی بیشتر از موجودی سبد خرید است' },
          { status: 400 }
        );
      }

      total += Number(cartItem.product.price) * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: cartItem.product.price,
      });
    }

    // Create order with unique slug
    const order = await prisma.order.create({
      data: {
        userId,
        slug: nanoid(10),
        status: 'PENDING',
        total,
        deliveryAddress: address.address,
        deliveryCity: address.city,
        deliveryState: address.state,
        deliveryZipCode: address.zipCode,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        slug: order.slug,
        status: order.status.toLowerCase(),
        total: order.total,
        createdAt: order.createdAt,
        address: {
          address: order.deliveryAddress,
          city: order.deliveryCity,
          state: order.deliveryState,
          zipCode: order.deliveryZipCode,
        },
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          product: {
            id: item.product.id,
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.image,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'خطا در ثبت سفارش' }, { status: 500 });
  }
}

// Update order status (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'شما دسترسی به این عملیات را ندارید' },
        { status: 403 }
      );
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'شناسه سفارش و وضعیت الزامی است' },
        { status: 400 }
      );
    }

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'وضعیت نامعتبر است' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        slug: order.slug,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی سفارش' },
      { status: 500 }
    );
  }
}
