import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'شناسه محصول الزامی است' }, { status: 400 });
    }

    const reviews = await prisma.productReview.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.content,
        userName: `${r.user.firstName} ${r.user.lastName}`,
        createdAt: r.createdAt,
        helpful: r.helpfulCount || 0
      }))
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نظرات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'وارد حساب کاربری شوید' }, { status: 401 });
    }

    const { productId, rating, comment } = await request.json();

    if (!productId || !rating || !comment || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'اطلاعات نامعتبر' }, { status: 400 });
    }

    // بررسی وجود محصول
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }

    // بررسی نظر قبلی کاربر
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId: parseInt(productId),
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'شما قبلاً نظر داده‌اید' }, { status: 400 });
    }

    // ایجاد نظر جدید
    const review = await prisma.productReview.create({
      data: {
        productId: parseInt(productId),
        userId: session.user.id,
        rating: parseInt(rating),
        title: 'نظر کاربر',
        content: comment.trim()
      }
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.content
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نظر' },
      { status: 500 }
    );
  }
} 