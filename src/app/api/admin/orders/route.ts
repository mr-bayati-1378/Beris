import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const role = searchParams.get('role') || 'all'; // برای فیلتر بر اساس نقش

    const skip = (page - 1) * limit;

    // Build where clause - همه سفارشات برای همه ادمین‌ها
    const where: any = {};
    
    // فیلتر بر اساس وضعیت
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // فیلتر بر اساس جستجو
    if (search) {
      where.OR = [
        { slug: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { phone: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    // فیلتر بر اساس نقش (اختیاری)
    if (role && role !== 'all') {
      switch (role) {
        case 'sales':
          // سفارشات در انتظار تایید فروش
          where.OR = [
            { status: 'PENDING' },
            { status: 'PENDING_APPROVAL' },
            { approvedBy: null },
          ];
          break;
        case 'finance':
          // سفارشات در انتظار تایید مالی
          where.OR = [
            { status: 'APPROVED' },
            { status: 'PENDING_FINANCE_APPROVAL' },
            { financeApprovedBy: null },
          ];
          break;
        case 'warehouse':
          // سفارشات در انتظار تایید انبار
          where.OR = [
            { status: 'FINANCE_APPROVED' },
            { status: 'PENDING_WAREHOUSE_APPROVAL' },
            { warehouseApprovedBy: null },
          ];
          break;
      }
    }

    // تعیین ترتیب
    const orderBy: any = {};
    // تبدیل date به createdAt
    const sortField = sortBy === 'date' ? 'createdAt' : sortBy;
    orderBy[sortField] = sortOrder;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          slug: true,
          status: true,
          total: true, // اضافه کردن فیلد total
          deliveryAddress: true,
          deliveryCity: true,
          deliveryState: true,
          deliveryZipCode: true,
          createdAt: true,
          updatedAt: true,
          orderSource: true, // منبع سفارش
          salesRep: true, // مسئول فروش
          notes: true, // یادداشت‌ها
          approvedBy: true,
          approvedAt: true,
          rejectedBy: true,
          rejectedAt: true,
          financeApprovedBy: true,
          financeApprovedAt: true,
          financeRejectedBy: true,
          financeRejectedAt: true,
          financeNotes: true,
          warehouseApprovedBy: true,
          warehouseApprovedAt: true,
          warehouseRejectedBy: true,
          warehouseRejectedAt: true,
          warehouseNotes: true,
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
                  images: {
                    select: {
                      url: true,
                    },
                    take: 1,
                  },
                  price: true,
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
      }),
      prisma.order.count({ where })
    ]);

    // Transform orders to match frontend interface
    const transformedOrders = orders.map(order => {
      // استفاده از فیلد total از دیتابیس یا محاسبه از آیتم‌ها
      const total = order.total || order.items.reduce((sum, item) => {
        let price = 0;
        if (item.product) {
          price = Number(item.product.price);
        } else if (item.userPack) {
          price = Number(item.userPack.totalPrice);
        }
        return sum + (price * item.quantity);
      }, 0);

      // Get payment status from payment object
      const paymentStatus = order.payment?.status || 'pending';

      // Convert status to lowercase to match frontend interface
      const status = order.status.toLowerCase();

      return {
        id: order.id,
        orderNumber: order.slug,
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        total: total,
        status: status,
        createdAt: order.createdAt.toISOString(),
        orderSource: order.orderSource,
        salesRep: order.salesRep,
        notes: order.notes,
        items: order.items.map(item => ({
          productName: item.product?.name || item.userPack?.name || 'محصول نامشخص',
          quantity: item.quantity,
          price: item.product ? Number(item.product.price) : Number(item.userPack?.totalPrice || 0)
        })),
        shippingAddress: `${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryState} ${order.deliveryZipCode}`,
        paymentStatus: paymentStatus
      };
    });

    // آمار کلی برای نمایش
    const stats = {
      totalOrders: await prisma.order.count(),
      pendingOrders: await prisma.order.count({ where: { status: 'PENDING' } }),
      processingOrders: await prisma.order.count({ where: { status: 'PROCESSING' } }),
      completedOrders: await prisma.order.count({ where: { status: 'COMPLETED' } }),
      cancelledOrders: await prisma.order.count({ where: { status: 'CANCELLED' } }),
      websiteOrders: await prisma.order.count({ where: { orderSource: 'WEBSITE' } }),
      salesRepOrders: await prisma.order.count({ where: { orderSource: 'SALES_REP' } }),
    };

    console.log('🔍 Admin Orders API called');
    console.log('📊 Found', orders.length, 'orders out of', total, 'total');
    console.log('👥 Admin user:', user.firstName, user.lastName);
    console.log('🎯 Role filter:', role);

    return NextResponse.json({
      orders: transformedOrders,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سفارشات' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { orderId, status, notes, role } = await request.json();

    // Convert status to uppercase for database
    const dbStatus = status.toUpperCase();

    // بروزرسانی سفارش بر اساس نقش ادمین
    const updateData: any = { 
      status: dbStatus,
      updatedAt: new Date()
    };

    // اضافه کردن یادداشت و تایید بر اساس نقش
    if (role === 'sales') {
      if (dbStatus === 'APPROVED') {
        updateData.approvedBy = adminUserId;
        updateData.approvedAt = new Date();
        updateData.rejectedBy = null;
        updateData.rejectedAt = null;
      } else if (dbStatus === 'REJECTED') {
        updateData.rejectedBy = adminUserId;
        updateData.rejectedAt = new Date();
        updateData.approvedBy = null;
        updateData.approvedAt = null;
      }
      if (notes) updateData.notes = notes;
    } else if (role === 'finance') {
      if (dbStatus === 'FINANCE_APPROVED') {
        updateData.financeApprovedBy = adminUserId;
        updateData.financeApprovedAt = new Date();
        updateData.financeRejectedBy = null;
        updateData.financeRejectedAt = null;
      } else if (dbStatus === 'REJECTED') {
        updateData.financeRejectedBy = adminUserId;
        updateData.financeRejectedAt = new Date();
        updateData.financeApprovedBy = null;
        updateData.financeApprovedAt = null;
      }
      if (notes) updateData.financeNotes = notes;
    } else if (role === 'warehouse') {
      if (dbStatus === 'PROCESSING') {
        updateData.warehouseApprovedBy = adminUserId;
        updateData.warehouseApprovedAt = new Date();
        updateData.warehouseRejectedBy = null;
        updateData.warehouseRejectedAt = null;
      } else if (dbStatus === 'REJECTED') {
        updateData.warehouseRejectedBy = adminUserId;
        updateData.warehouseRejectedAt = new Date();
        updateData.warehouseApprovedBy = null;
        updateData.warehouseApprovedAt = null;
      }
      if (notes) updateData.warehouseNotes = notes;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          }
        }
      }
    });

    // TODO: Send SMS notification to user about status change
    // await smsService.sendOrderStatusUpdate(
    //   updatedOrder.user.phone,
    //   updatedOrder.slug,
    //   status
    // );

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی وضعیت سفارش' },
      { status: 500 }
    );
  }
} 