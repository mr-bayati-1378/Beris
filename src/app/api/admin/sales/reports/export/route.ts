import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin-roles';
import * as XLSX from 'xlsx';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';
    
    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'excel';
    const range = searchParams.get('range') || 'week';

    // For now, return a simple CSV content as mock export
    const csvContent = `Date,Sales,Revenue
2024-01-01,10,1000000
2024-01-02,15,1500000
2024-01-03,8,800000
2024-01-04,12,1200000
2024-01-05,20,2000000`;

    const headers = new Headers();
    
    if (format === 'excel') {
      headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      headers.set('Content-Disposition', `attachment; filename="sales-report-${range}.xlsx"`);
    } else {
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Disposition', `attachment; filename="sales-report-${range}.pdf"`);
    }

    // Return the CSV content as a blob for now
    // In a real implementation, you would generate actual Excel/PDF files
    return new Response(csvContent, { headers });

  } catch (error) {
    console.error('Error exporting sales report:', error);
    return NextResponse.json(
      { error: 'خطا در صادرات گزارش' },
      { status: 500 }
    );
  }
} 