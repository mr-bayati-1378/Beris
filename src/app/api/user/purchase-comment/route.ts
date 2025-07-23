import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'احراز هویت نشده' },
        { status: 401 }
      );
    }

    const { orderId, rating, comment, isPublic } = await request.json();
    const userId = session.user.id;

    // بررسی معتبر بودن orderId
    if (!orderId || !rating || !comment) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص ارسال شده' },
        { status: 400 }
      );
    }

    // بررسی امتیاز (باید بین 1 تا 5 باشد)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'امتیاز باید بین ۱ تا ۵ باشد' },
        { status: 400 }
      );
    }

    // بررسی اینکه سفارش متعلق به کاربر باشد و تکمیل شده باشد
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: 'COMPLETED'
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد یا هنوز تکمیل نشده' },
        { status: 404 }
      );
    }

    // بررسی اینکه قبلاً نظر ثبت نشده باشد
    const existingComment = await prisma.purchaseComment.findUnique({
      where: { orderId }
    });

    if (existingComment) {
      return NextResponse.json(
        { error: 'قبلاً برای این سفارش نظر ثبت شده است' },
        { status: 400 }
      );
    }

    // ثبت نظر جدید
    const purchaseComment = await prisma.purchaseComment.create({
      data: {
        orderId,
        userId,
        rating,
        comment,
        isPublic: isPublic || false
      },
      include: {
        order: {
          select: {
            slug: true,
            total: true,
            createdAt: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      comment: purchaseComment,
      message: 'نظر شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد'
    });

  } catch (error) {
    console.error('Error submitting purchase comment:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نظر' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'احراز هویت نشده' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // دریافت نظرات کاربر
    const comments = await prisma.purchaseComment.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            slug: true,
            total: true,
            createdAt: true,
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      comments
    });

  } catch (error) {
    console.error('Error fetching purchase comments:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نظرات' },
      { status: 500 }
    );
  }
} 