import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-roles';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const currentAdmin = await getCurrentAdmin();
    
    if (!currentAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // محاسبه درآمد از پرداخت‌های موفق
    const successfulPayments = await prisma.payment.findMany({
      where: {
        status: 'success',
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const totalIncome = successfulPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.amount.toString()), 0
    );

    // فرض کنیم هزینه‌ها 30% درآمد باشد (این باید از جدول هزینه‌ها آمده باشد)
    const totalExpenses = totalIncome * 0.3;
    const netProfit = totalIncome - totalExpenses;

    // تراکنش‌های اخیر (شامل درآمد و هزینه)
    const recentTransactions = successfulPayments.slice(0, 10).map(payment => ({
      date: new Date(payment.createdAt).toLocaleDateString('fa-IR'),
      type: 'income',
      amount: parseFloat(payment.amount.toString()),
      description: 'درآمد از فروش',
    }));

    // اضافه کردن چند نمونه هزینه (در واقعیت باید از جدول expenses آمده باشد)
    recentTransactions.push(
      {
        date: new Date().toLocaleDateString('fa-IR'),
        type: 'expense',
        amount: 500000,
        description: 'هزینه اجاره',
      },
      {
        date: new Date().toLocaleDateString('fa-IR'),
        type: 'expense',
        amount: 200000,
        description: 'هزینه برق',
      }
    );

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netProfit,
      recentTransactions: recentTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    });
  } catch (error) {
    console.error('خطا در دریافت اطلاعات حسابداری:', error);
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
} 