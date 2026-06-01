"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineLoader } from "@/components/ui/loader";
import PaymentConfirmationDrawer from "@/components/payment-confirmation-drawer";
import { useCart } from "@/lib/cart-context";
import { useCoupon } from "@/lib/coupon-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { getShippingSettings, calculateShippingCost, type ShippingSettings } from "@/lib/shipping-services";
import { RazorpayService, RazorpayResponse } from "@/lib/razorpay-service";
import { EmailService, OrderEmailData } from "@/lib/email-service";
import { GoogleDriveService } from "@/lib/google-drive-service";
import { AUTH, NAV_LINKS, CHECKOUT, CURRENCY } from "@/lib/constants";

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const { state: couponState } = useCoupon();
  const { state: authState } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);

  // Load shipping settings
  useEffect(() => {
    const loadShippingSettings = async () => {
      try {
        const settings = await getShippingSettings();
        setShippingSettings(settings);
      } catch (error) {
        console.error("Error loading shipping settings:", error);
      }
    };
    loadShippingSettings();
  }, []);

  // Check authentication
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      addToast({
        title: "Login required",
        description: AUTH.loginRequiredCheckout,
        duration: 5000,
      });
      router.push(NAV_LINKS.login);
      return;
    }
  }, [authState.isLoading, authState.isAuthenticated, router, addToast]);

  // Redirect to cart if empty (but not if order was just completed)
  if (state.items.length === 0 && !orderCompleted) {
    router.push(NAV_LINKS.cart);
    return null;
  }

  // Show loading while checking auth or processing order completion
  if (authState.isLoading || orderCompleted) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
      <InlineLoader 
        text={orderCompleted ? "Redirecting to order confirmation..." : "Loading..."} 
        size="md" 
      />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!authState.isAuthenticated) {
    return null;
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Validate form data (you might want to add proper form validation)
      const billingAddress = {
        type: 'billing' as const,
        fullName: `${(document.getElementById('firstName') as HTMLInputElement)?.value || ''} ${(document.getElementById('lastName') as HTMLInputElement)?.value || ''}`.trim(),
        phone: (document.getElementById('phone') as HTMLInputElement)?.value || '',
        addressLine1: (document.getElementById('address') as HTMLInputElement)?.value || '',
        city: (document.getElementById('city') as HTMLInputElement)?.value || '',
        state: (document.getElementById('state') as HTMLInputElement)?.value || '',
        pincode: (document.getElementById('pincode') as HTMLInputElement)?.value || '',
        country: 'India',
      };

      // Use billing address for shipping if same as billing is checked
      const shippingAddress = sameAsBilling ? billingAddress : {
        type: 'shipping' as const,
        fullName: `${(document.getElementById('shippingFirstName') as HTMLInputElement)?.value || ''} ${(document.getElementById('shippingLastName') as HTMLInputElement)?.value || ''}`.trim(),
        phone: billingAddress.phone, // Use billing phone for shipping
        addressLine1: (document.getElementById('shippingAddress') as HTMLInputElement)?.value || '',
        city: (document.getElementById('shippingCity') as HTMLInputElement)?.value || '',
        state: (document.getElementById('shippingState') as HTMLInputElement)?.value || '',
        pincode: (document.getElementById('shippingPincode') as HTMLInputElement)?.value || '',
        country: 'India',
      };

      // Validate required fields
      if (!billingAddress.fullName || !billingAddress.phone || !billingAddress.addressLine1 || 
          !billingAddress.city || !billingAddress.state || !billingAddress.pincode) {
        addToast({
          type: "error",
          title: "Missing Information",
          description: "Please fill in all required billing address fields."
        });
        setIsProcessing(false);
        return;
      }

      // Create order data
      const orderData = {
        orderNumber: `LNZ${Date.now().toString().slice(-6)}`,
        userId: authState.user?.id || '',
        customerEmail: (document.getElementById('email') as HTMLInputElement)?.value || authState.user?.email || '',
        items: state.items,
        subtotal: subtotal,
        discountAmount: discountAmount,
        shippingCost: shippingCost,
        total: finalTotal,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod as 'cod' | 'online',
        couponCode: couponState.appliedCoupon?.code,
        status: 'pending' as const,
      };

      // Import OrderService dynamically to avoid circular dependencies
      const { OrderService } = await import('@/lib/order-services');

      if (paymentMethod === 'cod') {
        // Handle COD order
        const orderId = await OrderService.createOrder({
          userId: authState.user?.id || '',
          items: state.items,
          totalAmount: finalTotal,
          shippingAddress: shippingAddress,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
        });
        
        // Send email notifications
        await sendOrderEmails(orderData, orderId);
        
        // Upload custom designs to Google Drive
        await uploadCustomDesigns(orderData, orderId);
        
        // Create Shiprocket order
        await createShiprocketOrder(orderData, orderId);
        
        addToast({
          type: "success",
          title: "Order placed successfully!",
          description: "Your order has been confirmed and will be processed soon."
        });
        
        // Mark order as completed to prevent cart redirect
        setOrderCompleted(true);
        
        // Clear cart after successful order
        dispatch({ type: "CLEAR_CART" });
        
        // Redirect to thank you page with order ID
        router.replace(`/thank-you?orderId=${orderId}`);
      } else {
        // Handle online payment with Razorpay
        try {
          // Create Razorpay order
          const razorpayOrder = await RazorpayService.createOrder(finalTotal, 'INR', orderData.orderNumber);
          
          // Prepare payment options
          const paymentOptions = {
            amount: finalTotal * 100, // Amount in paise
            currency: 'INR',
            name: 'Lunarz',
            description: `Payment for Order #${orderData.orderNumber}`,
            order_id: razorpayOrder.id,
            handler: async (response: RazorpayResponse) => {
              try {
                // Verify payment
                const isVerified = await RazorpayService.verifyPayment(
                  response.razorpay_order_id,
                  response.razorpay_payment_id,
                  response.razorpay_signature
                );

                if (isVerified) {
                  // Create order in database
                  const orderId = await OrderService.createOrder({
                    userId: authState.user?.id || '',
                    items: state.items,
                    totalAmount: finalTotal,
                    shippingAddress: shippingAddress,
                    paymentMethod: 'online',
                    paymentStatus: 'paid',
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                  });
                  
                  // Send email notifications
                  await sendOrderEmails(orderData, orderId);
                  
                  // Upload custom designs to Google Drive
                  await uploadCustomDesigns(orderData, orderId);
                  
                  // Create Shiprocket order
                  await createShiprocketOrder(orderData, orderId);
                  
                  addToast({
                    type: "success",
                    title: "Payment successful!",
                    description: "Your order has been confirmed and will be processed soon."
                  });
                  
                  // Mark order as completed to prevent cart redirect
                  setOrderCompleted(true);
                  
                  // Clear cart after successful order
                  dispatch({ type: "CLEAR_CART" });
                  
                  // Redirect to thank you page with order ID
                  router.replace(`/thank-you?orderId=${orderId}`);
                } else {
                  throw new Error('Payment verification failed');
                }
              } catch (error: any) {
                console.error('Payment verification error:', error);
                addToast({
                  type: "error",
                  title: "Payment verification failed",
                  description: "Please contact support if amount was deducted."
                });
              } finally {
                setIsProcessing(false);
              }
            },
            prefill: {
              name: billingAddress.fullName,
              email: orderData.customerEmail,
              contact: billingAddress.phone,
            },
            notes: {
              address: billingAddress.addressLine1,
            },
            theme: {
              color: '#ef4444', // Red theme to match site
            },
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
                addToast({
                  type: "error",
                  title: "Payment cancelled",
                  description: "You cancelled the payment process."
                });
              },
            },
          };

          // Initiate Razorpay payment
          await RazorpayService.initiatePayment(paymentOptions);
          
        } catch (error: any) {
          console.error('Razorpay error:', error);
          addToast({
            type: "error",
            title: "Payment Failed",
            description: error.message || "Failed to initiate payment. Please try again."
          });
          setIsProcessing(false);
        }
      }
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      addToast({
        type: "error",
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again."
      });
      setIsProcessing(false);
    }
  };

  // Email notification helper function
  const sendOrderEmails = async (orderData: any, orderId: string) => {
    try {
      const emailData: OrderEmailData = {
        orderId: orderId,
        customerEmail: orderData.customerEmail || '',
        customerName: orderData.shippingAddress?.fullName || 'Customer',
        items: (orderData.items || []).map((item: any) => ({
          name: item.name || 'Unknown Item',
          quantity: item.quantity || 0,
          price: item.price || 0,
          image: item.image || item.images?.[0] || ''
        })),
        totalAmount: orderData.total || 0,
        shippingAddress: {
          fullName: orderData.shippingAddress?.fullName || '',
          address: orderData.shippingAddress?.addressLine1 || '',
          city: orderData.shippingAddress?.city || '',
          state: orderData.shippingAddress?.state || '',
          pincode: orderData.shippingAddress?.pincode || '',
          phone: orderData.shippingAddress?.phone || ''
        },
        paymentMethod: orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        orderDate: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Send emails (these will run in background)
      EmailService.sendOrderConfirmationToCustomer(emailData);
      EmailService.sendOrderNotificationToAdmin(emailData);
    } catch (error) {
      console.error('Error sending emails:', error);
      // Don't fail the order if email fails
    }
  };

  // Upload custom design images to Google Drive
  const uploadCustomDesigns = async (orderData: any, orderId: string) => {
    try {
      const customItems = orderData.items.filter((item: any) => item.isCustom && item.customDesign?.image);
      
      if (customItems.length === 0) {
        return; // No custom items to upload
      }

      console.log(`📤 Uploading ${customItems.length} custom design(s) for order ${orderId}`);

      for (let i = 0; i < customItems.length; i++) {
        const item = customItems[i];
        const fileName = GoogleDriveService.generateFileName(
          `${orderId}-item-${i + 1}`,
          orderData.customerEmail
        );

        await GoogleDriveService.uploadCustomDesign({
          orderId: orderId,
          customerEmail: orderData.customerEmail,
          designImage: item.customDesign.image,
          fileName: fileName
        });
      }

      console.log('✅ All custom designs uploaded successfully');
    } catch (error) {
      console.error('❌ Error uploading custom designs:', error);
      // Don't fail the order if upload fails
    }
  };

  // Create Shiprocket order
  const createShiprocketOrder = async (orderData: any, orderId: string) => {
    try {
      console.log(`📦 Creating Shiprocket order for ${orderId}`);

      // Format order data for Shiprocket API
      const shiprocketOrderData = {
        id: orderId,
        createdAt: new Date().toISOString(),
        customerInfo: {
          firstName: orderData.shippingAddress.fullName.split(' ')[0],
          lastName: orderData.shippingAddress.fullName.split(' ').slice(1).join(' '),
          email: orderData.customerEmail,
          phone: orderData.shippingAddress.phone,
        },
        shippingAddress: {
          address: orderData.shippingAddress.addressLine1,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          pincode: orderData.shippingAddress.pincode,
          country: orderData.shippingAddress.country || 'India',
        },
        items: orderData.items.map((item: any) => ({
          product: {
            id: item.id,
            name: item.name || item.product?.name || 'Product',
            price: item.price || item.product?.price || 0,
            sku: item.sku || item.product?.sku || item.id,
          },
          quantity: item.quantity || 1,
        })),
        totalAmount: orderData.total,
        paymentMethod: orderData.paymentMethod.toUpperCase(),
        shippingCharges: orderData.shippingCost || 0,
        discount: orderData.discountAmount || 0,
      };

      // Create order via API route
      const response = await fetch('/api/shiprocket/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiprocketOrderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.message || 'Failed to create Shiprocket order');
      }

      console.log('✅ Shiprocket order created successfully:', result.data);

      // You might want to store the Shiprocket order ID and shipment ID in your database
      // for future reference and tracking
      
    } catch (error) {
      console.error('❌ Error creating Shiprocket order:', error);
      
      // Show warning to user but don't fail the main order
      addToast({
        type: "warning",
        title: "Shipping Integration Warning",
        description: "Order placed successfully, but shipping integration failed. We'll process your order manually."
      });
    }
  };

  // Payment drawer handlers
  const handlePayNowClick = () => {
    setShowPaymentDrawer(true);
  };

  const handleChangePaymentMethod = () => {
    setShowPaymentDrawer(false);
    // Scroll to payment method section
    const paymentSection = document.getElementById('payment-method-section');
    if (paymentSection) {
      paymentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProceedWithPayment = () => {
    setShowPaymentDrawer(false);
    handlePlaceOrder();
  };

  // Calculate totals with coupon and shipping
  const subtotal = state.total;
  const discountAmount = couponState.discountCalculation?.discountAmount || 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Calculate shipping cost based on payment method and settings
  const shippingCost = shippingSettings 
    ? calculateShippingCost(subtotalAfterDiscount, paymentMethod, shippingSettings)
    : 0;
  
  const tax = Math.round(subtotalAfterDiscount * 0.18); // 18% GST
  const finalTotal = subtotalAfterDiscount + shippingCost + tax;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">{CHECKOUT.pageTitle}</h1>
      
      {/* Security Alert */}
      <Alert variant="info" className="mb-6 flex items-start space-x-2">
        <AlertIcon variant="info"/>
        <AlertDescription>
          Your payment information is secure and encrypted. We never store your full card details.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>{CHECKOUT.billingAddress}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="firstName">{CHECKOUT.firstName}</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="lastName">{CHECKOUT.lastName}</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">{CHECKOUT.email}</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="phone">{CHECKOUT.phone}</Label>
                <Input id="phone" placeholder="+91 9876543210" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="address">{CHECKOUT.address}</Label>
                <Input id="address" placeholder="123 Main Street" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="city">{CHECKOUT.city}</Label>
                  <Input id="city" placeholder="Mumbai" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="state">{CHECKOUT.state}</Label>
                  <Input id="state" placeholder="Maharashtra" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="pincode">{CHECKOUT.pincode}</Label>
                  <Input id="pincode" placeholder="400001" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>{CHECKOUT.shippingAddress}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="sameAsBilling"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="sameAsBilling">{CHECKOUT.sameAsBilling}</Label>
              </div>
              {!sameAsBilling && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingFirstName">{CHECKOUT.firstName}</Label>
                      <Input id="shippingFirstName" placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="shippingLastName">{CHECKOUT.lastName}</Label>
                      <Input id="shippingLastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shippingAddress">{CHECKOUT.address}</Label>
                    <Input id="shippingAddress" placeholder="123 Main Street" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">{CHECKOUT.city}</Label>
                      <Input id="shippingCity" placeholder="Mumbai" />
                    </div>
                    <div>
                      <Label htmlFor="shippingState">{CHECKOUT.state}</Label>
                      <Input id="shippingState" placeholder="Maharashtra" />
                    </div>
                    <div>
                      <Label htmlFor="shippingPincode">{CHECKOUT.pincode}</Label>
                      <Input id="shippingPincode" placeholder="400001" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card id="payment-method-section">
            <CardHeader>
              <CardTitle>{CHECKOUT.paymentMethod}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Online Payment */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="online"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <Label htmlFor="online" className="text-base font-medium">
                        💳 Online Payment
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay using Credit Card, Debit Card, UPI, Net Banking, Wallets
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Secure</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Instant</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <Label htmlFor="cod" className="text-base font-medium">
                        💵 Cash on Delivery
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay when your order is delivered to your doorstep
                      </p>
                      {paymentMethod === "cod" && shippingSettings && (
                        <div className="mt-2">
                          {finalTotal < shippingSettings.freeShippingThreshold ? (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              ₹{shippingSettings.codShippingCharge} shipping charge applies
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Free shipping
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Security Info */}
              {paymentMethod === "online" && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5">🔒</div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Secure Payment</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your payment information is encrypted and secure. We use Razorpay's secure payment gateway.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{CHECKOUT.orderSummary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.selectedSize} {item.selectedVariant && `• ${item.selectedVariant}`} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {CURRENCY.symbol}{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>{CHECKOUT.subtotal}</span>
                  <span>{CURRENCY.symbol}{subtotal.toLocaleString()}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({couponState.appliedCoupon?.code})</span>
                    <span>-{CURRENCY.symbol}{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>{CHECKOUT.shipping}</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">{CHECKOUT.free}</span>
                  ) : (
                    <span>{CURRENCY.symbol}{shippingCost.toLocaleString()}</span>
                  )}
                </div>
                
                {paymentMethod === 'cod' && shippingCost > 0 && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    COD orders below ₹{shippingSettings?.freeShippingThreshold} have ₹{shippingSettings?.codShippingCharge} shipping charge
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>{CHECKOUT.tax} (18%)</span>
                  <span>{CURRENCY.symbol}{tax.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{CHECKOUT.total}</span>
                    <span>{CURRENCY.symbol}{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={handlePayNowClick}
                disabled={isProcessing}
              >
                {isProcessing 
                  ? CHECKOUT.processingOrder 
                  : paymentMethod === 'cod' 
                    ? 'Place Order (COD)' 
                    : 'Pay Now'
                }
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Confirmation Drawer */}
      <PaymentConfirmationDrawer
        isOpen={showPaymentDrawer}
        onClose={() => setShowPaymentDrawer(false)}
        onChangeMethod={handleChangePaymentMethod}
        onProceed={handleProceedWithPayment}
        currentPaymentMethod={paymentMethod}
        totalAmount={finalTotal}
        isProcessing={isProcessing}
      />
    </div>
  );
}