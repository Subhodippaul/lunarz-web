import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from 'nodemailer';

// Service-role client — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email sending function
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Create transporter (same logic as send-email API)
    const createTransporter = () => {
      if (process.env.EMAIL_SERVICE === 'gmail') {
        const appPassword = process.env.EMAIL_APP_PASSWORD?.replace(/\s/g, '') || '';
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: appPassword,
          },
        });
      }
      
      if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
      }

      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    };

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Lunarz <lunarz.info@gmail.com>',
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    if (!orderId || !userId || !type || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Cancellations just update the order status — no order_requests row needed
    // (the DB type check constraint only allows 'return' | 'exchange')
    if (type === "cancel") {
      const { error: cancelError } = await supabaseAdmin
        .from("orders")
        .update({ order_status: "cancelled", updated_at: new Date().toISOString() })
        .eq("order_id", orderId);

      if (cancelError) {
        return NextResponse.json({ error: cancelError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        requestId,
        message: "Order cancelled successfully",
      });
    }

    // For return / exchange — insert into order_requests
    const { error: insertError } = await supabaseAdmin
      .from("order_requests")
      .insert([{
        request_id: requestId,
        order_id: orderId,
        user_id: userId,
        type,           // only 'return' | 'exchange' reach here
        reason,
        status: "pending",
      }]);

    if (insertError) {
      console.error("Error inserting order request:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

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
      const emailSent = await sendEmail("lunarz.info@gmail.com", emailSubject, emailContent);
    } catch (emailError) {
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
        await sendEmail(
          userEmail,
          `${type.charAt(0).toUpperCase() + type.slice(1)} Request Confirmation - Order #${orderId}`,
          customerEmailContent
        );
      } catch (emailError) {
        // Don't fail the request if email fails
      }
    }

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

    let query = supabaseAdmin.from("order_requests").select("*").order("created_at", { ascending: false });
    if (!isAdmin && userId) {
      query = query.eq("user_id", userId);
    } else if (!isAdmin && !userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ requests: data ?? [] });

  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}