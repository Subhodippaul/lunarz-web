"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Download, Eye, FileText, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineItem {
  id: string;
  description: string;
  size: string;
  quantity: number;
  rate: number;
  taxRate: number;
}

interface InvoiceData {
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerGSTIN: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerGSTIN: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  discount: number;
  shippingCharges: number;
  cgstRate: number;
  sgstRate: number;
  paymentMode: string;
  bankName: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankIFSC: string;
  bankUPI: string;
  notes: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function numberToWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num] + " ";
    if (num < 100) return tens[Math.floor(num / 10)] + " " + ones[num % 10] + " ";
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred " + convert(num % 100);
    if (num < 100000) return convert(Math.floor(num / 1000)) + "Thousand " + convert(num % 1000);
    if (num < 10000000) return convert(Math.floor(num / 100000)) + "Lakh " + convert(num % 100000);
    return convert(Math.floor(num / 10000000)) + "Crore " + convert(num % 10000000);
  }

  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);
  let result = convert(rupees).trim();
  if (paise > 0) result += ` and ${convert(paise).trim()} Paise`;
  return result + " Only";
}

function calcTotals(data: InvoiceData) {
  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const discountAmt = subtotal * (data.discount / 100);
  const taxableValue = subtotal - discountAmt;
  const cgstAmt = taxableValue * (data.cgstRate / 100);
  const sgstAmt = taxableValue * (data.sgstRate / 100);
  const grandTotal = taxableValue + cgstAmt + sgstAmt + data.shippingCharges;
  return { subtotal, discountAmt, taxableValue, cgstAmt, sgstAmt, grandTotal };
}

const defaultSellerData = () => ({
  sellerName: "Lunarz India",
  sellerAddress: "41, Satya Narayan Pally, Dakshin Behala\nRoad Sarsuna, Kolkata, West Bengal,\n700061",
  sellerPhone: "+91 XXXXX XXXXX",
  sellerEmail: "lunarz.info@gmail.com",
  sellerGSTIN: "",
});

const defaultItem = (): LineItem => ({
  id: uid(),
  description: "",
  size: "",
  quantity: 1,
  rate: 0,
  taxRate: 0,
});

const defaultData = (): InvoiceData => {
  return {
    sellerName: "",
    sellerAddress: "",
    sellerPhone: "",
    sellerEmail: "",
    sellerGSTIN: "",
    buyerName: "",
    buyerAddress: "",
    buyerPhone: "",
    buyerEmail: "",
    buyerGSTIN: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    items: [defaultItem()],
    discount: 0,
    shippingCharges: 0,
    cgstRate: 0,
    sgstRate: 0,
    paymentMode: "Bank Transfer",
    bankName: "",
    bankAccountHolder: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankUPI: "",
    notes: "",
  };
};

