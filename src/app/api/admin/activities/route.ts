import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { checkAdminPermission } from '@/lib/admin-roles';

export async function GET(request: NextRequest) {
  try {
    // بررسی دسترسی (فقط ادمین کل و مدیران مالی)
    const hasPermission = await checkAdminPermission('all') || await checkAdminPermission('financial_reports');
    if (!hasPermission) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const action = searchParams.get('action');
    const entity = searchParams.get('entity');
    const user = searchParams.get('user');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // ساخت فیلتر
    const where: any = {};

    if (search) {
      where.description = {
        contains: search,
      };
    }

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (user) {
      where.user = {
        phone: user,
      };
    }

    if (from && to) {
      where.createdAt = {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      };
    } else if (from) {
      where.createdAt = {
        gte: new Date(from),
      };
    } else if (to) {
      where.createdAt = {
        lte: new Date(to + 'T23:59:59.999Z'),
      };
    }

    const activities = await prisma.adminActivity.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            adminRole: {
              select: {
                displayName: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // محدود کردن نتایج
    });

    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    return NextResponse.json({ error: 'خطا در دریافت فعالیت‌ها' }, { status: 500 });
  }
} 