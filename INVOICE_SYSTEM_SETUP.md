# Invoice System Setup Guide

This guide explains the comprehensive invoice creation and management system for the Lunarz admin portal.

## 🧾 Features Overview

### ✅ Complete Invoice Management
- **Manual Invoice Creation**: Create professional invoices with all required fields
- **PDF Generation**: Download invoices as PDF with print-ready formatting
- **Share Functionality**: Share invoices via native sharing or clipboard
- **Database Storage**: All invoices stored in Firebase with full CRUD operations
- **Professional Layout**: GST-compliant invoice format for Indian businesses

### ✅ Invoice Components

#### 1. Company Details (Pre-filled)
- Company/Brand Name: "Lunarz"
- Logo placeholder (can be customized)
- Full Address with city, state, PIN
- Phone Number and Email
- GSTIN (GST Identification Number)
- PAN (optional)

#### 2. Invoice Information
- **Auto-generated Invoice Number**: Format `LNZ{YY}{MM}{DDD}` (e.g., LNZ24120001)
- Invoice Date (defaults to today)
- Due Date (optional)
- Place of Supply (for GST compliance)
- Payment Mode (UPI/Cash/Card/Bank Transfer/COD)

#### 3. Customer Details
- Customer Name and Address
- Mobile Number and Email
- Customer GSTIN (for B2B transactions)

#### 4. Product/Service Items Table
- Serial Number (auto-generated)
- Description
- HSN/SAC Code
- Quantity
- Rate per unit
- Tax Percentage
- Amount (auto-calculated)
- Add/Remove items dynamically

#### 5. Amount Summary
- Subtotal calculation
- Discount percentage and amount
- Taxable Value
- CGST and SGST calculations
- Shipping/Handling charges
- **Grand Total**
- **Amount in Words** (Indian format)

#### 6. Terms & Conditions
- Return/Exchange Policy
- Delivery Timeline
- Custom Order Policy
- Thank you note

#### 7. Bank Details (Optional)
- Account Holder Name
- Bank Name and Account Number
- IFSC Code
- UPI ID

#### 8. Legal Compliance
- Declaration statement
- Authorized signatory section
- Company stamp placeholder
- Computer-generated invoice footer

## 🚀 How to Use

### Access Invoice System
1. Go to Admin Panel: `/admin`
2. Click on "Invoices" in the sidebar
3. You'll see the invoice creation form

### Create New Invoice
1. **Company Details**: Pre-filled, modify if needed
2. **Invoice Info**: Invoice number auto-generated, set date and payment mode
3. **Customer Details**: Fill in customer information
4. **Add Items**: 
   - Click "Add Item" to add products/services
   - Fill description, HSN code, quantity, rate
   - Tax percentage (default 18%)
   - Amount auto-calculates
5. **Set Taxes**: Configure CGST/SGST rates (default 9% each)
6. **Add Discounts**: Set discount percentage if applicable
7. **Preview**: Click "Preview" to see formatted invoice
8. **Create**: Click "Create Invoice" to save

### PDF Generation & Sharing
- **Preview**: Shows formatted invoice with professional layout
- **Download PDF**: Generates print-ready PDF (opens print dialog)
- **Share**: Uses native sharing API or copies to clipboard
- **Print**: Direct printing from preview

## 🗄️ Database Structure

