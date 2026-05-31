# 🚀 Lunarz Web - Installation Guide

Complete setup guide for the Lunarz e-commerce platform with Supabase.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Gmail account (for email notifications)
- Razorpay account (for payments)

---

## ⚡ Quick Start

### Step 1: Clone and Install

```bash
# Navigate to project
cd lunarz-web

# Install dependencies
npm install

# Install required packages
npm install @supabase/supabase-js razorpay nodemailer xlsx googleapis
```

### Step 2: Setup Supabase

1. **Create Project:**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Name: `lunarz-web`
   - Database Password: (save securely)
   - Region: Choose closest to you
   - Wait ~2 minutes for setup

2. **Run Database Setup:**
   - In Supabase Dashboard → SQL Editor
   - Click "New Query"
   - Copy entire `supabase-setup.sql` file
   - Paste and click "Run"
   - Verify tables created in Table Editor

3. **Get API Keys:**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - anon public key

### Step 3: Configure Environment

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Razorpay (get from dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_here

# Gmail (for order emails)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password
EMAIL_FROM="Lunarz <your-email@gmail.com>"
NEXT_PUBLIC_ADMIN_EMAIL=lunarz.info@gmail.com

# Shiprocket (optional)
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
```

### Step 4: Setup Gmail App Password

1. Enable 2FA on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate password for "Mail"
4. Copy 16-character password to `.env.local`

### Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 6: Create Admin User

1. Go to `/signup`
2. Create account with your email
3. In Supabase Dashboard:
   - Table Editor → users
   - Find your user
   - Set `is_admin = true`
4. Refresh app → You have admin access!

---

## 📊 Database Schema

The `supabase-setup.sql` script creates:

### Tables:
- **users** - User profiles and admin status
- **products** - Product catalog
- **orders** - Customer orders
- **order_requests** - Return/exchange requests

### Features:
- Row Level Security (RLS) policies
- Automatic timestamps
- User profile auto-creation on signup
- Indexes for performance

---

## 🎨 Add Sample Products

### Option 1: Via Admin Panel
1. Login as admin
2. Go to `/admin/products`
3. Click "Add Product"
4. Fill in details and save

### Option 2: Via SQL
```sql
INSERT INTO products (name, price, category, images, sizes, description, material, stock) VALUES
('Classic White Tee', 599, 'T-Shirts', ARRAY['/products/white-tee.jpg'], ARRAY['S','M','L','XL'], 'Premium cotton t-shirt', '100% Cotton', 100),
('Black Polo', 899, 'Polo', ARRAY['/products/black-polo.jpg'], ARRAY['S','M','L','XL'], 'Classic polo shirt', '100% Cotton', 50);
```

---

## 📦 Custom T-Shirt Setup

### Excel Products

1. **Create Excel File:**
   - Location: `data/products.xlsx`
   - Columns: id, name, price, sizes, colors, material, weight, description

2. **Example Data:**
   | id | name | price | sizes | colors |
   |----|------|-------|-------|--------|
   | custom-001 | Classic Tee | 599 | S,M,L,XL | White,Black |

3. **Important:**
   - Close Excel before starting dev server
   - Products auto-load from Excel
   - No database storage for custom orders

---

## 🔐 Security Setup

### Supabase RLS Policies

Already configured in `supabase-setup.sql`:
- Users can read/update own data
- Admins can manage all data
- Public can read products
- Authenticated users can create orders

### Environment Variables

Never commit `.env.local`:
- Already in `.gitignore`
- Use `.env.local.example` as template
- Set in deployment platform separately

---

## 🧪 Testing

### Test Dummy Login
- Username: `123456`
- Password: `123456`
- No database required

### Test Real Auth
1. Sign up with email
2. Check email for confirmation (if enabled)
3. Login with credentials

### Test Orders
1. Add products to cart
2. Proceed to checkout
3. Use Razorpay test cards:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

### Test Custom T-Shirts
1. Visit `/customize-your-tshirt`
2. Select product
3. Checkout (no login required)
4. Check email for order confirmation

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables to Set:
- All variables from `.env.local`
- Supabase URL and key
- Razorpay keys
- Email credentials

### Post-Deployment:
1. Update Supabase Auth redirect URLs
2. Test all flows in production
3. Switch Razorpay to live keys

---

## 🐛 Troubleshooting

### "Cannot access Excel file"
**Solution:** Close Excel file, restart dev server

### "Invalid API key"
**Solution:** Check `.env.local` has correct Supabase keys

### "Email not sending"
**Solution:** 
- Verify Gmail App Password
- Check 2FA is enabled
- Test with `/api/test-email`

### "Admin access denied"
**Solution:** Set `is_admin = true` in Supabase users table

### "Products not loading"
**Solution:**
- Check Supabase connection
- Verify RLS policies
- Check browser console for errors

---

## 📚 Next Steps

1. **Customize Branding:**
   - Update logo in `public/`
   - Modify colors in `tailwind.config.js`
   - Edit content in pages

2. **Add Products:**
   - Via admin panel
   - Or bulk import via SQL

3. **Configure Shipping:**
   - Setup Shiprocket account
   - Add credentials to `.env.local`
   - Test order creation

4. **Setup Analytics:**
   - Add Google Analytics
   - Configure in `app/layout.tsx`

5. **Go Live:**
   - Switch to Razorpay live keys
   - Update email templates
   - Deploy to production

---

## 🎉 You're Ready!

Your Lunarz e-commerce platform is now set up with:
- ✅ Supabase database
- ✅ Authentication (dummy + real)
- ✅ Product management
- ✅ Order processing
- ✅ Payment integration
- ✅ Email notifications
- ✅ Admin panel
- ✅ Custom t-shirt orders

**Start selling!** 🛍️

---

**Need Help?** Check `README.md` for complete documentation.
