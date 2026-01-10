import { NextRequest, NextResponse } from "next/server";
import { OrderManagementService } from "@/lib/order-management-service";
import { EmailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      requestId, 
      status, 
      adminNotes, 
      refundAmount,
      userEmail,
      userName,
      orderId,
      type 
    } = body;

    // Validate required fields
    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the request status
    await OrderManagementService.updateRequestStatus(
      requestId,
      status,
      adminNotes,
      refundAmount
    );

    // Send email notification to admin
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${type?.charAt(0).toUpperCase() + type?.slice(1)} Request Updated</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Request Status Updated</h2>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
            <p><strong>New Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
            ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
            ${refundAmount ? `<p><strong>Refund Amount:</strong> ₹${refundAmount.toLocaleString()}</p>` : ''}
            <p><strong>Updated Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>

        <div style="background: #333; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0;">Lunarz Admin Panel</p>
        </div>
      </div>
    `;

    await EmailService.sendEmail({
      to: "lunarz.info@gmail.com",
      subject: `${type?.charAt(0).toUpperCase() + type?.slice(1)} Request Updated - ${requestId}`,
      html: adminEmailContent
    });

    // Send status update email to customer
    if (userEmail) {
      const getStatusMessage = (status: string) => {
        switch (status) {
          case 'approved':
            return {
              title: 'Request Approved',
              message: 'Great news! Your request has been approved.',
              color: '#4caf50',
              bgColor: '#e8f5e8'
            };
          case 'rejected':
            return {
              title: 'Request Rejected',
              message: 'We\'re sorry, but your request has been rejected.',
              color: '#f44336',
              bgColor: '#ffebee'
            };
          case 'processing':
            return {
              title: 'Request Processing',
              message: 'Your request is currently being processed.',
              color: '#ff9800',
              bgColor: '#fff3e0'
            };
          case 'completed':
            return {
              title: 'Request Completed',
              message: 'Your request has been completed successfully.',
              color: '#4caf50',
              bgColor: '#e8f5e8'
            };
          default:
            return {
              title: 'Request Updated',
              message: 'Your request status has been updated.',
              color: '#2196f3',
              bgColor: '#e3f2fd'
            };
        }
      };

      const statusInfo = getStatusMessage(status);

      const customerEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${statusInfo.title}</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
              <p>${statusInfo.message}</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
              ${refundAmount ? `<p><strong>Refund Amount:</strong> ₹${refundAmount.toLocaleString()}</p>` : ''}
            </div>

            ${adminNotes ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-top: 0;">Additional Information</h3>
                <p>${adminNotes}</p>
              </div>
            ` : ''}

            <div style="background: ${statusInfo.bgColor}; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusInfo.color};">
              <p style="margin: 0; color: ${statusInfo.color};">
                ${status === 'approved' ? 
                  '<strong>Next Steps:</strong> We will process your request and keep you updated on the progress.' :
                  status === 'completed' ?
                  '<strong>Thank you!</strong> Your request has been completed. If you have any questions, please contact our support team.' :
                  status === 'rejected' ?
                  '<strong>Need Help?</strong> If you have questions about this decision, please contact our support team.' :
                  '<strong>Stay Updated:</strong> We\'ll keep you informed about any changes to your request status.'
                }
              </p>
            </div>
          </div>

          <div style="background: #333; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">Thank you for choosing Lunarz!</p>
          </div>
        </div>
      `;

      await EmailService.sendEmail({
        to: userEmail,
        subject: `${statusInfo.title} - Request #${requestId}`,
        html: customerEmailContent
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Request status updated successfully" 
    });

  } catch (error) {
    console.error("Error updating request status:", error);
    return NextResponse.json(
      { error: "Failed to update request status" },
      { status: 500 }
    );
  }
}