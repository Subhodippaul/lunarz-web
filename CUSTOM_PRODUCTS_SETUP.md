# Custom Products Setup Guide

This guide explains how to set up custom product types (Regular T-shirt, Oversized T-shirt, and Hoodie) for the custom t-shirt designer page.

## Required Products

To enable the custom t-shirt designer, you need to add these three product types through the admin panel:

### 1. Regular T-shirt
- **Name**: "Regular T-shirt" (or any name containing "regular")
- **Category**: "Custom T-Shirts" (recommended)
- **Price**: Set your desired base price (e.g., ₹799)
- **Images**: Upload clear product images showing the regular fit
- **Sizes**: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
- **Description**: "Classic fit t-shirt perfect for custom designs"

### 2. Oversized T-shirt
- **Name**: "Oversized T-shirt" (or any name containing "oversized")
- **Category**: "Custom T-Shirts" (recommended)
- **Price**: Set your desired base price (e.g., ₹899)
- **Images**: Upload clear product images showing the oversized fit
- **Sizes**: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
- **Description**: "Relaxed oversized fit t-shirt for comfortable custom designs"

### 3. Hoodie
- **Name**: "Custom Hoodie" (or any name containing "hoodie")
- **Category**: "Custom T-Shirts" (recommended)
- **Price**: Set your desired base price (e.g., ₹1299)
- **Images**: Upload clear product images showing the hoodie
- **Sizes**: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
- **Description**: "Premium hoodie perfect for custom designs"

## How to Add Products

1. **Access Admin Panel**:
   - Go to `/admin` (requires admin authentication)
   - Navigate to "Products" section

2. **Add New Product**:
   - Click "Add Product" button
   - Fill in the product details as specified above
   - Upload high-quality product images
   - Set appropriate pricing
   - Save the product

3. **Verify Setup**:
   - Visit `/custom-tshirt` page
   - Check that all three product types appear in the gallery
   - Verify images and prices are displayed correctly

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Size**: Minimum 800x800px (square aspect ratio recommended)
- **Quality**: High resolution for best display
- **Background**: Clean, preferably white or transparent
- **Angles**: Front view recommended, multiple angles optional

## Filtering Logic

The custom t-shirt page filters products using these criteria:
- Category equals "Custom T-Shirts", OR
- Product name contains "regular", OR
- Product name contains "oversized", OR
- Product name contains "hoodie"

## Size Chart Integration

- Regular T-shirt and Oversized T-shirt → Uses "t-shirt" size chart
- Hoodie → Uses "hoodie" size chart (with different measurements)

## Pricing

- Each product type can have different base prices
- The selected product's price is used in the cart
- Final price = (Product base price) × (Quantity)

## Troubleshooting

**Products not showing up?**
- Check product names contain the required keywords
- Verify products are saved in the database
- Check browser console for any errors

**Images not displaying?**
- Ensure image URLs are accessible
- Check image file formats are supported
- Verify images are uploaded correctly

**Wrong size chart showing?**
- Product names containing "hoodie" will show hoodie size chart
- All others show t-shirt size chart
- Check product naming conventions

## Notes

- Products are fetched from the database on page load
- Loading states are handled automatically
- If no products are found, users see a helpful message
- Admin can update product details anytime through the admin panel