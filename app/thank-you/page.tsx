"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OrderService, OrderReceipt } from "@/lib/order-services";
import { useAuth } from "@/lib/auth-context";
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  CreditCard,
  Calendar,
  ArrowLeft,
  Share2,
  MessageCircle,
  Printer
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

function ThankYouContent() {
  const [order, setOrder] = useState<OrderReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const { state } = useAuth();
  const { addToast } = useToast();

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!orderId) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [orderId, mounted]);

  const fetchOrder = async () => {
    if (!orderId || !mounted) return;

    try {
      setLoading(true);
      const orderData = await OrderService.getOrderById(orderId);
      
      if (!orderData) {
        setError("Order not found");
        return;
      }

      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;
    
    // Generate HTML content
    const htmlContent = generateReceiptHTML(order);
    
    // Create a blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lunarz-Invoice-${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
    
    addToast({
      title: "Invoice Downloaded",
      description: "Your invoice has been downloaded successfully",
      type: "success",
    });
  };

  const handlePrintReceipt = () => {
    if (!order) return;
    
    // Open print dialog with receipt
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(generateReceiptHTML(order));
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  const handleShareOrder = async () => {
    if (!order) return;

    const shareData = {
      title: `Lunarz Order ${order.orderNumber}`,
      text: `I just placed an order at Lunarz! Order #${order.orderNumber}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text} - ${shareData.url}`
        );
        addToast({
          title: "Copied to clipboard",
          description: "Order details copied to clipboard",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const generateReceiptHTML = (order: OrderReceipt): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: #fff;
            }
            .invoice-header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .company-name { 
              font-size: 32px; 
              font-weight: bold; 
              color: #2563eb; 
              margin-bottom: 5px;
            }
            .invoice-title { 
              font-size: 24px; 
              color: #666; 
              margin-bottom: 10px;
            }
            .invoice-info { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .info-section { 
              flex: 1; 
              min-width: 250px; 
              margin-bottom: 20px;
            }
            .info-section h3 { 
              color: #2563eb; 
              margin-bottom: 10px; 
              font-size: 16px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .info-section p { 
              margin: 5px 0; 
              font-size: 14px;
            }
            .order-details { 
              background: #f8fafc; 
              padding: 15px; 
              border-radius: 8px; 
              margin-bottom: 20px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .items-table th { 
              background: #2563eb; 
              color: white; 
              padding: 12px 8px; 
              text-align: left; 
              font-weight: 600;
            }
            .items-table td { 
              padding: 12px 8px; 
              border-bottom: 1px solid #e5e7eb;
            }
            .items-table tr:nth-child(even) { 
              background: #f8fafc;
            }
            .items-table tr:hover { 
              background: #f1f5f9;
            }
            .total-section { 
              margin-top: 30px; 
              padding: 20px; 
              background: #f8fafc; 
              border-radius: 8px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0; 
              font-size: 14px;
            }
            .total-row.subtotal { 
              border-top: 1px solid #e5e7eb; 
              padding-top: 10px;
            }
            .total-row.final-total { 
              font-weight: bold; 
              font-size: 18px; 
              color: #2563eb; 
              border-top: 2px solid #2563eb; 
              padding-top: 10px; 
              margin-top: 10px;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              padding: 20px; 
              background: #f8fafc; 
              border-radius: 8px; 
              border-top: 3px solid #2563eb;
            }
            .footer h3 { 
              color: #2563eb; 
              margin-bottom: 10px;
            }
            .footer p { 
              color: #666; 
              font-size: 14px; 
              margin: 5px 0;
            }
            .status-badge { 
              display: inline-block; 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: 600; 
              text-transform: uppercase;
              background: #10b981; 
              color: white;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .invoice-header { page-break-after: avoid; }
              .items-table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="company-name">LUNARZ</div>
            <div class="invoice-title">INVOICE</div>
            <p style="color: #666; font-size: 14px;">Thank you for your business!</p>
          </div>
          
          <div class="invoice-info">
            <div class="info-section">
              <h3>Order Information</h3>
              <p><strong>Invoice Number:</strong> ${order.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p><strong>Status:</strong> <span class="status-badge">${order.status}</span></p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            </div>

            <div class="info-section">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${order.customerInfo.name}</p>
              <p><strong>Email:</strong> ${order.customerInfo.email}</p>
              <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
            </div>
          </div>

          <div class="info-section">
            <h3>Shipping Address</h3>
            <div class="order-details">
              <p><strong>${order.shippingAddress.fullName}</strong></p>
              <p>${order.shippingAddress.addressLine1}</p>
              ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}</p>
              <p>${order.shippingAddress.country}</p>
              <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40%;">Item Description</th>
                <th style="width: 15%;">Size</th>
                <th style="width: 10%;">Qty</th>
                <th style="width: 15%;">Unit Price</th>
                <th style="width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.name}</strong>
                    ${item.variant ? `<br><small style="color: #666;">Color: ${item.variant}</small>` : ''}
                  </td>
                  <td>${item.size}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price.toLocaleString()}</td>
                  <td style="text-align: right;"><strong>₹${item.total.toLocaleString()}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row subtotal">
              <span>Subtotal:</span>
              <span>₹${order.subtotal.toLocaleString()}</span>
            </div>
            ${order.discountAmount > 0 ? `
              <div class="total-row">
                <span>Discount ${order.couponCode ? `(${order.couponCode})` : ''}:</span>
                <span style="color: #10b981;">-₹${order.discountAmount.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>Shipping Charges:</span>
              <span>${order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost.toLocaleString()}`}</span>
            </div>
            <div class="total-row final-total">
              <span>TOTAL AMOUNT:</span>
              <span>₹${order.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="footer">
            <h3>Thank You for Shopping with Lunarz!</h3>
            <p>For any queries or support, please contact us:</p>
            <p><strong>Email:</strong> lunarz.info@gmail.com</p>
            <p><strong>Website:</strong> www.lunarz.com</p>
            <p style="margin-top: 15px; font-size: 12px; color: #888;">
              This is a computer-generated invoice. No signature required.
            </p>
          </div>
        </body>
      </html>
    `;
  };

  if (!mounted) {
    return <LoadingFallback />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "We couldn't find your order details."}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(order.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </button>
                <button
                  onClick={handleShareOrder}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  We'll send you updates as your order progresses
                </p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      Size: {item.size}
                      {item.variant && ` • Color: ${item.variant}`}
                      {' • Qty: '}{item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{item.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">₹{item.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Discount {order.couponCode && `(${order.couponCode})`}
                  </span>
                  <span className="text-green-600">-₹{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Shipping Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h3>
                <p className="text-gray-600">{order.paymentMethod}</p>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="text-gray-600 text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <div className="flex items-center mt-2">
                    <Phone className="h-4 w-4 mr-1" />
                    {order.shippingAddress.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support & Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help with any questions about your order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:lunarz.info@gmail.com"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
              <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
          {state.user && (
            <Link
              href="/profile"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View All Orders
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your order details...</p>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThankYouContent />
    </Suspense>
  );
}