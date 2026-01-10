import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/order-services";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Create a test order with delivered status
    const testOrderData = {
      orderNumber: `DELIVERED${Date.now().toString().slice(-6)}`,
      userId: userId,
      customerEmail: 'test@example.com',
      items: [
        {
          product: {
            id: 'test-product-delivered',
            name: 'Test Delivered T-Shirt',
            price: 1299,
            images: ['test-image.jpg']
          },
          quantity: 1,
          selectedSize: 'L',
          selectedVariant: 'Blue'
        }
      ],
      subtotal: 1299,
      discountAmount: 0,
      shippingCost: 0,
      total: 1299,
      shippingAddress: {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        country: 'India'
      },
      paymentMethod: 'online' as const,
      status: 'delivered' as const,
    };

    console.log('🧪 Creating test delivered order:', testOrderData);

    const orderId = await OrderService.createOrder(testOrderData);
    
    // Update the order to delivered status with delivery date
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: 'delivered',
      deliveryDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    console.log('✅ Test delivered order created with ID:', orderId);

    return NextResponse.json({
      success: true,
      testOrderId: orderId,
      message: 'Test delivered order created successfully'
    });

  } catch (error: any) {
    console.error('❌ Test delivered order creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}