### Invoice Collection: `invoices`
```typescript
interface Invoice {
  id: string;
  
  // Company Details
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGSTIN: string;
  companyPAN: string;
  
  // Invoice Information
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  paymentMode: string;
  
  // Customer Details
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  customerGSTIN: string;
  
  // Items Array
  items: InvoiceItem[];
  
  // Calculations
  subtotal: number;
  discount: number;
  shippingCharges: number;
  cgstRate: number;
  sgstRate: number;
  totalAmount: number;
  
  // Terms & Bank Details
  returnPolicy: string;
  deliveryTimeline: string;
  customOrderPolicy: string;
  thankYouNote: string;
  bankAccountHolder: string;
  bankName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  bankUPI: string;
  
  // Metadata
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 Customization Options

### Company Branding
1. **Logo**: Replace logo placeholder in invoice preview
2. **Colors**: Modify brand colors in CSS
3. **Company Details**: Update default company information

### Invoice Template
1. **Layout**: Modify `invoice-preview.tsx` for layout changes
2. **Fields**: Add/remove fields in the form and database schema
3. **Calculations**: Customize tax calculations in `invoice-service.ts`

### PDF Styling
- **Print CSS**: Modify print styles in `generateInvoiceHTML()`
- **Fonts**: Change font families for PDF output
- **Layout**: Adjust margins, spacing, and formatting

## 📋 Default Values

### Company Information
```typescript
companyName: "Lunarz"
companyAddress: "Your Company Address\nCity, State - PIN\nIndia"
companyPhone: "+91 XXXXX XXXXX"
companyEmail: "lunarz.info@gmail.com"
```

### Terms & Conditions
```typescript
returnPolicy: "7 days return policy applicable"
deliveryTimeline: "3-5 business days"
customOrderPolicy: "Custom orders are non-returnable"
thankYouNote: "Thank you for shopping with Lunarz!"
```

### Tax Settings
- **CGST**: 9% (default)
- **SGST**: 9% (default)
- **Item Tax**: 18% (default)

## 🔧 Technical Implementation

### Key Files
- `app/admin/invoices/page.tsx` - Main invoice creation page
- `lib/invoice-service.ts` - Database operations and calculations
- `components/admin/invoice-preview.tsx` - PDF preview and generation
- `components/ui/textarea.tsx` - Form textarea component
- `components/ui/select.tsx` - Form select component

### Dependencies
- **Firebase**: Database storage
- **Radix UI**: Form components
- **Lucide React**: Icons
- **Browser Print API**: PDF generation

### Features
- **Auto-calculations**: Real-time amount calculations
- **Form validation**: Required field validation
- **Responsive design**: Works on desktop and mobile
- **Error handling**: Comprehensive error management
- **Loading states**: User feedback during operations

## 📱 Mobile Responsiveness

- **Responsive Form**: Adapts to mobile screens
- **Touch-friendly**: Large buttons and inputs
- **Mobile PDF**: Optimized PDF viewing on mobile
- **Sidebar Navigation**: Mobile-friendly admin navigation

## 🔒 Security & Validation

- **Admin Authentication**: Only authenticated admins can access
- **Input Validation**: Form validation for required fields
- **Data Sanitization**: Safe handling of user inputs
- **Error Boundaries**: Graceful error handling

## 🚀 Future Enhancements

### Planned Features
1. **Email Integration**: Send invoices via email
2. **Recurring Invoices**: Set up recurring billing
3. **Payment Integration**: Link with payment gateways
4. **Invoice Templates**: Multiple template options
5. **Bulk Operations**: Bulk invoice creation
6. **Advanced Search**: Search and filter invoices
7. **Reports**: Invoice analytics and reports
8. **Multi-currency**: Support for different currencies

### Integration Possibilities
- **WhatsApp Sharing**: Share invoices via WhatsApp
- **Google Drive**: Auto-backup invoices to Drive
- **Accounting Software**: Export to Tally, QuickBooks
- **SMS Notifications**: Send invoice notifications

## 📞 Support

For technical support or customization requests:
- Check the code comments for implementation details
- Refer to Firebase documentation for database operations
- Test thoroughly before production use
- Keep backups of invoice data

## 🎯 Best Practices

1. **Regular Backups**: Export invoice data regularly
2. **Number Sequence**: Maintain sequential invoice numbers
3. **Legal Compliance**: Ensure GST compliance for Indian businesses
4. **Data Validation**: Always validate customer and item data
5. **PDF Testing**: Test PDF generation across different browsers
6. **Mobile Testing**: Verify mobile functionality regularly

The invoice system is now ready for production use with all professional features required for a business!