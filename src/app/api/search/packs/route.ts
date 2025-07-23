import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({ packs: [] });
    }

    // جستجو در پک‌های کاربر
    const packs = await prisma.userPack.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        OR: [
          {
            name: {
              contains: query
            }
          },
          {
            description: {
              contains: query
            }
          }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                slug: true
              }
            }
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // تبدیل به فرمت مناسب
    const formattedPacks = packs.map(pack => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      price: pack.totalPrice || 0,
      itemCount: pack.items.length,
      image: pack.items[0]?.product?.image || '/default-pack.png',
      slug: `pack-${pack.id}`,
      type: 'pack',
      packItems: pack.items.map(item => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    }));

    return NextResponse.json({ packs: formattedPacks });

  } catch (error) {
    console.error('Error searching packs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 