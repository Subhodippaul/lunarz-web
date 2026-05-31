# 🔄 Firebase to Supabase Migration Guide

## ✅ What's Been Done

Firebase has been completely replaced with Supabase throughout the application.

### Files Changed/Created:

**New Files:**
- `lib/supabase.ts` - Supabase client configuration
- `lib/supabase-services.ts` - Database CRUD operations (replaces firebase-services.ts)
- `supabase-setup.sql` - Database schema and setup script

**Updated Files:**
- `lib/auth-context.tsx` - Now uses Supabase Auth
- `package.json` - Replaced `firebase` with `@supabase/supabase-js`
- `.env.local.example` - Updated environment variables
- `README.md` - Updated all documentation

**Files to Delete (Old Firebase files):**
- `lib/firebase.ts`
- `lib/firebase-services.ts`

---

## 🚀 Setup Instructions

### Step 1: Install Supabase

```bash
npm install @supabase/supabase-js
npm uninstall firebase
```

### Step 2: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: lunarz-web
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be ready (~2 minutes)

### Step 3: Setup Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase-setup.sql`
4. Paste and click "Run"
5. Verify tables created: Go to **Table Editor** and see:
   - users
   - products
   - orders
   - order_requests

### Step 4: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 5: Update Environment Variables

Create/update `.env.local`:

```env
# Remove all Firebase variables
# Add Supabase variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Keep other variables (Razorpay, Email, etc.)
```

### Step 6: Create Admin User

1. Start your app: `npm run dev`
2. Go to `/signup` and create an account
3. In Supabase Dashboard:
   - Go to **Table Editor** → **users**
   - Find your user row
   - Click to edit
   - Set `is_admin` = `true`
   - Save
4. Refresh your app - you now have admin access!

### Step 7: Migrate Data (If you have existing Firebase data)

**Option A: Manual Migration (Small dataset)**
1. Export data from Firebase Console
2. Format as SQL INSERT statements
3. Run in Supabase SQL Editor

**Option B: Script Migration (Large dataset)**
```javascript
// migration-script.js
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

// Initialize both
const firebaseApp = admin.initializeApp({...});
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Migrate products
async function migrateProducts() {
  const snapshot = await admin.firestore().collection('products').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    await supabase.from('products').insert({
      id: doc.id,
      name: data.name,
      price: data.price,
      // ... map all fields
    });
  }
}

// Run migrations
migrateProducts();
// migrateOrders();
// migrateUsers();
```

### Step 8: Update Code References

**Files that need updating (if you have custom code):**

Search for these imports and replace:
```typescript
// OLD (Firebase)
import { auth, db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// NEW (Supabase)
import { supabase } from './supabase';
```

**Common patterns to replace:**

| Firebase | Supabase |
|----------|----------|
| `collection(db, 'products')` | `supabase.from('products')` |
| `getDocs(query)` | `.select()` |
| `addDoc(collection, data)` | `.insert(data)` |
| `updateDoc(docRef, data)` | `.update(data).eq('id', id)` |
| `deleteDoc(docRef)` | `.delete().eq('id', id)` |
| `where('field', '==', value)` | `.eq('field', value)` |
| `orderBy('field')` | `.order('field')` |
| `limit(10)` | `.limit(10)` |

### Step 9: Test Everything

1. **Authentication:**
   - Sign up new user
   - Login with email/password
   - Logout
   - Dummy login (123456/123456)

2. **Products:**
   - View products list
   - View product details
   - Admin: Create/Edit/Delete products

3. **Orders:**
   - Add to cart
   - Checkout
   - Place order
   - View orders in profile
   - Admin: View all orders

4. **Custom T-Shirts:**
   - View `/customize-your-tshirt`
   - Products load from Excel
   - Place custom order (email only)

---

## 🔑 Key Differences: Firebase vs Supabase

### Authentication

**Firebase:**
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);
```

**Supabase:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Database Queries

**Firebase (Firestore):**
```typescript
const snapshot = await getDocs(collection(db, 'products'));
const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**Supabase (PostgreSQL):**
```typescript
const { data: products, error } = await supabase
  .from('products')
  .select('*');
```

### Real-time Subscriptions

**Firebase:**
```typescript
onSnapshot(collection(db, 'orders'), (snapshot) => {
  // Handle changes
});
```

**Supabase:**
```typescript
supabase
  .channel('orders')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
    // Handle changes
  })
  .subscribe();
```

---

## 🎯 Benefits of Supabase

1. **PostgreSQL** - More powerful than Firestore
2. **SQL Queries** - Full SQL support
3. **Row Level Security** - Built-in security policies
4. **Better Pricing** - More generous free tier
5. **Open Source** - Can self-host if needed
6. **Better TypeScript Support** - Auto-generated types
7. **Realtime** - Built-in realtime subscriptions
8. **Storage** - Built-in file storage (like Firebase Storage)

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
**Solution:** Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "relation does not exist"
**Solution:** Run `supabase-setup.sql` in SQL Editor

### Error: "Row Level Security policy violation"
**Solution:** Check RLS policies in Supabase Dashboard → Authentication → Policies

### Can't login after migration
**Solution:** 
1. Users need to sign up again (passwords are hashed differently)
2. Or use password reset flow
3. Or manually set passwords in Supabase Auth dashboard

### Admin access not working
**Solution:** Set `is_admin = true` in users table for your user

---

## 📝 Checklist

- [ ] Supabase project created
- [ ] Database setup SQL executed
- [ ] Environment variables updated
- [ ] Dependencies installed (`@supabase/supabase-js`)
- [ ] Old Firebase files deleted
- [ ] Admin user created and configured
- [ ] Authentication tested
- [ ] Products CRUD tested
- [ ] Orders flow tested
- [ ] Custom t-shirt flow tested
- [ ] Email notifications working
- [ ] Payment integration working

---

## 🎉 Migration Complete!

Your app now uses Supabase instead of Firebase. All functionality remains the same, but with a more powerful PostgreSQL database and better developer experience.

**Next Steps:**
1. Delete old Firebase files: `lib/firebase.ts`, `lib/firebase-services.ts`
2. Remove Firebase from Google Cloud Console (if not used elsewhere)
3. Update any deployment configurations
4. Celebrate! 🎊

---

**Need Help?** Check the main README.md for complete documentation.
