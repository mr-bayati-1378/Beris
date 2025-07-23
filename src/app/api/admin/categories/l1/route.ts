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

    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'نام و slug الزامی است' }, { status: 400 });
    }

    // Check if slug already exists
    const existingCategory = await prisma.categoryL1.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'این slug قبلاً استفاده شده است' }, { status: 409 });
    }

    // Create category
    const category = await prisma.categoryL1.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('خطا در ایجاد دسته‌بندی L1:', error);
    return NextResponse.json({ error: 'خطا در ایجاد دسته‌بندی' }, { status: 500 });
  }
} 