import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { UserService } from '@/lib/firebase-services';

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await UserService.checkUserExists(email);
    if (!userExists) {
      return NextResponse.json(
        { message: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(email, { otp, expires, attempts: 0 });

    // Send OTP via email
    const emailSent = await EmailService.sendPasswordResetOTP(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { message: 'Failed to send email. Please check your email configuration.' },
        { status: 500 }
      );
    }

    console.log(`Password reset OTP sent to ${email}`); // Keep minimal logging

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Send reset OTP error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}