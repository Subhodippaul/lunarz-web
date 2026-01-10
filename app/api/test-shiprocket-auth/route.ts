import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test Shiprocket authentication directly
    const email = 'lunarz.info@gmail.com';
    const password = 'Passw0rd@2026#!';
    
    console.log('Testing Shiprocket authentication...');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const responseText = await response.text();
    console.log('Shiprocket response status:', response.status);
    console.log('Shiprocket response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Shiprocket response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = { raw: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      rawResponse: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Test authentication error:', error);
    return NextResponse.json(
      { 
        error: 'Test authentication failed',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}