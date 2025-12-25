import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { Product, StockEntry } from "./data";

// Collections
const COLLECTIONS = {
  PRODUCTS: "products",
  STOCK_ENTRIES: "stockEntries",
} as const;

export class InventoryService {
  // Get stock entries for a product
  static async getStockHistory(productId: string): Promise<StockEntry[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.STOCK_ENTRIES),
        where("productId", "==", productId)
      );
      const querySnapshot = await getDocs(q);
      
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as StockEntry[];

      // Sort by date in JavaScript instead of Firestore
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      const batch = writeBatch(db);

      // Add stock entry
      const stockEntryRef = doc(collection(db, COLLECTIONS.STOCK_ENTRIES));
      const stockEntry: any = {
        productId,
        type,
        quantity,
        reason,
        date: new Date().toISOString(),
        userId,
        createdAt: Timestamp.now(),
      };

      // Only add optional fields if they have values
      if (reference) {
        stockEntry.reference = reference;
      }
      if (notes) {
        stockEntry.notes = notes;
      }

      batch.set(stockEntryRef, stockEntry);

      // Update product stock
      const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      
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

      batch.update(productRef, {
        stock: Math.max(0, newStock), // Ensure stock doesn't go negative
        updatedAt: Timestamp.now(),
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error(`Failed to add stock entry: ${error.message}`);
    }
  }

  // Get current stock for a product
  static async getCurrentStock(productId: string): Promise<number> {
    try {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        const data = productDoc.data();
        return data.stock || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error getting current stock:", error);
      return 0;
    }
  }

  // Get low stock products
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      return products.filter(product => {
        const stock = product.stock || 0;
        const threshold = product.lowStockThreshold || 10;
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
      const batch = writeBatch(db);

      for (const update of updates) {
        // Add stock entry
        const stockEntryRef = doc(collection(db, COLLECTIONS.STOCK_ENTRIES));
        batch.set(stockEntryRef, {
          productId: update.productId,
          type: 'adjustment',
          quantity: update.quantity,
          reason: update.reason,
          date: new Date().toISOString(),
          userId: update.userId,
          createdAt: Timestamp.now(),
        });

        // Update product stock
        const productRef = doc(db, COLLECTIONS.PRODUCTS, update.productId);
        batch.update(productRef, {
          stock: Math.max(0, update.quantity),
          updatedAt: Timestamp.now(),
        });
      }

      await batch.commit();
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
      product.lowStockThreshold || 10,
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
        lowStockThreshold: parseInt(values[12]) || 10,
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