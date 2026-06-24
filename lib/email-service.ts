// Email service for order notifications
// This is a basic implementation - in production, you'd use services like:
// - SendGrid, Mailgun, AWS SES, or Nodemailer with SMTP

export interface CustomDesignAttachment {
  productName: string;
  image: string;   // base64 data URL, e.g. "data:image/png;base64,..."
  fileName: string;
  note: string;
}

interface NodemailerAttachment {
  filename: string;
  content: string; // base64 string, WITHOUT the "data:image/...;base64," prefix
  encoding: 'base64';
  cid: string;
}

// Splits a "data:image/png;base64,AAAA..." string into its raw base64 payload + a Nodemailer
// attachment object referencing the given Content-ID. Returns null for malformed entries so a
// single bad upload can be skipped rather than crashing the whole email send.
function dataUrlToAttachment(dataUrl: string, cid: string, fallbackName: string): NodemailerAttachment | null {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;
  const [, ext, base64Content] = match;
  return {
    filename: fallbackName.includes('.') ? fallbackName : `${fallbackName}.${ext}`,
    content: base64Content,
    encoding: 'base64',
    cid,
  };
}

export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: string;
  orderDate: string;
  // Custom design images uploaded on the product page for "Customize" products,
  // each with its own note. Embedded inline (as base64) into the admin email only —
  // customers already know what they uploaded, so we don't duplicate it in their email.
  customDesignAttachments?: CustomDesignAttachment[];
}

export class EmailService {
  private static ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lunarz.info@gmail.com';
  
  // Generic email sending method
  static async sendEmail({ to, subject, html, attachments }: { to: string; subject: string; html: string; attachments?: NodemailerAttachment[] }): Promise<boolean> {
    try {
      console.log('📧 Sending email to:', to);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          html,
          ...(attachments && attachments.length > 0 ? { attachments } : {}),
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent successfully:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Failed to send email:', error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }
  
  // Customer order confirmation email
  static async sendOrderConfirmationToCustomer(orderData: OrderEmailData): Promise<boolean> {
    try {
      const customerEmailHtml = this.generateCustomerEmailTemplate(orderData);
      
      console.log('📧 Sending order confirmation to customer:', orderData.customerEmail);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: orderData.customerEmail,
          subject: `Order Confirmation - ${orderData.orderId}`,
          html: customerEmailHtml
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer email sent successfully:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Failed to send customer email:', error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error sending customer email:', error);
      return false;
    }
  }

  // Admin order notification email
  static async sendOrderNotificationToAdmin(orderData: OrderEmailData): Promise<boolean> {
    try {
      // Convert each base64 design image into a Nodemailer CID attachment.
      // The cid here must match the cid: reference used inside generateAdminEmailTemplate.
      const designAttachments: NodemailerAttachment[] = (orderData.customDesignAttachments || [])
        .map((d, i) => dataUrlToAttachment(d.image, `design-${i}`, d.fileName))
        .filter((a): a is NodemailerAttachment => a !== null);

      const adminEmailHtml = this.generateAdminEmailTemplate(orderData);
      
      console.log('📧 Sending order notification to admin:', this.ADMIN_EMAIL);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.ADMIN_EMAIL,
          subject: `🚨 New Order Received - ${orderData.orderId}`,
          html: adminEmailHtml,
          ...(designAttachments.length > 0 ? { attachments: designAttachments } : {}),
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Admin email sent successfully:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Failed to send admin email:', error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error sending admin email:', error);
      return false;
    }
  }

