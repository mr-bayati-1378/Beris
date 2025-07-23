import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - دریافت آدرس‌های کاربر
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - افزودن آدرس جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, address, city, state, zipCode } = body;

    if (!title || !address || !city || !zipCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // اگر این اولین آدرس باشد، آن را پیش‌فرض قرار بده
    const existingAddresses = await prisma.address.count({
      where: { userId: session.user.id }
    });

    const newAddress = await prisma.address.create({
      data: {
        title,
        address,
        city,
        state: state || city,
        zipCode,
        isDefault: existingAddresses === 0, // اولین آدرس پیش‌فرض است
        userId: session.user.id,
      }
    });

    return NextResponse.json({ address: newAddress });
  } catch (error) {
    console.error('Error creating user address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 