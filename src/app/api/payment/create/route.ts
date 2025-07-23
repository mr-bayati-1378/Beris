import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PaymentService } from '@/lib/payment';

function getUserFromToken(req: NextRequest): number | null {
  const token = req.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserFromToken(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const { orderId, gatewayName } = await req.json();

    if (!orderId || !gatewayName) {
      return NextResponse.json(
        { error: 'شناسه سفارش و نام درگاه الزامی است' },
        { status: 400 }
      );
    }

    // دریافت URL سایت برای callback
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const callbackUrl = `${protocol}://${host}/payment/callback`;

    const result = await PaymentService.createPayment(
      orderId,
      gatewayName,
      callbackUrl
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        paymentId: result.paymentId,
        paymentUrl: result.paymentUrl,
        message: 'درخواست پرداخت با موفقیت ایجاد شد'
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'خطا در ایجاد درخواست پرداخت' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'خطای سرور در ایجاد پرداخت' },
      { status: 500 }
    );
  }
} 