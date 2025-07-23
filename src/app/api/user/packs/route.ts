import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// دریافت پک‌های کاربر
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const includePublic = url.searchParams.get('includePublic') === 'true';

    const whereClause = includePublic 
      ? {
          OR: [
            { userId },
            { isPublic: true, isActive: true }
          ]
        }
      : { userId };

    const userPacks = await prisma.userPack.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                image: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { userId: userId ? 'asc' : 'desc' }, // کاربر خودش اول
        { createdAt: 'desc' },
      ],
    });

    const packsWithTotalPrice = userPacks.map(pack => {
      const totalPrice = pack.items.reduce((sum, item) => {
        return sum + (Number(item.product.price) * item.quantity);
      }, 0);

      return {
        id: pack.id,
        name: pack.name,
        description: pack.description,
        isPublic: pack.isPublic,
        isActive: pack.isActive,
        totalPrice,
        itemCount: pack.items.length,
        createdAt: pack.createdAt,
        isOwner: pack.userId === userId,
        creator: pack.userId === userId ? null : {
          name: `${pack.user.firstName} ${pack.user.lastName}`,
        },
        items: pack.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          notes: item.notes,
          product: item.product,
        })),
      };
    });

    return NextResponse.json({ packs: packsWithTotalPrice });
  } catch (error) {
    console.error('Error fetching user packs:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پک‌ها' },
      { status: 500 }
    );
  }
}

// ایجاد پک جدید
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, description, isPublic = false, items } = await req.json();

    // اعتبارسنجی
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'نام پک الزامی است' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'حداقل یک محصول باید به پک اضافه شود' },
        { status: 400 }
      );
    }

    // بررسی وجود محصولات
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'برخی از محصولات انتخاب شده وجود ندارند' },
        { status: 400 }
      );
    }

    // محاسبه قیمت کل
    let totalPrice = 0;
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalPrice += Number(product.price) * item.quantity;
      }
    }

    // ایجاد پک
    const userPack = await prisma.userPack.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId,
        isPublic: Boolean(isPublic),
        totalPrice,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes?.trim() || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                image: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'پک با موفقیت ایجاد شد',
      pack: {
        id: userPack.id,
        name: userPack.name,
        description: userPack.description,
        isPublic: userPack.isPublic,
        isActive: userPack.isActive,
        totalPrice: Number(userPack.totalPrice),
        itemCount: userPack.items.length,
        items: userPack.items,
      },
    });
  } catch (error) {
    console.error('Error creating user pack:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد پک' },
      { status: 500 }
    );
  }
} 