"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  Mail,
  Calendar,
  User,
  AlertCircle
} from "lucide-react";

interface OrderStatus {
  status: string;
  timestamp: string;
  location: string;
  description: string;
  completed: boolean;
}

interface TrackingInfo {
  orderNumber: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  currentLocation: string;
  carrier: string;
  orderDate: string;
  customerName: string;
  shippingAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    image: string;
  }>;
  statusHistory: OrderStatus[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
console.log('this.config.email.',process.env.SHIPROCKET_EMAIL, process.env.SHIPROCKET_PASSWORD);
    try {
      // Track with Shiprocket API
      const response = await fetch(`/api/shiprocket/track-order?${
        orderNumber.includes('LNZ') ? `order_id=${orderNumber}` : `awb_code=${orderNumber}`
      }`);

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setTrackingInfo(result.data);
        setError("");
      } else {
        // Handle specific error cases
        if (response.status === 503) {
          setError("Shiprocket tracking is not configured. Please contact support.");
        } else {
          setError(result.details || result.error || "Order not found. Please check your order number and email address.");
        }
        setTrackingInfo(null);
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setError("Unable to track order at the moment. Please try again later.");
      setTrackingInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (status === trackingInfo?.status) {
      return <Clock className="h-5 w-5 text-blue-600" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "out for delivery":
        return "bg-blue-100 text-blue-800";
      case "in transit":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Package className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Track Your Order</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Enter your order details to get real-time updates on your package
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Tracking Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-6 w-6 mr-2" />
              Track Your Package
            </CardTitle>
            <p className="text-gray-600">
              Enter your order number or tracking number along with your email address
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderNumber">Order Number / Tracking Number</Label>
                  <Input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. LNZ240001 or AWB tracking number"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="mt-2"
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                loading={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Tracking..." : "Track Order"}
              </Button>
            </form>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Instructions:</strong> Enter your order number (e.g., LNZ240001) or AWB tracking code 
                along with your email address to track your shipment.
              </p>
              <p className="text-blue-700 text-xs mt-2">
                <strong>Note:</strong> Tracking data is fetched directly from Shiprocket. 
                Ensure your Shiprocket integration is properly configured.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Package className="h-6 w-6 mr-2" />
                    Order #{trackingInfo.orderNumber}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingInfo.status)}`}>
                    {trackingInfo.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold">{trackingInfo.orderDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Carrier</p>
                      <p className="font-semibold">{trackingInfo.carrier}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Current Location</p>
                      <p className="font-semibold">{trackingInfo.currentLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Est. Delivery</p>
                      <p className="font-semibold">{trackingInfo.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
                <p className="text-gray-600">Follow your package journey</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingInfo.statusHistory && trackingInfo.statusHistory.length > 0 ? (
                    trackingInfo.statusHistory.map((status, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          {getStatusIcon(status.status, status.completed)}
                          {index < trackingInfo.statusHistory.length - 1 && (
                            <div className={`w-0.5 h-12 mt-2 ${status.completed ? 'bg-green-300' : 'bg-gray-300'}`}></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold ${status.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                              {status.status}
                            </h3>
                            <span className="text-sm text-gray-500">{status.timestamp}</span>
                          </div>
                          <p className={`text-sm mt-1 ${status.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                            {status.description}
                          </p>
                          <p className={`text-xs mt-1 ${status.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                            📍 {status.location}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tracking history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingInfo.items && trackingInfo.items.length > 0 ? (
                    trackingInfo.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No item details available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Recipient
                    </h3>
                    <p className="text-gray-700">{trackingInfo.customerName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Delivery Address
                    </h3>
                    <p className="text-gray-700">{trackingInfo.shippingAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Speak with our customer service team
                </p>
                <p className="text-blue-600 font-semibold">+91 12345 67890</p>
              </div>
              <div className="text-center">
                <Mail className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Send us your tracking questions
                </p>
                <p className="text-green-600 font-semibold">lunarz.info@gmail.com</p>
              </div>
              <div className="text-center">
                <Package className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Track Issues</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Report delivery problems
                </p>
                <Button variant="outline" size="sm">
                  Report Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tracking FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How long does shipping take?</h3>
                <p className="text-gray-600 text-sm">
                  Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">When will I receive my tracking number?</h3>
                <p className="text-gray-600 text-sm">
                  You'll receive your tracking number via email within 24 hours of your order being shipped.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">My tracking hasn't updated. What should I do?</h3>
                <p className="text-gray-600 text-sm">
                  Tracking information can take 24-48 hours to update. If it's been longer, please contact our support team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}