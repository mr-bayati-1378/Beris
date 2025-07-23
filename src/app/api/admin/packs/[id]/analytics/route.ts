import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin-roles';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check permissions
    const hasPermission = await checkAdminPermission('packs');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const packId = parseInt(params.id);
    
    if (isNaN(packId)) {
      return NextResponse.json(
        { error: 'Invalid pack ID' },
        { status: 400 }
      );
    }

    // Handle regular pack analytics
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true,
              }
            }
          }
        },
        invoiceItems: {
          include: {
            invoice: {
              select: {
                status: true,
                totalAmount: true,
                createdAt: true,
              }
            }
          }
        }
      }
    });

    if (!pack) {
      return NextResponse.json(
        { error: 'Pack not found' },
        { status: 404 }
      );
    }

    // Filter completed/paid invoices
    const completedInvoiceItems = pack.invoiceItems.filter(item => 
      item.invoice.status === 'PAID'
    );

    // Calculate total sales and revenue
    const salesCount = completedInvoiceItems.reduce((total, item) => total + item.quantity, 0);
    const revenue = completedInvoiceItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

    // Calculate monthly sales
    const monthlySales = completedInvoiceItems.reduce((acc, item) => {
      const date = new Date(item.invoice.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existingMonth = acc.find(m => m.month === monthKey);
      if (existingMonth) {
        existingMonth.salesCount += item.quantity;
        existingMonth.revenue += Number(item.price) * item.quantity;
      } else {
        acc.push({
          month: monthKey,
          salesCount: item.quantity,
          revenue: Number(item.price) * item.quantity,
        });
      }
      
      return acc;
    }, [] as { month: string; salesCount: number; revenue: number }[])
    .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate sales by channel
    const channelSales = completedInvoiceItems.reduce((acc, item) => {
      const channel = 'direct';
    
      const existingChannel = acc.find(c => c.channel === channel);
      if (existingChannel) {
        existingChannel.salesCount += item.quantity;
        existingChannel.revenue += Number(item.price) * item.quantity;
      } else {
        acc.push({
          channel,
          salesCount: item.quantity,
          revenue: Number(item.price) * item.quantity,
        });
      }
      
      return acc;
    }, [] as { channel: string; salesCount: number; revenue: number }[])
    .sort((a, b) => b.salesCount - a.salesCount);

    return NextResponse.json({
      id: pack.id,
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      isCustomPack: false,
      salesCount,
      revenue,
      items: pack.items,
      monthlySales,
      channelSales,
      createdAt: pack.createdAt,
      updatedAt: pack.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching pack analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 