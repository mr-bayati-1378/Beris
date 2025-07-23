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

    const { voteType } = await request.json();
    const reviewId = parseInt(params.reviewId);

    if (!voteType || !['helpful', 'unhelpful'].includes(voteType)) {
      return NextResponse.json(
        { error: 'نوع رای نامعتبر است' },
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

    // بررسی رای قبلی کاربر
    const existingVote = await prisma.reviewVote.findFirst({
      where: {
        reviewId,
        userId: session.user.id
      }
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // حذف رای اگر همان نوع است
        await prisma.reviewVote.delete({
          where: { id: existingVote.id }
        });
      } else {
        // تغییر نوع رای
        await prisma.reviewVote.update({
          where: { id: existingVote.id },
          data: { voteType }
        });
      }
    } else {
      // ایجاد رای جدید
      await prisma.reviewVote.create({
        data: {
          reviewId,
          userId: session.user.id,
          voteType
        }
      });
    }

    // محاسبه تعداد رای‌ها
    const helpfulVotes = await prisma.reviewVote.count({
      where: { reviewId, voteType: 'helpful' }
    });

    const unhelpfulVotes = await prisma.reviewVote.count({
      where: { reviewId, voteType: 'unhelpful' }
    });

    // بررسی رای فعلی کاربر
    const currentUserVote = await prisma.reviewVote.findFirst({
      where: { reviewId, userId: session.user.id }
    });

    return NextResponse.json({
      helpfulCount: helpfulVotes,
      unhelpfulCount: unhelpfulVotes,
      userVote: currentUserVote?.voteType || null
    });

  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت رای' },
      { status: 500 }
    );
  }
} 