import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }

    console.log('🔍 Debug: Checking orders for userId:', userId);

    // Check orders collection
    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", userId)
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    
    console.log('📊 Debug: Found', ordersSnapshot.docs.length, 'orders');

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
    }));

    // Check order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemsQuery = query(
          collection(db, "orderItems"),
          where("orderId", "==", order.id)
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        
        const items = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return {
          ...order,
          items
        };
      })
    );

    console.log('✅ Debug: Orders with items:', ordersWithItems);

    return NextResponse.json({
      success: true,
      userId,
      ordersCount: orders.length,
      orders: ordersWithItems
    });

  } catch (error: any) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}