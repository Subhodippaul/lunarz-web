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
import { AddressService, Address as SupabaseAddress } from "@/lib/supabase-services";
import { MapPin, Plus, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const emptyForm = (): AddressForm => ({
  firstName: "", lastName: "", email: "",
  phone: "", address: "", city: "", state: "", pincode: "",
});

const SESSION_KEY = "lunarz_checkout_address";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function saveToSession(form: AddressForm) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(form)); } catch {}
}

function loadFromSession(): AddressForm | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

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

  // Controlled address form (persisted in sessionStorage)
  const [form, setForm] = useState<AddressForm>(emptyForm());

  // Saved addresses from DB
  const [savedAddresses, setSavedAddresses] = useState<SupabaseAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Load shipping settings
  useEffect(() => {
    getShippingSettings().then(s => setShippingSettings(s)).catch(() => {});
  }, []);

  // Check auth
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      addToast({ title: "Login required", description: AUTH.loginRequiredCheckout, duration: 5000 });
      router.push(NAV_LINKS.login);
    }
  }, [authState.isLoading, authState.isAuthenticated, router, addToast]);

  // Restore form from sessionStorage + load saved addresses
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user) return;

    const saved = loadFromSession();
    if (saved) setForm(saved);

    AddressService.getUserAddresses(authState.user.id).then(addrs => {
      setSavedAddresses(addrs);
      // Auto-select default address if no session data
      if (!saved && addrs.length > 0) {
        const def = addrs.find(a => a.is_default) ?? addrs[0];
        setSelectedAddressId(def.id ?? null);
      } else if (saved) {
        // User had a session — show new form with pre-filled data
        setShowNewForm(true);
      } else {
        setShowNewForm(addrs.length === 0);
      }
    }).catch(() => setShowNewForm(true));
  }, [authState.isAuthenticated, authState.user?.id]);

  // Persist form to sessionStorage on every change
  useEffect(() => {
    if (showNewForm) saveToSession(form);
  }, [form, showNewForm]);

  if (state.items.length === 0 && !orderCompleted) {
    router.push(NAV_LINKS.cart);
    return null;
  }

  if (authState.isLoading || orderCompleted) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <InlineLoader text={orderCompleted ? "Redirecting..." : "Loading..."} size="md" />
      </div>
    );
  }

  if (!authState.isAuthenticated) return null;

  // Resolve active address for order
  const getActiveAddress = () => {
    if (!showNewForm && selectedAddressId) {
      const saved = savedAddresses.find(a => a.id === selectedAddressId);
      if (saved) {
        return {
          type: "shipping" as const,
          fullName: saved.name,
          phone: saved.phone,
          addressLine1: saved.address_line1,
          city: saved.city,
          state: saved.state,
          pincode: saved.pincode,
          country: "India",
        };
      }
    }
    return {
      type: "billing" as const,
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      phone: form.phone,
      addressLine1: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: "India",
    };
  };

  const validateForm = () => {
    if (!showNewForm && selectedAddressId) return true;
    return !!(form.firstName && form.lastName && form.phone &&
              form.address && form.city && form.state && form.pincode);
  };

  // Totals
  const subtotal = state.total;
  const discountAmount = couponState.discountCalculation?.discountAmount || 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shippingCost = shippingSettings
    ? calculateShippingCost(subtotalAfterDiscount, paymentMethod, shippingSettings) : 0;
  const tax = Math.round(subtotalAfterDiscount * 0.18);
  const finalTotal = subtotalAfterDiscount + shippingCost + tax;

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      addToast({ type: "error", title: "Missing Information", description: "Please fill in all required address fields." });
      return;
    }

    setIsProcessing(true);
    try {
      const billingAddress = getActiveAddress();
      const shippingAddress = sameAsBilling ? billingAddress : billingAddress;

      const orderData = {
        orderNumber: `LNZ${Date.now().toString().slice(-6)}`,
        userId: authState.user?.id || "",
        customerEmail: form.email || authState.user?.email || "",
        items: state.items,
        subtotal,
        discountAmount,
        shippingCost,
        total: finalTotal,
        shippingAddress,
        paymentMethod: paymentMethod as "cod" | "online",
        couponCode: couponState.appliedCoupon?.code,
        status: "pending" as const,
      };

      const { OrderService } = await import("@/lib/order-services");

      // Save address to profile after successful order (non-blocking)
      const saveAddressToProfile = async (orderId: string) => {
        if (!authState.user) return;
        try {
          await AddressService.createAddress({
            user_id: authState.user.id,
            name: billingAddress.fullName,
            phone: billingAddress.phone,
            address_line1: billingAddress.addressLine1,
            city: billingAddress.city,
            state: billingAddress.state,
            pincode: billingAddress.pincode,
            type: "home",
            is_default: savedAddresses.length === 0,
          });
        } catch { /* non-fatal */ }
      };

      if (paymentMethod === "cod") {
        const orderId = await OrderService.createOrder({
          userId: authState.user?.id || "",
          items: state.items,
          totalAmount: finalTotal,
          shippingAddress,
          paymentMethod: "cod",
          paymentStatus: "pending",
        });

        if (showNewForm) await saveAddressToProfile(orderId);
        await sendOrderEmails(orderData, orderId);
        await uploadCustomDesigns(orderData, orderId);
        await createShiprocketOrder(orderData, orderId);

        clearSession();
        setOrderCompleted(true);
        dispatch({ type: "CLEAR_CART" });
        addToast({ type: "success", title: "Order placed!", description: "Your order has been confirmed." });
        router.replace(`/thank-you?orderId=${orderId}`);
      } else {
        const razorpayOrder = await RazorpayService.createOrder(finalTotal, "INR", orderData.orderNumber);
        const paymentOptions = {
          amount: finalTotal * 100,
          currency: "INR",
          name: "Lunarz",
          description: `Order #${orderData.orderNumber}`,
          order_id: razorpayOrder.id,
          handler: async (response: RazorpayResponse) => {
            try {
              const isVerified = await RazorpayService.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              if (!isVerified) throw new Error("Payment verification failed");

              const orderId = await OrderService.createOrder({
                userId: authState.user?.id || "",
                items: state.items,
                totalAmount: finalTotal,
                shippingAddress,
                paymentMethod: "online",
                paymentStatus: "paid",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              });

              if (showNewForm) await saveAddressToProfile(orderId);
              await sendOrderEmails(orderData, orderId);
              await uploadCustomDesigns(orderData, orderId);
              await createShiprocketOrder(orderData, orderId);

              clearSession();
              setOrderCompleted(true);
              dispatch({ type: "CLEAR_CART" });
              addToast({ type: "success", title: "Payment successful!", description: "Your order has been confirmed." });
              router.replace(`/thank-you?orderId=${orderId}`);
            } catch (err: any) {
              addToast({ type: "error", title: "Payment verification failed", description: err.message });
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: { name: billingAddress.fullName, email: orderData.customerEmail, contact: billingAddress.phone },
          theme: { color: "#ef4444" },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              addToast({ type: "error", title: "Payment cancelled", description: "You cancelled the payment." });
            },
          },
        };
        await RazorpayService.initiatePayment(paymentOptions);
      }
    } catch (err: any) {
      addToast({ type: "error", title: "Order Failed", description: err.message || "Failed to place order." });
      setIsProcessing(false);
    }
  };

  // ─── Email / Drive / Shiprocket helpers (unchanged) ──────────────────────

  const sendOrderEmails = async (orderData: any, orderId: string) => {
    try {
      const emailData: OrderEmailData = {
        orderId,
        customerEmail: orderData.customerEmail || "",
        customerName: orderData.shippingAddress?.fullName || "Customer",
        items: (orderData.items || []).map((item: any) => ({
          name: item.name || "Unknown Item",
          quantity: item.quantity || 0,
          price: item.price || 0,
          image: item.image || item.images?.[0] || "",
        })),
        totalAmount: orderData.total || 0,
        shippingAddress: {
          fullName: orderData.shippingAddress?.fullName || "",
          address: orderData.shippingAddress?.addressLine1 || "",
          city: orderData.shippingAddress?.city || "",
          state: orderData.shippingAddress?.state || "",
          pincode: orderData.shippingAddress?.pincode || "",
          phone: orderData.shippingAddress?.phone || "",
        },
        paymentMethod: orderData.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
        orderDate: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
      };
      EmailService.sendOrderConfirmationToCustomer(emailData);
      EmailService.sendOrderNotificationToAdmin(emailData);
    } catch {}
  };

  const uploadCustomDesigns = async (orderData: any, orderId: string) => {
    try {
      const customItems = orderData.items.filter((item: any) => item.isCustom && item.customDesign?.image);
      for (let i = 0; i < customItems.length; i++) {
        const item = customItems[i];
        const fileName = GoogleDriveService.generateFileName(`${orderId}-item-${i + 1}`, orderData.customerEmail);
        await GoogleDriveService.uploadCustomDesign({ orderId, customerEmail: orderData.customerEmail, designImage: item.customDesign.image, fileName });
      }
    } catch {}
  };

  const createShiprocketOrder = async (orderData: any, orderId: string) => {
    try {
      const response = await fetch("/api/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          createdAt: new Date().toISOString(),
          customerInfo: {
            firstName: orderData.shippingAddress.fullName.split(" ")[0],
            lastName: orderData.shippingAddress.fullName.split(" ").slice(1).join(" "),
            email: orderData.customerEmail,
            phone: orderData.shippingAddress.phone,
          },
          shippingAddress: {
            address: orderData.shippingAddress.addressLine1,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state,
            pincode: orderData.shippingAddress.pincode,
            country: "India",
          },
          items: orderData.items.map((item: any) => ({
            product: { id: item.id, name: item.name || item.product?.name || "Product", price: item.price || item.product?.price || 0, sku: item.sku || item.id },
            quantity: item.quantity || 1,
          })),
          totalAmount: orderData.total,
          paymentMethod: orderData.paymentMethod.toUpperCase(),
          shippingCharges: orderData.shippingCost || 0,
          discount: orderData.discountAmount || 0,
        }),
      });
      if (!response.ok) {
        addToast({ type: "warning", title: "Shipping Warning", description: "Order placed, but shipping integration failed." });
      }
    } catch {}
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const f = (field: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">{CHECKOUT.pageTitle}</h1>

      <Alert variant="info" className="mb-6 flex items-start space-x-2">
        <AlertIcon variant="info" />
        <AlertDescription>Your payment information is secure and encrypted.</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Delivery Address ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="space-y-3">
                  {savedAddresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => { setSelectedAddressId(addr.id ?? null); setShowNewForm(false); }}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        !showNewForm && selectedAddressId === addr.id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {!showNewForm && selectedAddressId === addr.id && (
                        <Check className="absolute top-3 right-3 w-5 h-5 text-red-500" />
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {addr.type || "home"}
                        </span>
                        {addr.is_default && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900">{addr.name}</p>
                      <p className="text-sm text-gray-600">{addr.phone}</p>
                      <p className="text-sm text-gray-600">
                        {addr.address_line1}, {addr.city}, {addr.state} – {addr.pincode}
                      </p>
                    </div>
                  ))}

                  <button
                    onClick={() => { setShowNewForm(true); setSelectedAddressId(null); }}
                    className={`w-full border-2 border-dashed rounded-lg p-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      showNewForm ? "border-red-400 text-red-600 bg-red-50" : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Use a different address
                  </button>
                </div>
              )}

              {/* Address form — shown when no saved addresses or user picks new */}
              {(savedAddresses.length === 0 || showNewForm) && (
                <div className="space-y-4">
                  {savedAddresses.length > 0 && (
                    <p className="text-sm font-medium text-gray-700">Enter new address</p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">{CHECKOUT.firstName} *</Label>
                      <Input id="firstName" value={form.firstName} onChange={f("firstName")} placeholder="John" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">{CHECKOUT.lastName} *</Label>
                      <Input id="lastName" value={form.lastName} onChange={f("lastName")} placeholder="Doe" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{CHECKOUT.email}</Label>
                    <Input id="email" type="email" value={form.email} onChange={f("email")}
                      placeholder={authState.user?.email || "john@example.com"} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{CHECKOUT.phone} *</Label>
                    <Input id="phone" value={form.phone} onChange={f("phone")} placeholder="+91 9876543210" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">{CHECKOUT.address} *</Label>
                    <Input id="address" value={form.address} onChange={f("address")} placeholder="123 Main Street" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">{CHECKOUT.city} *</Label>
                      <Input id="city" value={form.city} onChange={f("city")} placeholder="Mumbai" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">{CHECKOUT.state} *</Label>
                      <Input id="state" value={form.state} onChange={f("state")} placeholder="Maharashtra" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pincode">{CHECKOUT.pincode} *</Label>
                      <Input id="pincode" value={form.pincode} onChange={f("pincode")} placeholder="400001" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Payment Method ── */}
          <Card id="payment-method-section">
            <CardHeader><CardTitle>{CHECKOUT.paymentMethod}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {/* Online */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <input type="radio" id="online" name="paymentMethod" value="online"
                    checked={paymentMethod === "online"} onChange={e => setPaymentMethod(e.target.value)} />
                  <div className="flex-1">
                    <Label htmlFor="online" className="text-base font-medium">💳 Online Payment</Label>
                    <p className="text-sm text-gray-600 mt-1">Credit Card, Debit Card, UPI, Net Banking</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Secure</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Instant</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* COD */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <input type="radio" id="cod" name="paymentMethod" value="cod"
                    checked={paymentMethod === "cod"} onChange={e => setPaymentMethod(e.target.value)} />
                  <div className="flex-1">
                    <Label htmlFor="cod" className="text-base font-medium">💵 Cash on Delivery</Label>
                    <p className="text-sm text-gray-600 mt-1">Pay when your order is delivered</p>
                    {paymentMethod === "cod" && shippingSettings && (
                      <div className="mt-2">
                        {finalTotal < shippingSettings.freeShippingThreshold ? (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            ₹{shippingSettings.codShippingCharge} shipping applies
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Free shipping</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {paymentMethod === "online" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                  <span className="text-blue-600">🔒</span>
                  <p className="text-xs text-blue-700">Payments encrypted via Razorpay's secure gateway.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader><CardTitle>{CHECKOUT.orderSummary}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {state.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.selectedSize}{item.selectedVariant && ` • ${item.selectedVariant}`} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{CURRENCY.symbol}{(item.product.price * item.quantity).toLocaleString()}</p>
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
                  {shippingCost === 0
                    ? <span className="text-green-600">{CHECKOUT.free}</span>
                    : <span>{CURRENCY.symbol}{shippingCost.toLocaleString()}</span>}
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
                onClick={() => setShowPaymentDrawer(true)}
                disabled={isProcessing}
              >
                {isProcessing
                  ? CHECKOUT.processingOrder
                  : paymentMethod === "cod" ? "Place Order (COD)" : "Pay Now"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentConfirmationDrawer
        isOpen={showPaymentDrawer}
        onClose={() => setShowPaymentDrawer(false)}
        onChangeMethod={() => { setShowPaymentDrawer(false); document.getElementById("payment-method-section")?.scrollIntoView({ behavior: "smooth" }); }}
        onProceed={() => { setShowPaymentDrawer(false); handlePlaceOrder(); }}
        currentPaymentMethod={paymentMethod}
        totalAmount={finalTotal}
        isProcessing={isProcessing}
      />
    </div>
  );
}
