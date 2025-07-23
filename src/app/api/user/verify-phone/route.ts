import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'شماره تلفن الزامی است' },
        { status: 400 }
      );
    }

    // بروزرسانی وضعیت تایید شماره کاربر
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        phoneVerified: true,
        phoneNumber: phoneNumber
      }
    });

    return NextResponse.json(
      { 
        message: 'شماره تلفن با موفقیت تایید شد',
        verified: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying phone:', error);
    return NextResponse.json(
      { error: 'خطای سرور. لطفاً دوباره تلاش کنید' },
      { status: 500 }
    );
  }
} 