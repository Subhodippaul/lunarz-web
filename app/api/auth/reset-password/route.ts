import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/firebase-services';

// Access the same OTP store
declare global {
  var otpStore: Map<string, { otp: string; expires: number; attempts: number }> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const otpData = global.otpStore!?.get(email);

    if (!otpData) {
      return NextResponse.json(
        { message: 'No valid OTP session found. Please start over.' },
        { status: 404 }
      );
    }

    // Check if OTP was verified (attempts = -1)
    if (otpData.attempts !== -1) {
      return NextResponse.json(
        { message: 'OTP not verified. Please verify OTP first.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (Date.now() > otpData.expires) {
      global.otpStore!.delete(email);
      return NextResponse.json(
        { message: 'OTP session has expired. Please start over.' },
        { status: 400 }
      );
    }

    // Verify OTP one more time
    if (otpData.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Reset password
    const success = await UserService.resetPassword(email, newPassword);

    if (!success) {
      return NextResponse.json(
        { message: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    // Clear OTP from store
    global.otpStore!.delete(email);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}