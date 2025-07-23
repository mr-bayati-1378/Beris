import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'وارد حساب کاربری شوید' }, { status: 401 });
    }

    const { productId, rating } = await request.json();

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'اطلاعات نامعتبر' }, { status: 400 });
    }

    // بررسی وجود محصول
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }

    // بررسی امتیاز قبلی کاربر
    const existingRating = await prisma.productRating.findFirst({
      where: {
        productId: parseInt(productId),
        userId: session.user.id
      }
    });

    if (existingRating) {
      // به‌روزرسانی امتیاز موجود
      await prisma.productRating.update({
        where: { id: existingRating.id },
        data: { rating: parseInt(rating) }
      });
    } else {
      // ایجاد امتیاز جدید
      await prisma.productRating.create({
        data: {
          productId: parseInt(productId),
          userId: session.user.id,
          rating: parseInt(rating)
        }
      });
    }

    // محاسبه میانگین امتیاز
    const ratings = await prisma.productRating.findMany({
      where: { productId: parseInt(productId) }
    });

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    // بروزرسانی میانگین در جدول محصولات (اختیاری)
    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        averageRating: averageRating
      }
    });

    return NextResponse.json({
      success: true,
      averageRating: averageRating.toFixed(1),
      totalRatings: ratings.length,
      userRating: parseInt(rating)
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت امتیاز' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');

    if (!productId) {
      return NextResponse.json({ error: 'شناسه محصول الزامی است' }, { status: 400 });
    }

    // اگر userId مشخص شده، امتیاز آن کاربر را برگردان
    if (userId && session?.user?.id === userId) {
      const userRating = await prisma.productRating.findFirst({
        where: {
          productId: parseInt(productId),
          userId: userId
        }
      });

      return NextResponse.json({
        userRating: userRating?.rating || 0
      });
    }

    // اطلاعات عمومی محصول
    const ratings = await prisma.productRating.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    // اگر کاربر وارد شده، امتیاز او را نیز برگردان
    let userRating = 0;
    if (session?.user?.id) {
      const userRatingRecord = ratings.find(r => r.userId === session.user.id);
      userRating = userRatingRecord?.rating || 0;
    }

    return NextResponse.json({
      averageRating: averageRating.toFixed(1),
      totalRatings: ratings.length,
      userRating: userRating,
      ratings: ratings.map(r => ({
        rating: r.rating,
        userName: `${r.user.firstName} ${r.user.lastName}`,
        createdAt: r.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت امتیازها' },
      { status: 500 }
    );
  }
} 