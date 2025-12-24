# Admin Dashboard Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: "Access Denied" when trying to access admin dashboard

**Symptoms:**
- User is logged in but can't access `/admin`
- Gets redirected to home page with "Access denied" message
- Admin button doesn't appear in navbar

**Root Cause:**
The `isAdmin` field is not properly set or retrieved from Firestore.

**Solutions:**

#### Solution A: Use Debug Tools
1. Add the debug component to your homepage temporarily:
```bash
# In app/page.tsx, add:
import DebugAdminStatus from "@/components/debug-admin-status";

# Then add <DebugAdminStatus /> to your JSX
```

2. Log in and check what the debug component shows
3. Click "Refresh User Data" to force reload from Firestore

#### Solution B: Check Firestore Data
1. Run the debug script:
```bash
npm run debug-user your-email@example.com
```

2. Verify your user document has:
```json
{
  "uid": "your-firebase-uid",
  "email": "your-email@example.com",
  "name": "Your Name", 
  "provider": "email",
  "isAdmin": true,  // ← This must be boolean true, not string "true"
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Solution C: Manual Fix in Firebase Console
1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Find your user document
4. Add/edit the `isAdmin` field:
   - Field name: `isAdmin`
   - Field type: `boolean`
   - Field value: `true`
5. Save changes
6. Log out and log back in

#### Solution D: Use Create Admin Script
```bash
npm run create-admin your-email@example.com your-password
```

### Issue 2: Products not loading in admin dashboard

**Symptoms:**
- Admin dashboard loads but products page is empty
- Loading spinner never stops
- Console errors about Firestore permissions

**Solutions:**

#### Check Firestore Rules
Ensure your `firestore.rules` includes:
```javascript
// Products collection - readable by all, writable by admin users only
match /products/{productId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

#### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

#### Check Network Tab
1. Open browser DevTools → Network tab
2. Try to load products page
3. Look for failed Firestore requests
4. Check error messages

### Issue 3: Orders not showing up

**Symptoms:**
- Orders page loads but shows no orders
- "No orders found" message appears

**Possible Causes:**
1. No orders exist in database yet
2. Firestore rules blocking access
3. Collection name mismatch

**Solutions:**

#### Create Test Order
1. Go to your main website (not admin)
2. Add items to cart and complete checkout
3. Check if order appears in admin dashboard

#### Verify Collection Names
Check that your collections are named exactly:
- `products`
- `orders` 
- `users`
- `addresses`
- `paymentMethods`

### Issue 4: Can't add/edit products

**Symptoms:**
- Product modal opens but save fails
- "Failed to save product" error
- Console shows permission errors

**Solutions:**

#### Verify Admin Status
```bash
npm run debug-user your-email@example.com
```
Ensure `isAdmin: true` is set.

#### Check Required Fields
All these fields are required:
- Product name
- Price (number)
- Category
- Description
- Material
- Care instructions
- Origin
- Manufacturer
- At least one size

#### Check Image URLs
- Images must be valid URLs
- Use placeholder URLs for testing: `https://via.placeholder.com/400x400`

### Issue 5: Firebase connection issues

**Symptoms:**
- "Firebase not initialized" errors
- Connection timeouts
- Authentication failures

**Solutions:**

#### Verify Environment Variables
Check `.env.local` has all required variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

#### Restart Development Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### Check Firebase Project Status
1. Go to Firebase Console
2. Verify project is active
3. Check billing status (if using paid features)

## 🔧 Development Tools

### Debug Scripts
```bash
# Check user data
npm run debug-user your-email@example.com

# Create admin user
npm run create-admin your-email@example.com your-password

# Start development server
npm run dev
```

### Browser DevTools
1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor Firebase requests
3. **Application Tab**: Check localStorage/sessionStorage
4. **Firestore Tab** (if using Firebase extension): View real-time data

### Firebase Console
1. **Authentication**: Verify user accounts
2. **Firestore**: Check data structure and rules
3. **Usage**: Monitor API calls and quotas

## 🚀 Performance Tips

### Optimize Firestore Queries
- Use indexes for complex queries
- Limit query results with pagination
- Cache frequently accessed data

### Image Optimization
- Use optimized image URLs
- Consider using Firebase Storage for images
- Implement lazy loading for product images

### Error Handling
- Always wrap Firebase calls in try-catch
- Provide user-friendly error messages
- Log errors for debugging

## 📞 Getting Help

### Check Logs
1. Browser console for client-side errors
2. Firebase Console for server-side issues
3. Network tab for API failures

### Common Error Messages

#### "User not found"
- User document doesn't exist in Firestore
- Run create-admin script or register user first

#### "Permission denied"
- Firestore rules blocking access
- User doesn't have admin privileges
- Check isAdmin field in user document

#### "Document not found"
- Collection or document ID mismatch
- Check collection names and document structure

#### "Network error"
- Firebase configuration issues
- Internet connectivity problems
- Firebase service outage (check status page)

### Debug Checklist
- [ ] User is authenticated
- [ ] User has `isAdmin: true` in Firestore
- [ ] Firestore rules are deployed
- [ ] Environment variables are set
- [ ] Firebase project is active
- [ ] Collections exist with correct names
- [ ] Network requests are successful

## 🔄 Reset Instructions

If everything is broken and you need to start fresh:

### 1. Clear Browser Data
- Clear localStorage and sessionStorage
- Clear cookies for your domain
- Hard refresh (Ctrl+Shift+R)

### 2. Reset Firebase Auth
```bash
# Log out all users
# Clear auth state in your app
```

### 3. Reset Firestore Data
- Go to Firebase Console
- Delete problematic documents
- Re-run initialization scripts

### 4. Restart Everything
```bash
npm run dev
```

### 5. Re-create Admin User
```bash
npm run create-admin your-email@example.com your-password
```

This should resolve most issues. If problems persist, check the Firebase Console for service status and quotas.