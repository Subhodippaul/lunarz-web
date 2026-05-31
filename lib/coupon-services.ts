import { supabase } from './supabase';

export interface Coupon {
  id?: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number; // percentage (0-100) or fixed amount
  buyQuantity?: number; // for buy X get Y offers
  getQuantity?: number; // for buy X get Y offers
  minOrderAmount?: number;
  maxDiscount?: number; // max discount for percentage coupons
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableProducts?: string[]; // product IDs, empty means all products
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponUsage {
  id?: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: Date;
}

export interface DiscountCalculation {
  discountAmount: number;
  finalTotal: number;
  appliedCoupon?: Coupon;
  freeItems?: Array<{
    productId: string;
    quantity: number;
  }>;
}

// Admin functions
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: couponData.code,
        name: couponData.name,
        description: couponData.description,
        type: couponData.type,
        value: couponData.value,
        buy_quantity: couponData.buyQuantity,
        get_quantity: couponData.getQuantity,
        min_order_amount: couponData.minOrderAmount,
        max_discount: couponData.maxDiscount,
        usage_limit: couponData.usageLimit,
        used_count: 0,
        valid_from: couponData.validFrom.toISOString(),
        valid_to: couponData.validTo.toISOString(),
        is_active: couponData.isActive,
        applicable_products: couponData.applicableProducts || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

export const getAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      type: row.type,
      value: row.value,
      buyQuantity: row.buy_quantity,
      getQuantity: row.get_quantity,
      minOrderAmount: row.min_order_amount,
      maxDiscount: row.max_discount,
      usageLimit: row.usage_limit,
      usedCount: row.used_count,
      validFrom: new Date(row.valid_from),
      validTo: new Date(row.valid_to),
      isActive: row.is_active,
      applicableProducts: row.applicable_products,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<void> => {
  try {
    const updateData: any = {};
    
    if (updates.code !== undefined) updateData.code = updates.code;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.buyQuantity !== undefined) updateData.buy_quantity = updates.buyQuantity;
    if (updates.getQuantity !== undefined) updateData.get_quantity = updates.getQuantity;
    if (updates.minOrderAmount !== undefined) updateData.min_order_amount = updates.minOrderAmount;
    if (updates.maxDiscount !== undefined) updateData.max_discount = updates.maxDiscount;
    if (updates.usageLimit !== undefined) updateData.usage_limit = updates.usageLimit;
    if (updates.usedCount !== undefined) updateData.used_count = updates.usedCount;
    if (updates.validFrom !== undefined) updateData.valid_from = updates.validFrom.toISOString();
    if (updates.validTo !== undefined) updateData.valid_to = updates.validTo.toISOString();
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.applicableProducts !== undefined) updateData.applicable_products = updates.applicableProducts;

    const { error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

export const deleteCoupon = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

// Customer functions
export const validateCoupon = async (code: string, userId: string): Promise<Coupon | null> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    const coupon: Coupon = {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      type: data.type,
      value: data.value,
      buyQuantity: data.buy_quantity,
      getQuantity: data.get_quantity,
      minOrderAmount: data.min_order_amount,
      maxDiscount: data.max_discount,
      usageLimit: data.usage_limit,
      usedCount: data.used_count,
      validFrom: new Date(data.valid_from),
      validTo: new Date(data.valid_to),
      isActive: data.is_active,
      applicableProducts: data.applicable_products,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    // Check if coupon is within valid date range
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return null;
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return null;
    }

    return coupon;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

export const calculateDiscount = (
  cartItems: Array<{
    id: number;
    product: { id: string; price: number };
    quantity: number;
  }>,
  coupon: Coupon,
  subtotal: number
): DiscountCalculation => {
  let discountAmount = 0;
  let freeItems: Array<{ productId: string; quantity: number }> = [];

  // Check minimum order amount
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return { discountAmount: 0, finalTotal: subtotal };
  }

  // Filter applicable items
  const applicableItems = coupon.applicableProducts && coupon.applicableProducts.length > 0
    ? cartItems.filter(item => coupon.applicableProducts!.includes(item.product.id))
    : cartItems;

  if (applicableItems.length === 0) {
    return { discountAmount: 0, finalTotal: subtotal };
  }

  switch (coupon.type) {
    case 'percentage':
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
      break;

    case 'fixed':
      discountAmount = Math.min(coupon.value, subtotal);
      break;

    case 'buy_x_get_y':
      if (coupon.buyQuantity && coupon.getQuantity) {
        // Calculate total quantity of applicable items
        const totalQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
        const eligibleSets = Math.floor(totalQuantity / coupon.buyQuantity);
        const freeQuantity = eligibleSets * coupon.getQuantity;

        if (freeQuantity > 0) {
          // Sort items by price (ascending) to give cheapest items for free
          const sortedItems = [...applicableItems].sort((a, b) => a.product.price - b.product.price);
          
          let remainingFreeQuantity = freeQuantity;
          for (const item of sortedItems) {
            if (remainingFreeQuantity <= 0) break;
            
            const freeFromThisItem = Math.min(remainingFreeQuantity, item.quantity);
            if (freeFromThisItem > 0) {
              freeItems.push({
                productId: item.product.id,
                quantity: freeFromThisItem
              });
              discountAmount += freeFromThisItem * item.product.price;
              remainingFreeQuantity -= freeFromThisItem;
            }
          }
        }
      }
      break;
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    discountAmount,
    finalTotal,
    appliedCoupon: coupon,
    freeItems: freeItems.length > 0 ? freeItems : undefined
  };
};

export const applyCoupon = async (
  couponId: string,
  userId: string,
  orderId: string,
  discountAmount: number
): Promise<void> => {
  try {
    // Record coupon usage
    const { error: usageError } = await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: couponId,
        user_id: userId,
        order_id: orderId,
        discount_amount: discountAmount,
      });

    if (usageError) throw usageError;

    // Get current used count
    const { data: couponData, error: fetchError } = await supabase
      .from('coupons')
      .select('used_count')
      .eq('id', couponId)
      .single();

    if (fetchError) throw fetchError;

    // Increment usage count
    const { error: updateError } = await supabase
      .from('coupons')
      .update({ used_count: (couponData.used_count || 0) + 1 })
      .eq('id', couponId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
};

export const getCouponUsageStats = async (couponId: string): Promise<{
  totalUsage: number;
  totalDiscount: number;
  recentUsages: CouponUsage[];
}> => {
  try {
    const { data, error } = await supabase
      .from('coupon_usage')
      .select('*')
      .eq('coupon_id', couponId)
      .order('used_at', { ascending: false });

    if (error) throw error;

    const usages: CouponUsage[] = (data || []).map(row => ({
      id: row.id,
      couponId: row.coupon_id,
      userId: row.user_id,
      orderId: row.order_id,
      discountAmount: row.discount_amount,
      usedAt: new Date(row.used_at),
    }));

    const totalUsage = usages.length;
    const totalDiscount = usages.reduce((sum, usage) => sum + usage.discountAmount, 0);

    return {
      totalUsage,
      totalDiscount,
      recentUsages: usages.slice(0, 10), // Last 10 usages
    };
  } catch (error) {
    console.error('Error fetching coupon usage stats:', error);
    throw error;
  }
};
