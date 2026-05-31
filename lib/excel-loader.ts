/**
 * Excel Product Loader
 * Automatically reads products from Excel file
 */

import * as fs from 'fs';
import * as path from 'path';

// Dynamic import for xlsx to handle Next.js environment
let XLSX: any = null;

try {
  XLSX = require('xlsx');
} catch (error) {
  console.error('❌ Failed to load xlsx package:', error);
}

export interface CustomProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  material: string;
  weight: string;
  sizes: string[];
  colors: string[];
  printArea: string;
}

/**
 * Load products from Excel file
 * @param excelPath - Path to Excel file (relative to project root)
 * @returns Array of products
 */
export function loadProductsFromExcel(excelPath: string = 'data/products.xlsx'): CustomProduct[] {
  try {
    // Check if XLSX is loaded
    if (!XLSX) {
      console.error('❌ XLSX package not available');
      return [];
    }
    
    // Resolve full path
    const fullPath = path.join(process.cwd(), excelPath);
    
    console.log(`🔍 Excel Loader: Checking for file at: ${fullPath}`);
    console.log(`🔍 Current working directory: ${process.cwd()}`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Excel file not found: ${fullPath}`);
      console.warn('📝 Using fallback: Empty product list');
      return [];
    }

    console.log(`✅ Excel file found!`);
    
    // Check if file is accessible (not locked)
    try {
      fs.accessSync(fullPath, fs.constants.R_OK);
    } catch (accessError: any) {
      console.error(`❌ Cannot access Excel file: ${accessError.message}`);
      console.error('💡 TIP: Close the Excel file if it\'s open in Microsoft Excel');
      return [];
    }
    
    console.log(`📖 Reading products from: ${excelPath}`);

    // Read Excel file with buffer to avoid file locking issues
    const fileBuffer = fs.readFileSync(fullPath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    console.log(`✅ Workbook loaded, sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Raw data extracted: ${rawData.length} rows`);
    
    // Transform data
    const products: CustomProduct[] = rawData.map((row: any, index: number) => {
      // Parse sizes (comma-separated string to array)
      const sizes = row.sizes 
        ? row.sizes.toString().split(',').map((s: string) => s.trim())
        : ['S', 'M', 'L', 'XL'];
      
      // Parse colors (comma-separated string to array)
      const colors = row.colors 
        ? row.colors.toString().split(',').map((c: string) => c.trim())
        : ['Black', 'White'];
      
      // Generate ID if not provided
      const id = row.id || `custom-${String(index + 1).padStart(3, '0')}`;
      
      // Generate image path if not provided
      const imageName = row.image || `${id}.svg`;
      const image = imageName.startsWith('/') ? imageName : `/customize-tshirts/${imageName}`;
      
      return {
        id: id,
        name: row.name || 'Unnamed Product',
        price: Number(row.price) || 599,
        category: row.category || 'Customizable T-Shirts',
        image: image,
        description: row.description || 'Premium quality customizable t-shirt',
        material: row.material || '100% Cotton',
        weight: row.weight || '180 GSM',
        sizes: sizes,
        colors: colors,
        printArea: row.printArea || 'Front & Back'
      };
    });
    
    console.log(`✅ Loaded ${products.length} products from Excel`);
    
    return products;
    
  } catch (error: any) {
    console.error('❌ Error loading products from Excel:', error.message);
    console.warn('📝 Using fallback: Empty product list');
    return [];
  }
}

/**
 * Get products (with caching for performance)
 */
let cachedProducts: CustomProduct[] | null = null;

export function getProducts(): CustomProduct[] {
  if (cachedProducts === null) {
    cachedProducts = loadProductsFromExcel();
  }
  return cachedProducts;
}

/**
 * Reload products from Excel (useful for development)
 */
export function reloadProducts(): CustomProduct[] {
  cachedProducts = null;
  return getProducts();
}
