import { NextResponse } from 'next/server';
import { getProducts, reloadProducts } from '@/lib/excel-loader';

export async function GET() {
  try {
    console.log('🔄 API: Fetching products from Excel...');
    
    // Force reload to get fresh data
    const products = reloadProducts();
    
    console.log(`✅ API: Loaded ${products.length} products`);
    
    return NextResponse.json({
      success: true,
      products: products,
      count: products.length
    });
  } catch (error: any) {
    console.error('❌ API Error fetching products:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load products',
        details: error.message,
        products: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
