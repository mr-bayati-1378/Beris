import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    console.log('🔍 Order Detail API called for slug:', params.slug);
    console.log('👤 User ID:', session.user.id);

    const order = await prisma.order.findFirst({
      where: {
        slug: params.slug,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              }
            },
            userPack: {
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log('📦 Order found:', order ? 'Yes' : 'No');
    if (order) {
      console.log('📋 Order ID:', order.id, 'Status:', order.status);
    }

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // Calculate total from order items
    const total = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    return NextResponse.json({
      id: order.id,
      slug: order.slug,
      status: order.status.toLowerCase(),
      total: total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deliveryAddress: {
        address: order.deliveryAddress,
        city: order.deliveryCity,
        state: order.deliveryState,
        zipCode: order.deliveryZipCode,
        phone: order.deliveryPhone,
        recipient: order.deliveryRecipient,
      },
      billingAddress: order.useSameAddressForBilling ? null : {
        address: order.billingAddress,
        city: order.billingCity,
        state: order.billingState,
        zipCode: order.billingZipCode,
        phone: order.billingPhone,
        recipient: order.billingRecipient,
      },
      useSameAddressForBilling: order.useSameAddressForBilling,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          images: item.product.images,
        } : null,
        userPack: item.userPack ? {
          id: item.userPack.id,
          name: item.userPack.name,
          totalPrice: Number(item.userPack.totalPrice),
        } : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات سفارش' },
      { status: 500 }
    );
  }
}
