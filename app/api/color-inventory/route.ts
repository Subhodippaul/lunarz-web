import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/color-inventory?color=Black&size=M&category=Oversized
 * Returns { stock, low_threshold } for the given color+size+category.
 * Public endpoint — no auth required.
 */
export async function GET(req: NextRequest) {
  const color    = req.nextUrl.searchParams.get('color');
  const size     = req.nextUrl.searchParams.get('size');
  const category = req.nextUrl.searchParams.get('category');

  if (!color || !size || !category) {
    return NextResponse.json({ error: 'color, size and category required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('color_inventory')
    .select('stock, low_threshold')
    .eq('color',    color)
    .eq('size',     size)
    .eq('category', category)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    stock:         data?.stock         ?? 0,
    low_threshold: data?.low_threshold ?? 10,
  });
}
