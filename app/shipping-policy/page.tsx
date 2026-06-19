"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, Clock, Package } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Truck className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Shipping Policy</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Fast, reliable delivery to get your custom products to you quickly and safely
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Last Updated */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            <strong>Last Updated:</strong> January 4, 2025
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-600" />
              Shipping Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              At Lunarz, we're committed to getting your custom products to you as quickly and 
              safely as possible. This Shipping Policy outlines our delivery options, timeframes, 
              and costs for orders within India and internationally.
            </p>
            <p className="text-gray-700">
              All orders are processed and shipped from our facility in Mumbai, Maharashtra.
            </p>
          </CardContent>
        </Card>

        {/* Processing Time */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-6 w-6 mr-2 text-green-600" />
              Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Standard Products</h3>
                <p className="text-green-700">1-2 business days</p>
                <p className="text-sm text-green-600 mt-1">Ready-to-ship items from our inventory</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Custom Products</h3>
                <p className="text-orange-700">2-3 business days</p>
                <p className="text-sm text-orange-600 mt-1">Items with uploaded designs or customizations</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Peak Season:</strong> During festivals and sale periods, processing may take 
                an additional 1-2 business days due to high order volume.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Domestic Shipping */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-blue-600" />
              Domestic Shipping (India)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Options</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Standard Delivery</h4>
                    <span className="text-green-600 font-semibold">FREE on orders ₹999+</span>
                  </div>
                  <p className="text-gray-700 mb-2">3-5 business days</p>
                  <p className="text-sm text-gray-600">₹99 for orders below ₹999</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Express Delivery</h4>
                    <span className="text-blue-600 font-semibold">₹199</span>
                  </div>
                  <p className="text-gray-700 mb-2">1-2 business days</p>
                  <p className="text-sm text-gray-600">Available in major cities</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Same Day Delivery</h4>
                    <span className="text-purple-600 font-semibold">₹299</span>
                  </div>
                  <p className="text-gray-700 mb-2">Within 6-8 hours</p>
                  <p className="text-sm text-gray-600">Available in Mumbai, Delhi, Bangalore (orders before 2 PM)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Coverage Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Metro Cities (1-2 days)</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Mumbai, Delhi, Bangalore</li>
                    <li>Chennai, Kolkata, Hyderabad</li>
                    <li>Pune, Ahmedabad, Jaipur</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Other Cities (3-5 days)</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>All state capitals</li>
                    <li>Major district headquarters</li>
                    <li>PIN codes serviceable by our partners</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Shipping */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>International Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Coming Soon:</strong> We're working on expanding our shipping to international 
                destinations. Currently, we only ship within India.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Planned International Coverage</h3>
              <p className="text-gray-700 mb-2">We plan to offer shipping to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>United States and Canada</li>
                <li>United Kingdom and Europe</li>
                <li>Australia and New Zealand</li>
                <li>Middle East countries</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Subscribe to our newsletter to be notified when international shipping becomes available.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Partners */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Shipping Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We work with trusted logistics partners to ensure reliable delivery:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold">Delhivery</div>
                <div className="text-sm text-gray-600">Express & Standard</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold">Blue Dart</div>
                <div className="text-sm text-gray-600">Express Delivery</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold">Ekart</div>
                <div className="text-sm text-gray-600">Standard Delivery</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold">India Post</div>
                <div className="text-sm text-gray-600">Remote Areas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Tracking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Tracking Information</h3>
              <p className="text-gray-700 mb-2">
                Once your order ships, you'll receive:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Shipping confirmation email with tracking number</li>
                <li>SMS updates on delivery progress</li>
                <li>Real-time tracking through our website</li>
                <li>Delivery notification when package arrives</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Track Your Order</h3>
              <p className="text-gray-700">
                Log into your account and visit the "My Orders" section to track all your shipments 
                in real-time. You can also use the tracking number directly on our shipping partner's website.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Delivery Attempts</h3>
              <p className="text-gray-700 mb-2">
                Our delivery partners will make up to 3 delivery attempts:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>First attempt: As per delivery schedule</li>
                <li>Second attempt: Next business day</li>
                <li>Third attempt: Customer can schedule preferred time</li>
                <li>After 3 attempts: Package returned to our facility</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Delivery Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Someone must be available to receive the package</li>
                <li>Valid ID may be required for verification</li>
                <li>Signature confirmation for orders above ₹5,000</li>
                <li>Safe drop-off available in some areas (with consent)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Address Accuracy</h3>
              <p className="text-gray-700">
                Please ensure your shipping address is complete and accurate. We're not responsible 
                for delays or non-delivery due to incorrect addresses. Address changes after shipping 
                may incur additional charges.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Special Circumstances */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Special Circumstances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Weather and Natural Disasters</h3>
              <p className="text-gray-700">
                Deliveries may be delayed due to severe weather conditions, natural disasters, 
                or other circumstances beyond our control. We'll keep you updated on any delays.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Remote Areas</h3>
              <p className="text-gray-700">
                Delivery to remote or difficult-to-access areas may take additional time. 
                Extra charges may apply for special delivery requirements.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Bulk Orders</h3>
              <p className="text-gray-700">
                Orders with 50+ items may require special handling and extended processing time. 
                We'll contact you with specific delivery arrangements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Damaged or Lost Packages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Damaged or Lost Packages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Damaged Packages</h3>
              <p className="text-gray-700">
                If your package arrives damaged, please don't accept the delivery and contact us 
                immediately. If you've already accepted it, take photos and contact us within 24 hours.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Lost Packages</h3>
              <p className="text-gray-700">
                If your package is marked as delivered but you haven't received it, please:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                <li>Check with neighbors and building security</li>
                <li>Look for safe drop-off locations</li>
                <li>Contact us within 48 hours</li>
                <li>We'll investigate with our shipping partner</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Need help with your shipment? Our customer support team is here to assist:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:lunarz.info@gmail.com" className="text-blue-600 hover:underline">lunarz.info@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 9432436470 (Mon-Fri, 9 AM - 6 PM)</p>
              <p><strong>WhatsApp:</strong> +91 9432436470 (Quick support)</p>
            </div>
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                <strong>Pro Tip:</strong> Keep your order number and tracking information handy 
                when contacting support for faster assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}