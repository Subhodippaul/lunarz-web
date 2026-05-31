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
  type: 'return' | 'exchange';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export async function createReturnExchangeRequest(
  request: Omit<ReturnExchangeRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('order_requests')
      .insert([{
        request_id: request.requestId,
        order_id: request.orderId,
        user_id: request.userId,
        type: request.type,
        reason: request.reason,
        status: request.status || 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error: any) {
    console.error("Error creating return/exchange request:", error);
    throw new Error(error.message);
  }
}

export async function getReturnExchangeRequestsByUserId(userId: string): Promise<ReturnExchangeRequest[]> {
  try {
    const { data, error } = await supabase
      .from('order_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching return/exchange requests:", error);
    return [];
  }
}

export async function getAllReturnExchangeRequests(): Promise<ReturnExchangeRequest[]> {
  try {
    const { data, error } = await supabase
      .from('order_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all return/exchange requests:", error);
    return [];
  }
}

export async function updateReturnExchangeRequestStatus(
  requestId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('order_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('request_id', requestId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating return/exchange request status:", error);
    throw new Error(error.message);
  }
}

export async function getReturnExchangeRequestById(requestId: string): Promise<ReturnExchangeRequest | null> {
  try {
    const { data, error } = await supabase
      .from('order_requests')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching return/exchange request:", error);
    return null;
  }
}
