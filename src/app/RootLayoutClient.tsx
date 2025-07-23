'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/hooks/useCart';
import ScrollToTop from '@/components/ScrollToTop';

// Dynamically import Footer to prevent SSR hydration mismatch with event handlers
const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-900"></div>
});

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');
  const isProfileRoute = pathname.startsWith('/profile');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isSpecialRoute = isAdminRoute || isAuthRoute || isProfileRoute || isDashboardRoute;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by showing minimal content during SSR
  if (!isClient) {
    return (
      <SessionProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <CartProvider>
        {!isSpecialRoute && (
          <>
            <Header />
            <main className="mx-auto w-full max-w-screen-2xl flex-1 px-2 py-4 sm:px-4 sm:py-6 md:px-8">
              {children}
            </main>
            <Footer />
          </>
        )}
        {isSpecialRoute && children}
        
        {/* Global Components */}
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontFamily: 'Yekan, sans-serif',
              direction: 'rtl',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </CartProvider>
    </SessionProvider>
  );
} 