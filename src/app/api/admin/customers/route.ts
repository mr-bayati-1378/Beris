import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentAdmin, checkAdminPermission, logAdminActivity } from '@/lib/admin-roles';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // بررسی admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'lastOrder';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const role = searchParams.get('role') || 'admin';
    const perPage = 10;

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalCustomers = await prisma.user.count({
      where: {
        ...whereClause,
        isAdmin: false,
      },
    });

    // Get customers with their orders
    const customers = await prisma.user.findMany({
      where: {
        ...whereClause,
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
          select: {
            id: true,
            createdAt: true,
            status: true,
            items: {
              select: {
                price: true,
                quantity: true,
              }
            }
          },
          where: {
            status: {
              in: ['COMPLETED', 'PROCESSING', 'PENDING']
            },
          },
        },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        ...(sortBy === 'lastOrder'
          ? {
              orders: {
                _count: sortOrder,
              },
            }
          : {}),
      },
    });

    // Process and format customer data
    const formattedCustomers = customers.map(customer => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => {
        const orderTotal = order.items.reduce((itemSum, item) => {
          return itemSum + (Number(item.price) * item.quantity);
        }, 0);
        return sum + orderTotal;
      }, 0);
      const lastOrder = customer.orders.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        address: customer.addresses[0]?.address || '---',
        city: customer.addresses[0]?.city || '---',
        state: customer.addresses[0]?.state || '---',
        zipCode: customer.addresses[0]?.zipCode || '---',
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrder 
          ? new Intl.DateTimeFormat('fa-IR').format(lastOrder.createdAt)
          : '---',
        createdAt: new Intl.DateTimeFormat('fa-IR').format(customer.createdAt),
      };
    });

    // Sort processed data if needed
    if (sortBy === 'totalSpent') {
      formattedCustomers.sort((a, b) => 
        sortOrder === 'desc' ? b.totalSpent - a.totalSpent : a.totalSpent - b.totalSpent
      );
    } else if (sortBy === 'totalOrders') {
      formattedCustomers.sort((a, b) => 
        sortOrder === 'desc' ? b.totalOrders - a.totalOrders : a.totalOrders - b.totalOrders
      );
    }

    return NextResponse.json({
      customers: formattedCustomers,
      totalPages: Math.ceil(totalCustomers / perPage),
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات مشتریان' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      state,
      zipCode
    } = await request.json();

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'نام، نام خانوادگی و شماره تلفن الزامی است' }, { status: 400 });
    }

    // بررسی تکراری بودن شماره تلفن
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'کاربری با این شماره تلفن موجود است' }, { status: 409 });
    }

    // ایجاد رمز عبور پیش‌فرض
    const defaultPassword = `${phone.slice(-4)}@${firstName}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // ایجاد مشتری
    const customer = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email: email || null,
        password: hashedPassword,
        isAdmin: false,
        isActive: true,
        addresses: {
          create: {
            title: 'آدرس پیش‌فرض',
            address: address || 'تهران، خیابان ولیعصر',
            city: city || 'تهران',
            state: state || 'تهران',
            zipCode: zipCode || '1234567890',
            isDefault: true,
          },
        },
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
      }
    });

    // لاگ فعالیت
    await logAdminActivity(
      admin.id,
      'create',
      'customer',
      customer.id.toString(),
      `ایجاد مشتری جدید: ${customer.firstName} ${customer.lastName}`,
      request
    );

    return NextResponse.json({ 
      success: true, 
      customer,
      defaultPassword // برای نمایش به ادمین
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'خطا در ایجاد مشتری' }, { status: 500 });
  }
}