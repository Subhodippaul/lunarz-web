import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/order-services";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Create a test order
    const testOrderData = {
      orderNumber: `TEST${Date.now().toString().slice(-6)}`,
      userId: userId,
      customerEmail: 'test@example.com',
      items: [
        {
          product: {
            id: 'test-product-1',
            name: 'Test T-Shirt',
            price: 999,
            images: ['test-image.jpg']
          },
          quantity: 1,
          selectedSize: 'M',
          selectedVariant: 'Black'
        }
      ],
      subtotal: 999,
      discountAmount: 0,
      shippingCost: 50,
      total: 1049,
      shippingAddress: {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        country: 'India'
      },
      paymentMethod: 'cod' as const,
      status: 'pending' as const,
    };

    console.log('🧪 Creating test order:', testOrderData);

    const orderId = await OrderService.createOrder(testOrderData);
    
    console.log('✅ Test order created with ID:', orderId);

    // Now try to retrieve the order
    const userOrders = await OrderService.getUserOrders(userId);
    
    console.log('📋 Retrieved orders for user:', userOrders);

    return NextResponse.json({
      success: true,
      testOrderId: orderId,
      userOrdersCount: userOrders.length,
      userOrders: userOrders
    });

  } catch (error: any) {
    console.error('❌ Test order creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}