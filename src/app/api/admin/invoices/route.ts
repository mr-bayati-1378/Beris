import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const { orderId, paymentDocuments, role } = await request.json();

    // Validate input
    if (!orderId) {
      return NextResponse.json({ error: 'شناسه سفارش الزامی است' }, { status: 400 });
    }

    if (!paymentDocuments || !Array.isArray(paymentDocuments) || paymentDocuments.length === 0) {
      return NextResponse.json({ error: 'مستندات پرداخت الزامی است' }, { status: 400 });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    // Calculate total payment amount
    const totalPaymentAmount = paymentDocuments.reduce((sum, doc) => sum + Number(doc.amount), 0);
    const orderTotal = Number(order.total);

    // Validate payment amount
    if (totalPaymentAmount !== orderTotal) {
      return NextResponse.json({ 
        error: `مبلغ پرداختی (${totalPaymentAmount}) با مبلغ سفارش (${orderTotal}) مطابقت ندارد` 
      }, { status: 400 });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: order.userId,
        status: 'PAID',
        totalAmount: orderTotal,
        paidAmount: totalPaymentAmount,
        paymentDate: new Date(),
        notes: `فاکتور ایجاد شده توسط ${user.firstName} ${user.lastName}`,
        createdById: adminUserId,
        items: {
          create: await Promise.all(
            (await prisma.orderItem.findMany({
              where: { orderId },
              include: {
                product: true,
                userPack: true
              }
            })).map(item => ({
              productId: item.productId,
              packId: item.userPackId || null,
              quantity: item.quantity,
              price: item.price,
            }))
          )
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    // Create payment documents
    const paymentDocs = await Promise.all(
      paymentDocuments.map(async (doc) => {
        return await prisma.paymentDocument.create({
          data: {
            invoiceId: invoice.id,
            type: doc.type,
            amount: doc.amount,
            date: new Date(doc.date),
            checkNumber: doc.checkNumber,
            checkDate: doc.checkDate ? new Date(doc.checkDate) : null,
            accountNumber: doc.accountNumber,
            bankName: doc.bankName,
            notes: doc.notes,
            createdBy: adminUserId
          }
        });
      })
    );

    // Update order status to finance approved
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'FINANCE_APPROVED',
        financeApprovedBy: adminUserId,
        financeApprovedAt: new Date(),
        financeNotes: `فاکتور ${invoiceNumber} ایجاد شد - ${paymentDocuments.length} مستند پرداخت`
      }
    });

    // Create activity log
    await prisma.adminActivity.create({
      data: {
        userId: adminUserId,
        action: 'create',
        entityType: 'invoice',
        entityId: String(invoice.id),
        details: `فاکتور ${invoiceNumber} برای سفارش ${order.slug} ایجاد شد`
      }
    });

    console.log('🔍 Admin Invoice API called');
    console.log('📄 Invoice created:', invoiceNumber);
    console.log('💰 Payment documents:', paymentDocuments.length);
    console.log('👥 Admin user:', user.firstName, user.lastName);

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        paymentDate: invoice.paymentDate,
        customer: invoice.customer,
        items: invoice.items,
        paymentDocuments: paymentDocs
      }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد فاکتور' },
      { status: 500 }
    );
  }
}

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

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { firstName: { contains: search } } },
        { customer: { lastName: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            }
          },
          items: {
            select: {
              id: true,
              productId: true,
              packId: true,
              quantity: true,
              price: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          paymentDocuments: {
            select: {
              type: true,
              amount: true,
              date: true,
            }
          }
        }
      }),
      prisma.invoice.count({ where })
    ]);

    // Transform invoices
    const transformedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customer: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      customerPhone: invoice.customer.phone,
      status: invoice.status.toLowerCase(),
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      paymentDate: invoice.paymentDate,
      createdAt: invoice.createdAt,
      itemsCount: invoice.items.length,
      paymentDocumentsCount: invoice.paymentDocuments.length
    }));

    // Stats
    const stats = {
      totalInvoices: await prisma.invoice.count(),
      paidInvoices: await prisma.invoice.count({ where: { status: 'PAID' } }),
      openInvoices: await prisma.invoice.count({ where: { status: 'OPEN' } }),
      totalRevenue: await prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { paidAmount: true }
      }).then(result => Number(result._sum.paidAmount || 0))
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
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فاکتورها' },
      { status: 500 }
    );
  }
} 