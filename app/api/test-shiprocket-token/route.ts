import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test with a token (you'll need to replace this with your actual token)
    const token = process.env.SHIPROCKET_TOKEN;
    
    if (!token || token === 'your-shiprocket-api-token-here') {
      return NextResponse.json(
        { 
          error: 'No token configured',
          message: 'Please set SHIPROCKET_TOKEN in your .env.local file',
          instructions: [
            '1. Visit /api/get-shiprocket-token to get your token',
            '2. Copy the token to your .env.local file',
            '3. Restart your development server',
            '4. Try this endpoint again'
          ]
        },
        { status: 400 }
      );
    }

    console.log('Testing Shiprocket token...');
    console.log('Token preview:', token.substring(0, 20) + '...');
    
    // Test the token by making a simple API call
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders?page=1&per_page=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'Lunarz-Web/1.0'
      },
    });

    const responseText = await response.text();
    console.log('Test response status:', response.status);
    console.log('Test response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token test failed',
          status: response.status,
          response: responseText,
          tokenPreview: token.substring(0, 20) + '...'
        },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      data = { raw: responseText };
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid and working!',
      tokenPreview: token.substring(0, 20) + '...',
      testResponse: data,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error testing Shiprocket token:', error);
    return NextResponse.json(
      { 
        error: 'Token test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}