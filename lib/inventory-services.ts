import { supabase } from './supabase';
import { Product, StockEntry } from './data';

export class InventoryService {
  // Get stock entries for a product
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
      console.error("Error fetching stock history:", error);
      return [];
    }
  }

  // Add stock entry and update product stock
  static async addStockEntry(
    productId: string,
    type: 'in' | 'out' | 'adjustment',
    quantity: number,
    reason: string,
    userId: string,
    reference?: string,
    notes?: string
  ): Promise<void> {
    try {
      // Get current stock
      const currentStock = await this.getCurrentStock(productId);
      let newStock = currentStock;

      if (type === 'in') {
        newStock += quantity;
      } else if (type === 'out') {
        newStock -= quantity;
      } else if (type === 'adjustment') {
        newStock = quantity; // For adjustments, quantity is the new total
      }

      // Add stock entry
      const stockEntryData: any = {
        product_id: productId,
        type,
        quantity,
        reason,
        user_id: userId,
      };

      if (reference) stockEntryData.reference = reference;
      if (notes) stockEntryData.notes = notes;

      const { error: entryError } = await supabase
        .from('stock_entries')
        .insert(stockEntryData);

      if (entryError) throw entryError;

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: Math.max(0, newStock) })
        .eq('id', productId);

      if (updateError) throw updateError;
    } catch (error: any) {
      throw new Error(`Failed to add stock entry: ${error.message}`);
    }
  }

  // Get current stock for a product
  static async getCurrentStock(productId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (error || !data) return 0;
      return data.stock || 0;
    } catch (error) {
      console.error("Error getting current stock:", error);
      return 0;
    }
  }

  // Get low stock products
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      const products = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        price: row.price,
        category: row.category,
        images: row.images,
        sizes: row.sizes,
        description: row.description,
        material: row.material,
        care: row.care,
        origin: row.origin,
        manufacturer: row.manufacturer,
        stock: row.stock,
        isTrending: row.is_trending,
        trendingOrder: row.trending_order,
        isLatestCollection: row.is_latest_collection,
        latestOrder: row.latest_order,
      })) as Product[];

      return products.filter(product => {
        const stock = product.stock || 0;
        const threshold = 10; // Default threshold
        return stock <= threshold;
      });
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      return [];
    }
  }

  // Bulk stock update
  static async bulkUpdateStock(updates: Array<{
    productId: string;
    quantity: number;
    reason: string;
    userId: string;
  }>): Promise<void> {
    try {
      for (const update of updates) {
        // Add stock entry
        const { error: entryError } = await supabase
          .from('stock_entries')
          .insert({
            product_id: update.productId,
            type: 'adjustment',
            quantity: update.quantity,
            reason: update.reason,
            user_id: update.userId,
          });

        if (entryError) throw entryError;

        // Update product stock
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: Math.max(0, update.quantity) })
          .eq('id', update.productId);

        if (updateError) throw updateError;
      }
    } catch (error: any) {
      throw new Error(`Failed to bulk update stock: ${error.message}`);
    }
  }
}

// CSV Export/Import utilities
export class ProductCSVService {
  // Export products to CSV
  static exportToCSV(products: Product[]): string {
    const headers = [
      'id',
      'name',
      'price',
      'category',
      'description',
      'material',
      'care',
      'origin',
      'manufacturer',
      'sizes',
      'variants',
      'stock',
      'low_stock_threshold',
      'sku',
      'barcode'
    ];

    const rows = products.map(product => [
      product.id,
      product.name,
      product.price,
      product.category,
      product.description,
      product.material,
      product.care,
      product.origin,
      product.manufacturer,
      product.sizes.join(';'),
      product.variants?.join(';') || '',
      product.stock || 0,
      10, // Default low stock threshold
      product.sku || '',
      product.barcode || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Parse CSV content to products
  static parseCSV(csvContent: string): Omit<Product, 'id' | 'images'>[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return [];

    // Proper CSV line parser that handles quoted fields with commas
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));

    const get = (values: string[], ...keys: string[]): string => {
      for (const key of keys) {
        const idx = headers.indexOf(key);
        if (idx !== -1 && values[idx]) return values[idx];
      }
      return '';
    };

    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = parseLine(line);

        const sizesRaw = get(values, 'sizes');
        const variantsRaw = get(values, 'variants');

        return {
          name: get(values, 'name') || '',
          price: parseFloat(get(values, 'price')) || 0,
          category: get(values, 'category') || '',
          description: get(values, 'description') || '',
          material: get(values, 'material') || '',
          care: get(values, 'care') || '',
          origin: get(values, 'origin') || '',
          manufacturer: get(values, 'manufacturer') || '',
          sizes: sizesRaw ? sizesRaw.split(';').map(s => s.trim()).filter(Boolean) : [],
          variants: variantsRaw ? variantsRaw.split(';').map(s => s.trim()).filter(Boolean) : undefined,
          stock: parseInt(get(values, 'stock')) || 0,
          lowStockThreshold: parseInt(get(values, 'low_stock_threshold', 'lowstockthreshold')) || 10,
          sku: get(values, 'sku') || undefined,
          barcode: get(values, 'barcode') || undefined,
        };
      });
  }

  // Download CSV file
  static downloadCSV(csvContent: string, filename: string = 'products.csv'): void {
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
