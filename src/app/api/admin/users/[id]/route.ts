import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: 'شناسه کاربر نامعتبر' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
        orders: {
          select: {
            id: true,
            slug: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('خطا در دریافت کاربر:', error);
    return NextResponse.json({ error: 'خطا در دریافت کاربر' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: 'شناسه کاربر نامعتبر' }, { status: 400 });
    }

    const updateData = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    // If updating phone, check uniqueness
    if (updateData.phone && updateData.phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone: updateData.phone },
      });

      if (phoneExists) {
        return NextResponse.json({ error: 'کاربری با این شماره تلفن موجود است' }, { status: 409 });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('خطا در بروزرسانی کاربر:', error);
    return NextResponse.json({ error: 'خطا در بروزرسانی کاربر' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: 'شناسه کاربر نامعتبر' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    // Delete user and all related data using transaction
    await prisma.$transaction(async (tx) => {
      // Delete user's wishlist items
      await tx.wishlistItem.deleteMany({
        where: {
          wishlist: {
            userId: userId,
          },
        },
      });

      // Delete user's wishlist
      await tx.wishlist.deleteMany({
        where: { userId: userId },
      });

      // Delete user's order items
      await tx.orderItem.deleteMany({
        where: {
          order: {
            userId: userId,
          },
        },
      });

      // Delete user's orders
      await tx.order.deleteMany({
        where: { userId: userId },
      });

      // Delete user's addresses
      await tx.address.deleteMany({
        where: { userId: userId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({ message: 'کاربر با موفقیت حذف شد' });
  } catch (error) {
    console.error('خطا در حذف کاربر:', error);
    return NextResponse.json({ error: 'خطا در حذف کاربر' }, { status: 500 });
  }
} 