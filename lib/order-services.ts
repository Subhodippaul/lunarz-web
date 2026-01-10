import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Order } from "./profile-data";
import { CartItem } from "./cart-context";

// Collections
const COLLECTIONS = {
  ORDERS: "orders",
  ORDER_ITEMS: "orderItems",
} as const;

export interface OrderData {
  orderNumber: string;
  userId: string;
  customerEmail?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  shippingAddress: any;
  paymentMethod: 'cod' | 'online';
  couponCode?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  // Razorpay payment fields
  paymentId?: string;
  razorpayOrderId?: string;
}

export interface OrderReceipt {
  orderId: string;
  orderNumber: string;
  date: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size: string;
    variant?: string;
    total: number;
  }>;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  shippingAddress: any;
  paymentMethod: string;
  couponCode?: string;
  status: string;
}

export class OrderService {
  // Create a new order
  static async createOrder(orderData: OrderData): Promise<string> {
    try {
      // Generate order number if not provided
      if (!orderData.orderNumber) {
        orderData.orderNumber = `LNZ${Date.now().toString().slice(-6)}`;
      }

      const orderDoc: any = {
        orderNumber: orderData.orderNumber,
        userId: orderData.userId,
        subtotal: orderData.subtotal,
        discountAmount: orderData.discountAmount,
        shippingCost: orderData.shippingCost,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add optional fields only if they have values
      if (orderData.customerEmail) {
        orderDoc.customerEmail = orderData.customerEmail;
      }
      if (orderData.couponCode) {
        orderDoc.couponCode = orderData.couponCode;
      }
      if (orderData.paymentId) {
        orderDoc.paymentId = orderData.paymentId;
      }
      if (orderData.razorpayOrderId) {
        orderDoc.razorpayOrderId = orderData.razorpayOrderId;
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), orderDoc);

      // Add order items
      for (const item of orderData.items) {
        const orderItemDoc: any = {
          orderId: docRef.id,
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          selectedSize: item.selectedSize,
          total: item.product.price * item.quantity,
          createdAt: Timestamp.now(),
        };

        // Add optional fields only if they have values
        if (item.selectedVariant) {
          orderItemDoc.selectedVariant = item.selectedVariant;
        }

        await addDoc(collection(db, COLLECTIONS.ORDER_ITEMS), orderItemDoc);
      }

      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<OrderReceipt | null> {
    try {
      const orderDoc = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));
      
      if (!orderDoc.exists()) {
        return null;
      }

      const orderData = orderDoc.data();
      
      // Get order items
      const itemsQuery = query(
        collection(db, COLLECTIONS.ORDER_ITEMS),
        where("orderId", "==", orderId)
      );
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const items = itemsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.productName,
          quantity: data.quantity,
          price: data.price,
          size: data.selectedSize,
          variant: data.selectedVariant,
          total: data.total,
        };
      });

      // Get user info from auth or shipping address
      const customerInfo = {
        name: orderData.shippingAddress?.fullName || 'Customer',
        email: orderData.customerEmail || 'customer@example.com',
        phone: orderData.shippingAddress?.phone || '',
      };

      const receipt: OrderReceipt = {
        orderId,
        orderNumber: orderData.orderNumber,
        date: orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt,
        customerInfo,
        items,
        subtotal: orderData.subtotal,
        discountAmount: orderData.discountAmount || 0,
        shippingCost: orderData.shippingCost || 0,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        couponCode: orderData.couponCode,
        status: orderData.status,
      };

      return receipt;
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  }

  // Get user orders
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      
      const orders = await Promise.all(
        querySnapshot.docs.map(async (orderDoc) => {
          const orderData = orderDoc.data();
          
          // Get order items
          const itemsQuery = query(
            collection(db, COLLECTIONS.ORDER_ITEMS),
            where("orderId", "==", orderDoc.id)
          );
          const itemsSnapshot = await getDocs(itemsQuery);
          
          const items = itemsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              productId: data.productId,
              name: data.productName,
              quantity: data.quantity,
              price: data.price,
              size: data.selectedSize,
              variant: data.selectedVariant,
            };
          });

          return {
            id: orderDoc.id,
            orderNumber: orderData.orderNumber,
            date: orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt,
            status: orderData.status,
            items,
            total: orderData.total,
            shippingAddress: orderData.shippingAddress,
            createdAt: orderData.createdAt,
            deliveryDate: orderData.deliveryDate,
            paymentMethod: orderData.paymentMethod,
          } as Order;
        })
      );

      // Sort by date (newest first)
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Generate receipt PDF (placeholder for future implementation)
  static generateReceiptPDF(receipt: OrderReceipt): string {
    // This would integrate with a PDF generation service
    // For now, return a placeholder URL
    return `/api/receipt/${receipt.orderId}/pdf`;
  }

  // Generate receipt download link
  static getReceiptDownloadLink(orderId: string): string {
    return `/api/receipt/${orderId}/download`;
  }
}