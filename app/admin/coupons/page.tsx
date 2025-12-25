"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, BarChart3 } from "lucide-react";
import { getAllCoupons, deleteCoupon, type Coupon } from "@/lib/coupon-services";
import { useToast } from "@/components/ui/toast";
import CouponModal from "@/components/admin/coupon-modal";
import CouponStatsModal from "@/components/admin/coupon-stats-modal";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const fetchedCoupons = await getAllCoupons();
      setCoupons(fetchedCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to fetch coupons"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await deleteCoupon(id);
      setCoupons(coupons.filter(coupon => coupon.id !== id));
      addToast({
        type: "success",
        title: "Success",
        description: "Coupon deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to delete coupon"
      });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleViewStats = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsStatsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
    fetchCoupons();
  };

  const handleStatsModalClose = () => {
    setIsStatsModalOpen(false);
    setSelectedCoupon(null);
  };

  const getCouponTypeLabel = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed':
        return `₹${coupon.value} OFF`;
      case 'buy_x_get_y':
        return `Buy ${coupon.buyQuantity} Get ${coupon.getQuantity}`;
      default:
        return 'Unknown';
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    if (!coupon.isActive) return { label: 'Inactive', color: 'bg-gray-500' };
    if (now < coupon.validFrom) return { label: 'Scheduled', color: 'bg-blue-500' };
    if (now > coupon.validTo) return { label: 'Expired', color: 'bg-red-500' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { label: 'Used Up', color: 'bg-orange-500' };
    }
    return { label: 'Active', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Coupons & Discounts</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupons & Discounts</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No coupons found</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Coupon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const status = getCouponStatus(coupon);
            return (
              <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-blue-600">
                        {coupon.code}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{coupon.name}</p>
                    </div>
                    <Badge className={`${status.color} text-white`}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-600">
                      {getCouponTypeLabel(coupon)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Used: {coupon.usedCount}
                      {coupon.usageLimit && `/${coupon.usageLimit}`}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Valid: {coupon.validFrom.toLocaleDateString()} - {coupon.validTo.toLocaleDateString()}</p>
                    {coupon.minOrderAmount && (
                      <p>Min Order: ₹{coupon.minOrderAmount}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewStats(coupon)}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(coupon.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <CouponModal
          coupon={selectedCoupon}
          onClose={handleModalClose}
        />
      )}

      {isStatsModalOpen && selectedCoupon && (
        <CouponStatsModal
          coupon={selectedCoupon}
          onClose={handleStatsModalClose}
        />
      )}
    </div>
  );
}