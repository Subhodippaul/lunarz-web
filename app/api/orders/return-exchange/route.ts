import { NextRequest, NextResponse } from "next/server";
import { OrderManagementService, ReturnExchangeRequest } from "@/lib/order-management-service";
import { EmailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Return/Exchange API called');
    
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    const { 
      orderId, 
      userId, 
      type, 
      reason, 
      description, 
      items, 
      pickupAddress,
      images,
      userEmail,
      userName 
    } = body;

    // Validate required fields
    if (!orderId || !userId || !type || !reason || !items || items.length === 0) {
      console.error('❌ Missing required fields:', { orderId, userId, type, reason, itemsLength: items?.length });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, creating request...');

    // Create the request
    const requestId = await OrderManagementService.createRequest({
      orderId,
      userId,
      type,
      reason,
      description,
      items,
      pickupAddress,
      images
    });

    console.log('✅ Request created with ID:', requestId);

    // Send email notification to admin
    const emailSubject = `New ${type.charAt(0).toUpperCase() + type.slice(1)} Request - Order #${orderId}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">New ${type.charAt(0).toUpperCase() + type.slice(1)} Request</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Request Details</h2>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
            <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
            <p><strong>Reason:</strong> ${reason}</p>
            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
            <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Items</h3>
            ${items.map((item: any) => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p><strong>${item.productName}</strong></p>
                <p>Quantity: ${item.quantity}</p>
                ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                ${item.color ? `<p>Color: ${item.color}</p>` : ''}
                <p>Price: ₹${item.price.toLocaleString()}</p>
                ${item.exchangeSize ? `<p><strong>Exchange Size:</strong> ${item.exchangeSize}</p>` : ''}
                ${item.exchangeColor ? `<p><strong>Exchange Color:</strong> ${item.exchangeColor}</p>` : ''}
              </div>
            `).join('')}
          </div>

          ${pickupAddress ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">Pickup Address</h3>
              <p><strong>${pickupAddress.fullName}</strong></p>
              <p>${pickupAddress.phone}</p>
              <p>${pickupAddress.address}</p>
              <p>${pickupAddress.city}, ${pickupAddress.state} - ${pickupAddress.pincode}</p>
            </div>
          ` : ''}

          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <p style="margin: 0; color: #1976d2;">
              <strong>Action Required:</strong> Please review this ${type} request in the admin panel and take appropriate action.
            </p>
          </div>
        </div>

        <div style="background: #333; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0;">Lunarz - Premium Streetwear</p>
        </div>
      </div>
    `;

    try {
      await EmailService.sendEmail({
        to: "lunarz.info@gmail.com",
        subject: emailSubject,
        html: emailContent
      });
      console.log('✅ Admin email sent');
    } catch (emailError) {
      console.error('⚠️ Failed to send admin email:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to customer
    if (userEmail) {
      const customerEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${type.charAt(0).toUpperCase() + type.slice(1)} Request Received</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
              <p>We have received your ${type} request for order #${orderId}.</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Status:</strong> Pending Review</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>

            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>What's Next?</strong> Our team will review your request within 24-48 hours. You'll receive an email update once we've processed your request.
              </p>
            </div>
          </div>

          <div style="background: #333; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">Thank you for choosing Lunarz!</p>
          </div>
        </div>
      `;

      try {
        await EmailService.sendEmail({
          to: userEmail,
          subject: `${type.charAt(0).toUpperCase() + type.slice(1)} Request Confirmation - Order #${orderId}`,
          html: customerEmailContent
        });
        console.log('✅ Customer email sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send customer email:', emailError);
        // Don't fail the request if email fails
      }
    }

    console.log('🎉 Request processed successfully');

    return NextResponse.json({ 
      success: true, 
      requestId,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} request submitted successfully` 
    });

  } catch (error: any) {
    console.error("❌ Error processing return/exchange request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';

    let requests;
    if (isAdmin) {
      requests = await OrderManagementService.getAllRequests();
    } else if (userId) {
      requests = await OrderManagementService.getUserRequests(userId);
    } else {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    return NextResponse.json({ requests });

  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}