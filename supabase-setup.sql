-- Supabase Database Setup
-- Run this in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  material TEXT,
  care TEXT,
  origin TEXT,
  manufacturer TEXT,
  stock INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  trending_order INTEGER,
  is_latest_collection BOOLEAN DEFAULT FALSE,
  latest_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can read products
CREATE POLICY "Anyone can read products" ON products
  FOR SELECT USING (TRUE);

-- Only admins can insert products
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can update products
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can delete products
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== ORDERS TABLE ====================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shiprocket_order_id TEXT,
  tracking_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== ORDER REQUESTS TABLE ====================
CREATE TABLE IF NOT EXISTS order_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('return', 'exchange')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_requests table
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own requests
CREATE POLICY "Users can read own requests" ON order_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can insert own requests" ON order_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can read all requests
CREATE POLICY "Admins can read all requests" ON order_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests" ON order_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== ADDRESSES TABLE ====================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on addresses table
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users can manage their own addresses
CREATE POLICY "Users can read own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== PAYMENT METHODS TABLE ====================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  card_last4 TEXT,
  card_brand TEXT,
  upi_id TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_methods table
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can manage their own payment methods
CREATE POLICY "Users can read own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== COUPONS TABLE ====================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'buy_x_get_y')),
  value NUMERIC(10, 2) NOT NULL,
  buy_quantity INTEGER,
  get_quantity INTEGER,
  min_order_amount NUMERIC(10, 2),
  max_discount NUMERIC(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  applicable_products UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on coupons table
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can read active coupons
CREATE POLICY "Anyone can read active coupons" ON coupons
  FOR SELECT USING (is_active = TRUE);

-- Admins can manage all coupons
CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== COUPON USAGE TABLE ====================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on coupon_usage table
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own coupon usage
CREATE POLICY "Users can read own coupon usage" ON coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all coupon usage
CREATE POLICY "Admins can read all coupon usage" ON coupon_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== REVIEWS TABLE ====================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_image TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  source TEXT NOT NULL CHECK (source IN ('google', 'website', 'manual')),
  google_review_id TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read active reviews
CREATE POLICY "Anyone can read active reviews" ON reviews
  FOR SELECT USING (is_active = TRUE);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== SHIPPING SETTINGS TABLE ====================
CREATE TABLE IF NOT EXISTS shipping_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cod_shipping_charge NUMERIC(10, 2) NOT NULL DEFAULT 50,
  free_shipping_threshold NUMERIC(10, 2) NOT NULL DEFAULT 999,
  standard_shipping_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
  express_shipping_charge NUMERIC(10, 2) NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on shipping_settings table
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read shipping settings
CREATE POLICY "Anyone can read shipping settings" ON shipping_settings
  FOR SELECT USING (TRUE);

-- Admins can manage shipping settings
CREATE POLICY "Admins can manage shipping settings" ON shipping_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Insert default shipping settings
INSERT INTO shipping_settings (cod_shipping_charge, free_shipping_threshold, standard_shipping_charge, express_shipping_charge, is_active)
VALUES (50, 999, 0, 100, TRUE)
ON CONFLICT DO NOTHING;

-- ==================== INVOICES TABLE ====================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_address TEXT NOT NULL,
  company_phone TEXT NOT NULL,
  company_email TEXT NOT NULL,
  company_gstin TEXT NOT NULL,
  company_pan TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_gstin TEXT,
  place_of_supply TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  shipping_charges NUMERIC(10, 2) DEFAULT 0,
  cgst_rate NUMERIC(5, 2) DEFAULT 0,
  sgst_rate NUMERIC(5, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  advance_payment NUMERIC(10, 2) DEFAULT 0,
  due_payment NUMERIC(10, 2) DEFAULT 0,
  return_policy TEXT,
  delivery_timeline TEXT,
  custom_order_policy TEXT,
  thank_you_note TEXT,
  bank_account_holder TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_upi TEXT,
  declaration TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on invoices table
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invoices
CREATE POLICY "Admins can manage invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== STOCK ENTRIES TABLE ====================
CREATE TABLE IF NOT EXISTS stock_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on stock_entries table
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;

-- Admins can manage stock entries
CREATE POLICY "Admins can manage stock entries" ON stock_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== CHAT SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_email TEXT,
  guest_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('active', 'closed', 'waiting')),
  subject TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES users(id),
  last_message TEXT,
  unread_count INTEGER DEFAULT 0,
  user_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_sessions table
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own chat sessions
CREATE POLICY "Users can read own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own chat sessions
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all chat sessions
CREATE POLICY "Admins can manage chat sessions" ON chat_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== CHAT MESSAGES TABLE ====================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'system')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'email_notification')),
  is_read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages from their sessions
CREATE POLICY "Users can read own chat messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Users can insert messages to their sessions
CREATE POLICY "Users can insert own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Admins can manage all chat messages
CREATE POLICY "Admins can manage chat messages" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_requests_user_id ON order_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_order_id ON order_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_status ON order_requests(status);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_active ON reviews(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_stock_entries_product_id ON stock_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_date ON stock_entries(date);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- ==================== FUNCTIONS ====================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_requests_updated_at BEFORE UPDATE ON order_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_settings_updated_at BEFORE UPDATE ON shipping_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== SAMPLE DATA (Optional) ====================

-- Insert sample products (uncomment to use)
/*
INSERT INTO products (name, price, category, images, sizes, description, material, care, origin, manufacturer, stock) VALUES
('Classic White Tee', 599, 'T-Shirts', ARRAY['/products/white-tee.jpg'], ARRAY['S', 'M', 'L', 'XL'], 'Premium cotton t-shirt', '100% Cotton', 'Machine wash cold', 'India', 'Lunarz', 100),
('Black Polo Shirt', 899, 'Polo', ARRAY['/products/black-polo.jpg'], ARRAY['S', 'M', 'L', 'XL'], 'Classic polo shirt', '100% Cotton', 'Machine wash cold', 'India', 'Lunarz', 50),
('Navy Hoodie', 1299, 'Hoodies', ARRAY['/products/navy-hoodie.jpg'], ARRAY['M', 'L', 'XL', 'XXL'], 'Comfortable hoodie', '80% Cotton, 20% Polyester', 'Machine wash cold', 'India', 'Lunarz', 30);
*/

-- ==================== SETUP COMPLETE ====================
-- Your Supabase database is now ready!
-- Next steps:
-- 1. Create your first admin user by signing up
-- 2. Manually set is_admin = TRUE for that user in the users table
-- 3. Start using the application!
