# 🚀 Quick Setup Instructions

## ⚡ Get Started in 5 Minutes

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

### Step 2: Create Supabase Project (2 min)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Name: `lunarz-web`
   - Database Password: (save it!)
   - Region: Choose closest
4. Wait ~2 minutes

### Step 3: Setup Database (1 min)

1. In Supabase Dashboard → **SQL Editor**
2. Click "New Query"
3. Copy entire `supabase-setup.sql` file
4. Paste and click **Run**
5. Check **Table Editor** - you should see 6 tables

### Step 4: Configure Environment (1 min)

1. In Supabase Dashboard → **Settings** → **API**
2. Copy:
   - Project URL
   - anon public key

3. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Add your other keys (Razorpay, Email, etc.)
```

### Step 5: Start App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 6: Create Admin User

1. Go to `/signup`
2. Create account
3. In Supabase Dashboard:
   - **Table Editor** → **users**
   - Find your user
   - Click to edit
   - Set `is_admin` = `true`
   - Save
4. Refresh app - you're now admin!

---

## ✅ You're Done!

Test these features:
- ✅ Login (use 123456/123456 for dummy login)
- ✅ Browse products at `/products`
- ✅ Custom t-shirts at `/customize-your-tshirt`
- ✅ Admin panel at `/admin`

---

## 📚 Full Documentation

- **Complete Setup:** [INSTALL.md](./INSTALL.md)
- **Migration Details:** [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)
- **Main Docs:** [README.md](./README.md)

---

## 🐛 Quick Fixes

**Products not loading?**
- Check Supabase connection
- Verify tables exist in Table Editor
- Check browser console (F12)

**Can't login?**
- Try dummy login: 123456/123456
- Check Supabase Auth is enabled

**Admin access denied?**
- Set `is_admin = true` in users table

---

**Need Help?** Check the full guides above or open an issue.
