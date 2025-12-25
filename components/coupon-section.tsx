"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, X, Check, AlertCircle } from "lucide-react";
import { validateCoupon, calculateDiscount } from "@/lib/coupon-services";
import { useCoupon } from "@/lib/coupon-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { COUPONS } from "@/lib/constants";

interface CouponSectionProps {
  cartItems: Array<{
    id: number;
    product: { id: string; price: number; name: string };
    quantity: number;
  }>;
  subtotal: number;
}

export default function CouponSection({ cartItems, subtotal }: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState("");
  const { state: couponState, dispatch } = useCoupon();
  const { state: authState } = useAuth();
  const { addToast } = useToast();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      addToast({
        type: "error",
        title: "Error",
        description: COUPONS.enterCouponCode
      });
      return;
    }

    if (!authState.user?.id) {
      addToast({
        type: "error",
        title: "Error",
        description: COUPONS.loginToApplyCoupon
      });
      return;
    }

    dispatch({ type: 'SET_VALIDATING', payload: true });

    try {
      const coupon = await validateCoupon(couponCode, authState.user.id);
      
      if (!coupon) {
        dispatch({ type: 'SET_ERROR', payload: COUPONS.invalidCoupon });
        addToast({
          type: "error",
          title: "Invalid Coupon",
          description: COUPONS.invalidCoupon
        });
        return;
      }

      const calculation = calculateDiscount(cartItems, coupon, subtotal);
      
      if (calculation.discountAmount === 0) {
        dispatch({ type: 'SET_ERROR', payload: COUPONS.couponNotApplicable });
        addToast({
          type: "error",
          title: "Coupon Not Applicable",
          description: COUPONS.couponNotApplicable
        });
        return;
      }

      dispatch({ 
        type: 'SET_COUPON', 
        payload: { coupon, calculation } 
      });

      addToast({
        type: "success",
        title: COUPONS.couponApplied,
        description: `You saved ₹${calculation.discountAmount.toFixed(2)}`
      });

      setCouponCode("");
    } catch (error) {
      console.error("Error applying coupon:", error);
      dispatch({ type: 'SET_ERROR', payload: COUPONS.failedToApplyCoupon });
      addToast({
        type: "error",
        title: "Error",
        description: COUPONS.failedToApplyCoupon
      });
    }
  };

  const handleRemoveCoupon = () => {
    dispatch({ type: 'CLEAR_COUPON' });
    addToast({
      type: "success",
      title: COUPONS.couponRemoved,
      description: "Coupon has been removed from your cart"
    });
  };

  const getCouponTypeLabel = (coupon: any) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed':
        return `₹${coupon.value} OFF`;
      case 'buy_x_get_y':
        return `Buy ${coupon.buyQuantity} Get ${coupon.getQuantity}`;
      default:
        return 'DISCOUNT';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-4 h-4 text-blue-600" />
          <h3 className="font-medium">{COUPONS.couponCode}</h3>
        </div>

        {!couponState.appliedCoupon ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder={COUPONS.enterCouponCode}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                disabled={couponState.isValidating}
              />
              <Button 
                onClick={handleApplyCoupon}
                disabled={couponState.isValidating || !couponCode.trim()}
                className="whitespace-nowrap"
              >
                {couponState.isValidating ? "Applying..." : COUPONS.applyCoupon}
              </Button>
            </div>

            {couponState.error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{couponState.error}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-800">
                      {couponState.appliedCoupon.code}
                    </span>
                    <Badge className="bg-green-600 text-white text-xs">
                      {getCouponTypeLabel(couponState.appliedCoupon)}
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700">
                    {couponState.appliedCoupon.name}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemoveCoupon}
                className="text-green-700 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-right">
              <p className="text-green-600 font-semibold">
                {COUPONS.discount}: -₹{couponState.discountCalculation?.discountAmount.toFixed(2)}
              </p>
            </div>

            {/* Show free items for Buy X Get Y offers */}
            {couponState.discountCalculation?.freeItems && 
             couponState.discountCalculation.freeItems.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">{COUPONS.freeItems}</p>
                {couponState.discountCalculation.freeItems.map((freeItem, index) => {
                  const product = cartItems.find(item => item.product.id === freeItem.productId);
                  return (
                    <div key={index} className="text-sm text-blue-700">
                      {product?.product.name} x{freeItem.quantity}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}