import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { auth } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET - دریافت لیست Inbound ها با فیلترینگ و صفحه‌بندی
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const supplierId = searchParams.get('supplierId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // ایجاد فیلترها
    const where: any = {};
    
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { productTitle: { contains: search } },
        { supplierName: { contains: search } }
      ];
    }
    
    if (supplierId) {
      where.supplierId = parseInt(supplierId);
    }
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [inbounds, total] = await Promise.all([
      prisma.inbound.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          createdByUser: {
            select: {
              username: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.inbound.count({ where })
    ]);

    // آمار کلی
    const stats = await prisma.inbound.aggregate({
      where,
      _sum: {
        totalPrice: true,
        quantity: true
      },
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      data: inbounds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalAmount: stats._sum.totalPrice || 0,
        totalQuantity: stats._sum.quantity || 0,
        totalRecords: stats._count.id || 0
      }
    });
  } catch (error) {
    console.error('Error fetching inbounds:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات' }, { status: 500 });
  }
}

// POST - ایجاد Inbound جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const data = await request.json();
    const {
      productTitle,
      supplierId,
      supplierName,
      supplierPhone,
      supplierAddress,
      date,
      quantity,
      totalPrice
    } = data;

    // اعتبارسنجی
    if (!productTitle || !date || !quantity || !totalPrice) {
      return NextResponse.json({ 
        error: 'فیلدهای ضروری را پر کنید' 
      }, { status: 400 });
    }

    // محاسبه قیمت واحد
    const unitPrice = parseFloat(totalPrice) / parseInt(quantity);

    // تولید شماره فاکتور اتومات
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2);
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    // یافتن آخرین شماره فاکتور امروز
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lastInbound = await prisma.inbound.findFirst({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let dailySequence = 1;
    if (lastInbound) {
      const lastSequence = parseInt(lastInbound.invoiceNumber.slice(-4));
      dailySequence = lastSequence + 1;
    }

    const invoiceNumber = `IN${year}${month}${String(dailySequence).padStart(4, '0')}`;

    const inbound = await prisma.inbound.create({
      data: {
        invoiceNumber,
        productTitle,
        supplierId: supplierId ? parseInt(supplierId) : null,
        supplierName,
        supplierPhone,
        supplierAddress,
        date: new Date(date),
        quantity: parseInt(quantity),
        totalPrice: parseFloat(totalPrice),
        unitPrice,
        createdBy: session.user.id
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        createdByUser: {
          select: {
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'ورودی با موفقیت ایجاد شد',
      data: inbound
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating inbound:', error);
    return NextResponse.json({ error: 'خطا در ایجاد ورودی' }, { status: 500 });
  }
} 