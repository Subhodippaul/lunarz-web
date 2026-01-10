import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get credentials from environment
    const email = process.env.SHIPROCKET_EMAIL || 'lunarz.info@gmail.com';
    const password = process.env.SHIPROCKET_PASSWORD || 'Passw0rd@2026#!';
    
    // Validate credential format
    const validation = {
      email: {
        value: email,
        isSet: !!email,
        isValidFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        length: email.length,
        preview: email ? `${email.substring(0, 5)}***@${email.split('@')[1]}` : 'UNDEFINED'
      },
      password: {
        isSet: !!password,
        length: password.length,
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        hasNumbers: /\d/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        preview: password ? `${password.substring(0, 3)}***${password.slice(-3)}` : 'UNDEFINED'
      }
    };

    console.log('=== CREDENTIAL VALIDATION ===');
    console.log(JSON.stringify(validation, null, 2));
    console.log('=============================');

    // Test if credentials work with Shiprocket
    console.log('Testing credentials with Shiprocket API...');
    
    const testResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Lunarz-Web/1.0'
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const responseText = await testResponse.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    console.log('Shiprocket API test result:');
    console.log('Status:', testResponse.status);
    console.log('Response:', responseText);

    return NextResponse.json({
      validation,
      apiTest: {
        status: testResponse.status,
        statusText: testResponse.statusText,
        success: testResponse.ok,
        response: responseData,
        headers: Object.fromEntries(testResponse.headers.entries())
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Credential validation error:', error);
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}