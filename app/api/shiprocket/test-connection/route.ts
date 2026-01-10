import { NextRequest, NextResponse } from 'next/server';
import ShiprocketService from '@/lib/shiprocket-service';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SHIPROCKET CONNECTION TEST ===');
    
    // Clear any cached token first
    ShiprocketService.clearAuthToken();
    
    // Test authentication
    const token = await ShiprocketService.authenticate();
    
    console.log('✅ Authentication successful');
    console.log('==================================');
    
    return NextResponse.json({
      success: true,
      message: 'Shiprocket connection successful',
      tokenReceived: !!token,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Shiprocket connection test failed:', error);
    console.log('==================================');
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Shiprocket connection failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}