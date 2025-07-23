import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-roles';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({ hasPermission: false, isAdmin: false }, { status: 401 });
    }

    // اگر نقش ندارد، فقط بررسی کنیم که ادمین باشد
    if (!admin.adminRole) {
      return NextResponse.json({ 
        hasPermission: admin.isAdmin, 
        isAdmin: admin.isAdmin,
        permissions: admin.isAdmin ? ['all'] : []
      });
    }

    const permissions = admin.adminRole.permissions as string[];
    
    return NextResponse.json({
      hasPermission: true,
      isAdmin: admin.isAdmin,
      permissions,
      role: admin.adminRole.name,
      user: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
      }
    });
  } catch (error) {
    console.error('Error checking admin permissions:', error);
    return NextResponse.json({ 
      hasPermission: false, 
      isAdmin: false,
      error: 'خطا در بررسی مجوزها' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { permission } = await request.json();
    
    if (!permission) {
      return NextResponse.json({ error: 'Permission required' }, { status: 400 });
    }

    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({ hasPermission: false }, { status: 401 });
    }

    // اگر نقش ندارد، فقط بررسی کنیم که ادمین باشد
    if (!admin.adminRole) {
      return NextResponse.json({ hasPermission: admin.isAdmin });
    }

    const permissions = admin.adminRole.permissions as string[];
    
    // اگر دسترسی کامل دارد
    if (permissions.includes('all')) {
      return NextResponse.json({ hasPermission: true });
    }

    // بررسی مجوز خاص
    const hasPermission = permissions.includes(permission);
    
    return NextResponse.json({ hasPermission });
  } catch (error) {
    console.error('Error checking specific permission:', error);
    return NextResponse.json({ 
      hasPermission: false,
      error: 'خطا در بررسی مجوز' 
    }, { status: 500 });
  }
} 