"use client";
import { useEffect, useState } from "react";
import { AdminAnalyticsService } from "@/lib/admin-services";
import { Package, ShoppingCart, Users, DollarSign, Clock } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
}

import { DashboardSkeleton } from "@/components/admin/skeleton-loaders";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await AdminAnalyticsService.getDashboardStats();
        setStats(dashboardStats);
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 sm:mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
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