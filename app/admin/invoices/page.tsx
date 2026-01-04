"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Download, Share2, FileText, Eye } from "lucide-react";
import { InvoiceService, Invoice, InvoiceItem } from "@/lib/invoice-service";
import InvoicePreview from "@/components/admin/invoice-preview";

interface InvoiceFormData {
  // Company Details (pre-filled)
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
  
  // Items
  items: InvoiceItem[];
  
  // Amount Details
  subtotal: number;
  discount: number;
  shippingCharges: number;
  cgstRate: number;
  sgstRate: number;
  
  // Payment Details
  advancePayment: number;
  duePayment: number;
  
  // Terms & Notes
  returnPolicy: string;
  deliveryTimeline: string;
  customOrderPolicy: string;
  thankYouNote: string;
  
  // Bank Details
  bankAccountHolder: string;
  bankName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  bankUPI: string;
  
  // Declaration
  declaration: string;
}

export default function InvoicesPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState<InvoiceFormData>({
    // Company Details (default values)
    companyName: "Lunarz",
    companyAddress: "Your Company Address\nCity, State - PIN\nIndia",
    companyPhone: "+91 XXXXX XXXXX",
    companyEmail: "lunarz.info@gmail.com",
    companyGSTIN: "",
    companyPAN: "",
    
    // Invoice Information
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    placeOfSupply: "",
    paymentMode: "UPI",
    
    // Customer Details
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    customerEmail: "",
    customerGSTIN: "",
    
    // Items
    items: [{
      id: "1",
      description: "",
      hsnSac: "",
      quantity: 1,
      rate: 0,
      taxRate: 18,
      amount: 0
    }],
    
    // Amount Details
    subtotal: 0,
    discount: 0,
    shippingCharges: 0,
    cgstRate: 9,
    sgstRate: 9,
    
    // Payment Details
    advancePayment: 0,
    duePayment: 0,
    
    // Terms & Notes
    returnPolicy: "7 days return policy applicable",
    deliveryTimeline: "3-5 business days",
    customOrderPolicy: "Custom orders are non-returnable",
    thankYouNote: "Thank you for shopping with Lunarz!",
    
    // Bank Details
    bankAccountHolder: "Lunarz",
    bankName: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankUPI: "",
    
    // Declaration
    declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."
  });

  useEffect(() => {
    generateInvoiceNumber();
    loadInvoices();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.discount, formData.shippingCharges, formData.cgstRate, formData.sgstRate]);

  useEffect(() => {
    // Auto-calculate due payment when advance payment or totals change
    const grandTotal = calculateGrandTotal();
    const dueAmount = Math.max(0, grandTotal - formData.advancePayment);
    if (dueAmount !== formData.duePayment) {
      setFormData(prev => ({ ...prev, duePayment: dueAmount }));
    }
  }, [formData.advancePayment, formData.items, formData.discount, formData.shippingCharges, formData.cgstRate, formData.sgstRate]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `LNZ${year}${month}${random}`;
    
    setFormData(prev => ({ ...prev, invoiceNumber }));
  };

  const loadInvoices = async () => {
    try {
      const fetchedInvoices = await InvoiceService.getAllInvoices();
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const itemAmount = item.quantity * item.rate;
      return sum + itemAmount;
    }, 0);

    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableValue = subtotal - discountAmount;
    const cgstAmount = (taxableValue * formData.cgstRate) / 100;
    const sgstAmount = (taxableValue * formData.sgstRate) / 100;
    const grandTotal = taxableValue + cgstAmount + sgstAmount + formData.shippingCharges;

    setFormData(prev => ({ ...prev, subtotal }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      hsnSac: "",
      quantity: 1,
      rate: 0,
      taxRate: 18,
      amount: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerAddress || formData.items.length === 0) {
      addToast({
        title: "Validation Error",
        description: "Please fill in customer details and add at least one item",
        type: "error"
      });
      return;
    }

    try {
      setLoading(true);
      
      const invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        status: 'draft',
        totalAmount: calculateGrandTotal()
      };

      const savedInvoice = await InvoiceService.createInvoice(invoice);
      
      addToast({
        title: "Invoice Created",
        description: `Invoice ${formData.invoiceNumber} created successfully`,
        type: "success"
      });

      // Reset form
      generateInvoiceNumber();
      setFormData(prev => ({
        ...prev,
        customerName: "",
        customerAddress: "",
        customerPhone: "",
        customerEmail: "",
        customerGSTIN: "",
        advancePayment: 0,
        duePayment: 0,
        items: [{
          id: "1",
          description: "",
          hsnSac: "",
          quantity: 1,
          rate: 0,
          taxRate: 18,
          amount: 0
        }]
      }));

      loadInvoices();
      
    } catch (error) {
      console.error("Error creating invoice:", error);
      addToast({
        title: "Error",
        description: "Failed to create invoice",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGrandTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableValue = subtotal - discountAmount;
    const cgstAmount = (taxableValue * formData.cgstRate) / 100;
    const sgstAmount = (taxableValue * formData.sgstRate) / 100;
    return taxableValue + cgstAmount + sgstAmount + formData.shippingCharges;
  };

  const handlePreview = () => {
    const invoice: Invoice = {
      id: 'preview',
      ...formData,
      status: 'draft',
      totalAmount: calculateGrandTotal(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentInvoice(invoice);
    setShowPreview(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      {/* Subtle watermark for the form page */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <img 
          src="/logo2.png" 
          alt="Lunarz Logo"
          className="opacity-3 transform -rotate-45"
          style={{ 
            width: '800px', 
            height: '800px'
          }}
        />
      </div>
      
      {/* Main content with higher z-index */}
      <div className="relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Management</h1>
        <p className="text-gray-600">Create and manage invoices for your business</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Phone Number</Label>
                  <Input
                    id="companyPhone"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyPhone: e.target.value }))}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyEmail: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyGSTIN">GSTIN</Label>
                  <Input
                    id="companyGSTIN"
                    value={formData.companyGSTIN}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyGSTIN: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="placeOfSupply">Place of Supply</Label>
                  <Input
                    id="placeOfSupply"
                    value={formData.placeOfSupply}
                    onChange={(e) => setFormData(prev => ({ ...prev, placeOfSupply: e.target.value }))}
                    placeholder="e.g., Maharashtra"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select
                    value={formData.paymentMode}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Mobile Number</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="customerAddress">Customer Address</Label>
                  <Textarea
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customerGSTIN">Customer GSTIN (B2B)</Label>
                  <Input
                    id="customerGSTIN"
                    value={formData.customerGSTIN}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerGSTIN: e.target.value }))}
                    placeholder="Optional for B2B"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Items</CardTitle>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                      <div className="col-span-1">
                        <Label>No.</Label>
                        <div className="h-10 flex items-center justify-center bg-gray-50 rounded border">
                          {index + 1}
                        </div>
                      </div>
                      <div className="col-span-4">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Product/Service description"
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>HSN/SAC</Label>
                        <Input
                          value={item.hsnSac}
                          onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)}
                          placeholder="HSN"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>Rate</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>Tax %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Amount</Label>
                        <div className="h-10 flex items-center px-3 bg-gray-50 rounded border">
                          ₹{item.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amount Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Amount Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingCharges">Shipping Charges</Label>
                  <Input
                    id="shippingCharges"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCharges}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingCharges: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                  <Input
                    id="cgstRate"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={formData.cgstRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, cgstRate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                  <Input
                    id="sgstRate"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={formData.sgstRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, sgstRate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="advancePayment">Advance Payment (₹)</Label>
                  <Input
                    id="advancePayment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.advancePayment}
                    onChange={(e) => setFormData(prev => ({ ...prev, advancePayment: parseFloat(e.target.value) || 0 }))}
                    placeholder="Amount paid in advance"
                  />
                </div>
                <div>
                  <Label htmlFor="duePayment">Due Payment (₹)</Label>
                  <Input
                    id="duePayment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.duePayment}
                    onChange={(e) => setFormData(prev => ({ ...prev, duePayment: parseFloat(e.target.value) || 0 }))}
                    placeholder="Remaining amount due"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated: ₹{Math.max(0, calculateGrandTotal() - formData.advancePayment).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button type="submit" disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </div>

        {/* Recent Invoices */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.slice(0, 10).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{invoice.customerName}</p>
                      <p className="text-sm text-gray-500">₹{invoice.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div> {/* End of z-10 content div */}

      {/* Invoice Preview Modal */}
      {showPreview && currentInvoice && (
        <InvoicePreview
          invoice={currentInvoice}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}