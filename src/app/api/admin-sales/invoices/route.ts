import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { OrderStatus, OrderSource } from '@prisma/client';

// تابع تبدیل تاریخ شمسی به میلادی
function jalaliToGregorian(jy: number, jm: number, jd: number) {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;
  let gy2 = (jm > 2) ? (jy + 1) : jy;
  let days = (365 * jy) + ((parseInt(String(jy / 33))) * 8) + parseInt(String(((jy % 33) + 3) / 4)) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * parseInt(String(days / 146097));
  days %= 146097;
  if (days > 36524) {
    gy += 100 * parseInt(String(--days / 36524));
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * parseInt(String(days / 1461));
  days %= 1461;
  if (days > 365) {
    gy += parseInt(String((days - 1) / 365));
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  let gm = (days < 186) ? 1 + parseInt(String(days / 31)) : 7 + parseInt(String((days - 186) / 30));
  return { year: gy, month: gm, day: gd };
}

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // ساخت where clause
    const where: any = {
      orderSource: 'SALES_REP' // فقط فاکتورهای مسئول فروش
    };

    // فیلتر بر اساس وضعیت
    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    // جستجو
    if (search) {
      where.OR = [
        { slug: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { phone: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    // تعیین ترتیب
    const orderBy: any = {};
    const sortField = sortBy === 'date' ? 'createdAt' : sortBy;
    orderBy[sortField] = sortOrder;

    const [invoices, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          slug: true,
          status: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          orderSource: true,
          salesRep: true,
          notes: true,
          approvedBy: true,
          approvedAt: true,
          financeApprovedBy: true,
          financeApprovedAt: true,
          warehouseApprovedBy: true,
          warehouseApprovedAt: true,
          // فیلدهای جدید فاکتور
          invoiceNumber: true,
          orderDate: true,
          deliveryDate: true,
          settlementPeriod: true,
          salesExpert: true,
          salesChannel: true,
          totalPurchase: true,
          totalGrossSale: true,
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

    // تبدیل داده‌ها برای frontend
    const transformedInvoices = invoices.map(invoice => {
      const paymentStatus = invoice.payment?.status || 'pending';
      const status = invoice.status.toLowerCase();

      return {
        ...invoice,
        paymentStatus,
        status,
        items: invoice.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.product ? Number(item.product.price) : Number(item.userPack?.totalPrice || 0),
          marginPercent: item.marginPercent || 0,
          grossSale: item.grossSale || 0,
          type: item.product ? 'product' : 'pack',
          product: item.product ? {
            name: item.product.name
          } : null,
          userPack: item.userPack ? {
            name: item.userPack.name
          } : null
        }))
      };
    });

    // آمار
    const stats = {
      totalInvoices: await prisma.order.count({ where: { orderSource: 'SALES_REP' } }),
      pendingInvoices: await prisma.order.count({ where: { orderSource: 'SALES_REP', status: 'PENDING' } }),
      approvedInvoices: await prisma.order.count({ where: { orderSource: 'SALES_REP', status: 'APPROVED' } }),
      completedInvoices: await prisma.order.count({ where: { orderSource: 'SALES_REP', status: 'COMPLETED' } }),
    };

    return NextResponse.json({
      invoices: transformedInvoices,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching sales invoices:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فاکتورها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating sales invoice...');
    
    // بررسی admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      console.log('❌ Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('📋 Request body:', JSON.stringify(body, null, 2));

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
      notes,
      // اطلاعات جدید فاکتور
      invoiceNumber,
      orderDate,
      deliveryDate,
      settlementPeriod,
      salesExpert,
      salesChannel,
      totalPurchase,
      totalGrossSale
    } = body;

    console.log('📊 Extracted data:', {
      customerId,
      customerName,
      customerPhone,
      total,
      itemsCount: items?.length,
      invoiceNumber,
      orderDate,
      deliveryDate
    });

    // اعتبارسنجی
    if (!customerName || !customerPhone || !items || items.length === 0) {
      console.log('❌ Validation failed');
      return NextResponse.json(
        { error: 'اطلاعات مشتری و محصولات الزامی است' },
        { status: 400 }
      );
    }

    // بررسی یا ایجاد مشتری
    let customer = await prisma.user.findFirst({
      where: {
        OR: [
          { id: customerId },
          { phone: customerPhone }
        ]
      }
    });

    if (!customer) {
      console.log('👤 Creating new customer...');
      try {
        customer = await prisma.user.create({
          data: {
            id: customerId || `CUST-${Date.now()}`,
            firstName: customerName.split(' ')[0] || customerName,
            lastName: customerName.split(' ').slice(1).join(' ') || '',
            phone: customerPhone,
            password: 'temp_password_' + Math.random().toString(36).substr(2, 9), // رمز موقت
            isActive: true
          }
        });
        console.log('✅ Customer created:', customer.id);
      } catch (error) {
        console.error('❌ Error creating customer:', error);
        return NextResponse.json(
          { error: 'خطا در ایجاد مشتری' },
          { status: 500 }
        );
      }
    }

    // دریافت اطلاعات ادمین فعلی
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
      console.log('❌ Admin user not found');
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    console.log('👨‍💼 Current admin:', currentAdmin.id);

    // تبدیل تاریخ‌ها
    let parsedOrderDate = new Date();
    let parsedDeliveryDate = null;

    try {
      if (orderDate) {
        // اگر تاریخ شمسی است (فرمت YYYY/MM/DD)
        if (typeof orderDate === 'string' && orderDate.includes('/')) {
          const parts = orderDate.split('/');
          if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);
            
            // تبدیل شمسی به میلادی
            const gregorian = jalaliToGregorian(year, month, day);
            parsedOrderDate = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
          }
        } else {
          parsedOrderDate = new Date(orderDate);
        }
      }
      
      if (deliveryDate) {
        // اگر تاریخ شمسی است (فرمت YYYY/MM/DD)
        if (typeof deliveryDate === 'string' && deliveryDate.includes('/')) {
          const parts = deliveryDate.split('/');
          if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);
            
            // تبدیل شمسی به میلادی
            const gregorian = jalaliToGregorian(year, month, day);
            parsedDeliveryDate = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
          }
        } else {
          parsedDeliveryDate = new Date(deliveryDate);
        }
      }
    } catch (error) {
      console.log('⚠️ Date parsing error:', error);
    }

    console.log('📅 Dates:', { orderDate: parsedOrderDate, deliveryDate: parsedDeliveryDate });

    // ایجاد سفارش جدید با وضعیت PENDING_FINANCE_APPROVAL
    const orderData = {
      slug: invoiceNumber || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: OrderStatus.PENDING_FINANCE_APPROVAL,
      total: totalGrossSale || total, // استفاده از فروش ناخالص
      customerId: customer.id,
      address: address || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      deliveryAddress: address || '',
      deliveryCity: city || '',
      deliveryState: state || '',
      deliveryZipCode: zipCode || '',
      salesRep: salesExpert || `${currentAdmin.firstName} ${currentAdmin.lastName}`,
      notes: notes || `فاکتور ثبت شده توسط ${currentAdmin.firstName} ${currentAdmin.lastName}`,
      orderSource: OrderSource.SALES_REP,
      approvedBy: String(currentAdmin.id),
      approvedAt: new Date(),
      user: {
        connect: { id: customer.id }
      },
      // فیلدهای جدید فاکتور
      invoiceNumber: invoiceNumber || null,
      orderDate: parsedOrderDate,
      deliveryDate: parsedDeliveryDate,
      settlementPeriod: settlementPeriod || 'نقدی',
      salesExpert: salesExpert || `${currentAdmin.firstName} ${currentAdmin.lastName}`,
      salesChannel: salesChannel || 'فروش مستقیم',
      totalPurchase: totalPurchase || 0,
      totalGrossSale: totalGrossSale || total,
    };

    console.log('📝 Creating order with data:', orderData);

    let order;
    try {
      order = await prisma.order.create({
        data: orderData
      });
      console.log('✅ Order created:', order.id);
    } catch (error) {
      console.error('❌ Error creating order:', error);
      return NextResponse.json(
        { error: 'خطا در ایجاد سفارش' },
        { status: 500 }
      );
    }

    // ایجاد آیتم‌های سفارش
    if (items && items.length > 0) {
      console.log('📦 Creating order items...');
      
      for (const item of items) {
        console.log('📋 Processing item:', item);
        
        // تبدیل userPackId از رشته به عدد اگر وجود داشته باشد
        let userPackId = null;
        if (item.packId && item.packId.startsWith('user-')) {
          userPackId = parseInt(item.packId.replace('user-', ''));
          console.log('🔄 Converted userPackId:', userPackId);
        }

        const orderItemData = {
          orderId: order.id,
          productId: item.productId ? parseInt(item.productId) : null,
          userPackId: userPackId,
          quantity: item.quantity,
          price: item.price,
          // فیلدهای جدید آیتم
          marginPercent: item.marginPercent || 0,
          grossSale: item.grossSale || (item.quantity * item.price * (1 + (item.marginPercent || 0) / 100))
        };

        console.log('📝 Creating order item with data:', orderItemData);

        try {
          await prisma.orderItem.create({
            data: orderItemData
          });
        } catch (error) {
          console.error('❌ Error creating order item:', error);
          return NextResponse.json(
            { error: 'خطا در ایجاد آیتم سفارش' },
            { status: 500 }
          );
        }
      }
      
      console.log('✅ All order items created');
    }

    console.log('🎉 Invoice created successfully');

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
        notes: order.notes,
        // اطلاعات جدید
        invoiceNumber: order.invoiceNumber,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        settlementPeriod: order.settlementPeriod,
        salesExpert: order.salesExpert,
        salesChannel: order.salesChannel,
        totalPurchase: order.totalPurchase,
        totalGrossSale: order.totalGrossSale
      }
    });

  } catch (error) {
    console.error('❌ Error creating sales invoice:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد فاکتور' },
      { status: 500 }
    );
  }
} 