import { supabase } from './supabase';

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
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (ordersError) throw ordersError;

      const orders = (ordersData || []).map(row => ({
        id: row.id,
        orderNumber: row.order_id,
        total: row.total_amount,
        status: row.order_status,
        paymentMethod: row.payment_method,
        shippingAddress: row.shipping_address,
        items: row.items,
        createdAt: row.created_at,
      }));

      // Calculate basic metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Count orders by status
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate top selling products from order items
      const productSales: Record<string, any> = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const key = item.productId || item.product_id || item.id;
            if (!productSales[key]) {
              productSales[key] = {
                productId: key,
                productName: item.productName || item.product_name || item.name || 'Unknown Product',
                totalQuantity: 0,
                totalRevenue: 0,
              };
            }
            productSales[key].totalQuantity += item.quantity || 0;
            productSales[key].totalRevenue += (item.price || 0) * (item.quantity || 0);
          });
        }
      });

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
          customerName: order.shippingAddress?.fullName || order.shippingAddress?.name || 'Customer',
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
      const { data, error } = await supabase
        .from('orders')
        .select('order_status');

      if (error) throw error;

      return (data || []).reduce((acc, order) => {
        acc[order.order_status] = (acc[order.order_status] || 0) + 1;
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
      const { data, error } = await supabase
        .from('orders')
        .select('payment_method, total_amount');

      if (error) throw error;

      return (data || []).reduce((acc, order) => {
        const method = order.payment_method || 'unknown';
        acc[method] = (acc[method] || 0) + (order.total_amount || 0);
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
      
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const orders = (data || []).map(row => ({
        total: row.total_amount,
        createdAt: row.created_at,
      }));

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