  // Password reset OTP email
  static async sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
    try {
      const otpEmailHtml = this.generateOTPEmailTemplate(otp);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Password Reset - Verification Code',
          html: otpEmailHtml
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ OTP email sent successfully to:', email);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Failed to send OTP email:', error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      return false;
    }
  }

  // Customer email template
  private static generateCustomerEmailTemplate(orderData: OrderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #667eea; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order, ${orderData.customerName}!</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
              <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
            </div>

            <div class="order-details">
              <h2>Items Ordered</h2>
              ${orderData.items.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.name || 'Unknown Item'}</strong><br>
                    Quantity: ${item.quantity || 0}
                  </div>
                  <div>₹${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</div>
                </div>
              `).join('')}
              <div class="item total">
                <div>Total Amount</div>
                <div>₹${(orderData.totalAmount || 0).toLocaleString()}</div>
              </div>
            </div>

            ${orderData.customDesignAttachments && orderData.customDesignAttachments.length > 0 ? `
              <div class="order-details">
                <h2>Your Custom Design${orderData.customDesignAttachments.length > 1 ? 's' : ''}</h2>
                <p style="color:#666; font-size:14px;">We've received the design${orderData.customDesignAttachments.length > 1 ? 's' : ''} you uploaded. Our team will reach out if anything needs clarifying.</p>
              </div>
            ` : ''}

            <div class="order-details">
              <h2>Shipping Address</h2>
              <p>
                ${orderData.shippingAddress.fullName}<br>
                ${orderData.shippingAddress.address}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}<br>
                Phone: ${orderData.shippingAddress.phone}
              </p>
            </div>

            <div class="order-details">
              <h2>What's Next?</h2>
              <p>• We'll process your order within 1-2 business days</p>
              <p>• You'll receive a shipping confirmation with tracking details</p>
              <p>• Expected delivery: 3-7 business days</p>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Lunarz!</p>
            <p>If you have any questions, contact us at lunarz.info@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Admin email template
  private static generateAdminEmailTemplate(orderData: OrderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #dc3545; }
          .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .design-card { display: flex; gap: 12px; padding: 12px; margin: 10px 0; background: #fafafa; border: 1px solid #eee; border-radius: 6px; }
          .design-card img { width: 90px; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; flex-shrink: 0; }
          .design-note { font-size: 14px; color: #333; }
          .design-filename { font-size: 12px; color: #888; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Order Received</h1>
            <p>Order ID: ${orderData.orderId}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>⚡ Action Required:</strong> Process this order within 24 hours
            </div>

            <div class="order-details">
              <h2>Customer Information</h2>
              <p><strong>Name:</strong> ${orderData.customerName}</p>
              <p><strong>Email:</strong> ${orderData.customerEmail}</p>
              <p><strong>Phone:</strong> ${orderData.shippingAddress.phone}</p>
            </div>

            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
              <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
            </div>

            <div class="order-details">
              <h2>Items to Ship</h2>
              ${orderData.items.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.name || 'Unknown Item'}</strong><br>
                    Qty: ${item.quantity || 0} × ₹${(item.price || 0).toLocaleString()}
                  </div>
                  <div>₹${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</div>
                </div>
              `).join('')}
              <div class="item total">
                <div>Total Revenue</div>
                <div>₹${(orderData.totalAmount || 0).toLocaleString()}</div>
              </div>
            </div>

            ${orderData.customDesignAttachments && orderData.customDesignAttachments.length > 0 ? `
              <div class="order-details">
                <h2>🎨 Custom Design${orderData.customDesignAttachments.length > 1 ? 's' : ''} Uploaded</h2>
                ${orderData.customDesignAttachments.map((d, i) => `
                  <div class="design-card">
                    <img src="cid:design-${i}" alt="${d.fileName}" />
                    <div>
                      <div class="design-filename">${d.productName} — ${d.fileName}</div>
                      <div class="design-note">${d.note ? d.note : '<em style="color:#aaa;">No note provided</em>'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="order-details">
              <h2>Shipping Address</h2>
              <p>
                ${orderData.shippingAddress.fullName}<br>
                ${orderData.shippingAddress.address}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}<br>
                Phone: ${orderData.shippingAddress.phone}
              </p>
            </div>

            <div class="order-details">
              <h2>Next Steps</h2>
              <p>1. ✅ Verify inventory availability</p>
              <p>2. 📦 Prepare items for shipping</p>
              <p>3. 🚚 Generate shipping label</p>
              <p>4. 📧 Send tracking info to customer</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // OTP email template
  private static generateOTPEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .otp-box { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; text-align: center; border: 2px solid #667eea; }
          .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .security-tips { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Your verification code is ready</p>
          </div>
          
          <div class="content">
            <div class="otp-box">
              <h2>Your Verification Code</h2>
              <div class="otp-code">${otp}</div>
              <p>Enter this code to reset your password</p>
            </div>

            <div class="warning">
              <strong>⏰ Important:</strong> This code will expire in 5 minutes for security reasons.
            </div>

            <div class="security-tips">
              <h3>🛡️ Security Tips</h3>
              <ul>
                <li>Never share this code with anyone</li>
                <li>Lunarz will never ask for this code via phone or email</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Use a strong, unique password for your account</li>
              </ul>
            </div>

            <div class="security-tips">
              <h3>Need Help?</h3>
              <p>If you're having trouble resetting your password or didn't request this code, please contact our support team at <strong>lunarz.info@gmail.com</strong></p>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated message from Lunarz</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
