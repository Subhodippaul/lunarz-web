/**
 * Generate Placeholder Images for Customize T-Shirt Products
 * 
 * This script creates simple SVG placeholder images for each product
 * until real product photos are available.
 * 
 * Run: node scripts/generate-placeholder-images.js
 */

const fs = require('fs');
const path = require('path');

const products = [
  { name: 'classic-white', color: '#FFFFFF', text: 'Classic\nCotton Tee' },
  { name: 'oversized-black', color: '#000000', text: 'Oversized\nDrop Shoulder' },
  { name: 'polo-navy', color: '#001F3F', text: 'Premium\nPolo Tee' },
  { name: 'vneck-grey', color: '#808080', text: 'V-Neck\nTee' },
  { name: 'longsleeve-white', color: '#F5F5F5', text: 'Long Sleeve\nTee' },
  { name: 'raglan-red', color: '#DC143C', text: 'Raglan\nSleeve Tee' },
  { name: 'pocket-olive', color: '#808000', text: 'Pocket\nTee' },
  { name: 'henley-charcoal', color: '#36454F', text: 'Henley\nNeck Tee' },
  { name: 'ringer-white', color: '#FAFAFA', text: 'Ringer\nTee' },
  { name: 'dryfit-blue', color: '#0066CC', text: 'Performance\nDry-Fit' },
  { name: 'crop-pink', color: '#FFB6C1', text: 'Crop Top\nTee' },
  { name: 'tank-black', color: '#1C1C1C', text: 'Tank\nTop' },
];

const outputDir = path.join(__dirname, '..', 'public', 'customize-tshirts');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate SVG for each product
products.forEach(product => {
  const textColor = ['#FFFFFF', '#F5F5F5', '#FAFAFA', '#FFB6C1'].includes(product.color) 
    ? '#333333' 
    : '#FFFFFF';
  
  const lines = product.text.split('\n');
  const lineHeight = 80;
  const startY = 400 - (lines.length * lineHeight) / 2;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="800" fill="${product.color}"/>
  
  <!-- T-Shirt Icon -->
  <g transform="translate(400, 250)">
    <path d="M -80 -60 L -100 -40 L -100 0 L -80 0 L -80 80 L 80 80 L 80 0 L 100 0 L 100 -40 L 80 -60 L 60 -40 L 40 -40 L 40 -20 L -40 -20 L -40 -40 L -60 -40 Z" 
          fill="${textColor}" 
          opacity="0.3" 
          stroke="${textColor}" 
          stroke-width="2"/>
  </g>
  
  <!-- Product Name -->
  ${lines.map((line, index) => `
  <text x="400" y="${startY + index * lineHeight}" 
        font-family="Arial, sans-serif" 
        font-size="60" 
        font-weight="bold" 
        fill="${textColor}" 
        text-anchor="middle">${line}</text>
  `).join('')}
  
  <!-- Customizable Badge -->
  <rect x="600" y="20" width="180" height="40" rx="20" fill="${textColor}" opacity="0.9"/>
  <text x="690" y="47" 
        font-family="Arial, sans-serif" 
        font-size="18" 
        font-weight="bold" 
        fill="${product.color}" 
        text-anchor="middle">Customizable</text>
</svg>`;

  const filename = `${product.name}.svg`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Generated: ${filename}`);
});

console.log(`\n🎉 Successfully generated ${products.length} placeholder images!`);
console.log(`📁 Location: ${outputDir}`);
console.log(`\n💡 Tip: Replace these SVG files with actual product photos for production.`);
