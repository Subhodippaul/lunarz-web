/**
 * POST /api/orders/deduct-inventory
 * Decrements shared color+size+category inventory after an order is confirmed.
 * Body: { orderId: string, items: CartItem[] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface OrderItem {
  selectedVariant?: string;
  selectedSize?:    string;
  product?: { category?: string };
  // flat shapes from order receipts
  variant?:  string;
  size?:     string;
  category?: string;
  quantity?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, items } = await req.json() as { orderId: string; items: OrderItem[] };

    if (!orderId || !Array.isArray(items)) {
      return NextResponse.json({ error: 'orderId and items required' }, { status: 400 });
    }

    const results: { color: string; size: string; category: string; qty: number; newStock: number }[] = [];

    for (const item of items) {
      const color    = item.selectedVariant || item.variant;
      const size     = item.selectedSize    || item.size;
      const category = item.product?.category || item.category;
      const qty      = item.quantity ?? 1;

      if (!color || !size || !category) continue;

      const { data, error } = await supabaseAdmin.rpc('decrement_color_inventory', {
        p_color:    color,
        p_size:     size,
        p_category: category,
        p_qty:      qty,
        p_ref:      orderId,
      });

      if (error) {
        console.error(`deduct-inventory error ${color}/${size}/${category}:`, error.message);
        continue;
      }

      results.push({ color, size, category, qty, newStock: data as number });
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error('deduct-inventory route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
