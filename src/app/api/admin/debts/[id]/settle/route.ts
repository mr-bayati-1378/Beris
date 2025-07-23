import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');
    const adminUserId = cookieStore.get('admin-user-id');
    
    if (!adminSession || adminSession.value !== 'authenticated' || !adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const debtId = parseInt(params.id);
    const body = await request.json();
    const { amount, paymentMethod, paymentDetails, notes } = body;

    if (!amount || !paymentMethod) {
      return NextResponse.json({ error: 'Amount and payment method are required' }, { status: 400 });
    }

    // Get the debt with payments
    const debt = await prisma.debt.findUnique({
      where: { id: debtId },
      include: {
        payments: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          }
        }
      }
    });

    if (!debt) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }

    // Calculate total paid amount
    const totalPaid = debt.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const remainingAmount = Number(debt.amount) - totalPaid;

    if (Number(amount) > remainingAmount) {
      return NextResponse.json({ error: 'Payment amount exceeds remaining debt' }, { status: 400 });
    }

    // Create payment record
    const payment = await prisma.debtPayment.create({
      data: {
        debtId: debtId,
        amount: amount,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails || null,
        adminId: adminUserId.value,
        notes: notes || null,
      }
    });

    // Update debt status
    const newTotalPaid = totalPaid + Number(amount);
    const newRemainingAmount = Number(debt.amount) - newTotalPaid;
    
    let newStatus = debt.status;
    if (newRemainingAmount <= 0) {
      newStatus = 'PAID';
    } else if (newTotalPaid > 0) {
      newStatus = 'PARTIAL';
    }

    // Check if overdue
    if (debt.dueDate < new Date() && newRemainingAmount > 0) {
      newStatus = 'OVERDUE';
    }

    await prisma.debt.update({
      where: { id: debtId },
      data: {
        paidAmount: newTotalPaid,
        remainingAmount: newRemainingAmount,
        status: newStatus,
      }
    });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        userId: adminUserId.value,
        action: 'DEBT_SETTLEMENT',
        entityType: 'DEBT',
        entityId: debtId.toString(),
        details: `تسویه بدهی مشتری ${debt.customer.firstName} ${debt.customer.lastName} به مبلغ ${amount} تومان`,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'بدهی با موفقیت تسویه شد',
      payment: payment,
      remainingAmount: newRemainingAmount,
      status: newStatus,
    });

  } catch (error) {
    console.error('Error settling debt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 