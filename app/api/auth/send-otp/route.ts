import { NextResponse } from 'next/server';

// Simple in-memory OTP store for development/demo
const otpStore: Record<string, { code: string; expires: number }> = {};

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    if (action === 'send') {
      // Generate a random 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[email.toLowerCase()] = {
        code: otpCode,
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      };

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${email}`,
        otpPreview: otpCode, // Provided for easy testing & preview
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process OTP.' }, { status: 500 });
  }
}
