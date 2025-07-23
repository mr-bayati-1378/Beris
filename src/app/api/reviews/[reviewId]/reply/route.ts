import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'احراز هویت لازم است' },
        { status: 401 }
      );
    }

    const { content } = await request.json();
    const reviewId = parseInt(params.reviewId);

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'متن پاسخ الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود نظر
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'نظر یافت نشد' },
        { status: 404 }
      );
    }

    // ایجاد پاسخ جدید
    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        userId: session.user.id,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        }
      }
    });

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت پاسخ' },
      { status: 500 }
    );
  }
} 