/**
 * Admin Services with Supabase
 * Replaces Firebase admin services
 */

import { supabase } from "./supabase";
import { Product } from "./data";
import { Order } from "./profile-data";
import { CreateOrderData } from "./order-services";

// Maps camelCase Product fields to snake_case DB columns
function mapProductToDb(product: Partial<Product>): Record<string, any> {
  const mapped: Record<string, any> = { ...product };

  // Rename camelCase keys to snake_case for Supabase
  if ('lowStockThreshold' in mapped) {
    mapped.low_stock_threshold = mapped.lowStockThreshold;
    delete mapped.lowStockThreshold;
  }
  if ('colorImages' in mapped) {
    mapped.color_images = mapped.colorImages;
    delete mapped.colorImages;
  }
  if ('relatedProducts' in mapped) {
    mapped.related_products = mapped.relatedProducts;
    delete mapped.relatedProducts;
  }
  if ('isTrending' in mapped) {
    mapped.is_trending = mapped.isTrending;
    delete mapped.isTrending;
  }
  if ('isLatestCollection' in mapped) {
    mapped.is_latest_collection = mapped.isLatestCollection;
    delete mapped.isLatestCollection;
  }
  if ('trendingOrder' in mapped) {
    mapped.trending_order = mapped.trendingOrder;
    delete mapped.trendingOrder;
  }
  if ('latestOrder' in mapped) {
    mapped.latest_order = mapped.latestOrder;
    delete mapped.latestOrder;
  }

  // Remove fields that don't exist in DB
  delete mapped.stockHistory;

  return mapped;
}

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
        .insert([mapProductToDb(product)])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Bulk insert products from CSV import.
   * Uses upsert on SKU to avoid duplicates when re-importing.
   * Returns counts of inserted, updated, and failed rows.
   */
  static async bulkImportProducts(
    products: Omit<Product, "id">[]
  ): Promise<{ inserted: number; updated: number; failed: Array<{ index: number; name: string; error: string }> }> {
    const failed: Array<{ index: number; name: string; error: string }> = [];
    let inserted = 0;
    let updated = 0;

    // Split into products with SKU (can upsert) and without (always insert)
    const withSku = products
      .map((p, i) => ({ product: p, originalIndex: i }))
      .filter(({ product }) => product.sku && product.sku.trim() !== '');

    const withoutSku = products
      .map((p, i) => ({ product: p, originalIndex: i }))
      .filter(({ product }) => !product.sku || product.sku.trim() === '');

    // Upsert products that have a SKU (conflict on sku column)
    if (withSku.length > 0) {
      const rows = withSku.map(({ product }) => ({
        ...mapProductToDb({ ...product, images: product.images ?? ['/placeholder.jpg'] }),
      }));

      const { data, error } = await supabase
        .from('products')
        .upsert(rows, { onConflict: 'sku', ignoreDuplicates: false })
        .select('id');

      if (error) {
        // Fall back to row-by-row so we can report individual failures
        for (const { product, originalIndex } of withSku) {
          try {
            const { data: single, error: singleErr } = await supabase
              .from('products')
              .upsert([mapProductToDb({ ...product, images: ['/placeholder.jpg'] })], {
                onConflict: 'sku',
                ignoreDuplicates: false,
              })
              .select('id')
              .single();

            if (singleErr) throw singleErr;
            inserted++;
          } catch (err: any) {
            failed.push({ index: originalIndex + 2, name: product.name, error: err.message });
          }
        }
      } else {
        inserted += (data ?? []).length;
      }
    }

    // Insert products without SKU one-by-one (no conflict key available)
    for (const { product, originalIndex } of withoutSku) {
      try {
        const { error } = await supabase
          .from('products')
          .insert([mapProductToDb({ ...product, images: ['/placeholder.jpg'] })]);

        if (error) throw error;
        inserted++;
      } catch (err: any) {
        failed.push({ index: originalIndex + 2, name: product.name, error: err.message });
      }
    }

    return { inserted, updated, failed };
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...mapProductToDb(updates), updated_at: new Date().toISOString() })
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
      const updates: Partial<Product> = { isTrending };
      if (isTrending && order !== undefined) {
        updates.trendingOrder = order;
      }
      await this.updateProduct(productId, updates);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateTrendingOrder(productId: string, newOrder: number): Promise<void> {
    try {
      await this.updateProduct(productId, { trendingOrder: newOrder });
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
      const updates: Partial<Product> = { isLatestCollection };
      if (isLatestCollection && order !== undefined) {
        updates.latestOrder = order;
      }
      await this.updateProduct(productId, updates);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateLatestCollectionOrder(productId: string, newOrder: number): Promise<void> {
    try {
      await this.updateProduct(productId, { latestOrder: newOrder });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // ============================================================================
  // BULK OPERATIONS FOR HOMEPAGE SECTIONS
  // ============================================================================

  static async bulkUpdateTrendingProducts(productUpdates: Array<{ productId: string; isTrending: boolean; order?: number }>): Promise<void> {
    try {
      for (const { productId, isTrending, order } of productUpdates) {
        const updates: Partial<Product> = { isTrending };
        if (isTrending && order !== undefined) {
          updates.trendingOrder = order;
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
        const updates: Partial<Product> = { isLatestCollection };
        if (isLatestCollection && order !== undefined) {
          updates.latestOrder = order;
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

      return (data || []).map((row) => ({
        id: row.order_id || row.id,
        orderNumber: row.order_id || row.id,
        date: row.created_at,
        status: row.order_status || 'pending',
        items: row.items || [],
        total: row.total_amount || 0,
        shippingAddress: row.shipping_address || {
          id: '',
          type: 'home',
          isDefault: false,
          fullName: '',
          phone: '',
          addressLine1: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        },
      }));
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

      return (data || []).map((row) => ({
        id: row.order_id || row.id,
        orderNumber: row.order_id || row.id,
        date: row.created_at,
        status: row.order_status || 'pending',
        items: row.items || [],
        total: row.total_amount || 0,
        shippingAddress: row.shipping_address || {
          id: '',
          type: 'home',
          isDefault: false,
          fullName: '',
          phone: '',
          addressLine1: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        },
        userId: row.user_id || '',
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        razorpayOrderId: row.razorpay_order_id,
        razorpayPaymentId: row.razorpay_payment_id,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  static async createOrder(userId: string, orderData: any): Promise<string> {
    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          order_id: orderId,
          user_id: userId,
          items: orderData.items,
          total_amount: orderData.total || (orderData as any).totalAmount || 0,
          shipping_address: orderData.shippingAddress,
          payment_method: (orderData as any).paymentMethod || 'cod',
          payment_status: (orderData as any).paymentStatus || 'pending',
          order_status: orderData.status || 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return orderId;
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

      // Map Supabase snake_case columns to camelCase for the UI
      return (data || []).map((user) => ({
        id: user.id,
        uid: user.id,
        email: user.email,
        name: user.display_name || user.email?.split('@')[0] || 'Unknown',
        provider: user.provider || 'email',
        isAdmin: user.is_admin || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }));
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
