'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const loading = status === 'loading';

  useEffect(() => {
    console.log('🔍 useAuth useEffect - status:', status, 'session:', session);
    
    if (status === 'authenticated' && session?.user) {
      // Extract user data from NextAuth session
      const sessionUser = session.user as any; // Type assertion for custom properties
      console.log('👤 Session user data:', sessionUser);
      
      const userData: User = {
        id: sessionUser.id || '',
        firstName: sessionUser.firstName || sessionUser.name?.split(' ')[0] || '',
        lastName: sessionUser.lastName || sessionUser.name?.split(' ')[1] || '',
        phone: sessionUser.phone || sessionUser.email || '',
      };
      console.log('👤 Processed user data:', userData);
      setUser(userData);
    } else if (status === 'unauthenticated') {
      console.log('❌ User unauthenticated');
      setUser(null);
    }
    // اگه status هنوز loading باشه، کاری نمی‌کنیم
  }, [session, status]);

  const login = async (phone: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'خطا در ورود');
    }

    const data = await res.json();
    return data;
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
    setUser(null);
  };

  return { user, loading, login, logout };
}
