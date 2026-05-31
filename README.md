# Lunarz Web - E-Commerce Platform

**Tech Stack:** Next.js 16 | React 19 | TypeScript | Supabase | Tailwind CSS | Razorpay | Shiprocket | Nodemailer

---

## 🎯 REPOSITORY OVERVIEW

Lunarz is a full-featured e-commerce platform for selling t-shirts and custom apparel with admin management, order tracking, and payment integration.

### Core Features
- **Product Catalog** - Browse and purchase t-shirts
- **Custom T-Shirt Orders** - Excel-based product management for customizable items
- **User Authentication** - Supabase Auth + Dummy login (123456/123456)
- **Shopping Cart** - Add to cart, manage quantities
- **Payment Gateway** - Razorpay integration (online + COD)
- **Order Management** - Track orders, returns, exchanges
- **Admin Panel** - Manage products, orders, users, invoices
- **Email Notifications** - Order confirmations via Nodemailer
- **Shipping Integration** - Shiprocket API for logistics

---

## 📁 PROJECT STRUCTURE

```
lunarz-web/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage
│   ├── products/                 # Product listing & details
│   ├── customize-your-tshirt/    # Custom t-shirt page (Excel-based)
│   ├── cart/                     # Shopping cart
│   ├── checkout/                 # Standard checkout (Firebase DB)
│   ├── customize-checkout/       # Custom checkout (Email-only, no DB)
│   ├── order-success/            # Order confirmation page
│   ├── profile/                  # User profile & orders
│   ├── admin/                    # Admin dashboard
│   │   ├── products/             # Product management
│   │   ├── orders/               # Order management
│   │   ├── users/                # User management
│   │   ├── invoices/             # Invoice generation
│   │   ├── returns/              # Return/exchange requests
│   │   └── settings/             # Admin settings
│   ├── login/                    # Login page
│   ├── signup/                   # Registration page
│   ├── forgot-password/          # Password reset
│   └── api/                      # API Routes
│       ├── customize-products/   # Excel product loader API
│       ├── customize-order/      # Custom order email API
│       ├── razorpay/             # Payment APIs
│       ├── shiprocket/           # Shipping APIs
│       ├── orders/               # Order management APIs
│       └── auth/                 # Authentication APIs
│
├── components/                   # React Components
│   ├── navbar.tsx                # Navigation bar
│   ├── footer.tsx                # Footer
│   ├── admin/                    # Admin components
│   └── ui/                       # Reusable UI components
│
├── lib/                          # Utility Libraries
│   ├── supabase.ts               # Supabase config
│   ├── supabase-services.ts      # Supabase CRUD operations
│   ├── auth-context.tsx          # Authentication context
│   ├── auth-utils.ts             # Auth utility functions
│   ├── cart-context.tsx          # Shopping cart context
│   ├── coupon-context.tsx        # Coupon context
│   ├── excel-loader.ts           # Excel file reader
│   ├── email-service.ts          # Email sending service
│   ├── razorpay-service.ts       # Razorpay integration
│   ├── shiprocket-service.ts     # Shiprocket integration
│   ├── order-services.ts         # Order management
│   ├── order-management-service.ts # Order status updates
│   ├── admin-services.ts         # Admin operations
│   ├── order-analytics.ts        # Analytics and reports
│   ├── coupon-services.ts        # Coupon management
│   ├── review-services.ts        # Review management
│   ├── shipping-services.ts      # Shipping settings
│   ├── invoice-service.ts        # Invoice generation
│   ├── inventory-services.ts     # Stock management
│   ├── chat-services.ts          # Chat support
│   └── data.ts                   # TypeScript types
│
├── data/                         # Data Files
│   ├── products.xlsx             # Custom t-shirt products (Excel)
│   └── customize-products.json   # Fallback JSON (not used)
│
├── public/                       # Static Assets
│   └── customize-tshirts/        # Product images
│
├── scripts/                      # Utility Scripts
│   ├── test-excel-read.js        # Test Excel loading
│   └── check-excel-lock.js       # Check file lock status
│
├── supabase-setup.sql            # Database setup script
├── .env.local                    # Environment variables
└── README.md                     # This file (ONLY documentation)
```

