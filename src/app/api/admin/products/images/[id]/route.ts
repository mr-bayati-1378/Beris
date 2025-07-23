import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = parseInt(params.id);

    // Get image info
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: 'تصویر یافت نشد' }, { status: 404 });
    }

    // Delete file from filesystem
    const filePath = join(process.cwd(), 'public', image.url);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Delete from database
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({
      success: true,
      message: 'تصویر با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'خطا در حذف تصویر' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
