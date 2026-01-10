import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Test email sending with current configuration
    const testEmail = {
      to: 'lunarz.info@gmail.com', // Send to yourself for testing
      subject: 'Gmail Configuration Test - Lunarz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Gmail Configuration Test ✅</h2>
          <p>This email confirms that your Gmail SMTP configuration is working correctly.</p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <p><strong>Email Service:</strong> ${process.env.EMAIL_SERVICE}</p>
            <p><strong>Email User:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>App Password:</strong> ${process.env.EMAIL_APP_PASSWORD ? 'Configured' : 'Not configured'}</p>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>If you received this email, your forgot password functionality should work!</p>
        </div>
      `
    };

    // Send test email using our email API
    const response = await fetch(`${request.nextUrl.origin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEmail)
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Gmail test email sent successfully!',
        details: result
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Gmail test failed',
        error: result
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Gmail test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Gmail test failed',
      error: error.message
    }, { status: 500 });
  }
}