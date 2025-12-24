"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { CHECKOUT, CURRENCY, NAV_LINKS, AUTH } from "@/lib/constants";

export default function CheckoutPage() {
  const { state } = useCart();
  const { state: authState } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

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

  // Redirect to cart if empty
  if (state.items.length === 0) {
    router.push(NAV_LINKS.cart);
    return null;
  }

  // Show loading while checking auth
  if (authState.isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!authState.isAuthenticated) {
    return null;
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addToast({
      title: "Order placed successfully!",
      description: "Your order has been confirmed and will be processed soon.",
      duration: 5000,
    });
    
    setIsProcessing(false);
    router.push("/");
  };

  const tax = Math.round(state.total * 0.18); // 18% GST
  const finalTotal = state.total + tax;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">{CHECKOUT.pageTitle}</h1>
      
      {/* Security Alert */}
      <Alert variant="info" className="mb-6">
        <AlertIcon variant="info" />
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
                <div>
                  <Label htmlFor="firstName">{CHECKOUT.firstName}</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">{CHECKOUT.lastName}</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{CHECKOUT.email}</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">{CHECKOUT.phone}</Label>
                <Input id="phone" placeholder="+91 9876543210" />
              </div>
              <div>
                <Label htmlFor="address">{CHECKOUT.address}</Label>
                <Input id="address" placeholder="123 Main Street" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">{CHECKOUT.city}</Label>
                  <Input id="city" placeholder="Mumbai" />
                </div>
                <div>
                  <Label htmlFor="state">{CHECKOUT.state}</Label>
                  <Input id="state" placeholder="Maharashtra" />
                </div>
                <div>
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
          <Card>
            <CardHeader>
              <CardTitle>{CHECKOUT.paymentMethod}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "creditCard", label: CHECKOUT.creditCard },
                  { id: "debitCard", label: CHECKOUT.debitCard },
                  { id: "upi", label: CHECKOUT.upi },
                  { id: "cod", label: CHECKOUT.cod },
                ].map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="rounded"
                    />
                    <Label htmlFor={method.id}>{method.label}</Label>
                  </div>
                ))}
              </div>

              {(paymentMethod === "creditCard" || paymentMethod === "debitCard") && (
                <div className="space-y-4 mt-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="cardNumber">{CHECKOUT.cardNumber}</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">{CHECKOUT.expiryDate}</Label>
                      <Input id="expiryDate" placeholder="12/25" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">{CHECKOUT.cvv}</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                    <div>
                      <Label htmlFor="cardholderName">{CHECKOUT.cardholderName}</Label>
                      <Input id="cardholderName" placeholder="John Doe" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="mt-4 p-4 border rounded-lg">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input id="upiId" placeholder="john@paytm" />
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
                  <span>{CURRENCY.symbol}{state.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{CHECKOUT.shipping}</span>
                  <span className="text-green-600">{CHECKOUT.free}</span>
                </div>
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
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? CHECKOUT.processingOrder : CHECKOUT.placeOrder}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}