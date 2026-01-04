"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Share2 } from "lucide-react";
import { Invoice, InvoiceService } from "@/lib/invoice-service";
import { useToast } from "@/components/ui/toast";

interface InvoicePreviewProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoicePreview({ invoice, isOpen, onClose }: InvoicePreviewProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const totals = InvoiceService.calculateInvoiceTotals(invoice);
  const amountInWords = InvoiceService.numberToWords(totals.grandTotal);

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked');
      }

      // Generate the HTML content for PDF
      const htmlContent = generateInvoiceHTML();
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      addToast({
        title: "PDF Generated",
        description: "Invoice PDF is ready for download",
        type: "success"
      });
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      addToast({
        title: "Error",
        description: "Failed to generate PDF",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `Invoice for ${invoice.customerName} - ₹${totals.grandTotal.toFixed(2)}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Invoice ${invoice.invoiceNumber} for ${invoice.customerName} - ₹${totals.grandTotal.toFixed(2)}`
        );
        addToast({
          title: "Copied to Clipboard",
          description: "Invoice details copied to clipboard",
          type: "success"
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const generateInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px;
            line-height: 1.4;
          }
          .invoice-header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .company-details h1 { 
            margin: 0; 
            font-size: 24px; 
            color: #2563eb;
          }
          .invoice-info { 
            text-align: right; 
          }
          .customer-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .customer-details, .invoice-details {
            width: 48%;
          }
          .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
          }
          th { 
            background-color: #f8f9fa; 
            font-weight: bold;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .amount-summary {
            width: 50%;
            margin-left: auto;
            margin-top: 20px;
          }
          .amount-summary table {
            margin-bottom: 10px;
          }
          .amount-summary th, .amount-summary td {
            border: 1px solid #ddd;
            padding: 6px 12px;
          }
          .grand-total {
            background-color: #f0f9ff;
            font-weight: bold;
          }
          .terms-section {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
          }
          .terms-left, .terms-right {
            width: 48%;
          }
          .signature-section {
            margin-top: 40px;
            text-align: right;
          }
          .signature-box {
            border: 1px solid #ddd;
            height: 80px;
            width: 200px;
            margin-left: auto;
            margin-top: 10px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            z-index: -1;
            pointer-events: none;
            user-select: none;
          }
          
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              z-index: -1;
              pointer-events: none;
              user-select: none;
            }

          }
        </style>
      </head>
      <body>
        <!-- Watermark -->
        <div class="watermark">
          <img src="/logo2.png" alt="Lunarz Logo" style="width: 500px; opacity: 0.08;" />
        </div>
        
        <!-- Invoice Header -->
        <div class="invoice-header">
          <div class="company-details">
            <h1>${invoice.companyName}</h1>
            <div style="white-space: pre-line;">${invoice.companyAddress}</div>
            <div>Phone: ${invoice.companyPhone}</div>
            <div>Email: ${invoice.companyEmail}</div>
            ${invoice.companyGSTIN ? `<div>GSTIN: ${invoice.companyGSTIN}</div>` : ''}
          </div>
          <div class="invoice-info">
            <h2 style="margin: 0; color: #dc2626;">INVOICE</h2>
            <div style="margin-top: 10px;">
              <strong>Invoice No:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}<br>
              <strong>Place of Supply:</strong> ${invoice.placeOfSupply}<br>
              <strong>Payment Mode:</strong> ${invoice.paymentMode}
            </div>
          </div>
        </div>

        <!-- Customer and Invoice Details -->
        <div class="customer-section">
          <div class="customer-details">
            <div class="section-title">Bill To:</div>
            <strong>${invoice.customerName}</strong><br>
            <div style="white-space: pre-line;">${invoice.customerAddress}</div>
            <div>Phone: ${invoice.customerPhone}</div>
            ${invoice.customerEmail ? `<div>Email: ${invoice.customerEmail}</div>` : ''}
            ${invoice.customerGSTIN ? `<div>GSTIN: ${invoice.customerGSTIN}</div>` : ''}
          </div>
          <div class="invoice-details">
            <div class="section-title">Invoice Details:</div>
            <div><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</div>
            <div><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</div>
            ${invoice.dueDate ? `<div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</div>` : ''}
            <div><strong>Place of Supply:</strong> ${invoice.placeOfSupply}</div>
            <div><strong>Payment Mode:</strong> ${invoice.paymentMode}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">No.</th>
              <th style="width: 40%;">Description</th>
              <th style="width: 10%;">HSN/SAC</th>
              <th style="width: 8%;">Qty</th>
              <th style="width: 12%;">Rate</th>
              <th style="width: 10%;">Tax %</th>
              <th style="width: 15%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.description}</td>
                <td class="text-center">${item.hsnSac}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₹${item.rate.toFixed(2)}</td>
                <td class="text-center">${item.taxRate}%</td>
                <td class="text-right">₹${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Amount Summary -->
        <div class="amount-summary">
          <table>
            <tr>
              <th>Subtotal:</th>
              <td class="text-right">₹${totals.subtotal.toFixed(2)}</td>
            </tr>
            ${invoice.discount > 0 ? `
              <tr>
                <th>Discount (${invoice.discount}%):</th>
                <td class="text-right">-₹${totals.discountAmount.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr>
              <th>Taxable Value:</th>
              <td class="text-right">₹${totals.taxableValue.toFixed(2)}</td>
            </tr>
            ${invoice.cgstRate > 0 ? `
              <tr>
                <th>CGST (${invoice.cgstRate}%):</th>
                <td class="text-right">₹${totals.cgstAmount.toFixed(2)}</td>
              </tr>
            ` : ''}
            ${invoice.sgstRate > 0 ? `
              <tr>
                <th>SGST (${invoice.sgstRate}%):</th>
                <td class="text-right">₹${totals.sgstAmount.toFixed(2)}</td>
              </tr>
            ` : ''}
            ${invoice.shippingCharges > 0 ? `
              <tr>
                <th>Shipping Charges:</th>
                <td class="text-right">₹${invoice.shippingCharges.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr class="grand-total">
              <th>Grand Total:</th>
              <td class="text-right">₹${totals.grandTotal.toFixed(2)}</td>
            </tr>
            ${invoice.advancePayment > 0 ? `
              <tr>
                <th>Advance Payment:</th>
                <td class="text-right">-₹${invoice.advancePayment.toFixed(2)}</td>
              </tr>
              <tr class="grand-total">
                <th>Due Payment:</th>
                <td class="text-right">₹${invoice.duePayment.toFixed(2)}</td>
              </tr>
            ` : ''}
          </table>
          <div style="margin-top: 10px; font-weight: bold;">
            Amount in Words: ${amountInWords}
          </div>
        </div>

        <!-- Terms and Bank Details -->
        <div class="terms-section">
          <div class="terms-left">
            <div class="section-title">Terms & Conditions:</div>
            <div style="font-size: 11px;">
              • ${invoice.returnPolicy}<br>
              • ${invoice.deliveryTimeline}<br>
              • ${invoice.customOrderPolicy}<br>
              <br>
              <em>${invoice.thankYouNote}</em>
            </div>
          </div>
          <div class="terms-right">
            ${invoice.bankName ? `
              <div class="section-title">Bank Details:</div>
              <div style="font-size: 11px;">
                <strong>Account Holder:</strong> ${invoice.bankAccountHolder}<br>
                <strong>Bank Name:</strong> ${invoice.bankName}<br>
                <strong>Account No:</strong> ${invoice.bankAccountNumber}<br>
                <strong>IFSC Code:</strong> ${invoice.bankIFSC}<br>
                ${invoice.bankUPI ? `<strong>UPI ID:</strong> ${invoice.bankUPI}<br>` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Declaration -->
        <div style="margin-top: 20px; font-size: 11px; font-style: italic;">
          <strong>Declaration:</strong> ${invoice.declaration}
        </div>

        <!-- Signature Section -->
        <div className="flex justify-end mt-6">
  <div className="text-center">
    <div className="mb-2 text-sm">
      For Lunarz
    </div>

    <div className="border border-gray-300 w-48 flex flex-col items-center justify-between p-2">
      
      <img
        src="/subhodip_sign.jpg"
        alt="Authorized Signature"
        style="width: 120px; opacity: 90;"
      />

      <div className="text-xs text-gray-600">
        (Authorized Signatory)
      </div>
    </div>
  </div>
</div>

        <!-- Footer -->
        <div class="footer">
          <div>This is a computer-generated invoice.</div>
          <div style="margin-top: 5px;">Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold">Invoice Preview - {invoice.invoiceNumber}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Invoice Content */}
          <CardContent className="p-0 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="p-8 bg-white relative" style={{ minHeight: '297mm' }}>
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <img 
                  src="/logo2.png" 
                  alt="Lunarz Logo"
                  className="opacity-5 transform -rotate-45"
                  style={{ 
                    width: '700px', 
                    // height: '700px'
                  }}
                />
              </div>
              
              {/* Invoice Content - with higher z-index */}
              <div className="relative z-10">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-800">
                <div>
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">{invoice.companyName}</h1>
                  <div className="text-sm text-gray-600 whitespace-pre-line">{invoice.companyAddress}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    <div>Phone: {invoice.companyPhone}</div>
                    <div>Email: {invoice.companyEmail}</div>
                    {invoice.companyGSTIN && <div>GSTIN: {invoice.companyGSTIN}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-red-600 mb-4">INVOICE</h2>
                  <div className="text-sm">
                    <div><strong>Invoice No:</strong> {invoice.invoiceNumber}</div>
                    <div><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</div>
                    <div><strong>Place of Supply:</strong> {invoice.placeOfSupply}</div>
                    <div><strong>Payment Mode:</strong> {invoice.paymentMode}</div>
                  </div>
                </div>
              </div>

              {/* Customer and Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">Bill To:</h3>
                  <div className="text-sm">
                    <div className="font-semibold text-lg mb-2">{invoice.customerName}</div>
                    <div className="whitespace-pre-line text-gray-600 mb-2">{invoice.customerAddress}</div>
                    <div>Phone: {invoice.customerPhone}</div>
                    {invoice.customerEmail && <div>Email: {invoice.customerEmail}</div>}
                    {invoice.customerGSTIN && <div>GSTIN: {invoice.customerGSTIN}</div>}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">Invoice Details:</h3>
                  <div className="text-sm">
                    <div><strong>Invoice Number:</strong> {invoice.invoiceNumber}</div>
                    <div><strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</div>
                    {invoice.dueDate && <div><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</div>}
                    <div><strong>Place of Supply:</strong> {invoice.placeOfSupply}</div>
                    <div><strong>Payment Mode:</strong> {invoice.paymentMode}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left w-12">No.</th>
                      <th className="border border-gray-300 p-3 text-left">Description</th>
                      <th className="border border-gray-300 p-3 text-center w-20">HSN/SAC</th>
                      <th className="border border-gray-300 p-3 text-center w-16">Qty</th>
                      <th className="border border-gray-300 p-3 text-right w-24">Rate</th>
                      <th className="border border-gray-300 p-3 text-center w-16">Tax %</th>
                      <th className="border border-gray-300 p-3 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-3">{item.description}</td>
                        <td className="border border-gray-300 p-3 text-center">{item.hsnSac}</td>
                        <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 p-3 text-right">₹{item.rate.toFixed(2)}</td>
                        <td className="border border-gray-300 p-3 text-center">{item.taxRate}%</td>
                        <td className="border border-gray-300 p-3 text-right">₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Amount Summary */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <table className="w-full border-collapse border border-gray-300">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left bg-gray-50">Subtotal:</th>
                      <td className="border border-gray-300 p-2 text-right">₹{totals.subtotal.toFixed(2)}</td>
                    </tr>
                    {invoice.discount > 0 && (
                      <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-50">Discount ({invoice.discount}%):</th>
                        <td className="border border-gray-300 p-2 text-right">-₹{totals.discountAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <th className="border border-gray-300 p-2 text-left bg-gray-50">Taxable Value:</th>
                      <td className="border border-gray-300 p-2 text-right">₹{totals.taxableValue.toFixed(2)}</td>
                    </tr>
                    {invoice.cgstRate > 0 && (
                      <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-50">CGST ({invoice.cgstRate}%):</th>
                        <td className="border border-gray-300 p-2 text-right">₹{totals.cgstAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    {invoice.sgstRate > 0 && (
                      <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-50">SGST ({invoice.sgstRate}%):</th>
                        <td className="border border-gray-300 p-2 text-right">₹{totals.sgstAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    {invoice.shippingCharges > 0 && (
                      <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-50">Shipping Charges:</th>
                        <td className="border border-gray-300 p-2 text-right">₹{invoice.shippingCharges.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 p-2 text-left font-bold">Grand Total:</th>
                      <td className="border border-gray-300 p-2 text-right font-bold">₹{totals.grandTotal.toFixed(2)}</td>
                    </tr>
                    {invoice.advancePayment > 0 && (
                      <>
                        <tr>
                          <th className="border border-gray-300 p-2 text-left bg-gray-50">Advance Payment:</th>
                          <td className="border border-gray-300 p-2 text-right">-₹{invoice.advancePayment.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-orange-50">
                          <th className="border border-gray-300 p-2 text-left font-bold">Due Payment:</th>
                          <td className="border border-gray-300 p-2 text-right font-bold">₹{invoice.duePayment.toFixed(2)}</td>
                        </tr>
                      </>
                    )}
                  </table>
                  <div className="mt-3 text-sm font-semibold">
                    <strong>Amount in Words:</strong> {amountInWords}
                  </div>
                </div>
              </div>

              {/* Terms and Bank Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">Terms & Conditions:</h3>
                  <div className="text-sm text-gray-600">
                    <div>• {invoice.returnPolicy}</div>
                    <div>• {invoice.deliveryTimeline}</div>
                    <div>• {invoice.customOrderPolicy}</div>
                    <div className="mt-3 italic">{invoice.thankYouNote}</div>
                  </div>
                </div>
                {invoice.bankName && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">Bank Details:</h3>
                    <div className="text-sm text-gray-600">
                      <div><strong>Account Holder:</strong> {invoice.bankAccountHolder}</div>
                      <div><strong>Bank Name:</strong> {invoice.bankName}</div>
                      <div><strong>Account No:</strong> {invoice.bankAccountNumber}</div>
                      <div><strong>IFSC Code:</strong> {invoice.bankIFSC}</div>
                      {invoice.bankUPI && <div><strong>UPI ID:</strong> {invoice.bankUPI}</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Declaration */}
              <div className="mb-8 text-sm text-gray-600 italic">
                <strong>Declaration:</strong> {invoice.declaration}
              </div>

              {/* Signature Section */}
              <div className="flex justify-end mt-6">
  <div className="text-center">
    <div className="mb-2 text-sm">
      For {invoice.companyName}
    </div>

    <div className="border border-gray-300 w-48 h-20 flex flex-col items-center justify-between p-2">
      {/* Digital Signature */}
      <img
        src="/subhodip_sign.jpg"
        alt="Authorized Signature"
        className="max-h-14 object-contain opacity-90"
      />

      <div className="text-xs text-gray-600">
        (Authorized Signatory)
      </div>
    </div>
  </div>
</div>


              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <div>This is a computer-generated invoice.</div>
                <div className="mt-1">Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}</div>
              </div>
              </div> {/* End of z-10 content div */}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}