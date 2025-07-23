import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get main categories (L1) with their products
    const categories = await prisma.categoryL1.findMany({
      where: {
        name: { not: 'نامعلوم' }
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
                products: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    slug: true,
                    brand: true,
                    description: true,
                    images: {
                      select: {
                        url: true
                      },
                      take: 1
                    }
                  },
                  take: 12, // Limit products per category
                  orderBy: {
                    createdAt: 'desc'
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform the data for frontend
    const categoriesWithProducts = categories.map(l1 => {
      // Collect all products from all L3 categories under this L1
      const allProducts: any[] = [];
      
      l1.categoryL2s.forEach(l2 => {
        l2.categoryL3s.forEach(l3 => {
          allProducts.push(...l3.products.map(product => ({
            ...product,
            img: product.images && product.images.length > 0 
              ? product.images[0].url 
              : '/default-product.png'
          })));
        });
      });

      // Remove duplicates and take first 12
      const uniqueProducts = allProducts
        .filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )
        .slice(0, 12);

      return {
        id: l1.id,
        name: l1.name,
        slug: l1.slug,
        products: uniqueProducts,
        productCount: uniqueProducts.length
      };
    }).filter(category => category.productCount > 0); // Only return categories with products

    return NextResponse.json({
      categories: categoriesWithProducts,
      total: categoriesWithProducts.length
    });
  } catch (error) {
    console.error('Error fetching categories with products:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت دسته‌بندی‌ها' },
      { status: 500 }
    );
  }
} 