import { NextRequest, NextResponse } from 'next/server';
import { clearAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  return clearAuth(response);
}
