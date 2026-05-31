/**
 * Supabase Client Configuration
 * Replaces Firebase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          phone: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          category: string;
          images: string[];
          sizes: string[];
          description: string;
          material: string;
          care: string;
          origin: string;
          manufacturer: string;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          category: string;
          images: string[];
          sizes: string[];
          description: string;
          material: string;
          care: string;
          origin: string;
          manufacturer: string;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          category?: string;
          images?: string[];
          sizes?: string[];
          description?: string;
          material?: string;
          care?: string;
          origin?: string;
          manufacturer?: string;
          stock?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          items: any;
          total_amount: number;
          shipping_address: any;
          payment_method: string;
          payment_status: string;
          order_status: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          shiprocket_order_id: string | null;
          tracking_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          items: any;
          total_amount: number;
          shipping_address: any;
          payment_method: string;
          payment_status: string;
          order_status: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          shiprocket_order_id?: string | null;
          tracking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          items?: any;
          total_amount?: number;
          shipping_address?: any;
          payment_method?: string;
          payment_status?: string;
          order_status?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          shiprocket_order_id?: string | null;
          tracking_id?: string | null;
          updated_at?: string;
        };
      };
      order_requests: {
        Row: {
          id: string;
          request_id: string;
          order_id: string;
          user_id: string;
          type: 'return' | 'exchange';
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          order_id: string;
          user_id: string;
          type: 'return' | 'exchange';
          reason: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          order_id?: string;
          user_id?: string;
          type?: 'return' | 'exchange';
          reason?: string;
          status?: 'pending' | 'approved' | 'rejected';
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
