# Admin Dashboard

This admin dashboard provides comprehensive management capabilities for your e-commerce platform.

## Features

### 🏠 Dashboard Overview
- Real-time statistics (products, orders, users, revenue)
- Pending orders count
- Quick action buttons for common tasks

### 📦 Product Management
- View all products in a searchable table
- Add new products with full details (images, variants, sizes)
- Edit existing products
- Delete products
- Category-based filtering

### 📋 Order Management
- View all customer orders
- Filter by order status (pending, confirmed, shipped, delivered, cancelled)
- Search by order number, customer name, or order ID
- Update order status
- View detailed order information including:
  - Customer details
  - Shipping address
  - Order items and quantities
  - Order timeline

### 👥 User Management
- View all registered users
- Search users by name or email
- Promote users to admin role
- View user statistics (total users, admin count, Google vs email users)
- User registration date tracking

## Getting Started

### 1. Create Your First Admin User

After setting up the application, you need to create an admin user:

1. First, register a regular user account through the normal signup process
2. Run the admin creation script:

```bash
npm run create-admin <your-email> <your-password>
```

Example:
```bash
npm run create-admin admin@example.com mypassword123
```

### 2. Access the Admin Dashboard

1. Log in with your admin account
2. You'll see an "Admin" button in the navigation bar
3. Click it to access the admin dashboard at `/admin`

## Security Features

### Firestore Rules
The admin dashboard is protected by Firestore security rules that:
- Only allow admin users to modify products
- Allow admins to view all orders and users
- Restrict regular users to their own data

### Route Protection
- Admin routes are protected by the `AdminGuard` component
- Non-admin users are redirected to the home page
- Unauthenticated users are redirected to login

## File Structure

```
app/admin/
├── layout.tsx          # Admin dashboard layout with sidebar
├── page.tsx           # Dashboard overview with stats
├── products/
│   └── page.tsx       # Product management interface
├── orders/
│   └── page.tsx       # Order management interface
└── users/
    └── page.tsx       # User management interface

components/admin/
├── admin-guard.tsx    # Route protection component
├── product-modal.tsx  # Add/edit product modal
└── order-modal.tsx    # Order details modal

lib/
└── admin-services.ts  # Firebase services for admin operations

scripts/
└── create-admin.js    # Script to promote users to admin
```

## Admin Services

The `admin-services.ts` file provides specialized Firebase operations:

### AdminProductService
- `getAllProducts()` - Fetch all products
- `addProduct(product)` - Create new product
- `updateProduct(id, updates)` - Update existing product
- `deleteProduct(id)` - Remove product

### AdminOrderService
- `getAllOrders()` - Fetch all orders across all users
- `updateOrderStatus(orderId, status)` - Change order status
- `getOrderById(orderId)` - Get specific order details
- `deleteOrder(orderId)` - Remove order

### AdminUserService
- `getAllUsers()` - Fetch all registered users
- `updateUserRole(userId, isAdmin)` - Promote/demote admin status

### AdminAnalyticsService
- `getDashboardStats()` - Get overview statistics for dashboard

## Usage Tips

### Product Management
- Use high-quality image URLs for product images
- Add multiple variants (colors) and sizes for better customer experience
- Include detailed descriptions and care instructions
- Set competitive pricing

### Order Management
- Regularly update order statuses to keep customers informed
- Use the order details modal to view complete order information
- Filter by status to focus on orders that need attention

### User Management
- Be careful when promoting users to admin - they'll have full access
- Monitor user growth through the statistics cards
- Use search to quickly find specific users

## Troubleshooting

### "Access Denied" Error
- Make sure your user account has `isAdmin: true` in Firestore
- Run the create-admin script if you haven't already
- Check that Firestore rules are properly deployed

### Products Not Saving
- Verify your user has admin privileges
- Check browser console for Firebase errors
- Ensure all required fields are filled

### Orders Not Loading
- Check Firestore rules allow admin access to orders collection
- Verify your admin status in the users collection

## Development

To extend the admin dashboard:

1. Add new routes in `app/admin/`
2. Create corresponding components in `components/admin/`
3. Add new services in `lib/admin-services.ts`
4. Update navigation in `app/admin/layout.tsx`

The dashboard is built with:
- **Next.js 16** - React framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Firebase/Firestore** - Backend and database
- **TypeScript** - Type safety