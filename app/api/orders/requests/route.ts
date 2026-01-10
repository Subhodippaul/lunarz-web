import { NextRequest, NextResponse } from "next/server";
import { OrderManagementService } from "@/lib/order-management-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';

    if (!userId && !isAdmin) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    let requests;
    if (isAdmin) {
      requests = await OrderManagementService.getAllRequests();
    } else {
      requests = await OrderManagementService.getUserRequests(userId!);
    }

    return NextResponse.json({
      success: true,
      requests
    });

  } catch (error: any) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}