'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSessionChecker() {
  const router = useRouter();

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        // Check if we're in admin panel
        if (typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/admin') ||
          window.location.pathname.startsWith('/admin-sales') ||
          window.location.pathname.startsWith('/admin-supply') ||
          window.location.pathname.startsWith('/admin-finance') ||
          window.location.pathname.startsWith('/admin-warehouse')
        )) {
          // Skip login page
          if (window.location.pathname === '/admin/login') {
            return;
          }

          // Check localStorage for admin auth
          const adminAuth = localStorage.getItem('adminAuth');
          if (!adminAuth) {
            // No auth found, redirect to login
            router.push('/admin/login');
            return;
          }

          try {
            const authData = JSON.parse(adminAuth);
            // Check if auth is not expired (24 hours)
            const now = Date.now();
            const authTime = authData.timestamp || 0;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (now - authTime > maxAge) {
              // Auth expired
              localStorage.removeItem('adminAuth');
              router.push('/admin/login');
              return;
            }

            // Auth is valid, update timestamp
            authData.timestamp = now;
            localStorage.setItem('adminAuth', JSON.stringify(authData));
          } catch (error) {
            // Invalid auth data
            localStorage.removeItem('adminAuth');
            router.push('/admin/login');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkAdminSession();
  }, [router]);

  return null; // This component doesn't render anything
} 