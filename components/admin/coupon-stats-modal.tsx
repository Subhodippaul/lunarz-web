"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, TrendingUp, Users, DollarSign } from "lucide-react";
import { getCouponUsageStats, type Coupon, type CouponUsage } from "@/lib/coupon-services";

interface CouponStatsModalProps {
  coupon: Coupon;
  onClose: () => void;
}

export default function CouponStatsModal({ coupon, onClose }: CouponStatsModalProps) {
  const [stats, setStats] = useState<{
    totalUsage: number;
    totalDiscount: number;
    recentUsages: CouponUsage[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [coupon.id]);

  const fetchStats = async () => {
    if (!coupon.id) return;
    
    try {
      setLoading(true);
      const statsData = await getCouponUsageStats(coupon.id);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching coupon stats:", error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Coupon Statistics</h2>
            <p className="text-sm text-gray-600 mt-1">
              {coupon.code} - {coupon.name}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Coupon Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Coupon Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold">{getCouponTypeLabel(coupon)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold">
                      {coupon.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valid Period</p>
                    <p className="font-semibold text-xs">
                      {coupon.validFrom.toLocaleDateString()} - {coupon.validTo.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usage Limit</p>
                    <p className="font-semibold">
                      {coupon.usageLimit ? coupon.usageLimit.toLocaleString() : "Unlimited"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsage || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {coupon.usageLimit && (
                        `${((stats?.totalUsage || 0) / coupon.usageLimit * 100).toFixed(1)}% of limit`
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Discount Given</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{(stats?.totalDiscount || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg: ₹{stats?.totalUsage ? ((stats.totalDiscount / stats.totalUsage).toFixed(2)) : '0'} per use
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {coupon.usageLimit && stats?.totalUsage 
                        ? `${((stats.totalUsage / coupon.usageLimit) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Usage vs limit
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Usage */}
              {stats?.recentUsages && stats.recentUsages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentUsages.map((usage, index) => (
                        <div key={usage.id || index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">Order #{usage.orderId.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              User: {usage.userId.slice(-8)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              -₹{usage.discountAmount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {usage.usedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(!stats?.recentUsages || stats.recentUsages.length === 0) && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No usage data available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}