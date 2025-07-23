import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';
    
    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Mock settings data - in real app this would come from database
    const settings = {
      profile: {
        firstName: 'کارشناس',
        lastName: 'فروش',
        email: 'sales@company.com',
        phone: '09123456789',
        department: 'فروش',
        position: 'کارشناس فروش'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        orderAlerts: true,
        paymentAlerts: true,
        customerAlerts: false,
        systemAlerts: true,
        dailyReports: false,
        weeklyReports: true
      },
      preferences: {
        language: 'fa',
        timezone: 'Asia/Tehran',
        dateFormat: 'jalali',
        currency: 'IRR',
        itemsPerPage: 20,
        defaultView: 'table'
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordLastChanged: new Date().toISOString()
      }
    };

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const isAdminLoggedIn = cookieStore.get('admin-session')?.value === 'authenticated';
    
    if (!isAdminLoggedIn) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const body = await request.json();
    const { settings, role } = body;

    // In a real app, save to database
    console.log('Saving settings for role:', role, settings);

    return NextResponse.json({ success: true, message: 'تنظیمات ذخیره شد' });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'خطا در ذخیره تنظیمات' },
      { status: 500 }
    );
  }
} 