"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { OrderService } from "@/lib/order-services";
import OrderActions from "@/components/order-actions";
import { CenteredLoader } from "@/components/ui/loader";
import { Package, Calendar, MapPin, CreditCard, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersWithActions() {
  const { state: authState } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (authState.user?.id) {
      loadOrders();
    }
  }, [authState.user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const userOrders = await OrderService.getUserOrders(authState.user?.id || '');
      setOrders(userOrders);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      setError(error.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (items: any[]) => {
    return items?.reduce((total, item) => {
      const price = item.price ?? item.product?.price ?? 0;
      const quantity = item.quantity ?? 1;
      return total + (Number(price) * quantity);
    }, 0) || 0;
  };

  if (loading) {
    return <CenteredLoader text="Loading your orders..." size="md" />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadOrders}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
        <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
        <div className="space-y-3">
          <Button onClick={() => window.location.href = '/products'}>
            Start Shopping
          </Button>
          <div className="text-sm text-gray-500">
            <p>If you recently placed an order and it's not showing up:</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadOrders}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id || order.order_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Order Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">Order #{order.id || order.order_id}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.createdAt || order.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      ₹{(order.total || calculateTotal(order.items)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                </Button>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <OrderActions 
              order={order} 
              onOrderUpdate={loadOrders}
            />
          </div>

          {/* Order Details (Expandable) */}
          {selectedOrder?.id === order.id && (
            <div className="p-6 space-y-6">
              {/* Items */}
              <div>
                <h4 className="font-medium mb-4">Order Items</h4>
                <div className="space-y-3">
                  {order.items?.map((item: any, index: number) => {
                    // Handle both flat items and nested CartItem structure
                    const name = item.name || item.product?.name || 'Unknown Item';
                    const price = item.price ?? item.product?.price ?? 0;
                    const quantity = item.quantity ?? 1;
                    const size = item.size || item.selectedSize || '—';
                    const color = item.color || item.selectedVariant || item.variant || '—';
                    const image = item.image || item.product?.images?.[0] || '/placeholder.jpg';

                    return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={image}
                          alt={name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.onerror = null;
                            t.src = '/placeholder.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{name}</h5>
                          <p className="text-sm text-gray-600">
                            Size: {size} | Color: {color}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {quantity} × ₹{Number(price).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(Number(price) * quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Information
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Payment Method:</span>
                    <span className="font-medium">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Payment Status:</span>
                    <span className={`font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 
                      order.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal(order.items).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}