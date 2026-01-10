# Order Management System - Return, Exchange & Cancellation

## Overview
Comprehensive order management system that allows customers to return, exchange, or cancel orders with full email notification workflow to admin.

## Features Implemented

### 1. Customer Features
- **Order Cancellation**: Cancel orders before shipping
- **Order Returns**: Return delivered items within 30 days
- **Order Exchanges**: Exchange items for different size/color within 15 days
- **Order Tracking**: View order status and eligibility for actions
- **Email Notifications**: Automatic confirmation emails for all requests

### 2. Admin Features
- **Request Management**: View and manage all return/exchange/cancel requests
- **Status Updates**: Update request status with admin notes
- **Email Notifications**: Automatic notifications to admin for new requests
- **Refund Processing**: Set refund amounts for returns
- **Filtering**: Filter requests by status and type

### 3. Email System
- **Admin Notifications**: Sent to `lunarz.info@gmail.com` for every action
- **Customer Confirmations**: Sent to customers for request confirmations and status updates
- **Professional Templates**: HTML email templates with branding

## File Structure

### Core Services
- `lib/order-management-service.ts` - Main service for order management operations
- `lib/email-service.ts` - Email service (existing, enhanced for order management)

### API Routes
- `app/api/orders/return-exchange/route.ts` - Handle return/exchange/cancel requests
- `app/api/orders/update-request/route.ts` - Admin updates to requests

### Customer Components
- `components/order-actions.tsx` - Order action buttons (cancel/return/exchange)
- `components/return-exchange-modal.tsx` - Modal for creating requests
- `components/orders-with-actions.tsx` - Orders list with management features (integrated in profile)
- `app/profile/page.tsx` - Profile page with integrated order management

### Admin Components
- `app/admin/returns/page.tsx` - Admin panel for managing requests
- Updated `app/admin/layout.tsx` - Added Returns navigation

### Database Schema
```typescript
interface ReturnExchangeRequest {
  id: string;
  orderId: string;
  userId: string;
  type: 'return' | 'exchange' | 'cancel';
  reason: string;
  description?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
    exchangeSize?: string; // For exchanges
    exchangeColor?: string; // For exchanges
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  requestDate: Timestamp;
  responseDate?: Timestamp;
  adminNotes?: string;
  refundAmount?: number;
  pickupAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  images?: string[]; // For damage/defect claims
}
```

## Business Rules

### Cancellation Eligibility
- Orders with status: 'pending', 'confirmed', 'processing'
- No time limit for cancellation before shipping

### Return Eligibility
- Orders with status: 'delivered'
- Within 30 days of delivery date
- Requires pickup address

### Exchange Eligibility
- Orders with status: 'delivered'
- Within 15 days of delivery date
- Requires pickup address
- Can specify new size/color preferences

## Email Notifications

### Admin Notifications (lunarz.info@gmail.com)
1. **New Request Created** - Immediate notification with full details
2. **Request Status Updated** - When admin updates any request status

### Customer Notifications
1. **Request Confirmation** - When customer submits a request
2. **Status Updates** - When admin approves/rejects/processes requests

## Usage Instructions

### For Customers
1. Go to **Profile** page (via navbar profile dropdown or mobile navigation)
2. Click on **"My Orders"** tab in the profile section
3. View all orders with their current status and available actions
4. Use action buttons (Cancel/Return/Exchange) based on eligibility
5. Fill out the request form with reason and details
6. For returns/exchanges, provide pickup address
7. Receive email confirmation and status updates

### For Admins
1. Access `/admin/returns` to view all requests
2. Filter by status (pending, approved, etc.) or type (return, exchange, cancel)
3. Click "View Details" to see full request information
4. Update status and add admin notes
5. Set refund amount for returns
6. Email notifications sent automatically to customer and admin

## Integration Points

### Existing Systems
- **Order System**: Integrates with existing order management
- **Email Service**: Uses existing EmailService for notifications
- **User Authentication**: Uses existing auth system
- **Firebase**: Stores requests in Firestore database

### Navigation Updates
- Integrated order management into profile page "My Orders" section
- Removed separate `/orders` page for cleaner navigation
- Profile dropdown includes direct access to profile with orders

## Environment Variables Required
```
# Email service (existing)
GMAIL_USER=lunarz.info@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Firebase (existing)
FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## Testing Checklist

### Customer Flow
- [ ] Create return request for delivered order
- [ ] Create exchange request with size/color change
- [ ] Cancel pending order
- [ ] Verify email confirmations received
- [ ] Check request status updates

### Admin Flow
- [ ] View all requests in admin panel
- [ ] Filter requests by status and type
- [ ] Update request status with notes
- [ ] Set refund amount for returns
- [ ] Verify admin email notifications

### Email System
- [ ] Admin receives notifications for new requests
- [ ] Admin receives notifications for status updates
- [ ] Customers receive confirmation emails
- [ ] Customers receive status update emails
- [ ] Email templates display correctly

## Future Enhancements
1. **Image Upload**: Allow customers to upload images for damage claims
2. **Automated Refunds**: Integration with payment gateway for automatic refunds
3. **Pickup Scheduling**: Integration with logistics partners for pickup scheduling
4. **Return Labels**: Generate return shipping labels
5. **Analytics**: Dashboard for return/exchange analytics
6. **Bulk Actions**: Admin bulk status updates
7. **Customer Chat**: In-app messaging for request discussions

## Support
For technical issues or questions about the order management system, contact the development team or refer to the individual component documentation.