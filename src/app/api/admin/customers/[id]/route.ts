import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentAdmin, checkAdminPermission, logAdminActivity } from '@/lib/admin-roles';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی دسترسی
    const hasPermission = await checkAdminPermission('customers') || await checkAdminPermission('users_view');
    if (!hasPermission) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const customerId = params.id;

    const customer = await prisma.user.findUnique({
      where: {
        id: customerId,
        isAdmin: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        createdAt: true,
        addresses: {
          where: { isDefault: true },
          select: {
            address: true,
            city: true,
            state: true,
            zipCode: true,
          },
          take: 1,
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                quantity: true,
                price: true,
                product: {
                  select: {
                    name: true,
                    price: true,
                  }
                }
              }
            }
          }
        },
        customerInvoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
            customerInvoices: true,
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });
    }

    // محاسبه آمار مشتری
    const totalOrders = customer._count.orders;
    const totalSpent = customer.orders.reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => {
        return itemSum + (Number(item.price) * item.quantity);
      }, 0);
      return sum + orderTotal;
    }, 0);
    
    const lastOrder = customer.orders.length > 0 ? customer.orders[0] : null;
    const lastOrderDate = lastOrder 
      ? new Intl.DateTimeFormat('fa-IR').format(lastOrder.createdAt)
      : null;

    // تبدیل داده‌ها برای frontend
    const defaultAddress = customer.addresses[0] || null;
    const customerData = {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
      address: defaultAddress?.address || null,
      city: defaultAddress?.city || null,
      state: defaultAddress?.state || null,
      postalCode: defaultAddress?.zipCode || null,
      createdAt: new Intl.DateTimeFormat('fa-IR').format(customer.createdAt),
      totalOrders,
      totalSpent,
      lastOrderDate,
      orders: customer.orders.map(order => ({
        id: order.id,
        total: order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
        status: order.status,
        createdAt: new Intl.DateTimeFormat('fa-IR').format(order.createdAt),
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          product: {
            name: item.product.name,
          }
        }))
      }))
    };

    return NextResponse.json({ success: true, customer: customerData });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات مشتری' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی دسترسی
    const hasPermission = await checkAdminPermission('customers');
    if (!hasPermission) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'ادمین یافت نشد' }, { status: 401 });
    }

    const customerId = params.id;

    // بررسی وجود مشتری
    const customer = await prisma.user.findUnique({
      where: {
        id: customerId,
        isAdmin: false,
      },
      include: {
        _count: {
          select: {
            orders: true,
            customerInvoices: true,
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });
    }

    // بررسی اینکه آیا مشتری سفارش یا فاکتور دارد
    if (customer._count.orders > 0 || customer._count.customerInvoices > 0) {
      return NextResponse.json({ 
        error: 'این مشتری دارای سفارش یا فاکتور است و قابل حذف نیست' 
      }, { status: 409 });
    }

    // حذف مشتری
    await prisma.user.delete({
      where: { id: customerId },
    });

    // لاگ فعالیت
    await logAdminActivity(
      admin.id,
      'delete',
      'customer',
      customerId,
      `حذف مشتری: ${customer.firstName} ${customer.lastName}`,
      request
    );

    return NextResponse.json({ success: true, message: 'مشتری با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'خطا در حذف مشتری' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی دسترسی
    const hasPermission = await checkAdminPermission('customers');
    if (!hasPermission) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'ادمین یافت نشد' }, { status: 401 });
    }

    const customerId = params.id;
    const {
      firstName,
      lastName,
      phone,
      email,
      isActive
    } = await request.json();

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'نام، نام خانوادگی و شماره تلفن الزامی است' }, { status: 400 });
    }

    // بررسی وجود مشتری
    const existingCustomer = await prisma.user.findUnique({
      where: {
        id: customerId,
        isAdmin: false,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });
    }

    // بررسی تکراری بودن شماره تلفن (اگر تغییر کرده)
    if (phone !== existingCustomer.phone) {
      const phoneExists = await prisma.user.findFirst({
        where: { 
          phone,
          id: { not: customerId }
        },
      });

      if (phoneExists) {
        return NextResponse.json({ error: 'کاربری با این شماره تلفن موجود است' }, { status: 409 });
      }
    }

    // به‌روزرسانی مشتری
    const updatedCustomer = await prisma.user.update({
      where: { id: customerId },
      data: {
        firstName,
        lastName,
        phone,
        email: email || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
      }
    });

    // لاگ فعالیت
    await logAdminActivity(
      admin.id,
      'update',
      'customer',
      customerId,
      `به‌روزرسانی اطلاعات مشتری: ${updatedCustomer.firstName} ${updatedCustomer.lastName}`,
      request
    );

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی مشتری' }, { status: 500 });
  }
} 