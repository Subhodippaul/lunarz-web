"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { createCoupon, updateCoupon, type Coupon } from "@/lib/coupon-services";
import { useToast } from "@/components/ui/toast";

interface CouponModalProps {
  coupon?: Coupon | null;
  onClose: () => void;
}

export default function CouponModal({ coupon, onClose }: CouponModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed" | "buy_x_get_y",
    value: 0,
    buyQuantity: 1,
    getQuantity: 1,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: "",
    validTo: "",
    isActive: true,
    applicableProducts: [] as string[],
  });
  
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        buyQuantity: coupon.buyQuantity || 1,
        getQuantity: coupon.getQuantity || 1,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscount: coupon.maxDiscount || 0,
        usageLimit: coupon.usageLimit || 0,
        validFrom: coupon.validFrom.toISOString().split('T')[0],
        validTo: coupon.validTo.toISOString().split('T')[0],
        isActive: coupon.isActive,
        applicableProducts: coupon.applicableProducts || [],
      });
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const couponData: any = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        value: formData.value,
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        isActive: formData.isActive,
      };

      // Only add optional fields if they have values
      if (formData.minOrderAmount > 0) {
        couponData.minOrderAmount = formData.minOrderAmount;
      }
      
      if (formData.maxDiscount > 0) {
        couponData.maxDiscount = formData.maxDiscount;
      }
      
      if (formData.usageLimit > 0) {
        couponData.usageLimit = formData.usageLimit;
      }

      // Only add buy/get quantities for buy_x_get_y type
      if (formData.type === 'buy_x_get_y') {
        couponData.buyQuantity = formData.buyQuantity;
        couponData.getQuantity = formData.getQuantity;
      }

      // Only add applicable products if specified
      if (formData.applicableProducts.length > 0) {
        couponData.applicableProducts = formData.applicableProducts;
      }

      if (coupon?.id) {
        await updateCoupon(coupon.id, couponData);
        addToast({
          type: "success",
          title: "Success",
          description: "Coupon updated successfully"
        });
      } else {
        await createCoupon(couponData);
        addToast({
          type: "success",
          title: "Success",
          description: "Coupon created successfully"
        });
      }

      onClose();
    } catch (error) {
      console.error("Error saving coupon:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to save coupon"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                placeholder="SAVE20"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="20% Off Sale"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Get 20% off on all items"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Discount Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                  <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type !== 'buy_x_get_y' && (
              <div>
                <Label htmlFor="value">
                  {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", Number(e.target.value))}
                  min="0"
                  max={formData.type === 'percentage' ? "100" : undefined}
                  required
                />
              </div>
            )}
          </div>

          {formData.type === 'buy_x_get_y' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyQuantity">Buy Quantity</Label>
                <Input
                  id="buyQuantity"
                  type="number"
                  value={formData.buyQuantity}
                  onChange={(e) => handleInputChange("buyQuantity", Number(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="getQuantity">Get Quantity (Free)</Label>
                <Input
                  id="getQuantity"
                  type="number"
                  value={formData.getQuantity}
                  onChange={(e) => handleInputChange("getQuantity", Number(e.target.value))}
                  min="1"
                  required
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validFrom">Valid From *</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleInputChange("validFrom", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="validTo">Valid To *</Label>
              <Input
                id="validTo"
                type="date"
                value={formData.validTo}
                onChange={(e) => handleInputChange("validTo", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => handleInputChange("minOrderAmount", Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            {formData.type === 'percentage' && (
              <div>
                <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => handleInputChange("maxDiscount", Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="usageLimit">Usage Limit (0 = unlimited)</Label>
            <Input
              id="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={(e) => handleInputChange("usageLimit", Number(e.target.value))}
              min="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}