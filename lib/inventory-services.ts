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
        originalPrice: row.original_price,
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
      'originalPrice',
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
      product.originalPrice,
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
  // Returns objects that include the optional `id` from the CSV so bulkImport can upsert by id.
  static parseCSV(csvContent: string): (Omit<Product, 'id' | 'images'> & { id?: string })[] {
    // -----------------------------------------------------------------------
    // Tokenise the entire CSV character-by-character so that newlines inside
    // double-quoted fields are treated as part of the field value rather than
    // as record separators.  This fixes the "562 rows instead of 79" bug that
    // occurred because multiline description fields were being split on \n.
    // -----------------------------------------------------------------------
    const tokenise = (content: string): string[][] => {
      const records: string[][] = [];
      let fields: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        const next = content[i + 1];

        if (ch === '"') {
          if (inQuotes && next === '"') {
            // Escaped double-quote inside a quoted field
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else if ((ch === '\r' || ch === '\n') && !inQuotes) {
          // Skip \r in \r\n sequences
          if (ch === '\r' && next === '\n') i++;
          fields.push(current.trim());
          current = '';
          // Only push non-empty records
          if (fields.some(f => f !== '')) records.push(fields);
          fields = [];
        } else {
          current += ch;
        }
      }

      // Flush the last field / record
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
      const sizesRaw = get(values, 'sizes');
      const variantsRaw = get(values, 'variants');
      const idRaw = get(values, 'id');

      const product: CSVProduct = {
        name: get(values, 'name') || '',
        price: parseFloat(get(values, 'price')) || 0,
        originalPrice: parseFloat(get(values, 'original_price','originalprice')) || 0,
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

      // Preserve the id from the CSV so existing products can be updated by id
      if (idRaw) product.id = idRaw;

      return product;
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
