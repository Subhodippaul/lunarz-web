"use client";
import { useEffect, useState } from "react";
import { CreditCard, Banknote, ArrowLeft, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface PaymentConfirmationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeMethod: () => void;
  onProceed: () => void;
  currentPaymentMethod: string;
  totalAmount: number;
  isProcessing: boolean;
}

function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isDesktop;
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
  const isDesktop = useIsDesktop();

  const PaymentIcon = currentPaymentMethod === "cod" ? Banknote : CreditCard;
  const paymentMethodDisplay =
    currentPaymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={isDesktop ? "w-full sm:max-w-md" : "rounded-t-2xl max-h-[90vh]"}
      >
        <SheetHeader>
          <SheetTitle>Confirm Payment</SheetTitle>
        </SheetHeader>

        <div className="px-6 py-6 overflow-y-auto">
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
            <Button
              variant="outline"
              onClick={onChangeMethod}
              disabled={isProcessing}
              className="w-full rounded-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Change Payment Method
            </Button>

            <Button
              onClick={onProceed}
              disabled={isProcessing}
              className={`w-full rounded-full gap-2 text-white ${
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
            </Button>
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
      </SheetContent>
    </Sheet>
  );
}