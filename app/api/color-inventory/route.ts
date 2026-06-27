import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/color-inventory?color=Black&size=M&category=Oversized
 * GET /api/color-inventory?color=Black&category=Oversized   (size omitted -> summed across all sizes)
 *
 * If `size` is provided: returns { stock, low_threshold } for that exact color+size+category row.
 * If `size` is omitted: returns { stock } = sum of stock across all sizes for that color+category.
 * Public endpoint — no auth required.
 */
export async function GET(req: NextRequest) {
  const color    = req.nextUrl.searchParams.get('color');
  const size     = req.nextUrl.searchParams.get('size'); // now optional
  const category = req.nextUrl.searchParams.get('category');

  if (!color || !category) {
    return NextResponse.json({ error: 'color and category required' }, { status: 400 });
  }

  // Case 1: size provided -> exact row lookup (unchanged behavior)
  if (size) {
    const { data, error } = await supabaseAdmin
      .from('color_inventory')
      .select('stock, low_threshold')
      .eq('color', color)
      .eq('size', size)
      .eq('category', category)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      stock:         data?.stock         ?? 0,
      low_threshold: data?.low_threshold ?? 10,
    });
  }

  // Case 2: size omitted -> sum stock across all sizes for this color+category
  const { data, error } = await supabaseAdmin
    .from('color_inventory')
    .select('stock')
    .eq('color', color)
    .eq('category', category);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalStock = (data ?? []).reduce((sum, row) => sum + (row.stock ?? 0), 0);
  return NextResponse.json({ stock: totalStock });
}