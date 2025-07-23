import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn } from 'next-auth/react';

export async function POST(req: NextRequest) {
  const { phone, firstName, lastName, password } = await req.json();
  if (!phone || !firstName || !lastName || !password) {
    return NextResponse.json({ error: 'اطلاعات ناقص است.' }, { status: 400 });
  }

  // Validate password strength
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json(
      { error: 'این شماره قبلاً ثبت شده است.' },
      { status: 409 }
    );
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with hashed password
  const user = await prisma.user.create({
    data: {
      phone,
      firstName,
      lastName,
      password: hashedPassword,
    },
  });

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
}
