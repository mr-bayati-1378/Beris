import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Get product requests (for admins) or user's own requests
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { adminRole: true }
    });

    const isAdmin = user?.adminRole !== null;

    const where: any = {};
    
    if (!isAdmin) {
      // Regular users can only see their own requests
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [requests, total] = await Promise.all([
      prisma.productRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            }
          },
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productRequest.count({ where })
    ]);

    return NextResponse.json({
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching product requests:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت درخواست‌ها' },
      { status: 500 }
    );
  }
}

// POST - Create new product request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const { productName, description, quantity = 1, priority = 'NORMAL' } = await req.json();

    if (!productName?.trim()) {
      return NextResponse.json(
        { error: 'نام محصول الزامی است' },
        { status: 400 }
      );
    }

    const request = await prisma.productRequest.create({
      data: {
        userId: session.user.id,
        productName: productName.trim(),
        description: description?.trim() || null,
        quantity: Math.max(1, quantity),
        priority: priority as any,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: 'درخواست شما با موفقیت ثبت شد',
      request
    });
  } catch (error) {
    console.error('Error creating product request:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت درخواست' },
      { status: 500 }
    );
  }
}

// PUT - Update request status (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { adminRole: true }
    });

    if (!user?.adminRole) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const { requestId, status, adminNotes, priority } = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'شناسه درخواست الزامی است' },
        { status: 400 }
      );
    }

    const request = await prisma.productRequest.update({
      where: { id: requestId },
      data: {
        status: status,
        adminNotes: adminNotes,
        priority: priority,
        adminId: session.user.id,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: 'درخواست با موفقیت بروزرسانی شد',
      request
    });
  } catch (error) {
    console.error('Error updating product request:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی درخواست' },
      { status: 500 }
    );
  }
} 