import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple environment variable test
    const result = {
      NODE_ENV: process.env.NODE_ENV,
      SHIPROCKET_EMAIL: process.env.SHIPROCKET_EMAIL,
      SHIPROCKET_PASSWORD: process.env.SHIPROCKET_PASSWORD,
      // Test if any env vars are working
      FIREBASE_PROJECT: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      RAZORPAY_KEY: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      // Check all env vars
      ALL_ENV_KEYS: Object.keys(process.env).filter(key => 
        key.includes('SHIPROCKET') || key.includes('FIREBASE') || key.includes('RAZORPAY')
      )
    };

    console.log('Environment Debug:', result);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        error: 'Debug failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}