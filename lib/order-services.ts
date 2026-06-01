/**
 * Order Services with Supabase
 * Replaces Firebase order services
 */

import { supabase } from "./supabase";
import { Order } from "./profile-data";
import { CartItem } from "./cart-context";

export interface CreateOrderData {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export async function createOrder(orderData: CreateOrderData): Promise<string> {
  try {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        user_id: orderData.userId,
        items: orderData.items,
        total_amount: orderData.totalAmount,
        shipping_address: orderData.shippingAddress,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentStatus,
        order_status: 'pending',
        razorpay_order_id: orderData.razorpayOrderId || null,
        razorpay_payment_id: orderData.razorpayPaymentId || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return orderId;
  } catch (error: any) {
    console.error("Error creating order:", error);
    throw new Error(error.message);
  }
}

export async function getOrderById(orderId: string): Promise<OrderReceipt | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error || !data) return null;

    // Normalize items — handle both CartItem and flat structures
    const rawItems: any[] = data.items || [];
    const items: OrderReceiptItem[] = rawItems.map((item: any) => {
      const name = item.name || item.product?.name || 'Unknown Item';
      const price = item.price ?? item.product?.price ?? 0;
      const quantity = item.quantity ?? 1;
      const size = item.size || item.selectedSize || '—';
      const variant = item.variant || item.selectedVariant || item.color;
      return {
        name,
        size,
        variant,
        quantity,
        price: Number(price),
        total: Number(price) * quantity,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const totalAmount = data.total_amount || subtotal;
    const shippingAddress = data.shipping_address || {};

    return {
      id: data.id,
      orderId: data.order_id,
      orderNumber: data.order_id,
      date: data.created_at,
      status: data.order_status || 'pending',
      items,
      subtotal,
      discountAmount: 0,
      couponCode: undefined,
      shippingCost: 0,
      total: totalAmount,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.fullName || shippingAddress.full_name || '',
        phone: shippingAddress.phone || '',
        addressLine1: shippingAddress.addressLine1 || shippingAddress.address_line1 || '',
        addressLine2: shippingAddress.addressLine2 || shippingAddress.address_line2,
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode || '',
        country: shippingAddress.country || 'India',
      },
      paymentMethod: data.payment_method || 'N/A',
      paymentStatus: data.payment_status || 'pending',
      orderStatus: data.order_status || 'pending',
      customerInfo: {
        name: shippingAddress.fullName || shippingAddress.full_name || '',
        email: '',
        phone: shippingAddress.phone || '',
      },
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.order_id || row.id,
      orderNumber: row.order_id || row.id,
      date: row.created_at,
      status: row.order_status || 'pending',
      items: row.items || [],
      total: row.total_amount || 0,
      shippingAddress: row.shipping_address || {},
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      razorpayOrderId: row.razorpay_order_id,
      razorpayPaymentId: row.razorpay_payment_id,
      createdAt: row.created_at,
      userId: row.user_id,
    })) as any[];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        order_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating order status:", error);
    throw new Error(error.message);
  }
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating order:", error);
    throw new Error(error.message);
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', orderId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting order:", error);
    throw new Error(error.message);
  }
}

// OrderService class for backward compatibility
export class OrderService {
  static async createOrder(orderData: CreateOrderData): Promise<string> {
    return createOrder(orderData);
  }

  static async getOrderById(orderId: string): Promise<OrderReceipt | null> {
    return getOrderById(orderId);
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    return getOrdersByUserId(userId);
  }

  static async getAllOrders(): Promise<Order[]> {
    return getAllOrders();
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<void> {
    return updateOrderStatus(orderId, status);
  }

  static async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    return updateOrder(orderId, updates);
  }

  static async deleteOrder(orderId: string): Promise<void> {
    return deleteOrder(orderId);
  }
}

// OrderReceipt interface for thank-you page
export interface OrderReceiptItem {
  name: string;
  size: string;
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderReceipt {
  id: string;
  orderId: string;
  orderNumber: string;
  date: string;
  status: string;
  items: OrderReceiptItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingCost: number;
  total: number;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}
