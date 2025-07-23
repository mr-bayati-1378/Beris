import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signIn } from 'next-auth/react';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    console.log('🔍 Admin login attempt for username:', username);
    
    // Find admin user by username or phone field (fallback compatibility)
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { username: username },
              { phone: username } // fallback for existing users
            ]
          },
          { isAdmin: true },
          { isActive: true }
        ]
      }
    });

    console.log('👤 User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('📋 User details:', {
        id: user.id,
        username: user.username,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Check password
    console.log('🔐 Checking password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Get user with admin role info
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        adminRole: true,
      },
    });

    // تعیین مسیر داشبورد بر اساس نقش کاربر
    let dashboardPath = '/admin'; // پیش‌فرض برای مدیرکل
    
    if (userWithRole?.adminRole?.name) {
      const roleName = userWithRole.adminRole.name;
      switch (roleName) {
        case 'sales':
          dashboardPath = '/admin-sales';
          break;
        case 'supply':
          dashboardPath = '/admin-supply';
          break;
        case 'finance':
          dashboardPath = '/admin-finance';
          break;
        case 'warehouse':
          dashboardPath = '/admin-warehouse';
          break;
        default:
          dashboardPath = '/admin';
      }
    }

    const response = NextResponse.json({
      success: true,
      redirectTo: dashboardPath,
      user: {
        id: user.id.toString(),
        username: user.username || user.phone, // prefer username over phone
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        adminRole: userWithRole?.adminRole
      }
    });

    // Set admin session cookie
    response.cookies.set('admin-session', 'authenticated', {
      httpOnly: false, // Allow JavaScript access for client-side checks
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    // Also set user ID for auth checking
    response.cookies.set('admin-user-id', user.id.toString(), {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'خطا در سرور' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout endpoint
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin-session');
  response.cookies.delete('admin-user-id');
  return response;
} 