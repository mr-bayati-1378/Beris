import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - دریافت نظرات محصول
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    
    // پیدا کردن محصول با slug
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    const reviews = await prisma.productReview.findMany({
      where: { productId: product.id, status: 'APPROVED' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        votes: {
          select: {
            id: true,
            voteType: true,
            userId: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // محاسبه تعداد votes و وضعیت کاربر فعلی
    const reviewsWithVoteData = reviews.map(review => {
      const helpfulCount = review.votes.filter(v => v.voteType === 'helpful').length;
      const unhelpfulCount = review.votes.filter(v => v.voteType === 'unhelpful').length;
      const userVote = session?.user?.id 
        ? review.votes.find(v => v.userId === session.user.id)?.voteType || null
        : null;

      return {
        id: review.id,
        userId: review.userId,
        user: review.user,
        rating: review.rating,
        title: review.title,
        content: review.content,
        helpfulCount,
        unhelpfulCount,
        userHelpfulVote: userVote,
        replies: review.replies,
        createdAt: review.createdAt
      };
    });

    return NextResponse.json({ reviews: reviewsWithVoteData });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نظرات' },
      { status: 500 }
    );
  }
}

// POST - افزودن نظر جدید
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'احراز هویت لازم است' },
        { status: 401 }
      );
    }

    // پیدا کردن محصول با slug
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    const { rating, title, content } = await request.json();

    // بررسی اینکه آیا کاربر قبلاً نظر داده است
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId: product.id,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'شما قبلاً برای این محصول نظر داده‌اید' },
        { status: 400 }
      );
    }

    const review = await prisma.productReview.create({
      data: {
        productId: product.id,
        userId: session.user.id,
        rating,
        title,
        content,
        status: 'PENDING'
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

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نظر' },
      { status: 500 }
    );
  }
} 