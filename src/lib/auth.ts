import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// کلید رمزنگاری برای JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

// تایپ‌های مورد نیاز
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// تنظیمات NextAuth
const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        phone: { label: 'شماره موبایل', type: 'tel' },
        password: { label: 'رمز عبور', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Credentials authorize called:', credentials);
        if (!credentials?.phone || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { phone: credentials.phone as string },
          });

          if (!user) {
            console.log('User not found:', credentials.phone);
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            console.log('Invalid password for user:', credentials.phone);
            return null;
          }

          console.log('User authenticated successfully:', user.id);
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.phone,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('=== SIGNIN CALLBACK START ===');
      console.log('SignIn callback called:', { 
        provider: account?.provider, 
        user: { id: user.id, email: user.email, name: user.name },
        profile: profile 
      });
      
      // Add callback for all providers to debug
      console.log('Account info:', account);
      console.log('User info:', user);
      console.log('Profile info:', profile);
      
      // Allow all providers by default
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        console.log('JWT callback - user:', { id: user.id, email: user.email, name: user.name });
        
        // When user signs in, get full user data from database
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            profileImage: true,
            phoneVerified: true,
            isProfileComplete: true,
            adminRole: {
              select: {
                id: true,
                name: true,
                displayName: true,
                permissions: true,
              },
            },
          },
        });
        
        if (fullUser) {
          console.log('JWT callback - found user in DB:', fullUser.id);
          token.id = fullUser.id;
          token.firstName = fullUser.firstName;
          token.lastName = fullUser.lastName;
          token.phone = fullUser.phone;
          token.email = fullUser.email;
          token.profileImage = fullUser.profileImage;
          token.phoneVerified = fullUser.phoneVerified;
          token.isProfileComplete = fullUser.isProfileComplete;
          token.adminRole = fullUser.adminRole ? {
            ...fullUser.adminRole,
            permissions: Array.isArray(fullUser.adminRole.permissions) 
              ? fullUser.adminRole.permissions as string[]
              : []
          } : undefined;
        } else {
          console.log('JWT callback - user not found in DB:', user.id);
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - token:', { id: token.id, email: token.email, name: token.name });
      
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.email = token.email as string;
        session.user.name = `${token.firstName} ${token.lastName}`;
        session.user.image = token.profileImage as string;
        (session.user as any).phoneVerified = token.phoneVerified as boolean;
        (session.user as any).isProfileComplete = token.isProfileComplete as boolean;
        (session.user as any).adminRole = token.adminRole;
        
        console.log('Session callback - session user:', {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          phone: session.user.phone
        });
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

const nextAuth = NextAuth(authConfig);
export const { handlers, auth, signIn, signOut } = nextAuth;

// برای debug
console.log('NextAuth initialized:', { 
  hasHandlers: !!handlers, 
  hasAuth: !!auth, 
  hasSignIn: !!signIn, 
  hasSignOut: !!signOut 
});

// Export authOptions for use in API routes (backward compatibility)
export const authOptions = authConfig;

// توابع کمکی برای احراز هویت
export async function verifyAuth(req: NextRequest): Promise<User | null> {
  try {
    const token = req.cookies.get('token')?.value;
    console.log('Auth verification:', {
      hasToken: !!token,
      cookies: req.cookies.getAll().map(c => c.name),
      headers: Object.fromEntries(req.headers.entries()),
    });

    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function createAuthResponse(user: User): Promise<NextResponse> {
  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
  });

  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return response;
}

export async function clearAuth(response: NextResponse): Promise<NextResponse> {
  response.cookies.delete('token');
  return response;
}
