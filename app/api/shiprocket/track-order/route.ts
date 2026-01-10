import { NextRequest, NextResponse } from 'next/server';
import ShiprocketService from '@/lib/shiprocket-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const awbCode = searchParams.get('awb_code');
    const orderId = searchParams.get('order_id');

    console.log('Tracking request received:', { awbCode, orderId });

    if (!awbCode && !orderId) {
      return NextResponse.json(
        { error: 'Either AWB code or Order ID is required' },
        { status: 400 }
      );
    }

    // Check if Shiprocket credentials are configured
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      return NextResponse.json(
        { 
          error: 'Shiprocket not configured',
          message: 'Please configure SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment variables'
        },
        { status: 503 }
      );
    }

    // Track order in Shiprocket
    const trackingData = await ShiprocketService.trackOrder(awbCode || undefined, orderId || undefined);

    // Format the data for our frontend
    const formattedData = ShiprocketService.formatTrackingData(trackingData);

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error: any) {
    console.error('Shiprocket tracking error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to track order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}