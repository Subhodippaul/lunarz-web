/**
 * Supabase Database Services
 * Replaces firebase-services.ts
 */

import { supabase } from './supabase';

// ==================== PRODUCTS ====================

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  description: string;
  material: string;
  care: string;
  origin: string;
  manufacturer: string;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return data || [];
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// ==================== USERS ====================

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

export async function createUser(user: { id: string; email: string; display_name?: string; phone?: string }): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: user.id,
      email: user.email,
      display_name: user.display_name || null,
      phone: user.phone || null,
      is_admin: false,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return data;
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
}

// ==================== ORDERS ====================

export interface Order {
  id?: string;
  order_id: string;
  user_id: string;
  items: any[];
  total_amount: number;
  shipping_address: any;
  payment_method: string;
  payment_status: string;
  order_status: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  shiprocket_order_id?: string | null;
  tracking_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }

  return data || [];
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }

  return data || [];
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }

  return data;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  return updateOrder(orderId, { order_status: status });
}

// ==================== ORDER REQUESTS (Returns/Exchanges) ====================

export interface OrderRequest {
  id?: string;
  request_id: string;
  order_id: string;
  user_id: string;
  type: 'return' | 'exchange';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export async function createOrderRequest(request: Omit<OrderRequest, 'id' | 'created_at' | 'updated_at'>): Promise<OrderRequest> {
  const { data, error } = await supabase
    .from('order_requests')
    .insert([request])
    .select()
    .single();

  if (error) {
    console.error('Error creating order request:', error);
    throw error;
  }

  return data;
}

export async function getOrderRequestsByUserId(userId: string): Promise<OrderRequest[]> {
  const { data, error } = await supabase
    .from('order_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching order requests:', error);
    throw error;
  }

  return data || [];
}

export async function getAllOrderRequests(): Promise<OrderRequest[]> {
  const { data, error } = await supabase
    .from('order_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all order requests:', error);
    throw error;
  }

  return data || [];
}

export async function updateOrderRequest(requestId: string, updates: Partial<OrderRequest>): Promise<OrderRequest> {
  const { data, error } = await supabase
    .from('order_requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('request_id', requestId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order request:', error);
    throw error;
  }

  return data;
}

export async function updateOrderRequestStatus(
  requestId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<OrderRequest> {
  return updateOrderRequest(requestId, { status });
}
