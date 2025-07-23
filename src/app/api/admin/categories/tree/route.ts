import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

type L3 = { 
  id: number; 
  name: string; 
  slug: string; 
  categoryL2Id: number;
  _count: { products: number } 
};

type L2 = { 
  id: number; 
  name: string; 
  slug: string; 
  categoryL1Id: number;
  categoryL3s: L3[];
  _count: { categoryL3s: number } 
};

type L1 = {
  id: number;
  name: string;
  slug: string;
  categoryL2s: L2[];
  _count: { categoryL2s: number }
};

export async function GET() {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';

    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const categories = await prisma.categoryL1.findMany({
      include: {
        categoryL2s: {
          include: {
            categoryL3s: {
              include: {
                _count: {
                  select: { products: true }
                }
              },
              orderBy: { name: 'asc' }
            },
            _count: {
              select: { categoryL3s: true }
            }
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { categoryL2s: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Log the results for debugging
    console.log('Found admin categories:', {
      total: categories.length,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        l2Count: c._count.categoryL2s,
        l2s: c.categoryL2s.map(l2 => ({
          id: l2.id,
          name: l2.name,
          l3Count: l2._count.categoryL3s
        }))
      }))
    });

    // Calculate product counts for each level
    const formatCategoriesWithCounts = (l1: L1) => {
      const l2sWithCounts = l1.categoryL2s.map(l2 => {
        const l3sWithCounts = l2.categoryL3s.map(l3 => ({
          id: l3.id,
          name: l3.name,
          slug: l3.slug,
          categoryL2Id: l2.id,
          level: 3,
          productCount: l3._count.products,
          _count: {
            products: l3._count.products
          }
        }));

        const l2ProductCount = l3sWithCounts.reduce((sum, l3) => sum + l3.productCount, 0);

        return {
          id: l2.id,
          name: l2.name,
          slug: l2.slug,
          categoryL1Id: l1.id,
          level: 2,
          productCount: l2ProductCount,
          categoryL3s: l3sWithCounts,
          _count: {
            categoryL3s: l2._count.categoryL3s,
            products: l2ProductCount
          }
        };
      });

      const l1ProductCount = l2sWithCounts.reduce((sum, l2) => sum + l2.productCount, 0);

      return {
        id: l1.id,
        name: l1.name,
        slug: l1.slug,
        level: 1,
        productCount: l1ProductCount,
        categoryL2s: l2sWithCounts,
        _count: {
          categoryL2s: l1._count.categoryL2s,
          products: l1ProductCount
        }
      };
    };

    // Format the response
    const formattedCategories = categories.map(formatCategoriesWithCounts);

    return NextResponse.json({
      categories: formattedCategories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching admin category tree:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت ساختار دسته‌بندی‌ها' },
      { status: 500 }
    );
  }
} 