---

## 🔄 APPLICATION FLOWS

### 1. STANDARD PRODUCT FLOW (Database-backed)

**Route:** `/products` → `/products/[id]` → `/cart` → `/checkout` → `/order-success`

**Process:**
1. User browses products from Supabase database
2. Adds items to cart (stored in context)
3. Proceeds to checkout (requires login)
4. Enters shipping address
5. Selects payment method (Razorpay/COD)
6. Order saved to Supabase `orders` table
7. Email sent to admin and customer
8. Shiprocket order created (if configured)
9. Redirect to success page

**Key Files:**
- `app/products/page.tsx` - Product listing
- `app/products/[id]/page.tsx` - Product details
- `app/cart/page.tsx` - Shopping cart
- `app/checkout/page.tsx` - Checkout form
- `lib/supabase-services.ts` - All database operations
- `lib/order-services.ts` - Order management
- `lib/shipping-services.ts` - Shipping settings
- `app/api/razorpay/create-order/route.ts` - Payment creation
- `app/api/razorpay/verify-payment/route.ts` - Payment verification

---

### 2. CUSTOM T-SHIRT FLOW (Excel-based, No Database)

**Route:** `/customize-your-tshirt` → `/customize-checkout` → `/order-success`

**Process:**
1. Products loaded from `data/products.xlsx` via API
2. User selects product, size, color, quantity
3. Adds to cart (same cart context)
4. Proceeds to custom checkout (NO login required)
5. Enters customer details and address
6. Selects payment method
7. Order details sent via EMAIL only (not saved to database)
8. Admin receives order email at lunarz.info@gmail.com
9. Customer receives confirmation email
10. Redirect to success page

**Key Files:**
- `app/customize-your-tshirt/page.tsx` - Product selection
- `app/customize-checkout/page.tsx` - Checkout (no auth)
- `app/api/customize-products/route.ts` - Excel API
- `app/api/customize-order/route.ts` - Email-only order
- `lib/excel-loader.ts` - Excel file reader
- `data/products.xlsx` - Product data source

**Excel File Format:**
```
Columns: id, name, price, category, image, description, material, weight, sizes, colors, printArea
Example: custom-001, Classic Cotton Tee, 599, Customizable T-Shirts, classic-white.svg, Premium cotton, 100% Cotton, 180 GSM, XS,S,M,L,XL, White,Black,Navy, Front & Back
```

**Important Notes:**
- Close Excel file before running dev server (file locking issue)
- Products auto-reload on page refresh
- No database storage - orders sent via email only
- Uses buffer reading to avoid file locks

---

### 3. AUTHENTICATION FLOW

**Routes:** `/login`, `/signup`, `/forgot-password`

**Login Options:**
1. **Dummy Login** (for testing)
   - Username: `123456`
   - Password: `123456`
   - Stored in localStorage
   - No Supabase auth

2. **Supabase Login**
   - Email/password authentication
   - Stored in Supabase Auth
   - Persistent sessions

**Process:**
- Login checks dummy credentials first
- Falls back to Supabase if not dummy
- Auth state managed by `lib/auth-context.tsx`
- Protected routes check auth status

**Key Files:**
- `app/login/page.tsx` - Login form
- `app/signup/page.tsx` - Registration
- `app/forgot-password/page.tsx` - Password reset
- `lib/auth-context.tsx` - Auth state management (Supabase + Dummy)
- `lib/auth-utils.ts` - Auth utility functions
- `app/api/auth/` - Auth API routes

---

### 4. ADMIN FLOW

**Route:** `/admin/*` (Protected - requires admin role)

**Features:**
- Dashboard with statistics
- Product management (CRUD)
- Order management (view, update status)
- User management
- Invoice generation
- Return/exchange requests
- Settings

