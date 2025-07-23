import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isVip } = await request.json();
    const customerId = params.id;

    // بررسی وجود مشتری
    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    // به‌روزرسانی وضعیت VIP
    const updatedCustomer = await prisma.user.update({
      where: { id: customerId },
      data: { isVip },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        phone: true,
        email: true,
        isVip: true
      }
    });

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      message: isVip 
        ? 'مشتری به فهرست VIP اضافه شد' 
        : 'مشتری از فهرست VIP حذف شد'
    });
  } catch (error) {
    console.error('Error updating VIP status:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی وضعیت مشتری' },
      { status: 500 }
    );
  }
} 