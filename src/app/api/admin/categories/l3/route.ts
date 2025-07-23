import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { name, slug, categoryL2Id } = await request.json();

    if (!name || !slug || !categoryL2Id) {
      return NextResponse.json({ error: 'نام، slug و دسته‌بندی والد الزامی است' }, { status: 400 });
    }

    // Check if L2 category exists
    const parentCategory = await prisma.categoryL2.findUnique({
      where: { id: categoryL2Id },
      include: {
        categoryL1: true,
      },
    });

    if (!parentCategory) {
      return NextResponse.json({ error: 'دسته‌بندی والد یافت نشد' }, { status: 404 });
    }

    // Check if slug already exists
    const existingCategory = await prisma.categoryL3.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'این slug قبلاً استفاده شده است' }, { status: 409 });
    }

    // Create category
    const category = await prisma.categoryL3.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        categoryL2Id,
      },
      include: {
        categoryL2: {
          include: {
            categoryL1: true,
          },
        },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('خطا در ایجاد دسته‌بندی L3:', error);
    return NextResponse.json({ error: 'خطا در ایجاد دسته‌بندی' }, { status: 500 });
  }
} 