**Access Control:**
- Checks `is_admin` field in Supabase user table
- Redirects non-admin users to homepage
- Admin guard component wraps all admin routes

**Key Files:**
- `app/admin/layout.tsx` - Admin layout with guard
- `app/admin/page.tsx` - Dashboard with analytics
- `app/admin/products/page.tsx` - Product management
- `app/admin/orders/page.tsx` - Order management
- `app/admin/coupons/page.tsx` - Coupon management
- `app/admin/reviews/page.tsx` - Review management
- `app/admin/invoices/page.tsx` - Invoice generation
- `app/admin/inventory/page.tsx` - Stock management
- `app/admin/support/page.tsx` - Chat support
- `lib/admin-services.ts` - Admin operations
- `lib/order-analytics.ts` - Analytics and reports
- `lib/coupon-services.ts` - Coupon management
- `lib/review-services.ts` - Review management
- `lib/invoice-service.ts` - Invoice generation
- `lib/inventory-services.ts` - Stock management
- `lib/chat-services.ts` - Chat support
- `components/admin/admin-guard.tsx` - Access control

---

### 5. ORDER MANAGEMENT FLOW

**Process:**
1. Customer places order
2. Order saved to Supabase `orders` table
3. Email sent to admin and customer
4. Admin can view order in admin panel
5. Admin updates order status (Processing → Shipped → Delivered)
6. Customer can track order from profile
7. Customer can request return/exchange
8. Admin reviews and approves/rejects requests

**Order Statuses:**
- `pending` - Payment pending
- `processing` - Order confirmed
- `shipped` - Out for delivery
- `delivered` - Completed
- `cancelled` - Cancelled
- `returned` - Return initiated
- `refunded` - Refund processed

**Key Files:**
- `lib/order-services.ts` - Order CRUD operations
- `lib/order-management-service.ts` - Status updates
- `app/api/orders/requests/route.ts` - Return/exchange API
- `app/admin/orders/page.tsx` - Admin order view
- `app/profile/page.tsx` - Customer order view

---

### 6. PAYMENT FLOW (Razorpay)

**Process:**
1. User clicks "Place Order" in checkout
2. API creates Razorpay order: `/api/razorpay/create-order`
3. Razorpay modal opens for payment
4. User completes payment
5. Payment verified: `/api/razorpay/verify-payment`
6. Order saved to database
7. Confirmation email sent
8. Redirect to success page

**Payment Methods:**
- Online (Razorpay) - Credit/Debit/UPI/Netbanking
- Cash on Delivery (COD)

**Key Files:**
- `app/api/razorpay/create-order/route.ts`
- `app/api/razorpay/verify-payment/route.ts`
- `app/checkout/page.tsx` - Payment integration

**Environment Variables:**
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

### 7. EMAIL NOTIFICATION FLOW

**Trigger Events:**
- Order placed
- Order status updated
- Return/exchange request
- Password reset

**Email Service:** Nodemailer with Gmail SMTP

**Process:**
1. Event triggers email function
2. HTML template generated
3. Email sent via SMTP
4. Admin receives notification
5. Customer receives confirmation

**Key Files:**
- `lib/email-service.ts` - Email sending logic
- `app/api/send-email/route.ts` - Email API
- `app/api/customize-order/route.ts` - Custom order emails

**Environment Variables:**
```
EMAIL_USER=lunarz.info@gmail.com
EMAIL_APP_PASSWORD=your_app_password
```

**Setup:**
1. Enable 2FA on Gmail
2. Generate App Password
3. Add to `.env.local`

---

### 8. SHIPPING INTEGRATION (Shiprocket)

**Process:**
1. Order placed and confirmed
2. Admin creates shipment in Shiprocket
3. Tracking ID generated
4. Customer can track order
5. Status updates synced

**Key Files:**
- `lib/shiprocket-service.ts` - Shiprocket API client
- `app/api/shiprocket/create-order/route.ts`
- `app/api/shiprocket/track-order/route.ts`
- `app/track-order/page.tsx` - Customer tracking

