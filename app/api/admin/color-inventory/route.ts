import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET  /api/admin/color-inventory
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('color_inventory')
    .select('*')
    .order('category', { ascending: true })
    .order('color',    { ascending: true })
    .order('size',     { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

// POST /api/admin/color-inventory  — upsert a row
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { color, size, category, stock, low_threshold, notes } = body;

  if (!color?.trim() || !size?.trim() || !category?.trim()) {
    return NextResponse.json({ error: 'color, size and category are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('color_inventory')
    .upsert(
      {
        color: color.trim(),
        size: size.trim(),
        category: category.trim(),
        stock: Number(stock) || 0,
        low_threshold: Number(low_threshold) || 10,
        notes: notes || null,
      },
      { onConflict: 'color,size,category' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ row: data });
}

// PATCH /api/admin/color-inventory  — adjust stock
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, type, quantity, reason, userId, reference } = body;

  if (!id || !type || quantity == null || !reason) {
    return NextResponse.json({ error: 'id, type, quantity, reason required' }, { status: 400 });
  }

  const { data: row, error: fetchErr } = await supabaseAdmin
    .from('color_inventory')
    .select('stock')
    .eq('id', id)
    .single();
  if (fetchErr || !row) return NextResponse.json({ error: 'Row not found' }, { status: 404 });

  let newStock: number;
  if (type === 'in')         newStock = row.stock + Number(quantity);
  else if (type === 'out')   newStock = Math.max(0, row.stock - Number(quantity));
  else                       newStock = Number(quantity); // adjustment

  const { error: updateErr } = await supabaseAdmin
    .from('color_inventory')
    .update({ stock: newStock })
    .eq('id', id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  const logEntry: any = { color_inv_id: id, type, quantity: Number(quantity), reason };
  if (userId)    logEntry.user_id   = userId;
  if (reference) logEntry.reference = reference;
  await supabaseAdmin.from('color_inventory_log').insert(logEntry);

  return NextResponse.json({ stock: newStock });
}

// DELETE /api/admin/color-inventory?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('color_inventory').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
