import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packId = parseInt(params.id);
    
    if (isNaN(packId)) {
      return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
    }

    // Check if pack exists and belongs to user
    const pack = await prisma.userPack.findFirst({
      where: {
        id: packId,
        userId: session.user.id,
      },
    });

    if (!pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    // Delete pack items first (due to foreign key constraint)
    await prisma.userPackItem.deleteMany({
      where: {
        userPackId: packId,
      },
    });

    // Delete the pack
    await prisma.userPack.delete({
      where: {
        id: packId,
      },
    });

    return NextResponse.json({ message: 'Pack deleted successfully' });
  } catch (error) {
    console.error('Error deleting pack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 