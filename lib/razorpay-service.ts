// Razorpay Payment Service
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (multiply by 100)
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export class RazorpayService {
  private static readonly RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  private static readonly RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  // Load Razorpay script
  static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create Razorpay order on server
  static async createOrder(amount: number, currency: string = 'INR', receipt?: string): Promise<RazorpayOrder> {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency,
          receipt: receipt || `receipt_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Verify payment signature
  static async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      return result.verified;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  // Initialize Razorpay payment
  static async initiatePayment(options: Partial<RazorpayOptions>): Promise<void> {
    // Load Razorpay script if not already loaded
    const isLoaded = await this.loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    if (!this.RAZORPAY_KEY_ID) {
      throw new Error('Razorpay key ID not configured');
    }

    const razorpayOptions: RazorpayOptions = {
      key: this.RAZORPAY_KEY_ID,
      amount: options.amount || 0,
      currency: options.currency || 'INR',
      name: options.name || 'Lunarz',
      description: options.description || 'Payment for your order',
      order_id: options.order_id || '',
      handler: options.handler || (() => {}),
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      notes: {
        address: options.notes?.address || '',
      },
      theme: {
        color: options.theme?.color || '#2563eb',
      },
      modal: {
        ondismiss: options.modal?.ondismiss || (() => {}),
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  }

  // Get payment methods available
  static getAvailablePaymentMethods() {
    return [
      {
        id: 'razorpay',
        name: 'Online Payment',
        description: 'Pay using Credit Card, Debit Card, UPI, Net Banking, Wallets',
        icon: '💳',
        methods: ['card', 'upi', 'netbanking', 'wallet'],
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when your order is delivered',
        icon: '💵',
        methods: ['cash'],
      },
    ];
  }

  // Format amount for display
  static formatAmount(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Get Razorpay configuration
  static getConfig() {
    return {
      keyId: this.RAZORPAY_KEY_ID,
      isConfigured: !!this.RAZORPAY_KEY_ID,
    };
  }
}

// Types for better TypeScript support
export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}