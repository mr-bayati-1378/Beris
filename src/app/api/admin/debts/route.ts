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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'dueDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { customer: { firstName: { contains: search } } },
        { customer: { lastName: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { description: { contains: search } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'dueDate') {
      orderBy.dueDate = sortOrder;
    } else if (sortBy === 'amount') {
      orderBy.amount = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    }

    const debts = await prisma.debt.findMany({
      where,
      orderBy,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          }
        },
        order: {
          select: {
            id: true,
            slug: true,
          }
        },
        salesRep: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Calculate remaining amounts and filter by status if needed
    const processedDebts = debts.map(debt => {
      const totalPaid = debt.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const remaining = Number(debt.amount) - totalPaid;
      
      return {
        ...debt,
        remainingAmount: remaining,
        totalPaid,
        isOverdue: debt.dueDate < new Date() && remaining > 0,
      };
    });

    // Filter by status if needed
    let filteredDebts = processedDebts;
    if (status === 'overdue') {
      filteredDebts = processedDebts.filter(debt => debt.isOverdue);
    } else if (status === 'pending') {
      filteredDebts = processedDebts.filter(debt => debt.remainingAmount > 0 && !debt.isOverdue);
    } else if (status === 'paid') {
      filteredDebts = processedDebts.filter(debt => debt.remainingAmount <= 0);
    }

    return NextResponse.json({
      debts: filteredDebts,
      total: filteredDebts.length,
      totalAmount: filteredDebts.reduce((sum, debt) => sum + Number(debt.amount), 0),
      totalRemaining: filteredDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0),
    });

  } catch (error) {
    console.error('Error fetching debts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 