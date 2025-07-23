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

    const { name, slug, categoryL1Id } = await request.json();

    if (!name || !slug || !categoryL1Id) {
      return NextResponse.json({ error: 'نام، slug و دسته‌بندی والد الزامی است' }, { status: 400 });
    }

    // Check if L1 category exists
    const parentCategory = await prisma.categoryL1.findUnique({
      where: { id: categoryL1Id },
    });

    if (!parentCategory) {
      return NextResponse.json({ error: 'دسته‌بندی والد یافت نشد' }, { status: 404 });
    }

    // Check if slug already exists
    const existingCategory = await prisma.categoryL2.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'این slug قبلاً استفاده شده است' }, { status: 409 });
    }

    // Create category
    const category = await prisma.categoryL2.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        categoryL1Id,
      },
      include: {
        categoryL1: true,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('خطا در ایجاد دسته‌بندی L2:', error);
    return NextResponse.json({ error: 'خطا در ایجاد دسته‌بندی' }, { status: 500 });
  }
} 