import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - ویرایش آدرس
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = parseInt(params.id);
    const body = await request.json();
    const { title, address, city, state, zipCode, isDefault } = body;

    if (!title || !address || !city || !zipCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // بررسی اینکه آدرس متعلق به کاربر است
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // اگر این آدرس به عنوان پیش‌فرض تنظیم می‌شود، سایر آدرس‌ها را غیرپیش‌فرض کن
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          id: { not: addressId }
        },
        data: {
          isDefault: false
        }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        title,
        address,
        city,
        state: state || city,
        zipCode,
        isDefault: isDefault || false,
      }
    });

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error('Error updating user address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - تنظیم آدرس به عنوان پیش‌فرض
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = parseInt(params.id);

    // بررسی اینکه آدرس متعلق به کاربر است
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // تمام آدرس‌های کاربر را غیرپیش‌فرض کن
    await prisma.address.updateMany({
      where: {
        userId: session.user.id
      },
      data: {
        isDefault: false
      }
    });

    // این آدرس را پیش‌فرض کن
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        isDefault: true
      }
    });

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - حذف آدرس
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = parseInt(params.id);

    // بررسی اینکه آدرس متعلق به کاربر است
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // اگر آدرس پیش‌فرض است، آن را حذف نکن
    if (existingAddress.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default address' }, { status: 400 });
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting user address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 