function Field({
  label, value, onChange, type = "text", placeholder = "", required = false, rows, disabled = false
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; rows?: number; disabled?: boolean;
}) {
  const cls = `w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {rows ? (
        <textarea
          className={cls}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          className={cls}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export default function InvoiceMaker() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<InvoiceData>(defaultData());
  const [preview, setPreview] = useState(false);
  const [sellerEditable, setSellerEditable] = useState(false);

  // Handle client-side mounting and initialization
  useEffect(() => {
    setMounted(true);
    
    // Load saved seller details from localStorage
    const savedSeller = localStorage.getItem('invoiceSellerDetails');
    const sellerData = savedSeller ? JSON.parse(savedSeller) : defaultSellerData();
    
    setData(prev => ({
      ...prev,
      ...sellerData,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString().split("T")[0],
    }));
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Invoice Maker...</p>
        </div>
      </div>
    );
  }

  const set = (key: keyof InvoiceData, value: unknown) =>
    setData(prev => ({ ...prev, [key]: value }));

  const updateSellerField = (key: keyof InvoiceData, value: string) => {
    setData(prev => {
      const newData = { ...prev, [key]: value };
      const sellerDetails = {
        sellerName: newData.sellerName,
        sellerAddress: newData.sellerAddress,
        sellerPhone: newData.sellerPhone,
        sellerEmail: newData.sellerEmail,
        sellerGSTIN: newData.sellerGSTIN,
      };
      localStorage.setItem('invoiceSellerDetails', JSON.stringify(sellerDetails));
      return newData;
    });
  };

  const toggleSellerEdit = () => {
    setSellerEditable(!sellerEditable);
  };

  const updateItem = (id: string, key: keyof LineItem, value: string | number) =>
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [key]: value } : i),
    }));

  const addItem = () => setData(prev => ({ ...prev, items: [...prev.items, defaultItem()] }));

  const removeItem = (id: string) =>
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const totals = calcTotals(data);

  const downloadPDF = () => {
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to download the invoice."); return; }
    win.document.write(buildHTML(data, totals));
    win.document.close();
    win.onload = () => { win.print(); };
  };

  if (preview) {
    return (
      <PreviewPage
        data={data}
        totals={totals}
        onBack={() => setPreview(false)}
        onDownload={downloadPDF}
      />
    );
  }

  return (
    <div className="min-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoice Maker</h1>
              <p className="text-xs sm:text-sm text-gray-500">Fill in the details and download as PDF</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setPreview(true)} className="flex-1 sm:flex-none text-sm">
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button onClick={downloadPDF} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-sm">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm sm:text-base">Invoice Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Field label="Invoice Number" value={data.invoiceNumber} onChange={v => set("invoiceNumber", v)} required />
              <Field label="Invoice Date" value={data.invoiceDate} onChange={v => set("invoiceDate", v)} type="date" required />
              <Field label="Due Date" value={data.dueDate} onChange={v => set("dueDate", v)} type="date" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="text-sm sm:text-base">From (Seller)</CardTitle>
                  <Button size="sm" variant={sellerEditable ? "default" : "outline"} onClick={toggleSellerEdit}
                    className={`text-xs sm:text-sm ${sellerEditable ? "bg-green-600 hover:bg-green-700" : ""}`}>
                    {sellerEditable ? (<><Lock className="w-3 h-3 mr-1" />Lock</>) : (<><Unlock className="w-3 h-3 mr-1" />Edit</>)}
                  </Button>
                </div>
                {!sellerEditable && <p className="text-xs text-gray-500 mt-1">Seller details are locked. Click "Edit" to modify.</p>}
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Business / Name" value={data.sellerName} onChange={v => updateSellerField("sellerName", v)} required placeholder="Your business name" disabled={!sellerEditable} />
                <Field label="Address" value={data.sellerAddress} onChange={v => updateSellerField("sellerAddress", v)} rows={3} placeholder="Full address" disabled={!sellerEditable} />
                <Field label="Phone" value={data.sellerPhone} onChange={v => updateSellerField("sellerPhone", v)} placeholder="+91 XXXXX XXXXX" disabled={!sellerEditable} />
                <Field label="Email" value={data.sellerEmail} onChange={v => updateSellerField("sellerEmail", v)} type="email" placeholder="you@example.com" disabled={!sellerEditable} />
                <Field label="GSTIN (optional)" value={data.sellerGSTIN} onChange={v => updateSellerField("sellerGSTIN", v)} placeholder="22AAAAA0000A1Z5" disabled={!sellerEditable} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">To (Buyer)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Field label="Customer / Name" value={data.buyerName} onChange={v => set("buyerName", v)} required placeholder="Customer name" />
                <Field label="Address" value={data.buyerAddress} onChange={v => set("buyerAddress", v)} rows={3} placeholder="Full address" />
                <Field label="Phone" value={data.buyerPhone} onChange={v => set("buyerPhone", v)} placeholder="+91 XXXXX XXXXX" />
                <Field label="Email" value={data.buyerEmail} onChange={v => set("buyerEmail", v)} type="email" placeholder="customer@example.com" />
                <Field label="GSTIN (optional)" value={data.buyerGSTIN} onChange={v => set("buyerGSTIN", v)} placeholder="22AAAAA0000A1Z5" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="text-sm sm:text-base">Items / Services</CardTitle>
                <Button size="sm" variant="outline" onClick={addItem} className="text-xs sm:text-sm w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                      <th className="text-left pb-2 pr-2 w-[35%]">Description</th>
                      <th className="text-center pb-2 px-2 w-20">Size</th>
                      <th className="text-center pb-2 px-2 w-16">Qty</th>
                      <th className="text-right pb-2 px-2 w-24">Rate (₹)</th>
                      <th className="text-center pb-2 px-2 w-20">Tax %</th>
                      <th className="text-right pb-2 px-2 w-24">Amount</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-2 pr-2">
                          <input className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} placeholder="Item description" />
                        </td>
                        <td className="py-2 px-2">
                          <input className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 outline-none"
                            value={item.size} onChange={e => updateItem(item.id, "size", e.target.value)} placeholder="M/L/XL" />
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" min="1" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 outline-none"
                            value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" min="0" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-500 outline-none"
                            value={item.rate} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" min="0" max="100" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 outline-none"
                            value={item.taxRate} onChange={e => updateItem(item.id, "taxRate", parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="py-2 px-2 text-right font-medium">₹{(item.quantity * item.rate).toFixed(2)}</td>
                        <td className="py-2 pl-2">
                          {data.items.length > 1 && (
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-full sm:w-80 lg:w-72 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                    <Field label="Discount %" value={data.discount} onChange={v => set("discount", parseFloat(v) || 0)} type="number" />
                    <Field label="Shipping (₹)" value={data.shippingCharges} onChange={v => set("shippingCharges", parseFloat(v) || 0)} type="number" />
                    <Field label="CGST %" value={data.cgstRate} onChange={v => set("cgstRate", parseFloat(v) || 0)} type="number" />
                    <Field label="SGST %" value={data.sgstRate} onChange={v => set("sgstRate", parseFloat(v) || 0)} type="number" />
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-gray-600 text-xs sm:text-sm"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                    {data.discount > 0 && <div className="flex justify-between text-gray-600 text-xs sm:text-sm"><span>Discount ({data.discount}%)</span><span>-₹{totals.discountAmt.toFixed(2)}</span></div>}
                    {data.cgstRate > 0 && <div className="flex justify-between text-gray-600 text-xs sm:text-sm"><span>CGST ({data.cgstRate}%)</span><span>₹{totals.cgstAmt.toFixed(2)}</span></div>}
                    {data.sgstRate > 0 && <div className="flex justify-between text-gray-600 text-xs sm:text-sm"><span>SGST ({data.sgstRate}%)</span><span>₹{totals.sgstAmt.toFixed(2)}</span></div>}
                    {data.shippingCharges > 0 && <div className="flex justify-between text-gray-600 text-xs sm:text-sm"><span>Shipping</span><span>₹{data.shippingCharges.toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold text-sm sm:text-base border-t pt-2"><span>Grand Total</span><span>₹{totals.grandTotal.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm sm:text-base">Payment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.paymentMode} onChange={e => set("paymentMode", e.target.value)}>
                    {["Bank Transfer", "UPI", "Cash", "Cheque", "Credit Card", "Debit Card", "Online"].map(m => (<option key={m}>{m}</option>))}
                  </select>
                </div>
                <Field label="UPI ID (optional)" value={data.bankUPI} onChange={v => set("bankUPI", v)} placeholder="yourname@upi" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Field label="Bank Name" value={data.bankName} onChange={v => set("bankName", v)} placeholder="State Bank of India" />
                <Field label="Account Holder" value={data.bankAccountHolder} onChange={v => set("bankAccountHolder", v)} placeholder="Account holder name" />
                <Field label="Account Number" value={data.bankAccountNumber} onChange={v => set("bankAccountNumber", v)} placeholder="XXXXXXXXXX" />
                <Field label="IFSC Code" value={data.bankIFSC} onChange={v => set("bankIFSC", v)} placeholder="SBIN0001234" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm sm:text-base">Notes / Terms</CardTitle></CardHeader>
            <CardContent>
              <Field label="Additional notes or terms" value={data.notes} onChange={v => set("notes", v)} rows={3} placeholder="e.g. Payment due within 30 days. Thank you for your business!" />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pb-8">
            <Button variant="outline" onClick={() => setPreview(true)} className="w-full sm:w-auto">
              <Eye className="w-4 h-4 mr-2" /> Preview Invoice
            </Button>
            <Button onClick={downloadPDF} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildHTML(data: InvoiceData, totals: ReturnType<typeof calcTotals>): string {
  const { buildInvoiceHTML } = require('@/lib/invoice-html-template');
  return buildInvoiceHTML(data, totals);
}

function PreviewPage({
  data,
  totals,
  onBack,
  onDownload
}: {
  data: InvoiceData;
  totals: ReturnType<typeof calcTotals>;
  onBack: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Fixed Header with Buttons */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              ← Back to Edit
            </Button>
            <Button 
              onClick={onDownload} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
            >
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 md:p-10">
          <div dangerouslySetInnerHTML={{ __html: buildHTML(data, totals) }} />
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              ← Back to Edit
            </Button>
            <Button 
              onClick={onDownload} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
            >
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
