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
      'ID',
      'Name',
      'Price',
      'Category',
      'Description',
      'Material',
      'Care',
      'Origin',
      'Manufacturer',
      'Sizes',
      'Variants',
      'Stock',
      'Low Stock Threshold',
      'SKU',
      'Barcode'
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
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, ''));
      
      return {
        name: values[1] || '',
        price: parseFloat(values[2]) || 0,
        category: values[3] || '',
        description: values[4] || '',
        material: values[5] || '',
        care: values[6] || '',
        origin: values[7] || '',
        manufacturer: values[8] || '',
        sizes: values[9] ? values[9].split(';') : [],
        variants: values[10] ? values[10].split(';') : undefined,
        stock: parseInt(values[11]) || 0,
        sku: values[13] || undefined,
        barcode: values[14] || undefined,
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
