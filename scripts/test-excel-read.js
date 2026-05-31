/**
 * Test Excel Reading
 * Run with: node scripts/test-excel-read.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Excel File Reading...\n');

const excelPath = path.join(process.cwd(), 'data/products.xlsx');

console.log('📂 Excel file path:', excelPath);
console.log('📂 File exists:', fs.existsSync(excelPath));

if (!fs.existsSync(excelPath)) {
  console.error('❌ Excel file not found!');
  process.exit(1);
}

try {
  console.log('\n📖 Reading Excel file...');
  const workbook = XLSX.readFile(excelPath);
  
  console.log('✅ Workbook loaded');
  console.log('📊 Sheet names:', workbook.SheetNames);
  
  const sheetName = workbook.SheetNames[0];
  console.log('📄 Using sheet:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('\n📊 Raw data from Excel:');
  console.log('Total rows:', rawData.length);
  console.log('\nFirst row data:');
  console.log(JSON.stringify(rawData[0], null, 2));
  
  console.log('\n📋 All column names found:');
  if (rawData.length > 0) {
    console.log(Object.keys(rawData[0]));
  }
  
  console.log('\n✅ Excel file is readable!');
  console.log(`Found ${rawData.length} products`);
  
} catch (error) {
  console.error('❌ Error reading Excel:', error.message);
  console.error(error);
}
