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

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;
    return data;
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
    return data || [];
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

  static async getOrderById(orderId: string): Promise<Order | null> {
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
export interface OrderReceipt {
  id: string;
  orderId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}
