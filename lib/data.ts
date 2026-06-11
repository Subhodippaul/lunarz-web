export interface Product {
  id: string; // Changed from number to string for Firestore compatibility
  name: string;
  price: number;           // The selling price (what customer pays)
  originalPrice?: number;  // MRP / crossed-out price shown to customer
  category: string;
  images: string[];
  // Color-wise images mapping
  colorImages?: { [color: string]: string[] };
  variants?: string[];
  sizes: string[];
  description: string;
  material: string;
  care: string;
  origin: string;
  manufacturer: string;
  // Related products
  relatedProducts?: string[]; // Array of product IDs
  // Inventory management fields
  stock?: number; // Total stock quantity
  lowStockThreshold?: number; // Alert when stock falls below this
  sku?: string; // Stock Keeping Unit
  barcode?: string; // Product barcode
  stockHistory?: StockEntry[]; // Stock movement history
  // Admin controlled flags for homepage sections
  isTrending?: boolean; // Show in trending products section
  isLatestCollection?: boolean; // Show in latest collection section
  trendingOrder?: number; // Order in trending section (lower = higher priority)
  latestOrder?: number; // Order in latest collection section (lower = higher priority)
}

export interface StockEntry {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment'; // Stock movement type
  quantity: number; // Positive for in/adjustment up, negative for out/adjustment down
  reason: string; // Reason for stock change
  reference?: string; // Order ID, supplier invoice, etc.
  date: string; // ISO date string
  userId: string; // Admin user who made the change
  notes?: string; // Additional notes
}