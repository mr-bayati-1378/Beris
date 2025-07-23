import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
        orders: {
          include: {
            items: {
              select: {
                price: true,
                quantity: true,
              },
            },
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('خطا در دریافت کاربران:', error);
    return NextResponse.json({ error: 'خطا در دریافت کاربران' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { firstName, lastName, phone, email, isAdmin = false } = await request.json();

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'اطلاعات ضروری ناقص است' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'کاربری با این شماره تلفن موجود است' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        password: 'temp123', // Default temporary password
        isAdmin,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('خطا در ایجاد کاربر:', error);
    return NextResponse.json({ error: 'خطا در ایجاد کاربر' }, { status: 500 });
  }
} 