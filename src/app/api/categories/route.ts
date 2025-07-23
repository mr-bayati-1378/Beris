import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get all category levels
    const [l1Categories, l2Categories, l3Categories] = await Promise.all([
      prisma.categoryL1.findMany({
        where: { name: { not: 'نامعلوم' } },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.categoryL2.findMany({
        where: { name: { not: 'نامعلوم' } },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.categoryL3.findMany({
        where: { name: { not: 'نامعلوم' } },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Combine all categories with proper IDs to avoid conflicts
    const allCategories = [
      ...l1Categories.map(cat => ({ ...cat, id: `l1_${cat.id}`, level: 1 })),
      ...l2Categories.map(cat => ({ ...cat, id: `l2_${cat.id}`, level: 2 })),
      ...l3Categories.map(cat => ({ ...cat, id: `l3_${cat.id}`, level: 3 })),
    ];

    // Add default image to categories
    const categoriesWithImages = allCategories.map(category => ({
      ...category,
      img: '/default-category.jpg',
    }));

    return NextResponse.json({ categories: categoriesWithImages });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت دسته‌بندی‌ها' },
      { status: 500 }
    );
  }
}
