import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting inventory status check...');
    
    // Get last sync time
    const lastSync = await prisma.systemSetting.findUnique({
      where: { key: 'last_inventory_sync' }
    });
    
    console.log('Last sync found:', lastSync);
    
    // Get product statistics
    const totalProducts = await prisma.product.count();
    const inStockProducts = await prisma.product.count({
      where: { stock: { gt: 0 } }
    });
    const outOfStockProducts = await prisma.product.count({
      where: { stock: { equals: 0 } }
    });
    
    // Get recent price updates (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentUpdates = await prisma.product.count({
      where: {
        updatedAt: {
          gte: yesterday
        }
      }
    });
    
    const now = new Date();
    const lastSyncTime = lastSync ? new Date(lastSync.value) : null;
    const hoursSinceLastSync = lastSyncTime 
      ? (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60)
      : null;
    
    const response = {
      syncStatus: {
        lastSync: lastSyncTime?.toISOString(),
        hoursSinceLastSync,
        nextSync: lastSyncTime 
          ? new Date(lastSyncTime.getTime() + 6 * 60 * 60 * 1000).toISOString()
          : null,
        isSyncNeeded: hoursSinceLastSync === null || hoursSinceLastSync >= 6
      },
      inventory: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        recentUpdates
      },
      settings: {
        syncInterval: '6 hours',
        autoSync: true
      }
    };
    
    console.log('Response prepared:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error getting inventory status:', error);
    return NextResponse.json(
      { 
        error: 'خطا در دریافت وضعیت موجودی',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 