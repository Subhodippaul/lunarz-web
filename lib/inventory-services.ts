import { supabase } from './supabase';
import { Product, StockEntry } from './data';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ColorInventoryRow {
  id: string;
  color: string;
  size: string;
  category: string;
  stock: number;
  low_threshold: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ColorInventoryLog {
  id: string;
  color_inv_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  user_id?: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ColorInventoryService — shared stock keyed on (color, category)
// All write operations go through API routes (server-side admin client).
// Read operations use the public anon client — products table has RLS open for SELECT.
// ─────────────────────────────────────────────────────────────────────────────

export class ColorInventoryService {
  // ── READ ────────────────────────────────────────────────────────────────────

  /** All rows — calls the admin API route (usable from client). */
  static async getAll(): Promise<ColorInventoryRow[]> {
    const res = await fetch('/api/admin/color-inventory', { cache: 'no-store' });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to fetch inventory');
    const { rows } = await res.json();
    return rows ?? [];
  }

  /** Stock for a specific color + size + category (used on product page). */
  static async getStock(color: string, size: string, category: string): Promise<number> {
    const res = await fetch(
      `/api/color-inventory?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}&category=${encodeURIComponent(category)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return 0;
    const { stock } = await res.json();
    return stock ?? 0;
  }

  static async getStockByColor(color: string, category: string): Promise<number> {
  const res = await fetch(
    `/api/color-inventory?color=${encodeURIComponent(color)}&category=${encodeURIComponent(category)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return 0;
  const { stock } = await res.json();
  return stock ?? 0;
}

  /**
   * Return a map  { "Black|M|Oversized": 5, "White|L|Regular": 12, … }
   * Uses the public Supabase client (color_inventory SELECT is public).
   */
  static async getStockMap(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('color_inventory')
      .select('color, size, category, stock');
    if (error || !data) return {};
    const map: Record<string, number> = {};
    for (const row of data) {
      map[`${row.color}|${row.size}|${row.category}`] = row.stock ?? 0;
    }
    return map;
  }

  /** Recent log entries — calls the admin API route. */
  static async getLog(limit = 50): Promise<ColorInventoryLog[]> {
    const res = await fetch(`/api/admin/color-inventory/log`, { cache: 'no-store' });
    if (!res.ok) return [];
    const { entries } = await res.json();
    return (entries ?? []).slice(0, limit);
  }

  // ── WRITE (all via API routes — server uses admin client) ──────────────────

  /** Create or update a color+size+category inventory entry. */
  static async upsert(
    color: string,
    size: string,
    category: string,
    stock: number,
    lowThreshold = 10,
    notes?: string
  ): Promise<ColorInventoryRow> {
    const res = await fetch('/api/admin/color-inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color, size, category, stock, low_threshold: lowThreshold, notes }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to upsert');
    const { row } = await res.json();
    return row;
  }

  /** Delete an entry. */
  static async delete(id: string): Promise<void> {
    const res = await fetch(`/api/admin/color-inventory?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to delete');
  }

  /**
   * Adjust stock for a color+category entry.
   * type: 'in' → adds  |  'out' → subtracts  |  'adjustment' → sets absolute value
   */
  static async adjust(
    id: string,
    type: 'in' | 'out' | 'adjustment',
    quantity: number,
    reason: string,
    userId?: string,
    reference?: string
  ): Promise<void> {
    const res = await fetch('/api/admin/color-inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, quantity, reason, userId, reference }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to adjust');
  }

  /**
   * Decrement stock when an order is placed.
   */
  static async decrementForOrder(
    color: string,
    size: string,
    category: string,
    qty: number,
    orderId: string
  ): Promise<number> {
    const res = await fetch('/api/orders/deduct-inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, items: [{ selectedVariant: color, selectedSize: size, product: { category }, quantity: qty }] }),
    });
    if (!res.ok) return -1;
    const { results } = await res.json();
    return results?.[0]?.newStock ?? -1;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy InventoryService (product-level, kept for backward compat)
// ─────────────────────────────────────────────────────────────────────────────

export class InventoryService {
  static async getStockHistory(productId: string): Promise<StockEntry[]> {
    try {
      const { data, error } = await supabase
        .from('stock_entries')
        .select('*')
        .eq('product_id', productId)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        productId: row.product_id,
        type: row.type,
        quantity: row.quantity,
        reason: row.reason,
        reference: row.reference,
        notes: row.notes,
        date: row.date,
        userId: row.user_id,
      }));
    } catch (error) {
      console.error('Error fetching stock history:', error);
      return [];
    }
  }

  static async getCurrentStock(productId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();
      if (error || !data) return 0;
      return data.stock || 0;
    } catch {
      return 0;
    }
  }

  static async getLowStockProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      const products = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        price: row.price,
        originalPrice: row.original_price,
        category: row.category,
        images: Array.isArray(row.images) && row.images.length ? row.images : ['/placeholder.jpg'],
        sizes: Array.isArray(row.sizes) ? row.sizes : [],
        variants: row.variants,
        description: row.description,
        material: row.material,
        care: row.care,
        origin: row.origin,
        manufacturer: row.manufacturer,
        stock: row.stock,
        lowStockThreshold: row.low_stock_threshold,
        isTrending: row.is_trending,
        trendingOrder: row.trending_order,
        isLatestCollection: row.is_latest_collection,
        latestOrder: row.latest_order,
      })) as Product[];
      return products.filter(p => (p.stock || 0) <= (p.lowStockThreshold || 10));
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductCSVService (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export class ProductCSVService {
  static exportToCSV(products: Product[]): string {
    const headers = [
      'id', 'name', 'price', 'originalPrice', 'category', 'description',
      'material', 'care', 'origin', 'manufacturer', 'sizes', 'variants',
      'stock', 'low_stock_threshold', 'sku', 'barcode',
    ];
    const rows = products.map(product => [
      product.id, product.name, product.price, product.originalPrice,
      product.category, product.description, product.material, product.care,
      product.origin, product.manufacturer,
      product.sizes.join(';'), product.variants?.join(';') || '',
      product.stock || 0, 10, product.sku || '', product.barcode || '',
    ]);
    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  static parseCSV(csvContent: string): (Omit<Product, 'id' | 'images'> & { id?: string })[] {
    const tokenise = (content: string): string[][] => {
      const records: string[][] = [];
      let fields: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        const next = content[i + 1];
        if (ch === '"') {
          if (inQuotes && next === '"') { current += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          fields.push(current.trim()); current = '';
        } else if ((ch === '\r' || ch === '\n') && !inQuotes) {
          if (ch === '\r' && next === '\n') i++;
          fields.push(current.trim()); current = '';
          if (fields.some(f => f !== '')) records.push(fields);
          fields = [];
        } else { current += ch; }
      }
      fields.push(current.trim());
      if (fields.some(f => f !== '')) records.push(fields);
      return records;
    };

    const records = tokenise(csvContent.trim());
    if (records.length < 2) return [];
    const headers = records[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const get = (values: string[], ...keys: string[]): string => {
      for (const key of keys) {
        const idx = headers.indexOf(key);
        if (idx !== -1 && values[idx] !== undefined && values[idx] !== '') return values[idx];
      }
      return '';
    };

    type CSVProduct = Omit<Product, 'id' | 'images'> & { id?: string };
    return records.slice(1).map((values): CSVProduct => {
      const product: CSVProduct = {
        name: get(values, 'name') || '',
        price: parseFloat(get(values, 'price')) || 0,
        originalPrice: parseFloat(get(values, 'original_price', 'originalprice')) || 0,
        category: get(values, 'category') || '',
        description: get(values, 'description') || '',
        material: get(values, 'material') || '',
        care: get(values, 'care') || '',
        origin: get(values, 'origin') || '',
        manufacturer: get(values, 'manufacturer') || '',
        sizes: (() => { const r = get(values, 'sizes'); return r ? r.split(';').map(s => s.trim()).filter(Boolean) : []; })(),
        variants: (() => { const r = get(values, 'variants'); return r ? r.split(';').map(s => s.trim()).filter(Boolean) : undefined; })(),
        stock: parseInt(get(values, 'stock')) || 0,
        lowStockThreshold: parseInt(get(values, 'low_stock_threshold', 'lowstockthreshold')) || 10,
        sku: get(values, 'sku') || undefined,
        barcode: get(values, 'barcode') || undefined,
      };
      const idRaw = get(values, 'id');
      if (idRaw) product.id = idRaw;
      return product;
    });
  }

  static downloadCSV(csvContent: string, filename = 'products.csv'): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
