import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Collections
const COLLECTIONS = {
  ORDERS: "orders",
  ORDER_ITEMS: "orderItems",
} as const;

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    date: string;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export class OrderAnalyticsService {
  // Get comprehensive order analytics
  static async getOrderAnalytics(days: number = 30): Promise<OrderAnalytics> {
    try {
      // Get orders from the last N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const ordersQuery = query(
        collection(db, COLLECTIONS.ORDERS),
        where("createdAt", ">=", Timestamp.fromDate(startDate))
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderNumber: data.orderNumber || '',
          total: data.total || 0,
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || 'cod',
          shippingAddress: data.shippingAddress || {},
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          ...data,
        };
      });

      // Get all order items for product analytics
      const orderItemsSnapshot = await getDocs(collection(db, COLLECTIONS.ORDER_ITEMS));
      const orderItems = orderItemsSnapshot.docs.map(doc => doc.data());

      // Calculate basic metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Count orders by status
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate top selling products
      const productSales = orderItems.reduce((acc, item) => {
        const key = item.productId;
        if (!acc[key]) {
          acc[key] = {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        acc[key].totalQuantity += item.quantity || 0;
        acc[key].totalRevenue += item.total || 0;
        return acc;
      }, {} as Record<string, any>);

      const topSellingProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10);

      // Get recent orders
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.shippingAddress?.fullName || 'Customer',
          total: order.total,
          status: order.status,
          date: order.createdAt,
        }));

      // Calculate daily revenue
      const dailyRevenueMap = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { revenue: 0, orders: 0 };
        }
        acc[date].revenue += order.total || 0;
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, { revenue: number; orders: number }>);

      const dailyRevenue = Object.entries(dailyRevenueMap)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalOrders,
        totalRevenue,
        pendingOrders: statusCounts.pending || 0,
        confirmedOrders: statusCounts.confirmed || 0,
        shippedOrders: statusCounts.shipped || 0,
        deliveredOrders: statusCounts.delivered || 0,
        cancelledOrders: statusCounts.cancelled || 0,
        averageOrderValue,
        topSellingProducts,
        recentOrders,
        dailyRevenue,
      };
    } catch (error) {
      console.error("Error fetching order analytics:", error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
        topSellingProducts: [],
        recentOrders: [],
        dailyRevenue: [],
      };
    }
  }

  // Get order status distribution
  static async getOrderStatusDistribution(): Promise<Record<string, number>> {
    try {
      const ordersSnapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
      const orders = ordersSnapshot.docs.map(doc => doc.data());

      return orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error("Error fetching order status distribution:", error);
      return {};
    }
  }

  // Get revenue by payment method
  static async getRevenueByPaymentMethod(): Promise<Record<string, number>> {
    try {
      const ordersSnapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
      const orders = ordersSnapshot.docs.map(doc => doc.data());

      return orders.reduce((acc, order) => {
        const method = order.paymentMethod || 'unknown';
        acc[method] = (acc[method] || 0) + (order.total || 0);
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error("Error fetching revenue by payment method:", error);
      return {};
    }
  }

  // Get monthly revenue trend
  static async getMonthlyRevenueTrend(months: number = 12): Promise<Array<{
    month: string;
    revenue: number;
    orders: number;
  }>> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const ordersQuery = query(
        collection(db, COLLECTIONS.ORDERS),
        where("createdAt", ">=", Timestamp.fromDate(startDate))
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          total: data.total || 0,
          paymentMethod: data.paymentMethod || 'cod',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          ...data,
        };
      });

      const monthlyData = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = { revenue: 0, orders: 0 };
        }
        
        acc[monthKey].revenue += order.total || 0;
        acc[monthKey].orders += 1;
        return acc;
      }, {} as Record<string, { revenue: number; orders: number }>);

      return Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      console.error("Error fetching monthly revenue trend:", error);
      return [];
    }
  }
}