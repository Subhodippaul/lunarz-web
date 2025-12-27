import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    // Generate UUID using Node.js crypto.randomUUID
    const uniqueId = randomUUID();
    
    return NextResponse.json({ 
      success: true, 
      uniqueId 
    });
  } catch (error) {
    console.error('Error generating UUID:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate UUID' },
      { status: 500 }
    );
  }
}