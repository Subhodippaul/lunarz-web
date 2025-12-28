import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Test email data
    const testEmailData = {
      to: 'test@example.com',
      subject: 'Test Email from Lunarz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Test Successful! 🎉</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuration Status:</h3>
            <p><strong>Email Service:</strong> ${process.env.EMAIL_SERVICE || 'Not configured'}</p>
            <p><strong>Email User:</strong> ${process.env.EMAIL_USER || 'Not configured'}</p>
            <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Using Gmail'}</p>
            <p><strong>Admin Email:</strong> ${process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Not configured'}</p>
          </div>
          <p>If you received this email, your email setup is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is a test email from Lunarz Email System</p>
        </div>
      `
    };

    // Send test email using our email API
    const response = await fetch(`${request.nextUrl.origin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEmailData)
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        details: result,
        configuration: {
          emailService: process.env.EMAIL_SERVICE || 'Not configured',
          emailUser: process.env.EMAIL_USER || 'Not configured',
          adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Not configured',
          hasAppPassword: !!process.env.EMAIL_APP_PASSWORD
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email',
        error: result,
        configuration: {
          emailService: process.env.EMAIL_SERVICE || 'Not configured',
          emailUser: process.env.EMAIL_USER || 'Not configured',
          adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Not configured',
          hasAppPassword: !!process.env.EMAIL_APP_PASSWORD
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Test email error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Email test failed',
      error: error.message,
      configuration: {
        emailService: process.env.EMAIL_SERVICE || 'Not configured',
        emailUser: process.env.EMAIL_USER || 'Not configured',
        adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Not configured',
        hasAppPassword: !!process.env.EMAIL_APP_PASSWORD
      }
    }, { status: 500 });
  }
}