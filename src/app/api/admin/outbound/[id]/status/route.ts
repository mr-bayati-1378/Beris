import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../../generated/prisma';
import { auth } from '../../../../../../lib/auth';

const prisma = new PrismaClient();

// PUT - به‌روزرسانی وضعیت Outbound
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { status } = await request.json();
    const outboundId = parseInt(params.id);

    // بررسی وجود Outbound
    const existingOutbound = await prisma.outbound.findUnique({
      where: { id: outboundId },
      include: {
        createdByUser: {
          select: {
            username: true,
            adminRole: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!existingOutbound) {
      return NextResponse.json({ error: 'فاکتور یافت نشد' }, { status: 404 });
    }

    // تعریف مجوزهای تغییر وضعیت
    const userRole = session.user.adminRole?.name;
    let updateData: any = { status };

    switch (status) {
      case 'IN_TRANSIT':
        // فقط مدیر مالی می‌تواند به حالت "درحال ارسال" تغییر دهد
        if (userRole !== 'finance') {
          return NextResponse.json({ 
            error: 'فقط مدیر مالی می‌تواند فاکتور را تایید کند' 
          }, { status: 403 });
        }
        if (existingOutbound.status !== 'OPEN') {
          return NextResponse.json({ 
            error: 'فقط فاکتورهای باز قابل تایید هستند' 
          }, { status: 400 });
        }
        updateData.approvedBy = session.user.id;
        break;

      case 'SHIPPED':
        // فقط مدیر انبار می‌تواند به حالت "ارسال شده" تغییر دهد
        if (userRole !== 'warehouse') {
          return NextResponse.json({ 
            error: 'فقط مدیر انبار می‌تواند فاکتور را ارسال کند' 
          }, { status: 403 });
        }
        if (existingOutbound.status !== 'IN_TRANSIT') {
          return NextResponse.json({ 
            error: 'فقط فاکتورهای در حال ارسال قابل تکمیل هستند' 
          }, { status: 400 });
        }
        updateData.shippedBy = session.user.id;
        break;

      case 'OPEN':
        // برگشت به حالت باز فقط توسط مدیر فروش (سازنده) یا مدیر مالی
        if (userRole !== 'sales' && userRole !== 'finance') {
          return NextResponse.json({ 
            error: 'فقط مدیر فروش یا مالی می‌تواند فاکتور را باز کند' 
          }, { status: 403 });
        }
        updateData = { 
          status,
          approvedBy: null,
          shippedBy: null
        };
        break;

      default:
        return NextResponse.json({ 
          error: 'وضعیت نامعتبر' 
        }, { status: 400 });
    }

    const updatedOutbound = await prisma.outbound.update({
      where: { id: outboundId },
      data: updateData,
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
      }
    });

    return NextResponse.json({
      message: 'وضعیت فاکتور با موفقیت به‌روزرسانی شد',
      data: updatedOutbound
    });
  } catch (error) {
    console.error('Error updating outbound status:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی وضعیت' }, { status: 500 });
  }
} 