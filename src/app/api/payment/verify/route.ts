import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, authority, status } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'شناسه پرداخت الزامی است' },
        { status: 400 }
      );
    }

    // اگر کاربر پرداخت را لغو کرده
    if (status === 'NOK' || status === 'cancel') {
      return NextResponse.json({
        success: false,
        verified: false,
        error: 'پرداخت توسط کاربر لغو شد'
      });
    }

    if (!authority) {
      return NextResponse.json(
        { error: 'کد authority الزامی است' },
        { status: 400 }
      );
    }

    const result = await PaymentService.verifyPayment(
      parseInt(paymentId),
      authority
    );

    if (result.verified) {
      return NextResponse.json({
        success: true,
        verified: true,
        trackingCode: result.trackingCode,
        refId: result.refId,
        message: 'پرداخت با موفقیت تایید شد'
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        error: result.error || 'تایید پرداخت ناموفق بود'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'خطای سرور در تایید پرداخت' },
      { status: 500 }
    );
  }
}

// برای دریافت وضعیت پرداخت
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'شناسه پرداخت الزامی است' },
        { status: 400 }
      );
    }

    // دریافت اطلاعات پرداخت از دیتابیس
    const prisma = (await import('@/lib/prisma')).default;
    
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: {
        order: {
          select: {
            id: true,
            slug: true,
            status: true,
            total: true
          }
        },
        gateway: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'پرداخت یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        trackingCode: payment.trackingCode,
        referenceId: payment.referenceId,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        order: payment.order,
        gateway: payment.gateway
      }
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'خطای سرور در دریافت وضعیت پرداخت' },
      { status: 500 }
    );
  }
} 