**Environment Variables:**
```
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
```

---

## 🔧 ENVIRONMENT VARIABLES

Create `.env.local` file in root:

```env
# Supabase (replaces Firebase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email (Gmail)
EMAIL_USER=lunarz.info@gmail.com
EMAIL_APP_PASSWORD=your_app_password

# Shiprocket (Optional)
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password

# Google Drive (Optional - for file uploads)
GOOGLE_DRIVE_CLIENT_EMAIL=your_service_account_email
GOOGLE_DRIVE_PRIVATE_KEY=your_private_key
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

---

## 🚀 GETTING STARTED

**Quick Installation:** See [INSTALL.md](./INSTALL.md) for complete setup guide.

### Installation

```bash
# Install dependencies
npm install

# Required packages
npm install @supabase/supabase-js razorpay nodemailer xlsx googleapis
```

### Supabase Setup

1. **Create Supabase Project:**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Create a new project
   - Wait for database to be ready

2. **Run Database Setup:**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase-setup.sql`
   - Run the SQL script
   - This creates all tables, policies, and triggers

3. **Get API Keys:**
   - Go to Project Settings → API
   - Copy `Project URL` and `anon public` key
   - Add to `.env.local`

4. **Create Admin User:**
   - Sign up through the app
   - Go to Supabase Table Editor → `users` table
   - Find your user and set `is_admin = true`

**Full setup guide:** [INSTALL.md](./INSTALL.md)

### Development

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

### Important Notes

1. **Excel File Lock Issue:**
   - Close `data/products.xlsx` in Excel before starting server
   - File uses buffer reading to minimize locks
   - Test with: `node scripts/test-excel-read.js`

2. **Dummy Login:**
   - Username: `123456`
   - Password: `123456`
   - For quick testing without Supabase auth

3. **Custom T-Shirt Orders:**
   - No database storage
   - Orders sent via email only
   - Edit `data/products.xlsx` to update products

4. **Admin Access:**
   - Set `is_admin = true` in Supabase users table
   - Access: `/admin`

---

## 📊 DATABASE STRUCTURE (Supabase PostgreSQL)

### Core Tables

**users** - User accounts
```sql
id UUID PRIMARY KEY (references auth.users)
email TEXT NOT NULL UNIQUE
display_name TEXT
phone TEXT
is_admin BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
updated_at TIMESTAMP
```

**products** - Product catalog
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
price NUMERIC(10, 2) NOT NULL
category TEXT NOT NULL
images TEXT[] NOT NULL
sizes TEXT[] NOT NULL
description TEXT
material TEXT
care TEXT
origin TEXT
manufacturer TEXT
stock INTEGER DEFAULT 0
is_trending BOOLEAN DEFAULT FALSE
is_latest_collection BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
updated_at TIMESTAMP
```

**orders** - Customer orders
```sql
id UUID PRIMARY KEY
order_id TEXT NOT NULL UNIQUE
user_id UUID REFERENCES users(id)
items JSONB NOT NULL
total_amount NUMERIC(10, 2) NOT NULL
shipping_address JSONB NOT NULL
payment_method TEXT NOT NULL
payment_status TEXT NOT NULL
order_status TEXT NOT NULL
razorpay_order_id TEXT
razorpay_payment_id TEXT
shiprocket_order_id TEXT
tracking_id TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

**order_requests** - Returns/Exchanges
```sql
id UUID PRIMARY KEY
request_id TEXT NOT NULL UNIQUE
order_id TEXT NOT NULL
user_id UUID REFERENCES users(id)
type TEXT CHECK (type IN ('return', 'exchange'))
reason TEXT NOT NULL
status TEXT CHECK (status IN ('pending', 'approved', 'rejected'))
created_at TIMESTAMP
updated_at TIMESTAMP
```

