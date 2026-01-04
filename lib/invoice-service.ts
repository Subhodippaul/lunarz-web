import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

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

const COLLECTION_NAME = "invoices";

export class InvoiceService {
  // Create a new invoice
  static async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      const now = new Date().toISOString();
      const invoice = {
        ...invoiceData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), invoice);
      
      return {
        id: docRef.id,
        ...invoice
      };
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw new Error("Failed to create invoice");
    }
  }

  // Get all invoices
  static async getAllInvoices(): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const invoices: Invoice[] = [];

      querySnapshot.forEach((doc) => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        } as Invoice);
      });

      return invoices;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw new Error("Failed to fetch invoices");
    }
  }

  // Get invoice by ID
  static async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Invoice;
      }

      return null;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw new Error("Failed to fetch invoice");
    }
  }

  // Update invoice
  static async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw new Error("Failed to update invoice");
    }
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw new Error("Failed to delete invoice");
    }
  }

  // Get invoices by status
  static async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const invoices: Invoice[] = [];

      querySnapshot.forEach((doc) => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        } as Invoice);
      });

      return invoices;
    } catch (error) {
      console.error("Error fetching invoices by status:", error);
      throw new Error("Failed to fetch invoices by status");
    }
  }

  // Get invoices by customer
  static async getInvoicesByCustomer(customerName: string): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("customerName", "==", customerName),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const invoices: Invoice[] = [];

      querySnapshot.forEach((doc) => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        } as Invoice);
      });

      return invoices;
    } catch (error) {
      console.error("Error fetching invoices by customer:", error);
      throw new Error("Failed to fetch invoices by customer");
    }
  }

  // Search invoices
  static async searchInvoices(searchTerm: string): Promise<Invoice[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation that searches by invoice number
      const q = query(
        collection(db, COLLECTION_NAME),
        where("invoiceNumber", ">=", searchTerm),
        where("invoiceNumber", "<=", searchTerm + '\uf8ff'),
        orderBy("invoiceNumber"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const invoices: Invoice[] = [];

      querySnapshot.forEach((doc) => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        } as Invoice);
      });

      return invoices;
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

    const scales = ['', 'Thousand', 'Lakh', 'Crore'];

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
    let scaleIndex = 0;
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
}