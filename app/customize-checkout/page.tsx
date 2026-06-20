"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineLoader } from "@/components/ui/loader";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { CHECKOUT, CURRENCY } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CustomizeCheckoutPage() {
  const { state, dispatch } = useCart();
  const { state: authState } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: authState.user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    shippingFirstName: "",
    shippingLastName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingPincode: "",
  });

  // Redirect to cart if empty
  useEffect(() => {
    if (state.items.length === 0) {
      router.push("/cart");
    }
  }, [state.items.length, router]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (state.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <InlineLoader text="Loading..." size="md" />
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        addToast({
          type: "error",
          title: "Missing Information",
          description: `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        });
        return false;
      }
    }

    if (!sameAsBilling) {
      const shippingRequired = [
        "shippingFirstName",
        "shippingLastName",
        "shippingAddress",
        "shippingCity",
        "shippingState",
        "shippingPincode",
      ];

      for (const field of shippingRequired) {
        if (!formData[field as keyof typeof formData]) {
          addToast({
            type: "error",
            title: "Missing Information",
            description: `Please fill in shipping ${field.replace("shipping", "").replace(/([A-Z])/g, " $1").toLowerCase()}`,
          });
          return false;
        }
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    const billingAddress = {
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      addressLine1: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: "India",
    };

    const shippingAddress = sameAsBilling
      ? billingAddress
      : {
          fullName: `${formData.shippingFirstName} ${formData.shippingLastName}`.trim(),
          phone: formData.phone,
          addressLine1: formData.shippingAddress,
          city: formData.shippingCity,
          state: formData.shippingState,
          pincode: formData.shippingPincode,
          country: "India",
        };

    const orderData = {
      customerName: billingAddress.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      items: state.items,
      subtotal: subtotal,
      discountAmount: 0,
      shippingCost: shippingCost,
      tax: tax,
      total: finalTotal,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      paymentMethod: paymentMethod,
    };

    try {
      if (paymentMethod === "cod") {
        // Process COD order
        const response = await fetch("/api/customize-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        const result = await response.json();

        if (result.success) {
          addToast({
            type: "success",
            title: "Order Placed Successfully!",
            description: `Order #${result.orderNumber} has been confirmed.`,
          });

          dispatch({ type: "CLEAR_CART" });
          router.push(`/order-success?orderNumber=${result.orderNumber}`);
        } else {
          throw new Error(result.error || "Failed to place order");
        }
      } else {
        // Process online payment with Razorpay
        const razorpayResponse = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            currency: "INR",
          }),
        });

        const razorpayOrder = await razorpayResponse.json();

        if (!razorpayOrder.id) {
          throw new Error("Failed to create Razorpay order");
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: finalTotal * 100,
          currency: "INR",
          name: "Lunarz",
          description: "Custom T-Shirt Order",
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyResult = await verifyResponse.json();

              if (verifyResult.success) {
                // Payment verified, create order
                const orderResponse = await fetch("/api/customize-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...orderData,
                    paymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                  }),
                });

                const orderResult = await orderResponse.json();

                if (orderResult.success) {
                  addToast({
                    type: "success",
                    title: "Payment Successful!",
                    description: `Order #${orderResult.orderNumber} has been confirmed.`,
                  });

                  dispatch({ type: "CLEAR_CART" });
                  router.push(`/order-success?orderNumber=${orderResult.orderNumber}`);
                } else {
                  throw new Error("Failed to create order after payment");
                }
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error: any) {
              console.error("Payment handler error:", error);
              addToast({
                type: "error",
                title: "Payment Processing Failed",
                description: error.message || "Please contact support if amount was deducted",
              });
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: billingAddress.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#ef4444",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              addToast({
                type: "error",
                title: "Payment Cancelled",
                description: "You cancelled the payment process",
              });
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error: any) {
      console.error("Order error:", error);
      addToast({
        type: "error",
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  // Calculate totals
  const subtotal = state.total;
  const shippingCost = subtotal >= 999 ? 0 : paymentMethod === "cod" ? 50 : 40;
  const tax = Math.round(subtotal * 0);
  const finalTotal = subtotal + shippingCost + tax;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout - Custom T-Shirt</h1>

      <Alert variant="info" className="mb-6 flex items-start space-x-2">
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
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter your state"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    placeholder="Enter your pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
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
                <Label htmlFor="sameAsBilling">Same as billing address</Label>
              </div>
              {!sameAsBilling && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingFirstName">First Name *</Label>
                      <Input
                        id="shippingFirstName"
                        value={formData.shippingFirstName}
                        onChange={(e) => handleInputChange("shippingFirstName", e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingLastName">Last Name *</Label>
                      <Input
                        id="shippingLastName"
                        value={formData.shippingLastName}
                        onChange={(e) => handleInputChange("shippingLastName", e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shippingAddress">Address *</Label>
                    <Input
                      id="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">City *</Label>
                      <Input
                        id="shippingCity"
                        value={formData.shippingCity}
                        onChange={(e) => handleInputChange("shippingCity", e.target.value)}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingState">State *</Label>
                      <Input
                        id="shippingState"
                        value={formData.shippingState}
                        onChange={(e) => handleInputChange("shippingState", e.target.value)}
                        placeholder="Enter your state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingPincode">Pincode *</Label>
                      <Input
                        id="shippingPincode"
                        value={formData.shippingPincode}
                        onChange={(e) => handleInputChange("shippingPincode", e.target.value)}
                        placeholder="Enter your pincode"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="online"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="online" className="text-base font-medium">
                        💳 Online Payment
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay using Credit Card, Debit Card, UPI, Net Banking, Wallets
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="cod" className="text-base font-medium">
                        💵 Cash on Delivery
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay when your order is delivered
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.selectedSize} • {item.selectedVariant} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {CURRENCY.symbol}
                      {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{CURRENCY.symbol}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <span>{CURRENCY.symbol}{shippingCost}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{CURRENCY.symbol}{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-red-500">
                    {CURRENCY.symbol}{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                loading={isProcessing}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                {isProcessing ? "Processing..." : `Place Order - ${CURRENCY.symbol}${finalTotal.toLocaleString()}`}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our terms and conditions
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
