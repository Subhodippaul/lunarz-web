import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { Product } from "./data";
import { Order } from "./profile-data";

// Collections
const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  ADDRESSES: "addresses",
  PAYMENT_METHODS: "paymentMethods",
} as const;

// ============================================================================
// ADMIN PRODUCT SERVICES
// ============================================================================

export class AdminProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id, // Use string ID from Firestore
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  static async addProduct(product: Omit<Product, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // ============================================================================
  // TRENDING PRODUCTS MANAGEMENT
  // ============================================================================

  static async getTrendingProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where("isTrending", "==", true),
        orderBy("trendingOrder", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
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
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where("isLatestCollection", "==", true),
        orderBy("latestOrder", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error fetching latest collection products:", error);
      // Fallback to recent products if latest collection query fails
      const allProducts = await this.getAllProducts();
      return allProducts.slice().reverse().slice(0, 12);
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
      const batch = writeBatch(db);
      
      productUpdates.forEach(({ productId, isTrending, order }) => {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
        const updates: any = { 
          isTrending,
          updatedAt: Timestamp.now()
        };
        if (isTrending && order !== undefined) {
          updates.trendingOrder = order;
        }
        batch.update(docRef, updates);
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async bulkUpdateLatestCollection(productUpdates: Array<{ productId: string; isLatestCollection: boolean; order?: number }>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      productUpdates.forEach(({ productId, isLatestCollection, order }) => {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
        const updates: any = { 
          isLatestCollection,
          updatedAt: Timestamp.now()
        };
        if (isLatestCollection && order !== undefined) {
          updates.latestOrder = order;
        }
        batch.update(docRef, updates);
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // ============================================================================
  // USER ORDER SERVICES
  // ============================================================================

  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
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
      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as (Order & { userId: string })[];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  static async createOrder(userId: string, orderData: Omit<Order, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...orderData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getOrderById(orderId: string): Promise<(Order & { userId: string }) | null> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as (Order & { userId: string });
      }
      return null;
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  }

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await deleteDoc(docRef);
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
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  static async updateUserRole(userId: string, isAdmin: boolean): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(docRef, {
        isAdmin,
        updatedAt: Timestamp.now(),
      });
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
      const [productsSnapshot, ordersSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.PRODUCTS)),
        getDocs(collection(db, COLLECTIONS.ORDERS)),
        getDocs(collection(db, COLLECTIONS.USERS)),
      ]);

      const orders = ordersSnapshot.docs.map(doc => doc.data());
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;

      return {
        totalProducts: productsSnapshot.size,
        totalOrders: ordersSnapshot.size,
        totalUsers: usersSnapshot.size,
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