**addresses** - Saved addresses
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
name TEXT NOT NULL
phone TEXT NOT NULL
address_line1 TEXT NOT NULL
address_line2 TEXT
city TEXT NOT NULL
state TEXT NOT NULL
pincode TEXT NOT NULL
is_default BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
updated_at TIMESTAMP
```

**coupons** - Discount coupons
```sql
id UUID PRIMARY KEY
code TEXT NOT NULL UNIQUE
name TEXT NOT NULL
description TEXT NOT NULL
type TEXT CHECK (type IN ('percentage', 'fixed', 'buy_x_get_y'))
value NUMERIC(10, 2) NOT NULL
min_order_amount NUMERIC(10, 2)
max_discount NUMERIC(10, 2)
usage_limit INTEGER
used_count INTEGER DEFAULT 0
valid_from TIMESTAMP NOT NULL
valid_to TIMESTAMP NOT NULL
is_active BOOLEAN DEFAULT TRUE
applicable_products UUID[]
created_at TIMESTAMP
updated_at TIMESTAMP
```

**reviews** - Customer reviews
```sql
id UUID PRIMARY KEY
customer_name TEXT NOT NULL
customer_image TEXT
rating INTEGER CHECK (rating >= 1 AND rating <= 5)
review_text TEXT NOT NULL
date TIMESTAMP DEFAULT NOW()
verified BOOLEAN DEFAULT FALSE
source TEXT CHECK (source IN ('google', 'website', 'manual'))
location TEXT
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMP
updated_at TIMESTAMP
```

**invoices** - Generated invoices
```sql
id UUID PRIMARY KEY
invoice_number TEXT NOT NULL UNIQUE
invoice_date TEXT NOT NULL
due_date TEXT NOT NULL
company_name TEXT NOT NULL
customer_name TEXT NOT NULL
items JSONB NOT NULL
subtotal NUMERIC(10, 2) NOT NULL
total_amount NUMERIC(10, 2) NOT NULL
status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'))
... (see supabase-setup.sql for full schema)
created_at TIMESTAMP
updated_at TIMESTAMP
```

**stock_entries** - Inventory tracking
```sql
id UUID PRIMARY KEY
product_id UUID REFERENCES products(id)
type TEXT CHECK (type IN ('in', 'out', 'adjustment'))
quantity INTEGER NOT NULL
reason TEXT NOT NULL
reference TEXT
notes TEXT
date TIMESTAMP DEFAULT NOW()
user_id UUID REFERENCES users(id)
created_at TIMESTAMP
```

**chat_sessions** - Support chat sessions
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
guest_email TEXT
guest_name TEXT
status TEXT CHECK (status IN ('active', 'closed', 'waiting'))
priority TEXT CHECK (priority IN ('low', 'medium', 'high'))
assigned_to UUID REFERENCES users(id)
last_message TEXT
unread_count INTEGER DEFAULT 0
user_unread_count INTEGER DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

**chat_messages** - Chat messages
```sql
id UUID PRIMARY KEY
session_id UUID REFERENCES chat_sessions(id)
sender_id TEXT NOT NULL
sender_type TEXT CHECK (sender_type IN ('user', 'admin', 'system'))
sender_name TEXT NOT NULL
message TEXT NOT NULL
message_type TEXT CHECK (message_type IN ('text', 'system', 'email_notification'))
is_read BOOLEAN DEFAULT FALSE
timestamp TIMESTAMP DEFAULT NOW()
```

**shipping_settings** - Shipping configuration
```sql
id UUID PRIMARY KEY
cod_shipping_charge NUMERIC(10, 2) DEFAULT 50
free_shipping_threshold NUMERIC(10, 2) DEFAULT 999
standard_shipping_charge NUMERIC(10, 2) DEFAULT 0
express_shipping_charge NUMERIC(10, 2) DEFAULT 100
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Complete schema:** See `supabase-setup.sql` for full table definitions, indexes, RLS policies, and triggers.

---

## 🎨 KEY COMPONENTS

### Context Providers

