import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  updateDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  getDoc 
} from "firebase/firestore";

export interface ReturnExchangeRequest {
  id?: string;
  orderId: string;
  userId: string;
  type: 'return' | 'exchange' | 'cancel';
  reason: string;
  description?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
    exchangeSize?: string; // For exchanges
    exchangeColor?: string; // For exchanges
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  requestDate: Timestamp;
  responseDate?: Timestamp;
  adminNotes?: string;
  refundAmount?: number;
  pickupAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  images?: string[]; // For damage/defect claims
}

export interface OrderStatus {
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'exchanged' | 'return-requested' | 'exchange-requested';
  canCancel: boolean;
  canReturn: boolean;
  canExchange: boolean;
  deliveryDate?: Timestamp;
}

export class OrderManagementService {
  private static readonly COLLECTION_NAME = "returnExchangeRequests";
  private static readonly ORDERS_COLLECTION = "orders";

  // Create return/exchange/cancel request
  static async createRequest(request: Omit<ReturnExchangeRequest, 'id' | 'requestDate' | 'status'>): Promise<string> {
    try {
      console.log('🔄 OrderManagementService.createRequest called with:', request);
      
      const requestData: any = {
        orderId: request.orderId,
        userId: request.userId,
        type: request.type,
        reason: request.reason,
        items: request.items,
        status: 'pending',
        requestDate: Timestamp.now()
      };

      // Only add optional fields if they have values
      if (request.description) {
        requestData.description = request.description;
      }
      
      if (request.pickupAddress && request.type !== 'cancel') {
        requestData.pickupAddress = request.pickupAddress;
      }
      
      if (request.images && request.images.length > 0) {
        requestData.images = request.images;
      }

      console.log('📝 Creating request document:', requestData);
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), requestData);
      console.log('✅ Request document created with ID:', docRef.id);
      
      // Update order status based on request type
      if (request.type === 'cancel') {
        console.log('🚫 Updating order status to cancelled for order:', request.orderId);
        await this.updateOrderStatus(request.orderId, 'cancelled');
        console.log('✅ Order status updated to cancelled');
      } else if (request.type === 'return') {
        console.log('↩️ Updating order status to return-requested for order:', request.orderId);
        await this.updateOrderStatus(request.orderId, 'return-requested');
        console.log('✅ Order status updated to return-requested');
      } else if (request.type === 'exchange') {
        console.log('🔄 Updating order status to exchange-requested for order:', request.orderId);
        await this.updateOrderStatus(request.orderId, 'exchange-requested');
        console.log('✅ Order status updated to exchange-requested');
      }

