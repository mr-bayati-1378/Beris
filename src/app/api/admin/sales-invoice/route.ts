import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // بررسی admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');

    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current admin user
    const currentAdmin = await prisma.user.findFirst({
      where: {
        isAdmin: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      customerId, 
      customerName, 
      customerPhone, 
      total, 
      items, 
      address, 
      city, 
      state, 
      zipCode,
      notes 
    } = body;

    // بررسی وجود مشتری
    let customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    // اگر مشتری وجود نداشت، ایجاد کن
    if (!customer) {
      customer = await prisma.user.create({
        data: {
          id: customerId,
          firstName: customerName.split(' ')[0] || customerName,
          lastName: customerName.split(' ').slice(1).join(' ') || '',
          phone: customerPhone,
          password: 'temp_password_' + Math.random().toString(36).substr(2, 9), // رمز موقت
          isActive: true
        }
      });
    }

    // ایجاد سفارش جدید با وضعیت PENDING_FINANCE_APPROVAL
    const order = await prisma.order.create({
      data: {
        slug: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'PENDING_FINANCE_APPROVAL',
        total: total,
        userId: customerId,
        deliveryAddress: address,
        deliveryCity: city,
        deliveryState: state,
        deliveryZipCode: zipCode,
        salesRep: `${currentAdmin.firstName} ${currentAdmin.lastName}`,
        notes: notes || `فاکتور ثبت شده توسط ${currentAdmin.firstName} ${currentAdmin.lastName}`,
        orderSource: 'SALES_REP',
        approvedBy: String(currentAdmin.id),
        approvedAt: new Date(),
      }
    });

    // ایجاد آیتم‌های سفارش
    if (items && items.length > 0) {
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            userPackId: item.userPackId,
            quantity: item.quantity,
            price: item.price
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'فاکتور با موفقیت ثبت شد و برای تایید مالی ارسال شد',
      order: {
        id: order.id,
        slug: order.slug,
        status: order.status,
        total: order.total,
        customerName: customerName,
        customerPhone: customerPhone,
        salesRep: order.salesRep,
        notes: order.notes
      }
    });

  } catch (error) {
    console.error('Error creating sales invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 