/**
 * Check if Excel file is locked
 * Run with: node scripts/check-excel-lock.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Excel File Lock Status...\n');

const excelPath = path.join(process.cwd(), 'data/products.xlsx');

console.log('📂 File path:', excelPath);

// Check if file exists
if (!fs.existsSync(excelPath)) {
  console.error('❌ File does not exist!');
  process.exit(1);
}

console.log('✅ File exists');

// Check file stats
try {
  const stats = fs.statSync(excelPath);
  console.log('📊 File size:', stats.size, 'bytes');
  console.log('📅 Last modified:', stats.mtime.toLocaleString());
} catch (error) {
  console.error('❌ Cannot get file stats:', error.message);
}

// Check if file is readable
try {
  fs.accessSync(excelPath, fs.constants.R_OK);
  console.log('✅ File is readable');
} catch (error) {
  console.error('❌ File is NOT readable:', error.message);
  console.error('💡 This usually means the file is locked by another program');
  process.exit(1);
}

// Try to read file as buffer
try {
  console.log('\n🔄 Attempting to read file as buffer...');
  const buffer = fs.readFileSync(excelPath);
  console.log('✅ Successfully read file!');
  console.log('📦 Buffer size:', buffer.length, 'bytes');
  
  // Try to parse with xlsx
  try {
    const XLSX = require('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    console.log('✅ Successfully parsed Excel file!');
    console.log('📊 Sheets found:', workbook.SheetNames.join(', '));
    
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log('✅ Data rows:', data.length);
    
    console.log('\n🎉 SUCCESS! Excel file is NOT locked and can be read!');
    console.log('✅ Your Excel file is ready to use!');
    
  } catch (xlsxError) {
    console.error('❌ Error parsing Excel:', xlsxError.message);
    console.error('💡 Make sure xlsx package is installed: npm install xlsx');
  }
  
} catch (error) {
  console.error('❌ Cannot read file:', error.message);
  console.error('\n💡 SOLUTION:');
  console.error('   1. Close Microsoft Excel if it\'s open');
  console.error('   2. Check if any other program is using the file');
  console.error('   3. Try restarting your computer if issue persists');
  process.exit(1);
}
