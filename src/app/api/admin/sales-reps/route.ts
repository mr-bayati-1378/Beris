import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // بررسی admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sales representatives (admin users with sales role)
    const salesReps = await prisma.user.findMany({
      where: {
        isAdmin: true,
        adminRoleId: {
          not: null
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        adminRole: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    // Process sales reps data
    const processedSalesReps = salesReps.map(rep => ({
      id: rep.id,
      name: `${rep.firstName} ${rep.lastName}`,
      firstName: rep.firstName,
      lastName: rep.lastName,
      phone: rep.phone,
      email: rep.email,
      role: rep.adminRole?.name || 'مدیر فروش'
    }));

    return NextResponse.json({
      salesReps: processedSalesReps,
      total: processedSalesReps.length
    });

  } catch (error) {
    console.error('Error fetching sales representatives:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 