"use client";
import { useEffect, useState } from "react";
import { AdminAnalyticsService } from "@/lib/admin-services";
import { OrderAnalyticsService } from "@/lib/order-analytics";
import { ChatService } from "@/lib/chat-services";
import { Package, ShoppingCart, Users, DollarSign, Clock, MessageCircle, TrendingUp, BarChart3 } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  activeChatSessions: number;
  totalChatSessions: number;
  averageOrderValue: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

import { DashboardSkeleton } from "@/components/admin/skeleton-loaders";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeChatSessions: 0,
    totalChatSessions: 0,
    averageOrderValue: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardStats, orderAnalytics, chatSessions] = await Promise.all([
          AdminAnalyticsService.getDashboardStats(),
          OrderAnalyticsService.getOrderAnalytics(30),
          ChatService.getAdminChatSessions(),
        ]);
        
        const activeChatSessions = chatSessions.filter(session => 
          session.status === 'active' || session.status === 'waiting'
        ).length;
        
        setStats({
          ...dashboardStats,
          activeChatSessions,
          totalChatSessions: chatSessions.length,
          averageOrderValue: orderAnalytics.averageOrderValue,
          confirmedOrders: orderAnalytics.confirmedOrders,
          shippedOrders: orderAnalytics.shippedOrders,
          deliveredOrders: orderAnalytics.deliveredOrders,
        });

        setRecentOrders(orderAnalytics.recentOrders.slice(0, 5));
        setTopProducts(orderAnalytics.topSellingProducts.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Active Chats",
      value: stats.activeChatSessions,
      icon: MessageCircle,
      color: "bg-orange-500",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-yellow-500",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-red-500",
    },
  ];

  const orderStatusCards = [
    {
      title: "Confirmed",
      value: stats.confirmedOrders,
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Shipped",
      value: stats.shippedOrders,
      color: "bg-purple-100 text-purple-800",
    },
    {
      title: "Delivered",
      value: stats.deliveredOrders,
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Avg Order Value",
      value: `₹${Math.round(stats.averageOrderValue).toLocaleString()}`,
      color: "bg-indigo-100 text-indigo-800",
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 sm:mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-2 sm:p-3 rounded-lg`}>
                <card.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        {orderStatusCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">{card.title}</p>
              <span className={`inline-flex px-3 py-1 text-lg sm:text-xl font-bold rounded-full ${card.color}`}>
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Recent Orders
            </h2>
            <a
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Selling Products
            </h2>
            <a
              href="/admin/products"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </a>
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      <p className="text-sm text-gray-600">{product.totalQuantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{product.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/products"
            className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Manage Products</h3>
              <p className="text-xs sm:text-sm text-gray-600">Add, edit, or remove products</p>
            </div>
          </a>
          
          <a
            href="/admin/orders"
            className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Manage Orders</h3>
              <p className="text-xs sm:text-sm text-gray-600">View and update order status</p>
            </div>
          </a>
          
          <a
            href="/admin/users"
            className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Manage Users</h3>
              <p className="text-xs sm:text-sm text-gray-600">View and manage user accounts</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}