import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    // Input validation
    if (!phone || !password) {
      console.log('Login failed: Missing credentials', {
        phone: !!phone,
        password: !!password,
      });
      return NextResponse.json(
        { error: 'شماره موبایل و رمز عبور الزامی است.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      console.log('Login failed: User not found', { phone });
      return NextResponse.json(
        { error: 'کاربری با این شماره وجود ندارد.' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Login failed: Invalid password', { phone });
      return NextResponse.json(
        { error: 'رمز عبور اشتباه است.' },
        { status: 401 }
      );
    }

    // Use NextAuth signIn
    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        return NextResponse.json(
          { error: 'خطا در ورود به سیستم' },
          { status: 401 }
        );
      }

      // Return success response
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      });
    } catch (authError) {
      console.error('NextAuth signIn error:', authError);
      return NextResponse.json(
        { error: 'خطا در احراز هویت' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: 'خطای سیستمی رخ داده است. لطفا دوباره تلاش کنید.',
        debug: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
