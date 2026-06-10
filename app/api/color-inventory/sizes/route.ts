import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/color-inventory/sizes?color=Black&category=Oversized
 * Returns the sizes that have inventory entries for this color+category,
 * along with their stock levels.
 * e.g. { sizes: [{ size: "M", stock: 5 }, { size: "L", stock: 0 }, ...] }
 */
export async function GET(req: NextRequest) {
  const color    = req.nextUrl.searchParams.get('color');
  const category = req.nextUrl.searchParams.get('category');

  if (!color || !category) {
    return NextResponse.json({ error: 'color and category required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('color_inventory')
    .select('size, stock, low_threshold')
    .eq('color', color)
    .eq('category', category)
    .order('size', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    sizes: (data ?? []).map(r => ({
      size:          r.size,
      stock:         r.stock,
      low_threshold: r.low_threshold,
    })),
  });
}
