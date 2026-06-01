/**
 * Order Management Service with Supabase
 * Handles return/exchange requests
 */

import { supabase } from "./supabase";

export interface ReturnExchangeRequest {
  id?: string;
  requestId: string;
  orderId: string;
  userId: string;
  type: "return" | "exchange" | "cancel";
  reason: string;
  description?: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  adminNotes?: string;
  refundAmount?: number;
  requestDate?: string;
  responseDate?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: Array<{
    productName: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    exchangeSize?: string;
    exchangeColor?: string;
  }>;
  pickupAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export class OrderManagementService {
  /**
   * Create return/exchange request
   */
  static async createReturnExchangeRequest(
    request: Omit<ReturnExchangeRequest, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("order_requests")
        .insert([
          {
            request_id: request.requestId,
            order_id: request.orderId,
            user_id: request.userId,
            type: request.type,
            reason: request.reason,
            status: request.status || "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error("Error creating return/exchange request:", error);
      throw new Error(error.message);
    }
  }

  /**
   * Get requests by user ID
   */
  static async getReturnExchangeRequestsByUserId(
    userId: string
  ): Promise<ReturnExchangeRequest[]> {
    try {
      const { data, error } = await supabase
        .from("order_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        requestId: row.request_id,
        orderId: row.order_id,
        userId: row.user_id,
        type: row.type,
        reason: row.reason,
        status: row.status,
        requestDate: row.created_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error("Error fetching return/exchange requests:", error);
      return [];
    }
  }

  /**
   * Get all requests
   */
  static async getAllReturnExchangeRequests(): Promise<ReturnExchangeRequest[]> {
    try {
      const { data, error } = await supabase
        .from("order_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        requestId: row.request_id,
        orderId: row.order_id,
        userId: row.user_id,
        type: row.type,
        reason: row.reason,
        status: row.status,
        requestDate: row.created_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error("Error fetching all return/exchange requests:", error);
      return [];
    }
  }

  /**
   * Update request status
   */
  static async updateReturnExchangeRequestStatus(
    requestId: string,
    status: "pending" | "approved" | "rejected"
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("order_requests")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("request_id", requestId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error updating return/exchange request status:", error);
      throw new Error(error.message);
    }
  }

  /**
   * Get request by request ID
   */
  static async getReturnExchangeRequestById(
    requestId: string
  ): Promise<ReturnExchangeRequest | null> {
    try {
      const { data, error } = await supabase
        .from("order_requests")
        .select("*")
        .eq("request_id", requestId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching return/exchange request:", error);
      return null;
    }
  }

  static async getAllRequests() {
    return OrderManagementService.getAllReturnExchangeRequests();
  }

  /**
   * Get reasons for return
   */
  static getReturnReasons(): string[] {
    return [
      "Item received damaged",
      "Wrong item delivered",
      "Item not as described",
      "Size/fit issue",
      "Quality not as expected",
      "Changed my mind",
      "Duplicate order",
      "Other",
    ];
  }

  /**
   * Get reasons for exchange
   */
  static getExchangeReasons(): string[] {
    return [
      "Wrong size ordered",
      "Want a different color",
      "Want a different style",
      "Item received damaged",
      "Wrong item delivered",
      "Other",
    ];
  }

  /**
   * Get reasons for cancellation
   */
  static getCancelReasons(): string[] {
    return [
      "Ordered by mistake",
      "Found a better price elsewhere",
      "Changed my mind",
      "Delivery taking too long",
      "Shipping address is wrong",
      "Payment issue",
      "Other",
    ];
  }

  /**
   * Get order eligibility for actions (return, exchange, cancel)
   */
  static getOrderEligibility(order: any) {
    const eligibility = {
      canCancel: false,
      canReturn: false,
      canExchange: false,
    };

    if (!order || !order.status) {
      return eligibility;
    }

    const status = order.status.toLowerCase();

    // Can cancel if order is pending or confirmed
    if (status === "pending" || status === "confirmed") {
      eligibility.canCancel = true;
    }

    // Can return if order is delivered
    if (status === "delivered") {
      eligibility.canReturn = true;
      eligibility.canExchange = true;
    }

    // Cannot perform actions if already in request state or completed state
    if (
      status === "return-requested" ||
      status === "exchange-requested" ||
      status === "returned" ||
      status === "exchanged" ||
      status === "cancelled"
    ) {
      eligibility.canCancel = false;
      eligibility.canReturn = false;
      eligibility.canExchange = false;
    }

    return eligibility;
  }
}