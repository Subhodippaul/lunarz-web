import { supabase } from './supabase';

export interface InvoiceItem {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  taxRate: number;
  amount: number;
}

export interface Invoice {
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
  
  // Items
  items: InvoiceItem[];
  
  // Amount Details
  subtotal: number;
  discount: number;
  shippingCharges: number;
  cgstRate: number;
  sgstRate: number;
  totalAmount: number;
  
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
  
  // Status and Metadata
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export class InvoiceService {
  // Create a new invoice
  static async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoiceNumber,
          invoice_date: invoiceData.invoiceDate,
          due_date: invoiceData.dueDate,
          company_name: invoiceData.companyName,
          company_address: invoiceData.companyAddress,
          company_phone: invoiceData.companyPhone,
          company_email: invoiceData.companyEmail,
          company_gstin: invoiceData.companyGSTIN,
          company_pan: invoiceData.companyPAN,
          customer_name: invoiceData.customerName,
          customer_address: invoiceData.customerAddress,
          customer_phone: invoiceData.customerPhone,
          customer_email: invoiceData.customerEmail,
          customer_gstin: invoiceData.customerGSTIN,
          place_of_supply: invoiceData.placeOfSupply,
          payment_mode: invoiceData.paymentMode,
          items: invoiceData.items,
          subtotal: invoiceData.subtotal,
          discount: invoiceData.discount,
          shipping_charges: invoiceData.shippingCharges,
          cgst_rate: invoiceData.cgstRate,
          sgst_rate: invoiceData.sgstRate,
          total_amount: invoiceData.totalAmount,
          advance_payment: invoiceData.advancePayment,
          due_payment: invoiceData.duePayment,
          return_policy: invoiceData.returnPolicy,
          delivery_timeline: invoiceData.deliveryTimeline,
          custom_order_policy: invoiceData.customOrderPolicy,
          thank_you_note: invoiceData.thankYouNote,
          bank_account_holder: invoiceData.bankAccountHolder,
          bank_name: invoiceData.bankName,
          bank_account_number: invoiceData.bankAccountNumber,
          bank_ifsc: invoiceData.bankIFSC,
          bank_upi: invoiceData.bankUPI,
          declaration: invoiceData.declaration,
          status: invoiceData.status,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToInvoice(data);
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw new Error("Failed to create invoice");
    }
  }

  // Get all invoices
  static async getAllInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => this.mapToInvoice(row));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw new Error("Failed to fetch invoices");
    }
  }

  // Get invoice by ID
  static async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return this.mapToInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw new Error("Failed to fetch invoice");
    }
  }

  // Update invoice
  static async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.invoiceNumber !== undefined) updateData.invoice_number = updates.invoiceNumber;
      if (updates.invoiceDate !== undefined) updateData.invoice_date = updates.invoiceDate;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.companyName !== undefined) updateData.company_name = updates.companyName;
      if (updates.companyAddress !== undefined) updateData.company_address = updates.companyAddress;
      if (updates.companyPhone !== undefined) updateData.company_phone = updates.companyPhone;
      if (updates.companyEmail !== undefined) updateData.company_email = updates.companyEmail;
      if (updates.companyGSTIN !== undefined) updateData.company_gstin = updates.companyGSTIN;
      if (updates.companyPAN !== undefined) updateData.company_pan = updates.companyPAN;
      if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
      if (updates.customerAddress !== undefined) updateData.customer_address = updates.customerAddress;
      if (updates.customerPhone !== undefined) updateData.customer_phone = updates.customerPhone;
      if (updates.customerEmail !== undefined) updateData.customer_email = updates.customerEmail;
      if (updates.customerGSTIN !== undefined) updateData.customer_gstin = updates.customerGSTIN;
      if (updates.placeOfSupply !== undefined) updateData.place_of_supply = updates.placeOfSupply;
      if (updates.paymentMode !== undefined) updateData.payment_mode = updates.paymentMode;
      if (updates.items !== undefined) updateData.items = updates.items;
      if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
      if (updates.discount !== undefined) updateData.discount = updates.discount;
      if (updates.shippingCharges !== undefined) updateData.shipping_charges = updates.shippingCharges;
      if (updates.cgstRate !== undefined) updateData.cgst_rate = updates.cgstRate;
      if (updates.sgstRate !== undefined) updateData.sgst_rate = updates.sgstRate;
      if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount;
      if (updates.advancePayment !== undefined) updateData.advance_payment = updates.advancePayment;
      if (updates.duePayment !== undefined) updateData.due_payment = updates.duePayment;
      if (updates.returnPolicy !== undefined) updateData.return_policy = updates.returnPolicy;
      if (updates.deliveryTimeline !== undefined) updateData.delivery_timeline = updates.deliveryTimeline;
      if (updates.customOrderPolicy !== undefined) updateData.custom_order_policy = updates.customOrderPolicy;
      if (updates.thankYouNote !== undefined) updateData.thank_you_note = updates.thankYouNote;
      if (updates.bankAccountHolder !== undefined) updateData.bank_account_holder = updates.bankAccountHolder;
      if (updates.bankName !== undefined) updateData.bank_name = updates.bankName;
      if (updates.bankAccountNumber !== undefined) updateData.bank_account_number = updates.bankAccountNumber;
      if (updates.bankIFSC !== undefined) updateData.bank_ifsc = updates.bankIFSC;
      if (updates.bankUPI !== undefined) updateData.bank_upi = updates.bankUPI;
      if (updates.declaration !== undefined) updateData.declaration = updates.declaration;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw new Error("Failed to update invoice");
    }
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw new Error("Failed to delete invoice");
    }
  }

  // Get invoices by status
  static async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => this.mapToInvoice(row));
    } catch (error) {
      console.error("Error fetching invoices by status:", error);
      throw new Error("Failed to fetch invoices by status");
    }
  }

  // Get invoices by customer
  static async getInvoicesByCustomer(customerName: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_name', customerName)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => this.mapToInvoice(row));
    } catch (error) {
      console.error("Error fetching invoices by customer:", error);
      throw new Error("Failed to fetch invoices by customer");
    }
  }

  // Search invoices
  static async searchInvoices(searchTerm: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .ilike('invoice_number', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => this.mapToInvoice(row));
    } catch (error) {
      console.error("Error searching invoices:", error);
      throw new Error("Failed to search invoices");
    }
  }

  // Generate invoice number
  static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `LNZ${year}${month}${day}${random}`;
  }

  // Calculate invoice totals
  static calculateInvoiceTotals(invoice: Invoice) {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * invoice.discount) / 100;
    const taxableValue = subtotal - discountAmount;
    const cgstAmount = (taxableValue * invoice.cgstRate) / 100;
    const sgstAmount = (taxableValue * invoice.sgstRate) / 100;
    const grandTotal = taxableValue + cgstAmount + sgstAmount + invoice.shippingCharges;

    return {
      subtotal,
      discountAmount,
      taxableValue,
      cgstAmount,
      sgstAmount,
      grandTotal
    };
  }

  // Convert number to words (for amount in words)
  static numberToWords(amount: number): string {
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];

    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    if (amount === 0) return 'Zero Rupees Only';

    const convertHundreds = (num: number): string => {
      let result = '';
      
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      }
      
      if (num > 0) {
        result += ones[num] + ' ';
      }
      
      return result;
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = '';
    let remaining = rupees;

    // Handle crores
    if (remaining >= 10000000) {
      const crores = Math.floor(remaining / 10000000);
      result = convertHundreds(crores) + 'Crore ' + result;
      remaining %= 10000000;
    }

    // Handle lakhs
    if (remaining >= 100000) {
      const lakhs = Math.floor(remaining / 100000);
      result += convertHundreds(lakhs) + 'Lakh ';
      remaining %= 100000;
    }

    // Handle thousands
    if (remaining >= 1000) {
      const thousands = Math.floor(remaining / 1000);
      result += convertHundreds(thousands) + 'Thousand ';
      remaining %= 1000;
    }

    // Handle hundreds, tens, and ones
    if (remaining > 0) {
      result += convertHundreds(remaining);
    }

    result = result.trim() + ' Rupees';

    if (paise > 0) {
      result += ' and ' + convertHundreds(paise).trim() + ' Paise';
    }

    return result + ' Only';
  }

  // Helper method to map database row to Invoice
  private static mapToInvoice(row: any): Invoice {
    return {
      id: row.id,
      companyName: row.company_name,
      companyAddress: row.company_address,
      companyPhone: row.company_phone,
      companyEmail: row.company_email,
      companyGSTIN: row.company_gstin,
      companyPAN: row.company_pan,
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      dueDate: row.due_date,
      placeOfSupply: row.place_of_supply,
      paymentMode: row.payment_mode,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email,
      customerGSTIN: row.customer_gstin,
      items: row.items,
      subtotal: row.subtotal,
      discount: row.discount,
      shippingCharges: row.shipping_charges,
      cgstRate: row.cgst_rate,
      sgstRate: row.sgst_rate,
      totalAmount: row.total_amount,
      advancePayment: row.advance_payment,
      duePayment: row.due_payment,
      returnPolicy: row.return_policy,
      deliveryTimeline: row.delivery_timeline,
      customOrderPolicy: row.custom_order_policy,
      thankYouNote: row.thank_you_note,
      bankAccountHolder: row.bank_account_holder,
      bankName: row.bank_name,
      bankAccountNumber: row.bank_account_number,
      bankIFSC: row.bank_ifsc,
      bankUPI: row.bank_upi,
      declaration: row.declaration,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
