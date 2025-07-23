import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { 
  createDiscountCode, 
  calculateLogarithmicDiscount,
  getDiscountSuggestions,
  getLoyaltyLevel
} from '@/lib/discount-system';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'احراز هویت نشده' },
        { status: 401 }
      );
    }

    const userId = session.user.id; // Keep as string

    // دریافت تاریخچه خرید مشتری
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: 'COMPLETED'
      },
      select: {
        total: true,
        createdAt: true
      }
    });

    const totalPurchases = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const orderCount = orders.length;
    const lastOrderDate = orders.length > 0 ? orders[orders.length - 1].createdAt : new Date();
    const loyaltyLevel = getLoyaltyLevel(totalPurchases, orderCount);

    const purchaseHistory = {
      totalPurchases,
      orderCount,
      lastOrderDate,
      loyaltyLevel
    };

    // ایجاد کد تخفیف
    const discountCodeData = createDiscountCode(parseInt(userId), purchaseHistory);
    
    // دریافت پیشنهادات
    const suggestions = getDiscountSuggestions(purchaseHistory);

    // ذخیره کد تخفیف در دیتابیس (در صورت معتبر بودن)
    if (discountCodeData.isValid) {
      try {
        await prisma.discountCode.create({
          data: {
            code: discountCodeData.code,
            userId,
            percentage: discountCodeData.percentage,
            minPurchase: discountCodeData.minPurchase,
            maxDiscount: discountCodeData.maxDiscount,
            expiresAt: discountCodeData.expiresAt,
            isActive: true
          }
        });
      } catch (error) {
        // در صورت وجود کد تکراری، کد جدید تولید نمی‌کنیم
        console.log('Discount code already exists for user');
      }
    }

    return NextResponse.json({
      success: true,
      purchaseHistory,
      discountCode: discountCodeData,
      suggestions,
      currentDiscount: calculateLogarithmicDiscount(totalPurchases)
    });

  } catch (error) {
    console.error('Error generating discount code:', error);
    return NextResponse.json(
      { error: 'خطا در تولید کد تخفیف' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'احراز هویت نشده' },
        { status: 401 }
      );
    }

    const { forceGenerate } = await request.json();
    const userId = session.user.id; // Keep as string

    // حذف کدهای تخفیف قدیمی کاربر (در صورت درخواست تولید مجدد)
    if (forceGenerate) {
      await prisma.discountCode.deleteMany({
        where: {
          userId,
          isUsed: false
        }
      });
    }

    // تولید کد تخفیف جدید
    return GET(request);

  } catch (error) {
    console.error('Error creating new discount code:', error);
    return NextResponse.json(
      { error: 'خطا در تولید کد تخفیف جدید' },
      { status: 500 }
    );
  }
} 