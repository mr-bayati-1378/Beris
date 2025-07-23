import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check admin session cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader?.includes('admin-session=authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin user ID from cookie
    const adminUserId = cookieHeader.match(/admin-user-id=([^;]+)/)?.[1];
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orderSlug = params.slug;

    const order = await prisma.order.findUnique({
      where: {
        slug: orderSlug,
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
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: {
                  select: {
                    url: true,
                  },
                  take: 1,
                }
              }
            },
            userPack: {
              select: {
                name: true,
                totalPrice: true,
              }
            }
          }
        },
        payment: {
          select: {
            status: true,
            amount: true,
            gateway: {
              select: {
                displayName: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    // Transform order data
    const transformedOrder = {
      id: order.id,
      slug: order.slug,
      status: order.status.toLowerCase(),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderSource: order.orderSource,
      salesRep: order.salesRep,
      notes: order.notes,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryZipCode: order.deliveryZipCode,
      deliveryPhone: order.deliveryPhone,
      deliveryRecipient: order.deliveryRecipient,
      user: order.user,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        product: item.product ? {
          name: item.product.name,
          price: Number(item.product.price),
          images: item.product.images,
        } : null,
        userPack: item.userPack ? {
          name: item.userPack.name,
          totalPrice: Number(item.userPack.totalPrice),
        } : null,
      })),
      payment: order.payment ? {
        status: order.payment.status,
        amount: Number(order.payment.amount),
        gateway: order.payment.gateway,
      } : null,
    };

    return NextResponse.json({ success: true, order: transformedOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات سفارش' },
      { status: 500 }
    );
  }
} 