**AuthContext** (`lib/auth-context.tsx`)
- Manages user authentication state
- Handles dummy login and Supabase auth
- Provides `user`, `loading`, `login`, `logout` functions

**CartContext** (`lib/cart-context.tsx`)
- Manages shopping cart state
- Add/remove/update cart items
- Calculate totals
- Persist cart in localStorage

### Reusable Components

- `components/navbar.tsx` - Navigation with cart count
- `components/footer.tsx` - Footer with links
- `components/ui/loader.tsx` - Loading spinner
- `components/ui/toast.tsx` - Toast notifications
- `components/admin/admin-guard.tsx` - Admin route protection

---

## 🐛 TROUBLESHOOTING

### Excel File Issues

**Error:** "Cannot access file"
**Solution:** Close Excel file completely, restart dev server

**Test:** `node scripts/test-excel-read.js`

### Email Not Sending

**Check:**
1. Gmail App Password configured correctly
2. 2FA enabled on Gmail account
3. Environment variables set in `.env.local`

**Test:** Visit `/api/test-email`

### Payment Failing

**Check:**
1. Razorpay keys in `.env.local`
2. Test mode vs Live mode keys
3. Browser console for errors

### Admin Access Denied

**Solution:**
1. Open Supabase Dashboard
2. Go to Table Editor
3. Open `users` table
4. Find your user
5. Set `is_admin = true`

---

## 📝 DEVELOPMENT RULES FOR AI

### When Editing This Repository:

1. **Documentation:**
   - Update ONLY this README.md file
   - Do NOT create new MD files
   - Keep this file as single source of truth

2. **Database:**
   - All data stored in Supabase PostgreSQL
   - Use `lib/supabase-services.ts` for database operations
   - Never use Firebase imports

3. **Excel Products:**
   - Products loaded from `data/products.xlsx`
   - API route: `/api/customize-products`
   - Loader: `lib/excel-loader.ts`
   - Uses buffer reading to avoid file locks

4. **Two Checkout Flows:**
   - Standard: `/checkout` (Supabase DB + Auth required)
   - Custom: `/customize-checkout` (Email only + No auth)
   - Do NOT mix these flows

5. **Email Configuration:**
   - Admin email: `lunarz.info@gmail.com`
   - Customer email: from form input
   - Service: Nodemailer with Gmail SMTP

6. **Authentication:**
   - Dummy login: 123456/123456 (check first)
   - Supabase login: fallback
   - Context: `lib/auth-context.tsx`

7. **File Structure:**
   - Follow Next.js App Router conventions
   - API routes in `app/api/`
   - Components in `components/`
   - Utilities in `lib/`

8. **State Management:**
   - Auth: Context API (`lib/auth-context.tsx`)
   - Cart: Context API (`lib/cart-context.tsx`)
   - No Redux or external state library

9. **Styling:**
   - Tailwind CSS only
   - No custom CSS files except `app/globals.css`
   - Use Tailwind utility classes

10. **Supabase Integration:**
    - Always use `lib/supabase.ts` client
    - Use services from `lib/supabase-services.ts`
    - Never import Firebase packages
    - Follow RLS policies

---

## 🔄 Migration Status

**✅ COMPLETE:** Firebase has been fully replaced with Supabase.

See [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) for details.

---

## 🔐 SECURITY NOTES

- Environment variables in `.env.local` (never commit)
- Supabase Row Level Security (RLS) policies configured
- Admin routes protected with guard
- Payment verification on server-side
- Email credentials use App Passwords (not main password)

---

## 📦 DEPLOYMENT

1. Build production:
   ```bash
   npm run build
   ```

2. Set environment variables on hosting platform

3. Deploy to Vercel/Netlify/etc.

4. Supabase is already in production (no additional setup needed)

---

## 📞 SUPPORT

For issues or questions, refer to this README.md file first. All flows and configurations are documented here.

---

**Last Updated:** June 1, 2026
**Version:** 2.0.0 - Complete Supabase Migration
**Maintained By:** AI Assistant (Update this file only, no new MD files)
