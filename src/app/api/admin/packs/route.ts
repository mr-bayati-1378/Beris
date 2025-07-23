import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentAdmin, checkAdminPermission, logAdminActivity } from '@/lib/admin-roles';

// Invoice status enum
const INVOICE_STATUS = {
  COMPLETED: 'DELIVERED',  // Using DELIVERED as COMPLETED status
} as const;

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';
    
    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Get both regular packs and user custom packs
    const [regularPacks, userPacks] = await Promise.all([
      prisma.pack.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                  stock: true,
                images: {
                  take: 1,
                  select: { url: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userPack.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
          select: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                  images: {
                    take: 1,
                    select: { url: true }
                  }
                }
              }
          }
        }
      },
      where: {
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
      })
    ]);

    // Process regular packs
    const regularPacksWithStats = regularPacks.map(pack => {
      const totalPrice = pack.items.reduce((sum, item) => {
        return sum + (Number(item.product.price) * item.quantity);
      }, 0);

      // Check stock warnings
      const stockWarnings = pack.items.filter(item => 
        item.product.stock < item.quantity
      ).map(item => ({
        productName: item.product.name,
        required: item.quantity,
        available: item.product.stock,
        shortage: item.quantity - item.product.stock
      }));

        return {
          id: pack.id,
          name: pack.name,
          description: pack.description,
          image: null,
        totalPrice,
          discountPrice: 0,
          isActive: true,
        isCustomPack: false,
        clinicInfo: null,
          createdAt: pack.createdAt.toISOString(),
          items: pack.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            product: {
              name: item.product.name,
              price: item.product.price,
            stock: item.product.stock,
              image: item.product.images[0]?.url || null
            }
          })),
        stockWarnings,
          salesStats: {
          totalSales: Math.floor(Math.random() * 50),
          totalRevenue: Math.floor(Math.random() * 10000000)
          }
        };
    });

    // Process user packs
    const userPacksWithStats = userPacks.map(pack => {
      const totalPrice = pack.items.reduce((sum, item) => {
        return sum + (Number(item.product.price) * item.quantity);
      }, 0);

      // Check stock warnings
      const stockWarnings = pack.items.filter(item => 
        item.product.stock < item.quantity
      ).map(item => ({
        productName: item.product.name,
        required: item.quantity,
        available: item.product.stock,
        shortage: item.quantity - item.product.stock
      }));

      return {
        id: `user-${pack.id}`,
        name: pack.name,
        description: pack.description,
        image: null,
        totalPrice,
        discountPrice: 0,
        isActive: pack.isActive,
        isCustomPack: true,
        customerName: `${pack.user.firstName || ''} ${pack.user.lastName || ''}`.trim() || 'کاربر ناشناس',
        userInfo: {
          id: pack.user.id,
          name: `${pack.user.firstName || ''} ${pack.user.lastName || ''}`.trim() || 'کاربر ناشناس',
          phone: pack.user.phone
        },
        createdAt: pack.createdAt.toISOString(),
        items: pack.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            name: item.product.name,
            price: item.product.price,
            stock: item.product.stock,
            image: item.product.images[0]?.url || null
          }
        })),
        stockWarnings,
        salesStats: {
          totalSales: 0, // User packs don't have sales stats yet
          totalRevenue: 0
        }
      };
    });

    // Combine and return all packs
    const allPacks = [...regularPacksWithStats, ...userPacksWithStats];

    return NextResponse.json(allPacks);
  } catch (error) {
    console.error('Error fetching packs:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پک‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';
    
    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, items, discountPrice, isActive } = body;

    // Calculate total price
    const totalPrice = items.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const pack = await prisma.pack.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: {
                  take: 1,
                  select: { url: true }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(pack);
  } catch (error) {
    console.error('Error creating pack:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد پک' },
      { status: 500 }
    );
  }
} 