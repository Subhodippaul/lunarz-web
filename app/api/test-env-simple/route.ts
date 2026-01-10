import { NextResponse } from 'next/server';

export async function GET() {
  // Test different ways to access environment variables
  const tests = {
    // Direct access
    direct_shiprocket_email: process.env.SHIPROCKET_EMAIL,
    direct_shiprocket_password: process.env.SHIPROCKET_PASSWORD,
    
    // Test other env vars that should work
    firebase_project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    
    // Check if process.env exists at all
    process_env_exists: typeof process.env,
    
    // Count total env vars
    total_env_vars: Object.keys(process.env).length,
    
    // List some env var names (for debugging)
    sample_env_keys: Object.keys(process.env).slice(0, 10),
    
    // Check specific patterns
    shiprocket_keys: Object.keys(process.env).filter(key => key.includes('SHIPROCKET')),
    
    // Node environment
    node_env: process.env.NODE_ENV,
  };

  console.log('=== ENVIRONMENT TEST ===');
  console.log(JSON.stringify(tests, null, 2));
  console.log('========================');

  return NextResponse.json(tests);
}