import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, otp } = await req.json();
  if (!userId || !otp) {
    return NextResponse.json({ error: 'اطلاعات ناقص است.' }, { status: 400 });
  }

  // In real app, check OTP validity. Here, always accept.
  // Simulate session token
  const sessionToken = `session-${userId}-${Date.now()}`;

  // Set cookie (for demo, not secure)
  const res = NextResponse.json({ success: true });
  res.cookies.set('session', sessionToken, { httpOnly: true, path: '/' });
  return res;
}
