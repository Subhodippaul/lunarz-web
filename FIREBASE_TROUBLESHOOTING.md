# Firebase Configuration Troubleshooting

## Error: Firebase: Error (auth/invalid-api-key)

This error occurs when Firebase cannot authenticate with your project. Here are the steps to fix it:

### 1. **Verify Firebase Project Status**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Check if your project `lunarz-web` exists and is active
3. Ensure the project is not suspended or deleted

### 2. **Regenerate Firebase Configuration**

If your project exists but the API key is invalid:

1. Go to Firebase Console → Project Settings
2. Scroll down to "Your apps" section
3. Click on your web app (or create a new one if missing)
4. Copy the new configuration object
5. Update your `.env.local` file with the new values

### 3. **Check Environment Variables**

Ensure your `.env.local` file has all required variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. **Restart Development Server**

After updating environment variables:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 5. **Enable Required Firebase Services**

In Firebase Console, ensure these services are enabled:

1. **Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password and Google providers

2. **Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules

3. **Storage** (if using file uploads)
   - Go to Storage
   - Get started with default rules

### 6. **Update Firebase Security Rules**

Make sure your Firestore rules allow the operations you need:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users (for testing)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** The above rules are for testing only. Use proper security rules in production.

### 7. **Check Firebase Billing**

If your project has exceeded free tier limits:

1. Go to Firebase Console → Usage and billing
2. Check if you've hit any limits
3. Upgrade to Blaze plan if needed

### 8. **Create New Firebase Project (Last Resort)**

If nothing works, create a new Firebase project:

1. Go to Firebase Console
2. Create new project
3. Enable required services
4. Update your `.env.local` with new configuration

### 9. **Test Firebase Connection**

Add this to your page to test Firebase connection:

```typescript
import { auth } from '@/lib/firebase';

// Add this in a component
useEffect(() => {
  console.log('Firebase Auth:', auth);
  console.log('Firebase Config:', auth.app.options);
}, []);
```

### 10. **Common Issues**

- **API Key Restrictions**: Check if your API key has HTTP referrer restrictions
- **Domain Restrictions**: Ensure localhost is allowed in Firebase settings
- **Project Deletion**: The project might have been accidentally deleted
- **Billing Issues**: Free tier limits might be exceeded

### Quick Fix Commands

```bash
# Check if environment variables are loaded
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

If none of these solutions work, the issue might be with the Firebase project itself. Consider creating a new Firebase project and updating your configuration.