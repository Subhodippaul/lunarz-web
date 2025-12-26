"use client";
import { useState, useEffect } from "react";
import { OrderService } from "@/lib/order-services";
import { Order } from "@/lib/profile-data";
import { useAuth } from "@/lib/auth-context";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin,
  Calendar,
  Eye,
  Download
} from "lucide-react";
import Link from "next/link";

interface OrderTrackingProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function OrderTracking({ limit, showViewAll = true }: OrderTrackingProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useAuth();

  useEffect(() => {
    if (state.user) {
      fetchOrders();
    }
  }, [state.user]);

  const fetchOrders = async () => {
    if (!state.user) return;

    try {
      setLoading(true);
      const userOrders = await OrderService.getUserOrders(state.user.id);
      const displayOrders = limit ? userOrders.slice(0, limit) : userOrders;
      setOrders(displayOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <Package className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600 mb-6">
          When you place orders, they'll appear here for tracking.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(order.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                ₹{order.total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Package className="h-4 w-4" />
              <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {order.items.slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">
                      {item.size} {item.variant && `• ${item.variant}`} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              {order.items.length > 2 && (
                <p className="text-sm text-gray-600">
                  +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="font-medium">Shipping to:</span>
            </div>
            <p className="text-sm text-gray-900">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <Link
                href={`/thank-you?orderId=${order.id}`}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Link>
              <Link
                href={`/thank-you?orderId=${order.id}`}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Invoice
              </Link>
            </div>
            
            {order.status === 'delivered' && (
              <Link
                href={`/products/${order.items[0]?.productId}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Buy Again
              </Link>
            )}
          </div>
        </div>
      ))}

      {showViewAll && limit && orders.length >= limit && (
        <div className="text-center pt-4">
          <Link
            href="/profile?tab=orders"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      )}
    </div>
  );
}