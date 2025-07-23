import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { auth } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET - دریافت لیست Outbound ها با فیلترینگ و صفحه‌بندی
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
    const status = searchParams.get('status');
    const settlementPeriod = searchParams.get('settlementPeriod');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // ایجاد فیلترها
    const where: any = {};
    
    if (search) {
      where.OR = [
        { invoiceCode: { contains: search } },
        { customerName: { contains: search } },
        { customerOrder: { contains: search } },
        { productDescription: { contains: search } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (settlementPeriod) {
      where.settlementPeriod = settlementPeriod;
    }
    
    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) where.orderDate.gte = new Date(dateFrom);
      if (dateTo) where.orderDate.lte = new Date(dateTo);
    }

    const [outbounds, total] = await Promise.all([
      prisma.outbound.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              },
              pack: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          createdByUser: {
            select: {
              username: true,
              firstName: true,
              lastName: true
            }
          },
          approvedByUser: {
            select: {
              username: true,
              firstName: true,
              lastName: true
            }
          },
          shippedByUser: {
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
      prisma.outbound.count({ where })
    ]);

    // آمار کلی
    const stats = await prisma.outbound.aggregate({
      where,
      _sum: {
        salesAmount: true,
        purchaseAmount: true,
        totalQuantity: true
      },
      _avg: {
        marginPercent: true
      },
      _count: {
        id: true
      }
    });

    // آمار بر اساس وضعیت
    const statusStats = await prisma.outbound.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true
      },
      _sum: {
        salesAmount: true
      }
    });

    return NextResponse.json({
      data: outbounds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalSalesAmount: Number(stats._sum.salesAmount) || 0,
        totalPurchaseAmount: Number(stats._sum.purchaseAmount) || 0,
        totalProfit: (Number(stats._sum.salesAmount) || 0) - (Number(stats._sum.purchaseAmount) || 0),
        averageMargin: Number(stats._avg.marginPercent) || 0,
        totalQuantity: stats._sum.totalQuantity || 0,
        totalRecords: stats._count.id || 0
      },
      statusStats: statusStats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: stat._count.id,
          totalAmount: Number(stat._sum.salesAmount) || 0
        };
        return acc;
      }, {} as any)
    });
  } catch (error) {
    console.error('Error fetching outbounds:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات' }, { status: 500 });
  }
}

// POST - ایجاد Outbound جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const data = await request.json();
    const {
      orderDate,
      deliveryDate,
      customerName,
      customerPhone,
      settlementPeriod,
      customerOrder,
      productDescription,
      items,
      marginPercent
    } = data;

    // اعتبارسنجی
    if (!orderDate || !deliveryDate || !customerName || !customerOrder || !items || items.length === 0) {
      return NextResponse.json({ 
        error: 'فیلدهای ضروری را پر کنید' 
      }, { status: 400 });
    }

    // محاسبه مبالغ
    const totalQuantity = items.reduce((sum: number, item: any) => sum + parseInt(item.quantity), 0);
    const purchaseAmount = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.unitPrice) * parseInt(item.quantity));
    }, 0);
    const salesAmount = purchaseAmount + (purchaseAmount * (parseInt(marginPercent) / 100));

    // تولید کد فاکتور اتومات
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2);
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    // یافتن آخرین کد فاکتور امروز
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lastOutbound = await prisma.outbound.findFirst({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let dailySequence = 1;
    if (lastOutbound) {
      const lastSequence = parseInt(lastOutbound.invoiceCode.slice(-4));
      dailySequence = lastSequence + 1;
    }

    const invoiceCode = `OUT${year}${month}${String(dailySequence).padStart(4, '0')}`;

    // ایجاد Outbound با آیتم‌ها
    const outbound = await prisma.outbound.create({
      data: {
        invoiceCode,
        orderDate: new Date(orderDate),
        deliveryDate: new Date(deliveryDate),
        customerName,
        customerPhone,
        settlementPeriod: settlementPeriod || 'CASH',
        customerOrder,
        productDescription,
        totalQuantity,
        purchaseAmount,
        marginPercent: parseInt(marginPercent),
        salesAmount,
        createdBy: session.user.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId ? parseInt(item.productId) : null,
            packId: item.packId ? parseInt(item.packId) : null,
            productName: item.productName,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.unitPrice) * parseInt(item.quantity)
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            pack: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
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
      message: 'خروجی با موفقیت ایجاد شد',
      data: outbound
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating outbound:', error);
    return NextResponse.json({ error: 'خطا در ایجاد خروجی' }, { status: 500 });
  }
} 