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
  // Use maybeSingle() to avoid throwing on no rows
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

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
): Promise<any> {
  return updateOrderRequest(requestId, { status });
}

// ==================== PRODUCT SERVICE (for compatibility) ====================

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    return getAllProducts();
  }

  static async getProductById(id: string): Promise<Product | null> {
    return getProductById(id);
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    return getProductsByCategory(category);
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return createProduct(product);
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return updateProduct(id, updates);
  }

  static async deleteProduct(id: string): Promise<void> {
    return deleteProduct(id);
  }

  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}

// ==================== USER SERVICE (for compatibility) ====================

export class UserService {
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  static async checkUserExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  }

  static async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw new Error(error.message);
    }
  }
}

// ==================== ADDRESS SERVICE ====================

export interface Address {
  id?: string;
  user_id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export class AddressService {
  static async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  static async createAddress(address: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([address])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error creating address:', error);
      throw new Error(error.message);
    }
  }

  static async updateAddress(id: string, updates: Partial<Address>): Promise<void> {
    try {
      const { error } = await supabase
        .from('addresses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating address:', error);
      throw new Error(error.message);
    }
  }

  static async deleteAddress(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting address:', error);
      throw new Error(error.message);
    }
  }
}

// ==================== PAYMENT METHOD SERVICE ====================

export interface PaymentMethod {
  id?: string;
  user_id: string;
  type: string;
  card_last4?: string;
  card_brand?: string;
  upi_id?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export class PaymentMethodService {
  static async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  static async createPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([paymentMethod])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      throw new Error(error.message);
    }
  }

  static async deletePaymentMethod(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      throw new Error(error.message);
    }
  }
}
