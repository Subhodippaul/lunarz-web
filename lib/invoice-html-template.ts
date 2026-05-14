export function buildInvoiceHTML(data: any, totals: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; line-height: 1.5; padding: 30px; color: #000; position: relative; }
    .invoice { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.08; z-index: 0; pointer-events: none; width: 60%; max-width: 500px; height: auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
    .company-info { flex: 1; display: flex; align-items: flex-start; gap: 15px; }
    .company-logo { width: 80px; height: 80px; object-fit: contain; }
    .company-text { flex: 1; }
    .company-name { font-size: 22px; font-weight: bold; color: #000; margin-bottom: 8px; }
    .company-name span { color: #dc2626; }
    .company-details { font-size: 12px; line-height: 1.6; color: #333; }
    .company-details a { color: #2563eb; text-decoration: none; }
    .invoice-title { text-align: right; font-size: 32px; font-weight: bold; color: #4b5563; letter-spacing: 1px; }
    .invoice-meta { text-align: right; margin-top: 20px; font-size: 13px; }
    .invoice-meta div { margin-bottom: 4px; }
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 30px 0; border: 2px solid #000; }
    .address-box { padding: 15px; border-right: 2px solid #000; }
    .address-box:last-child { border-right: none; }
    .address-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
    .address-content { font-size: 12px; line-height: 1.7; }
    .address-content strong { display: block; font-size: 14px; margin-bottom: 5px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #000; }
    .items-table thead { background: #fbbf24; }
    .items-table th { padding: 12px 10px; text-align: left; font-weight: bold; font-size: 13px; text-transform: uppercase; border: 1px solid #000; }
    .items-table td { padding: 12px 10px; border: 1px solid #000; font-size: 13px; }
    .items-table tbody tr:nth-child(even) { background: #fef3c7; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .grand-total-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border: 2px solid #000; background: #fef3c7; margin-top: 0; }
    .grand-total-row > div { padding: 12px; border-right: 1px solid #000; font-weight: bold; font-size: 14px; }
    .grand-total-row > div:last-child { border-right: none; }
    .summary-box { float: right; width: 350px; margin-top: 15px; border: 2px solid #000; }
    .summary-row { display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #000; font-size: 13px; }
    .summary-row:last-child { border-bottom: none; background: #f3f4f6; font-weight: bold; font-size: 15px; }
    .summary-row span:first-child { text-align: right; flex: 1; padding-right: 20px; }
    .summary-row span:last-child { text-align: right; min-width: 100px; font-weight: bold; }
    .footer-note { clear: both; margin-top: 50px; text-align: center; font-size: 15px; color: #dc2626; font-weight: bold; padding-top: 20px; }
    .payment-info { margin-top: 30px; padding: 15px; border: 2px solid #10b981; background: #f0fdf4; }
    .payment-info h3 { font-size: 14px; margin-bottom: 10px; color: #059669; }
    .payment-info p { font-size: 12px; margin-bottom: 5px; }
    .notes-section { margin-top: 20px; padding: 15px; border: 2px solid #6b7280; background: #f9fafb; }
    .notes-section h3 { font-size: 14px; margin-bottom: 10px; color: #374151; }
    .notes-section p { font-size: 12px; line-height: 1.6; }
    .computer-generated { clear: both; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #6b7280; font-style: italic; }
    @media print { 
      body { padding: 0; } 
      .watermark { position: fixed; }
    }
  </style>
</head>
<body>
  <img src="/logo2.png" alt="Watermark" class="watermark" />
  <div class="invoice">
    <div class="header">
      <div class="company-info">
        <img src="/logo2.png" alt="Company Logo" class="company-logo" />
        <div class="company-text">
          <div class="company-name">${data.sellerName.split(' ')[0] || 'Company'} <span>${data.sellerName.split(' ').slice(1).join(' ') || 'Name'}</span></div>
          <div class="company-details">
            ${data.sellerAddress ? data.sellerAddress.replace(/\n/g, '<br>') : ''}<br>
            ${data.sellerPhone ? `Phone: ${data.sellerPhone}<br>` : ''}
            ${data.sellerEmail ? `Email: <a href="mailto:${data.sellerEmail}">${data.sellerEmail}</a>` : ''}
            ${data.sellerGSTIN ? `<br>GSTIN: ${data.sellerGSTIN}` : ''}
          </div>
        </div>
      </div>
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-meta">
          <div><strong>INVOICE #</strong>${data.invoiceNumber}</div>
          <div><strong>DATE:</strong> ${data.invoiceDate}</div>
          ${data.dueDate ? `<div><strong>DUE DATE:</strong> ${data.dueDate}</div>` : ''}
        </div>
      </div>
    </div>
    <div class="addresses">
      <div class="address-box">
        <div class="address-title">Bill To:</div>
        <div class="address-content">
          <strong>${data.buyerName || 'N/A'}</strong>
          ${data.buyerAddress ? data.buyerAddress.replace(/\n/g, '<br>') + '<br>' : ''}
          ${data.buyerPhone ? `Phone: ${data.buyerPhone}<br>` : ''}
          ${data.buyerEmail ? `Email: ${data.buyerEmail}` : ''}
        </div>
      </div>
      <div class="address-box">
        <div class="address-title">Ship To:</div>
        <div class="address-content">
          <strong>${data.buyerName || 'N/A'}</strong>
          ${data.buyerAddress ? data.buyerAddress.replace(/\n/g, '<br>') + '<br>' : ''}
          ${data.buyerPhone ? `Phone: ${data.buyerPhone}<br>` : ''}
          ${data.buyerEmail ? `Email: ${data.buyerEmail}` : ''}
        </div>
      </div>
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%;">DESCRIPTION</th>
          <th class="text-center" style="width: 15%;">SIZE</th>
          <th class="text-center" style="width: 10%;">QTY</th>
          <th class="text-right" style="width: 25%;">PRICE PER PIECE</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((item: any) => `
          <tr>
            <td>${item.description || 'N/A'}</td>
            <td class="text-center">${item.size || '-'}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${item.rate.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="grand-total-row">
      <div>Grand Total</div>
      <div></div>
      <div class="text-center">${data.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</div>
      <div class="text-right">${totals.subtotal.toFixed(2)}</div>
    </div>
    <div class="summary-box">
      <div class="summary-row"><span>SUBTOTAL</span><span>${totals.subtotal.toFixed(2)}</span></div>
      ${data.discount > 0 ? `<div class="summary-row"><span>DISCOUNT (${data.discount}%)</span><span>-${totals.discountAmt.toFixed(2)}</span></div>` : ''}
      ${data.cgstRate > 0 || data.sgstRate > 0 ? `<div class="summary-row"><span>SALES TAX (${data.cgstRate + data.sgstRate}%)</span><span>${(totals.cgstAmt + totals.sgstAmt).toFixed(2)}</span></div>` : `<div class="summary-row"><span>SALES TAX</span><span>00.00</span></div>`}
      ${data.shippingCharges > 0 ? `<div class="summary-row"><span>SHIPPING & HANDLING</span><span>${data.shippingCharges.toFixed(2)}</span></div>` : `<div class="summary-row"><span>SHIPPING & HANDLING</span><span>00.00</span></div>`}
      <div class="summary-row"><span>TOTAL AMOUNT</span><span>${totals.grandTotal.toFixed(2)}</span></div>
    </div>
    ${data.bankName || data.bankUPI ? `
      <div class="payment-info">
        <h3>PAYMENT DETAILS</h3>
        <p><strong>Payment Mode:</strong> ${data.paymentMode}</p>
        ${data.bankName ? `<p><strong>Bank:</strong> ${data.bankName}</p>` : ''}
        ${data.bankAccountHolder ? `<p><strong>Account Holder:</strong> ${data.bankAccountHolder}</p>` : ''}
        ${data.bankAccountNumber ? `<p><strong>Account Number:</strong> ${data.bankAccountNumber}</p>` : ''}
        ${data.bankIFSC ? `<p><strong>IFSC Code:</strong> ${data.bankIFSC}</p>` : ''}
        ${data.bankUPI ? `<p><strong>UPI ID:</strong> ${data.bankUPI}</p>` : ''}
      </div>
    ` : ''}
    ${data.notes ? `
      <div class="notes-section">
        <h3>NOTES / TERMS</h3>
        <p>${data.notes.replace(/\n/g, '<br>')}</p>
      </div>
    ` : ''}
    <div class="footer-note">
      Thanks for choosing <span>${data.sellerName.split(' ')[0] || 'Company'} ${data.sellerName.split(' ').slice(1).join(' ') || 'Name'}</span>
    </div>
    <div class="computer-generated">
      This is a computer generated invoice and does not require a physical signature.
    </div>
  </div>
</body>
</html>`;
}
