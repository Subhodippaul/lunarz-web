"use client";
import { Order } from "@/lib/profile-data";
import { X, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, Mail } from "lucide-react";

type OrderWithUser = Order & { userId: string };

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithUser | null;
  onStatusUpdate: (orderId: string, status: Order["status"]) => void;
}

export default function OrderModal({ isOpen, onClose, order, onStatusUpdate }: OrderModalProps) {
  // Debug logging to see what's being passed
  console.log("OrderModal props:", { 
    isOpen, 
    order: order ? {
      id: order.id,
      orderNumber: order.orderNumber,
      hasItems: !!order.items,
      itemsLength: order.items?.length,
      hasShippingAddress: !!order.shippingAddress
    } : "Order is null" 
  });
  
  if (!isOpen) {
    return null;
  }
  
  if (!order) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No order data available</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <Package className="h-5 w-5" />;
      case "cancelled":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "shipped":
        return "text-purple-600 bg-purple-50";
      case "delivered":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const handleStatusChange = (newStatus: Order["status"]) => {
    onStatusUpdate(order.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Order Details - {order.orderNumber || 'Unknown Order'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status and Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(order.status || 'pending')}`}>
                      {getStatusIcon(order.status || 'pending')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Status</p>
                      <p className="text-lg font-semibold capitalize">{order.status || 'pending'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status
                    </label>
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => handleStatusChange(e.target.value as Order["status"])}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-4">
                  {(order.items || []).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="shrink-0 w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name || 'Unknown Product'}</h5>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Size: {item.size || 'N/A'}</p>
                          {item.variant && <p>Color: {item.variant}</p>}
                          <p>Quantity: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{(item.price || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">each</p>
                      </div>
                    </div>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items found in this order</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{(order.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>₹{(order.total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">User ID: {order.userId?.slice(0, 8) || 'Unknown'}...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{order.shippingAddress?.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {order.shippingAddress ? (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{order.shippingAddress.fullName || 'Unknown'}</p>
                        <p>{order.shippingAddress.addressLine1 || 'No address'}</p>
                        {order.shippingAddress.addressLine2 && (
                          <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {order.shippingAddress.city || 'Unknown'}, {order.shippingAddress.state || 'Unknown'} {order.shippingAddress.pincode || ''}
                        </p>
                        <p>{order.shippingAddress.country || 'Unknown'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No shipping address provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span>{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Time:</span>
                      <span>{order.date ? new Date(order.date).toLocaleTimeString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}