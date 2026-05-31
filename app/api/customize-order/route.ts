import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Generate order number
    const orderNumber = `CUSTOM-${Date.now().toString().slice(-8)}`;

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Format order items for email
    const itemsHtml = orderData.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.product.name}</strong><br>
          Size: ${item.selectedSize}<br>
          Color: ${item.selectedVariant || 'N/A'}<br>
          Quantity: ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${(item.product.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .section-title { color: #ef4444; font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; border-bottom: 2px solid #ef4444; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; }
          .total-row { font-weight: bold; font-size: 18px; color: #ef4444; }
          .address-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .payment-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .payment-online { background: #dcfce7; color: #166534; }
          .payment-cod { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎨 New Custom T-Shirt Order</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${orderNumber}</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>Order Date:</strong> ${new Date().toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              <div class="section-title">📦 Order Items</div>
              <table>
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 10px; text-align: left;">Product Details</th>
                    <th style="padding: 10px; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="section-title">💰 Payment Summary</div>
              <table>
                <tr>
                  <td style="padding: 8px;">Subtotal:</td>
                  <td style="padding: 8px; text-align: right;">₹${orderData.subtotal.toLocaleString()}</td>
                </tr>
                ${orderData.discountAmount > 0 ? `
                <tr style="color: #16a34a;">
                  <td style="padding: 8px;">Discount:</td>
                  <td style="padding: 8px; text-align: right;">-₹${orderData.discountAmount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px;">Shipping:</td>
                  <td style="padding: 8px; text-align: right;">${orderData.shippingCost === 0 ? 'FREE' : '₹' + orderData.shippingCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;">Tax (18% GST):</td>
                  <td style="padding: 8px; text-align: right;">₹${orderData.tax.toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td style="padding: 15px 8px; border-top: 2px solid #ef4444;">Total Amount:</td>
                  <td style="padding: 15px 8px; text-align: right; border-top: 2px solid #ef4444;">₹${orderData.total.toLocaleString()}</td>
                </tr>
              </table>

              <div style="margin: 20px 0;">
                <strong>Payment Method:</strong> 
                <span class="payment-badge ${orderData.paymentMethod === 'online' ? 'payment-online' : 'payment-cod'}">
                  ${orderData.paymentMethod === 'online' ? '💳 Online Payment' : '💵 Cash on Delivery'}
                </span>
              </div>

              ${orderData.paymentId ? `
              <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <strong style="color: #166534;">✅ Payment Confirmed</strong><br>
                <span style="font-size: 12px; color: #166534;">Payment ID: ${orderData.paymentId}</span>
              </div>
              ` : ''}

              <div class="section-title">👤 Customer Information</div>
              <div class="address-box">
                <strong>${orderData.customerName}</strong><br>
                Email: ${orderData.customerEmail}<br>
                Phone: ${orderData.customerPhone}
              </div>

              <div class="section-title">📍 Shipping Address</div>
              <div class="address-box">
                <strong>${orderData.shippingAddress.fullName}</strong><br>
                ${orderData.shippingAddress.addressLine1}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}<br>
                ${orderData.shippingAddress.country}<br>
                Phone: ${orderData.shippingAddress.phone}
              </div>

              ${orderData.billingAddress && orderData.billingAddress.addressLine1 !== orderData.shippingAddress.addressLine1 ? `
              <div class="section-title">💳 Billing Address</div>
              <div class="address-box">
                <strong>${orderData.billingAddress.fullName}</strong><br>
                ${orderData.billingAddress.addressLine1}<br>
                ${orderData.billingAddress.city}, ${orderData.billingAddress.state} - ${orderData.billingAddress.pincode}<br>
                ${orderData.billingAddress.country}<br>
                Phone: ${orderData.billingAddress.phone}
              </div>
              ` : ''}

              ${orderData.couponCode ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>🎟️ Coupon Applied:</strong> ${orderData.couponCode}
              </div>
              ` : ''}

              <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <strong style="color: #1e40af;">📝 Note:</strong>
                <p style="margin: 10px 0 0 0; color: #1e40af;">
                  This is a custom t-shirt order. Please contact the customer to finalize the design details before processing.
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>This is an automated email from Lunarz Custom T-Shirt System</p>
              <p style="margin: 5px 0;">Order #${orderNumber}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: `"Lunarz Custom Orders" <${process.env.EMAIL_USER}>`,
      to: 'lunarz.info@gmail.com',
      subject: `🎨 New Custom T-Shirt Order #${orderNumber} - ₹${orderData.total.toLocaleString()}`,
      html: emailHtml,
    });

    // Send confirmation email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #dcfce7; color: #166534; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">✅ Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your order</p>
          </div>
          
          <div class="content">
            <div class="success-badge">
              <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎉 Your order has been placed successfully!</h2>
              <p style="margin: 0; font-size: 16px;">Order #${orderNumber}</p>
            </div>

            <div class="order-details">
              <p>Hi <strong>${orderData.customerName}</strong>,</p>
              <p>Thank you for choosing Lunarz for your custom t-shirt! We've received your order and will contact you shortly to finalize your design.</p>
              
              <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="color: #1e40af;">📞 Next Steps:</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #1e40af;">
                  <li>Our team will contact you within 24 hours</li>
                  <li>Share your design or let us help you create one</li>
                  <li>We'll send you a preview for approval</li>
                  <li>Your custom t-shirt will be printed and shipped</li>
                </ol>
              </div>

              <p><strong>Order Summary:</strong></p>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr style="font-weight: bold; font-size: 18px; color: #ef4444;">
                  <td style="padding: 15px 10px; border-top: 2px solid #ef4444;">Total Amount:</td>
                  <td style="padding: 15px 10px; text-align: right; border-top: 2px solid #ef4444;">₹${orderData.total.toLocaleString()}</td>
                </tr>
              </table>

              <p style="margin-top: 20px;"><strong>Shipping Address:</strong></p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                ${orderData.shippingAddress.fullName}<br>
                ${orderData.shippingAddress.addressLine1}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}<br>
                Phone: ${orderData.shippingAddress.phone}
              </div>

              <p style="margin-top: 20px;">If you have any questions, feel free to reply to this email or contact us.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>Team Lunarz</strong></p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>Order #${orderNumber}</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Lunarz. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Lunarz" <${process.env.EMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: `✅ Order Confirmation #${orderNumber} - Lunarz Custom T-Shirt`,
      html: customerEmailHtml,
    });

    return NextResponse.json({
      success: true,
      orderNumber: orderNumber,
      message: 'Order placed successfully',
    });

  } catch (error: any) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
