import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      gateways
    });
  } catch (error) {
    console.error('Get gateways error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت درگاه‌های پرداخت' },
      { status: 500 }
    );
  }
} 