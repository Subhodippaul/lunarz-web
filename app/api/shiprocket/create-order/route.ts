import { NextRequest, NextResponse } from 'next/server';
import ShiprocketService from '@/lib/shiprocket-service';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    console.log('Creating Shiprocket order with data:', JSON.stringify(orderData, null, 2));

    // Validate required fields from our system
    if (!orderData.id || !orderData.customerInfo?.email || !orderData.shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Check if Shiprocket credentials are configured
    if (!process.env.SHIPROCKET_TOKEN && (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD)) {
      return NextResponse.json(
        { 
          error: 'Shiprocket not configured',
          message: 'Please configure SHIPROCKET_TOKEN or SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment variables'
        },
        { status: 503 }
      );
    }

    // Format order data for Shiprocket
    const shiprocketOrderData = ShiprocketService.formatOrderForShiprocket(orderData);
    console.log('Formatted Shiprocket order data:', JSON.stringify(shiprocketOrderData, null, 2));

    // Create order in Shiprocket
    const shiprocketOrder = await ShiprocketService.createOrder(shiprocketOrderData);
    console.log('Shiprocket order created successfully:', shiprocketOrder);

    return NextResponse.json({
      success: true,
      data: shiprocketOrder
    });

  } catch (error: any) {
    console.error('Shiprocket order creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create Shiprocket order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}