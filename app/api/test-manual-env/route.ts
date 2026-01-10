import { NextResponse } from 'next/server';
import { EnvLoader } from '@/lib/env-loader';

export async function GET() {
  try {
    const config = EnvLoader.getShiprocketConfig();
    
    console.log('=== MANUAL ENV LOADER TEST ===');
    console.log(JSON.stringify(config, null, 2));
    console.log('==============================');

    return NextResponse.json({
      success: true,
      config,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Manual env loader error:', error);
    return NextResponse.json(
      { 
        error: 'Manual env loader failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}