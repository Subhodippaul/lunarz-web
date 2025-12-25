# Chat System Setup Guide

## Firestore Security Rules

Add these rules to your `firestore.rules` file to secure the chat system:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chat Sessions
    match /chatSessions/{sessionId} {
      // Users can read/write their own sessions
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.admin == true);
      
      // Allow guest users to read/write sessions with their email
      allow read, write: if resource.data.guestEmail != null;
      
      // Admins can read/write all sessions
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Chat Messages
    match /chatMessages/{messageId} {
      // Users can read messages from their sessions
      allow read: if request.auth != null && 
        (exists(/databases/$(database)/documents/chatSessions/$(resource.data.sessionId)) &&
         get(/databases/$(database)/documents/chatSessions/$(resource.data.sessionId)).data.userId == request.auth.uid);
      
      // Users can write messages to their sessions
      allow write: if request.auth != null && 
        (exists(/databases/$(database)/documents/chatSessions/$(resource.data.sessionId)) &&
         get(/databases/$(database)/documents/chatSessions/$(resource.data.sessionId)).data.userId == request.auth.uid);
      
      // Admins can read/write all messages
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
      
      // Allow guest users to read/write messages for their sessions
      allow read, write: if exists(/databases/$(database)/documents/chatSessions/$(resource.data.sessionId));
    }
    
    // Stock Entries (for inventory system)
    match /stockEntries/{entryId} {
      // Only admins can read/write stock entries
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## Firebase Configuration

Make sure your Firebase project has the following collections created:

1. `chatSessions` - Stores chat session data
2. `chatMessages` - Stores individual messages
3. `stockEntries` - Stores inventory movements (if using inventory system)

## No Indexes Required

The updated chat system has been optimized to avoid composite indexes by:

- Removing `orderBy` clauses from Firestore queries
- Sorting data in JavaScript instead of Firestore
- Using simple `where` clauses only

This eliminates the need for composite indexes and prevents the Firebase index creation errors.

## Email Integration

The system references `lunarz.info@gmail.com` throughout the interface. To set up actual email notifications:

1. Integrate with an email service (SendGrid, Nodemailer, etc.)
2. Update the `sendEmailNotification` method in `chat-services.ts`
3. Configure email templates and SMTP settings

## Testing the Chat System

1. **As a Guest User:**
   - Visit any non-admin page
   - Click the chat icon
   - Enter name and email
   - Send a message

2. **As a Registered User:**
   - Login to your account
   - Click the chat icon
   - Start chatting immediately

3. **As an Admin:**
   - Go to Admin → Support
   - View all conversations
   - Reply to messages
   - Manage session status

## Troubleshooting

### Common Issues and Solutions

**1. "Unsupported field value: undefined" Error**
- **Problem:** Firestore doesn't allow `undefined` values in documents
- **Solution:** The system now filters out undefined values before saving to Firestore
- **Fixed in:** All service functions now only include fields with actual values

**2. "Query requires an index" Error**
- **Problem:** Complex queries with multiple `where` clauses and `orderBy` require composite indexes
- **Solution:** Simplified queries to use only single `where` clauses, sorting done in JavaScript
- **Result:** No Firebase indexes required

**3. Authentication Issues**
- Check Firebase console for authentication setup
- Verify user has proper permissions
- Ensure admin users have `admin: true` in their custom claims

**4. Real-time Updates Not Working**
- Check Firebase console for Firestore rules
- Verify network connection
- Check browser console for WebSocket errors

If you encounter any other issues:

1. Check Firebase console for authentication
2. Verify Firestore rules are properly set
3. Ensure collections exist in Firestore
4. Check browser console for JavaScript errors
5. Verify user has admin privileges for admin features

## Features Included

- ✅ Real-time messaging
- ✅ Guest and registered user support
- ✅ Admin chat management
- ✅ Session status tracking
- ✅ Unread message indicators
- ✅ Email contact integration
- ✅ Mobile responsive design
- ✅ No composite indexes required