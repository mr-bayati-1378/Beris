import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// مسیرهایی که نیاز به احراز هویت ندارند
const publicPaths = [
  '/api/auth',
  '/api/products',
  '/api/categories',
  '/api/categories/tree',
  '/api/category',
  '/api/brands',
  '/api/search',
  '/api/payment/gateways',
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
  '/_next',
  '/images',
  '/brands',
  '/default-product.jpg',
  '/default-category.jpg',
  '/auth/login',
  '/auth/register',
  '/auth/error',
];

// مسیرهایی که فقط GET نیاز به احراز هویت ندارند
const publicGetPaths = ['/api/cart'];

// مسیرهای قدیمی که باید به مسیرهای جدید redirect شوند
const redirectPaths = {
  '/login': '/auth/login',
  '/register': '/auth/register',
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set pathname in header for layout detection
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);

  // بررسی مسیرهای قدیمی و redirect به مسیرهای جدید
  if (redirectPaths[pathname as keyof typeof redirectPaths]) {
    return NextResponse.redirect(
      new URL(
        redirectPaths[pathname as keyof typeof redirectPaths],
        request.url
      )
    );
  }

  // اگر مسیر عمومی است، اجازه عبور بده
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return response;
  }

  // برای مسیرهای API، احراز هویت را چک کن
  if (pathname.startsWith('/api/')) {
    // اگر مسیر فقط GET عمومی است و متد GET است، اجازه عبور بده
    if (
      publicGetPaths.some(path => pathname.startsWith(path)) &&
      request.method === 'GET'
    ) {
      return response;
    }

    // برای NextAuth، اجازه عبور بده
    if (pathname.startsWith('/api/auth/')) {
      return response;
    }

      // برای admin API ها، admin session را چک کن
  if (pathname.startsWith('/api/admin/')) {
    // Skip auth check for login endpoint
    if (pathname === '/api/admin/auth/login') {
      return response;
    }
    
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader?.includes('admin-session=authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return response;
  }

    // برای سایر API ها، session را چک کن
    const cookieHeader = request.headers.get('cookie');
    
    // برای API های حساس، session را چک کن
    if (pathname.startsWith('/api/order') || 
        pathname.startsWith('/api/orders') || 
        pathname.startsWith('/api/cart') ||
        pathname.startsWith('/api/user')) {
      // NextAuth خودش session را چک می‌کند
      return response;
    }
    
    return response;
  }

  // برای admin pages، admin session را چک کن
  if ((pathname.startsWith('/admin') || 
       pathname.startsWith('/admin-sales') || 
       pathname.startsWith('/admin-supply') || 
       pathname.startsWith('/admin-finance') || 
       pathname.startsWith('/admin-warehouse')) && 
      pathname !== '/admin/login') {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader?.includes('admin-session=authenticated')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/:path*',

    '/cart/:path*',
    '/checkout/:path*',
    '/checkout',
    '/complete-profile/:path*',
    '/complete-profile',
    '/orders/:path*',
    '/wishlist/:path*',
    '/dashboard/:path*',
    '/payment/:path*',
    '/admin/:path*',
    '/admin-sales/:path*',
    '/admin-supply/:path*',
    '/admin-finance/:path*',
    '/admin-warehouse/:path*',
    '/login',
    '/register',
  ],
};
