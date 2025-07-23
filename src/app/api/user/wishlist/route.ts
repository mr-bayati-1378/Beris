import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { productId } = await req.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'اطلاعات ناقص است.' }, { status: 400 });
    }

    await prisma.favorite.deleteMany({ where: { userId, productId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from favorites:', error);
    return NextResponse.json(
      { error: 'خطا در حذف از علاقه‌مندی‌ها' },
      { status: 500 }
    );
  }
}
