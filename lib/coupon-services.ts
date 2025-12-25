import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';

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

const COUPONS_COLLECTION = 'coupons';
const COUPON_USAGE_COLLECTION = 'couponUsage';

// Admin functions
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<string> => {
  try {
    // Clean the data to remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries({
        ...couponData,
        usedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, COUPONS_COLLECTION), cleanedData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

export const getAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const q = query(collection(db, COUPONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      validFrom: doc.data().validFrom.toDate(),
      validTo: doc.data().validTo.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Coupon[];
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<void> => {
  try {
    // Clean the updates to remove undefined values
    const cleanedUpdates = Object.fromEntries(
      Object.entries({
        ...updates,
        updatedAt: new Date(),
      }).filter(([_, value]) => value !== undefined)
    );

    const couponRef = doc(db, COUPONS_COLLECTION, id);
    await updateDoc(couponRef, cleanedUpdates);
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

export const deleteCoupon = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COUPONS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

// Customer functions
export const validateCoupon = async (code: string, userId: string): Promise<Coupon | null> => {
  try {
    const q = query(
      collection(db, COUPONS_COLLECTION),
      where('code', '==', code.toUpperCase()),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const couponDoc = querySnapshot.docs[0];
    const coupon = {
      id: couponDoc.id,
      ...couponDoc.data(),
      validFrom: couponDoc.data().validFrom.toDate(),
      validTo: couponDoc.data().validTo.toDate(),
      createdAt: couponDoc.data().createdAt.toDate(),
      updatedAt: couponDoc.data().updatedAt.toDate(),
    } as Coupon;

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
    await addDoc(collection(db, COUPON_USAGE_COLLECTION), {
      couponId,
      userId,
      orderId,
      discountAmount,
      usedAt: new Date(),
    });

    // Increment usage count
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    const couponDoc = await getDoc(couponRef);
    if (couponDoc.exists()) {
      const currentUsedCount = couponDoc.data().usedCount || 0;
      await updateDoc(couponRef, {
        usedCount: currentUsedCount + 1,
        updatedAt: new Date(),
      });
    }
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
    const q = query(
      collection(db, COUPON_USAGE_COLLECTION),
      where('couponId', '==', couponId),
      orderBy('usedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const usages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      usedAt: doc.data().usedAt.toDate(),
    })) as CouponUsage[];

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