      return docRef.id;
    } catch (error: any) {
      console.error("❌ Error creating request:", error);
      throw new Error(`Failed to create request: ${error.message}`);
    }
  }

  // Get user's requests
  static async getUserRequests(userId: string): Promise<ReturnExchangeRequest[]> {
    try {
      // Use a simpler query to avoid index issues
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReturnExchangeRequest));

      // Sort manually by requestDate (newest first)
      return requests.sort((a, b) => {
        const dateA = a.requestDate?.toDate?.() || new Date(0);
        const dateB = b.requestDate?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Error fetching user requests:", error);
      throw new Error("Failed to fetch requests");
    }
  }

  // Get all requests (admin)
  static async getAllRequests(): Promise<ReturnExchangeRequest[]> {
    try {
      // Use a simpler query to avoid index issues
      const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReturnExchangeRequest));

      // Sort manually by requestDate (newest first)
      return requests.sort((a, b) => {
        const dateA = a.requestDate?.toDate?.() || new Date(0);
        const dateB = b.requestDate?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Error fetching all requests:", error);
      throw new Error("Failed to fetch requests");
    }
  }

  // Update request status (admin)
  static async updateRequestStatus(
    requestId: string, 
    status: ReturnExchangeRequest['status'],
    adminNotes?: string,
    refundAmount?: number
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        responseDate: Timestamp.now()
      };

      if (adminNotes) updateData.adminNotes = adminNotes;
      if (refundAmount !== undefined) updateData.refundAmount = refundAmount;

      await updateDoc(doc(db, this.COLLECTION_NAME, requestId), updateData);

      // If approved, update order status accordingly
      if (status === 'approved') {
        const requestDoc = await getDoc(doc(db, this.COLLECTION_NAME, requestId));
        if (requestDoc.exists()) {
          const requestData = requestDoc.data() as ReturnExchangeRequest;
          if (requestData.type === 'return') {
            await this.updateOrderStatus(requestData.orderId, 'returned');
          } else if (requestData.type === 'exchange') {
            await this.updateOrderStatus(requestData.orderId, 'exchanged');
          }
        }
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      throw new Error("Failed to update request status");
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: OrderStatus['status']): Promise<void> {
    try {
      console.log(`🔄 Updating order ${orderId} status to ${status}`);
      
      await updateDoc(doc(db, this.ORDERS_COLLECTION, orderId), {
        status,
        updatedAt: Timestamp.now()
      });
      
      console.log(`✅ Order ${orderId} status updated to ${status}`);
    } catch (error: any) {
      console.error("❌ Error updating order status:", error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Check if order can be cancelled/returned/exchanged
  static getOrderEligibility(order: any): OrderStatus {
    const now = new Date();
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.date || order.createdAt);
    const deliveryDate = order.deliveryDate?.toDate ? order.deliveryDate.toDate() : null;
    
    // Calculate days since order/delivery
    const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceDelivery = deliveryDate ? 
      Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

    // For testing purposes, if no delivery date is set but status is delivered, assume delivered today
    const effectiveDaysSinceDelivery = order.status === 'delivered' ? 
      (daysSinceDelivery !== null ? daysSinceDelivery : 0) : daysSinceDelivery;

    // Check if requests are already submitted
    const hasReturnRequest = order.status === 'return-requested';
    const hasExchangeRequest = order.status === 'exchange-requested';
    const isCancelled = order.status === 'cancelled';
    const isReturned = order.status === 'returned';
    const isExchanged = order.status === 'exchanged';

    // Basic eligibility rules
    const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status) && !isCancelled;
    const canReturn = order.status === 'delivered' && 
                     effectiveDaysSinceDelivery !== null && 
                     effectiveDaysSinceDelivery <= 30 && 
                     !hasReturnRequest && 
                     !hasExchangeRequest && 
                     !isReturned && 
                     !isExchanged;
    const canExchange = order.status === 'delivered' && 
                       effectiveDaysSinceDelivery !== null && 
                       effectiveDaysSinceDelivery <= 15 && 
                       !hasReturnRequest && 
                       !hasExchangeRequest && 
                       !isReturned && 
                       !isExchanged;

    console.log('🔍 Order eligibility check:', {
      orderId: order.id,
      status: order.status,
      orderDate,
      deliveryDate,
      daysSinceOrder,
      daysSinceDelivery,
      effectiveDaysSinceDelivery,
      hasReturnRequest,
      hasExchangeRequest,
      canCancel,
      canReturn,
      canExchange
    });

    return {
      orderId: order.id,
      status: order.status,
      canCancel,
      canReturn,
      canExchange,
      deliveryDate: order.deliveryDate
    };
  }

  // Get return/exchange reasons
  static getReturnReasons(): string[] {
    return [
      "Defective/Damaged product",
      "Wrong item received",
      "Size doesn't fit",
      "Color different from image",
      "Quality not as expected",
      "Changed mind",
      "Ordered by mistake",
      "Found better price elsewhere",
      "Delivery delayed",
      "Other"
    ];
  }

  static getExchangeReasons(): string[] {
    return [
      "Wrong size received",
      "Wrong color received",
      "Want different size",
      "Want different color",
      "Defective product - need replacement",
      "Quality issue - need replacement",
      "Other"
    ];
  }

  static getCancelReasons(): string[] {
    return [
      "Changed mind",
      "Found better price elsewhere",
      "Ordered by mistake",
      "Delivery taking too long",
      "Need to modify order",
      "Financial constraints",
      "Product no longer needed",
      "Other"
    ];
  }
}