import { NextResponse } from 'next/server';
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
    const categories = await prisma.categoryL1.findMany({
      where: {
        name: { not: 'نامعلوم' } // فیلتر کردن دسته‌بندی‌های نامعلوم
      },
      include: {
        categoryL2s: {
          where: {
            name: { not: 'نامعلوم' }
          },
          include: {
            categoryL3s: {
              where: {
                name: { not: 'نامعلوم' }
              },
              include: {
                _count: {
                  select: { 
                    products: {
                      where: { isActive: true }
                    }
                  }
                }
              },
              orderBy: { name: 'asc' }
            },
            _count: {
              select: { 
                categoryL3s: {
                  where: {
                    name: { not: 'نامعلوم' }
                  }
                }
              }
            }
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { 
            categoryL2s: {
              where: {
                name: { not: 'نامعلوم' }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Format the response
    const formattedCategories = categories.map(l1 => ({
      id: l1.id,
      name: l1.name,
      slug: l1.slug,
      categoryL2s: l1.categoryL2s.map(l2 => ({
        id: l2.id,
        name: l2.name,
        slug: l2.slug,
        categoryL1Id: l1.id,
        categoryL3s: l2.categoryL3s.map(l3 => ({
          id: l3.id,
          name: l3.name,
          slug: l3.slug,
          categoryL2Id: l2.id,
          _count: {
            products: l3._count.products
          }
        })),
        _count: {
          categoryL3s: l2._count.categoryL3s
        }
      })),
      _count: {
        categoryL2s: l1._count.categoryL2s
      }
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت ساختار دسته‌بندی‌ها' },
      { status: 500 }
    );
  }
}
