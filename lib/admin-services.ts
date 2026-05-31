/**
 * Admin Services with Supabase
 * Replaces Firebase admin services
 */

import { supabase } from "./supabase";
import { Product } from "./data";
import { Order } from "./profile-data";

// ============================================================================
// ADMIN PRODUCT SERVICES
// ============================================================================

export class AdminProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  static async addProduct(product: Omit<Product, "id">): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // ============================================================================
  // TRENDING PRODUCTS MANAGEMENT
  // ============================================================================

  static async getTrendingProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_trending', true)
        .order('trending_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching trending products:", error);
      // Fallback to regular products if trending query fails
      const allProducts = await this.getAllProducts();
      return allProducts.slice(0, 12);
    }
  }

  static async setProductTrending(productId: string, isTrending: boolean, order?: number): Promise<void> {
    try {
      const updates: any = { is_trending: isTrending };
      if (isTrending && order !== undefined) {
        updates.trending_order = order;
      }
      await this.updateProduct(productId, updates);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateTrendingOrder(productId: string, newOrder: number): Promise<void> {
    try {
      await this.updateProduct(productId, { trending_order: newOrder });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // ============================================================================
  // LATEST COLLECTION MANAGEMENT
  // ============================================================================

  static async getLatestCollectionProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_latest_collection', true)
        .order('latest_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching latest collection products:", error);
      // Fallback to recent products if latest collection query fails
      const allProducts = await this.getAllProducts();
      return allProducts.slice(0, 12);
    }
  }

  static async setProductLatestCollection(productId: string, isLatestCollection: boolean, order?: number): Promise<void> {
    try {
      const updates: any = { is_latest_collection: isLatestCollection };
      if (isLatestCollection && order !== undefined) {
        updates.latest_order = order;
      }
      await this.updateProduct(productId, updates);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateLatestCollectionOrder(productId: string, newOrder: number): Promise<void> {
    try {
      await this.updateProduct(productId, { latest_order: newOrder });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // ============================================================================
  // BULK OPERATIONS FOR HOMEPAGE SECTIONS
  // ============================================================================

  static async bulkUpdateTrendingProducts(productUpdates: Array<{ productId: string; isTrending: boolean; order?: number }>): Promise<void> {
    try {
      // Supabase doesn't have batch operations like Firestore, so we'll do sequential updates
      for (const { productId, isTrending, order } of productUpdates) {
        const updates: any = { is_trending: isTrending };
        if (isTrending && order !== undefined) {
          updates.trending_order = order;
        }
        await this.updateProduct(productId, updates);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async bulkUpdateLatestCollection(productUpdates: Array<{ productId: string; isLatestCollection: boolean; order?: number }>): Promise<void> {
    try {
      for (const { productId, isLatestCollection, order } of productUpdates) {
        const updates: any = { is_latest_collection: isLatestCollection };
        if (isLatestCollection && order !== undefined) {
          updates.latest_order = order;
        }
        await this.updateProduct(productId, updates);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // ============================================================================
  // USER ORDER SERVICES
  // ============================================================================

  static async getUserOrders(userId: string): Promise<Order[]> {
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
}

// ============================================================================
// ADMIN ORDER SERVICES
// ============================================================================

export class AdminOrderService {
  static async getAllOrders(): Promise<(Order & { userId: string })[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  static async createOrder(userId: string, orderData: Omit<Order, "id">): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          user_id: userId,
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
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
      throw new Error(error.message);
    }
  }

  static async getOrderById(orderId: string): Promise<(Order & { userId: string }) | null> {
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

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('order_id', orderId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// ============================================================================
// ADMIN USER SERVICES
// ============================================================================

export class AdminUserService {
  static async getAllUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  static async updateUserRole(userId: string, isAdmin: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_admin: isAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// ============================================================================
// ADMIN ANALYTICS SERVICES
// ============================================================================

export class AdminAnalyticsService {
  static async getDashboardStats() {
    try {
      const [productsResult, ordersResult, usersResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*'),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]);

      const orders = ordersResult.data || [];
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const pendingOrders = orders.filter(order => order.order_status === 'pending').length;

      return {
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.data?.length || 0,
        totalUsers: usersResult.count || 0,
        totalRevenue,
        pendingOrders,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingOrders: 0,
      };
    }
  }
}
