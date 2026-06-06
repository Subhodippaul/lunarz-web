"use client";
import { useEffect, useState } from "react";
import { X, CreditCard, Banknote, ArrowLeft, Loader2 } from "lucide-react";

interface PaymentConfirmationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeMethod: () => void;
  onProceed: () => void;
  currentPaymentMethod: string;
  totalAmount: number;
  isProcessing: boolean;
}

export default function PaymentConfirmationDrawer({
  isOpen,
  onClose,
  onChangeMethod,
  onProceed,
  currentPaymentMethod,
  totalAmount,
  isProcessing,
}: PaymentConfirmationDrawerProps) {
  // Controls whether the drawer is mounted in the DOM
  const [mounted, setMounted] = useState(false);
  // Controls the visible/hidden CSS state (drives the slide animation)
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mount first, then on the next frame flip visible to trigger the slide-up
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      // Slide down first, then unmount after the transition ends
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const PaymentIcon = currentPaymentMethod === "cod" ? Banknote : CreditCard;
  const paymentMethodDisplay =
    currentPaymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer — slides up from bottom */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 transition-transform duration-350 ease-out shadow-2xl ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ transitionDuration: "350ms" }}
      >
        <div className="max-w-md mx-auto">
          {/* Drag handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Payment</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Payment Method */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    currentPaymentMethod === "cod"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <PaymentIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Selected Payment Method</p>
                  <p className="text-sm text-gray-600">{paymentMethodDisplay}</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <p className="text-gray-700 mb-2">
                {currentPaymentMethod === "cod"
                  ? "Your order will be placed and you can pay when it arrives."
                  : "You will be redirected to the payment gateway to complete your purchase."}
              </p>
              <p className="text-sm text-gray-500">Want to change your payment method?</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onChangeMethod}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                Change Payment Method
              </button>

              <button
                onClick={onProceed}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentPaymentMethod === "cod"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PaymentIcon className="h-4 w-4" />
                )}
                {isProcessing
                  ? "Processing..."
                  : currentPaymentMethod === "cod"
                  ? "Confirm Order (COD)"
                  : "Proceed to Payment"}
              </button>
            </div>

            {/* Security note */}
            {currentPaymentMethod === "online" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 text-center">
                  🔒 Your payment is secured with 256-bit SSL encryption
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
