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

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID دسته‌بندی نامعتبر است' }, { status: 400 });
    }

    const category = await prisma.categoryL1.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('خطا در دریافت دسته‌بندی L1:', error);
    return NextResponse.json({ error: 'خطا در دریافت دسته‌بندی' }, { status: 500 });
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

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID دسته‌بندی نامعتبر است' }, { status: 400 });
    }

    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'نام و slug الزامی است' }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await prisma.categoryL1.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 });
    }

    // Check if slug already exists (excluding current category)
    const duplicateSlug = await prisma.categoryL1.findFirst({
      where: { 
        slug: slug.trim(),
        id: { not: categoryId }
      },
    });

    if (duplicateSlug) {
      return NextResponse.json({ error: 'این slug قبلاً استفاده شده است' }, { status: 409 });
    }

    // Update category
    const updatedCategory = await prisma.categoryL1.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        slug: slug.trim(),
      },
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error('خطا در ویرایش دسته‌بندی L1:', error);
    return NextResponse.json({ error: 'خطا در ویرایش دسته‌بندی' }, { status: 500 });
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

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID دسته‌بندی نامعتبر است' }, { status: 400 });
    }

    // Check if category has subcategories
    const hasSubcategories = await prisma.categoryL2.findFirst({
      where: { categoryL1Id: categoryId },
    });

    if (hasSubcategories) {
      return NextResponse.json({ 
        error: 'این دسته‌بندی دارای زیر دسته است و قابل حذف نیست' 
      }, { status: 400 });
    }

    await prisma.categoryL1.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: 'دسته‌بندی با موفقیت حذف شد' });
  } catch (error) {
    console.error('خطا در حذف دسته‌بندی L1:', error);
    return NextResponse.json({ error: 'خطا در حذف دسته‌بندی' }, { status: 500 });
  }
} 