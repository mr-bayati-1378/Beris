import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';
    
    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    // دریافت محصولات با موجودی کم
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 10, gt: 0 },
        isActive: true
      },
      include: {
        categoryL3: {
          include: {
            categoryL2: {
              include: {
                categoryL1: true
              }
            }
          }
        }
      },
      orderBy: { stock: 'asc' }
    });

    // دریافت محصولات ناموجود
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        stock: 0,
        isActive: true
      },
      include: {
        categoryL3: {
          include: {
            categoryL2: {
              include: {
                categoryL1: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // آمار کلی
    const stats = {
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalAlerts: lowStockProducts.length + outOfStockProducts.length
    };

    return NextResponse.json({
      lowStockProducts: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        price: Number(product.price),
        category: product.categoryL3?.categoryL2?.categoryL1?.name || 'نامشخص',
        lastUpdated: product.updatedAt
      })),
      outOfStockProducts: outOfStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        price: Number(product.price),
        category: product.categoryL3?.categoryL2?.categoryL1?.name || 'نامشخص',
        lastUpdated: product.updatedAt
      })),
      stats
    });

  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت هشدارهای موجودی' },
      { status: 500 }
    );
  }
}

// ایجاد هشدار جدید
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';
    
    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { productId, type, message } = await request.json();

    const alert = await prisma.stockAlert.create({
      data: {
        productId,
        type, // 'low_stock', 'out_of_stock', 'custom'
        message,
        isResolved: false
      }
    });

    return NextResponse.json({ alert });

  } catch (error) {
    console.error('Error creating stock alert:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد هشدار' },
      { status: 500 }
    );
  }
} 