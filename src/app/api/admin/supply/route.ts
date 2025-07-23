import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, checkAdminPermission } from '@/lib/admin-roles';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    // بررسی دسترسی
    const hasPermission = await checkAdminPermission('procurement') || 
                         await checkAdminPermission('purchase_orders') ||
                         await checkAdminPermission('supplier_management');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    // گرفتن آمار کلی
    const [
      totalSuppliers,
      activePurchaseOrders,
      pendingInvoices
    ] = await Promise.all([
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.purchaseOrder.count({ 
        where: { 
          status: { in: ['PENDING', 'APPROVED', 'ORDERED'] } 
        } 
      }),
      prisma.purchaseInvoice.count({
        where: {
          status: { in: ['PENDING', 'DRAFT'] }
        }
      })
    ]);

    // محاسبه ارزش کل خریدها
    const totalPurchaseValue = await prisma.purchaseInvoice.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: 'PAID'
      }
    });

    // محاسبه خرید ماهانه (30 روز گذشته)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const monthlySpend = await prisma.purchaseInvoice.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        createdAt: {
          gte: monthAgo
        },
        status: 'PAID'
      }
    });

    const stats = {
      totalSuppliers,
      activePurchaseOrders,
      pendingInvoices,
      totalPurchaseValue: totalPurchaseValue._sum.totalAmount || 0,
      monthlySpend: monthlySpend._sum.totalAmount || 0,
      avgDeliveryTime: 7 // پیش‌فرض - باید محاسبه شود
    };

    return NextResponse.json({ 
      success: true, 
      stats 
    });

  } catch (error) {
    console.error('Error fetching supply stats:', error);
    return NextResponse.json({ 
      error: 'خطا در دریافت آمار' 
    }, { status: 500 });
  }
} 