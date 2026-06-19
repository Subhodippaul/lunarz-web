"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <RefreshCw className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Refund Policy</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Your satisfaction is our priority. Learn about our return and refund process.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Last Updated */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <p className="text-green-800">
            <strong>Last Updated:</strong> January 4, 2025
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              Our Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              At Lunarz, we want you to be completely satisfied with your purchase. If you're not 
              happy with your order, we offer a straightforward return and refund process within 
              our policy guidelines.
            </p>
            <p className="text-gray-700">
              This Refund Policy outlines the conditions and procedures for returns, exchanges, 
              and refunds for products purchased from Lunarz.
            </p>
          </CardContent>
        </Card>

        {/* Return Window */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-6 w-6 mr-2 text-blue-600" />
              Return Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-semibold">
                You have 7 days from the date of delivery to initiate a return.
              </p>
            </div>
            <p className="text-gray-700">
              The return window starts from the date you receive your order. After 7 days, 
              we cannot accept returns unless there is a manufacturing defect or error on our part.
            </p>
          </CardContent>
        </Card>

        {/* Eligible Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Eligible Items for Return</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-700 mb-2">✓ Returnable Items</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Standard products in original condition</li>
                <li>Items with original tags and packaging</li>
                <li>Unused and unwashed products</li>
                <li>Products without any damage or stains</li>
                <li>Items that don't fit (size exchanges available)</li>
              </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-red-700 mb-2">✗ Non-Returnable Items</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Custom/personalized products (unless defective)</li>
                <li>Items with uploaded designs or custom text</li>
                <li>Products that have been worn or washed</li>
                <li>Items damaged by misuse or normal wear</li>
                <li>Products without original tags or packaging</li>
                <li>Undergarments and intimate apparel</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Return Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Return an Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Initiate Return Request</h3>
                  <p className="text-gray-700">
                    Log into your account and go to "My Orders" or contact our customer support 
                    at <a href="mailto:lunarz.info@gmail.com" className="text-blue-600 hover:underline">lunarz.info@gmail.com</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Provide Order Details</h3>
                  <p className="text-gray-700">
                    Include your order number, item details, and reason for return. 
                    Photos may be required for quality issues.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Receive Return Authorization</h3>
                  <p className="text-gray-700">
                    We'll review your request and provide a Return Authorization (RA) number 
                    along with return instructions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Package and Ship</h3>
                  <p className="text-gray-700">
                    Pack the item securely with the RA number clearly marked. 
                    Use the provided return label if applicable.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Processing & Refund</h3>
                  <p className="text-gray-700">
                    Once we receive and inspect your return, we'll process your refund 
                    within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Shipping */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Return Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Our Responsibility</h3>
              <p className="text-gray-700 mb-2">
                We provide free return shipping when the return is due to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Wrong item sent</li>
                <li>Defective or damaged product</li>
                <li>Manufacturing error</li>
                <li>Quality issues</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Customer Responsibility</h3>
              <p className="text-gray-700 mb-2">
                You are responsible for return shipping costs when:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Changing your mind about the purchase</li>
                <li>Ordering the wrong size</li>
                <li>Item doesn't meet expectations (but is as described)</li>
                <li>Personal preference changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Refund Processing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Refund Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Processing Time</h3>
              <p className="text-gray-700">
                Refunds are processed within 5-7 business days after we receive and inspect 
                your returned item. You'll receive an email confirmation once the refund is processed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Refund Method</h3>
              <p className="text-gray-700 mb-2">
                Refunds will be issued to your original payment method:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Credit/Debit Cards: 5-10 business days</li>
                <li>UPI/Digital Wallets: 3-5 business days</li>
                <li>Net Banking: 5-7 business days</li>
                <li>Cash on Delivery: Bank transfer (provide account details)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Partial Refunds</h3>
              <p className="text-gray-700 mb-2">
                Partial refunds may be issued for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Items returned without original packaging</li>
                <li>Products with minor damage not reported initially</li>
                <li>Items missing accessories or tags</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Exchanges */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exchanges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We offer exchanges for size and color variations (subject to availability). 
              The exchange process follows the same steps as returns, but you'll receive 
              a replacement item instead of a refund.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Note:</strong> If the replacement item has a different price, 
                you'll be charged or refunded the difference.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Special Circumstances */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-orange-600" />
              Special Circumstances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Damaged or Defective Items</h3>
              <p className="text-gray-700">
                If you receive a damaged or defective item, please contact us immediately 
                with photos. We'll provide a full refund or replacement at no cost to you.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Lost or Stolen Packages</h3>
              <p className="text-gray-700">
                If your package is marked as delivered but you haven't received it, 
                please contact us within 48 hours. We'll work with the shipping carrier 
                to resolve the issue.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Bulk Orders</h3>
              <p className="text-gray-700">
                Special return conditions may apply to bulk orders (50+ items). 
                Please contact our sales team for specific terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Non-Refundable Fees */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Non-Refundable Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              The following fees are non-refundable:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Original shipping charges (unless we made an error)</li>
              <li>Return shipping costs (unless we made an error)</li>
              <li>Cash on Delivery (COD) fees</li>
              <li>Express shipping upgrades</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact for Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help with Returns?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Our customer support team is here to help with your return or refund questions:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:lunarz.info@gmail.com" className="text-blue-600 hover:underline">lunarz.info@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 9432436470 (Mon-Fri, 9 AM - 6 PM)</p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Tip:</strong> Keep your order confirmation email and tracking information 
                handy when contacting support for faster assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}