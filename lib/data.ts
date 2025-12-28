export interface Product {
  id: string; // Changed from number to string for Firestore compatibility
  name: string;
  price: number;
  category: string;
  images: string[];
  variants?: string[];
  sizes: string[];
  description: string;
  material: string;
  care: string;
  origin: string;
  manufacturer: string;
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

export const products: Product[] = [
  { 
    id: "1", 
    name: "Anime Oversized Tee", 
    price: 999,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    variants: ["Black", "White", "Grey"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Premium quality oversized anime graphic tee with comfortable fit",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd.",
    stock: 45,
    lowStockThreshold: 10,
    sku: "TSH-001-ANI",
    barcode: "1234567890123"
  },
  { 
    id: "2", 
    name: "Football Fan Tee", 
    price: 899,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    variants: ["Red", "Blue", "Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Show your love for football with this stylish fan tee",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd.",
    stock: 8,
    lowStockThreshold: 10,
    sku: "TSH-002-FB",
    barcode: "1234567890124"
  },
  { 
    id: "3", 
    name: "Pink Floyd Tee", 
    price: 1099,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    variants: ["Black", "Navy", "Charcoal"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Classic Pink Floyd band tee for music lovers",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd.",
    stock: 0,
    lowStockThreshold: 5,
    sku: "TSH-003-PF",
    barcode: "1234567890125"
  },
  { 
    id: "4", 
    name: "Streetwear Black Tee", 
    price: 949,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Minimalist streetwear tee perfect for everyday wear",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd.",
    stock: 25,
    lowStockThreshold: 15,
    sku: "TSH-004-SW",
    barcode: "1234567890126"
  },
  { 
    id: "5", 
    name: "Minimal White Tee", 
    price: 799,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Clean and minimal white tee for a classic look",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd.",
    stock: 3,
    lowStockThreshold: 10,
    sku: "TSH-005-MIN",
    barcode: "1234567890127"
  },
];