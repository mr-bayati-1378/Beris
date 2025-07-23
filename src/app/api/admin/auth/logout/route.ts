import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'خروج موفقیت‌آمیز بود' 
    });
    
    // Remove admin session cookies
    response.cookies.delete('admin-session');
    response.cookies.delete('admin-user-id');
    
    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'خطا در خروج' },
      { status: 500 }
    );
  }
} 