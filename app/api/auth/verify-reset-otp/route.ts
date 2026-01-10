import { NextRequest, NextResponse } from 'next/server';

// Access the same OTP store (in production, use Redis or database)
declare global {
  var otpStore: Map<string, { otp: string; expires: number; attempts: number }> | undefined;
}

// Initialize global OTP store
if (!global.otpStore) {
  global.otpStore = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const otpData = global.otpStore!.get(email);

    if (!otpData) {
      return NextResponse.json(
        { message: 'No OTP found. Please request a new one.' },
        { status: 404 }
      );
    }

    // Check if OTP expired
    if (Date.now() > otpData.expires) {
      global.otpStore!.delete(email);
      return NextResponse.json(
        { message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      global.otpStore!.delete(email);
      return NextResponse.json(
        { message: 'Too many failed attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      global.otpStore!.set(email, otpData);
      return NextResponse.json(
        { message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.` },
        { status: 400 }
      );
    }

    // OTP verified successfully - mark as verified but keep for password reset
    otpData.attempts = -1; // Mark as verified
    global.otpStore!.set(email, otpData);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}