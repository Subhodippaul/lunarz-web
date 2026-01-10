import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Use the credentials to get a token
    const email = 'lunarz.info@gmail.com';
    const password = 'Passw0rd@2026#!';
    
    console.log('Getting Shiprocket token...');
    
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
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

    const responseText = await response.text();
    console.log('Shiprocket response status:', response.status);
    console.log('Shiprocket response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to get token',
          status: response.status,
          response: responseText
        },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON response',
          response: responseText
        },
        { status: 500 }
      );
    }

    if (!data.token) {
      return NextResponse.json(
        { 
          error: 'No token in response',
          data: data
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token: data.token,
      tokenLength: data.token.length,
      tokenPreview: data.token.substring(0, 20) + '...',
      userInfo: {
        firstName: data.first_name,
        lastName: data.last_name,
        companyId: data.company_id
      },
      instructions: [
        '1. Copy the token below',
        '2. Add it to your .env.local file as SHIPROCKET_TOKEN=your-token-here',
        '3. Restart your development server',
        '4. Test the connection'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting Shiprocket token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get token',
        details: error.message 
      },
      { status: 500 }
    );
  }
}