/**
 * Excel to JSON Converter for Custom T-Shirt Products
 * 
 * This script converts an Excel file to customize-products.json
 * 
 * Usage: node scripts/excel-to-json.js <path-to-excel-file>
 * Example: node scripts/excel-to-json.js products.xlsx
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Get Excel file path from command line argument
const excelFilePath = process.argv[2];

if (!excelFilePath) {
  console.error('❌ Error: Please provide an Excel file path');
  console.log('Usage: node scripts/excel-to-json.js <path-to-excel-file>');
  console.log('Example: node scripts/excel-to-json.js products.xlsx');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(excelFilePath)) {
  console.error(`❌ Error: File not found: ${excelFilePath}`);
  process.exit(1);
}

try {
  console.log(`📖 Reading Excel file: ${excelFilePath}`);
  
  // Read the Excel file
  const workbook = XLSX.readFile(excelFilePath);
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`✅ Found ${rawData.length} products in Excel file`);
  
  // Transform data to match the required format
  const products = rawData.map((row, index) => {
    // Parse sizes (comma-separated string to array)
    const sizes = row.sizes 
      ? row.sizes.toString().split(',').map(s => s.trim())
      : ['S', 'M', 'L', 'XL'];
    
    // Parse colors (comma-separated string to array)
    const colors = row.colors 
      ? row.colors.toString().split(',').map(c => c.trim())
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
  
  // Output path
  const outputPath = path.join(__dirname, '..', 'data', 'customize-products.json');
  
  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  
  console.log(`\n✅ Successfully converted Excel to JSON!`);
  console.log(`📁 Output file: ${outputPath}`);
  console.log(`📊 Total products: ${products.length}`);
  
  // Show summary
  console.log('\n📋 Product Summary:');
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} - ₹${product.price} (${product.sizes.length} sizes, ${product.colors.length} colors)`);
  });
  
  console.log('\n🎉 Done! Your products are ready to use.');
  console.log('💡 Tip: Restart your dev server to see the changes.');
  
} catch (error) {
  console.error('❌ Error converting Excel to JSON:', error.message);
  process.exit(1);
}
