# Lunarz Web - E-commerce Platform

A modern e-commerce platform built with Next.js 14, TypeScript, Firebase, and Tailwind CSS. Features include user authentication, product catalog, shopping cart, checkout system, and user profile management.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth login
- 🛍️ **Product Catalog**: Browse products with detailed views and filtering
- 🛒 **Shopping Cart**: Add/remove items with quantity management
- 💳 **Checkout System**: Complete order processing with address and payment management
- 👤 **User Profiles**: Manage addresses, payment methods, and order history
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🎨 **Modern UI**: Built with shadcn/ui components
- 🔥 **Firebase Integration**: Real-time database with comprehensive CRUD operations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Font**: Poppins (Google Fonts)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager
- A Firebase project set up

## Firebase Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "lunarz-web")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click "Enable" and save
   - **Google**: Click "Enable", add your project support email, and save

### 3. Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (for development)
3. Select your preferred location
4. Click "Done"

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General** tab
2. Scroll down to "Your apps" section
3. Click "Add app" > Web app icon (`</>`)
4. Register your app with a nickname (e.g., "lunarz-web")
5. Copy the Firebase configuration object

### 5. Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd lunarz-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables** (see Firebase Setup section above)

4. **Initialize sample data**:
   ```bash
   npm run init-firebase
   ```
   This will populate your Firestore database with sample products.

5. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Firestore Security Rules

For production, update your Firestore security rules. Copy the contents of `firestore.rules` to your Firebase Console:

1. Go to **Firestore Database** > **Rules**
2. Replace the existing rules with the contents of the `firestore.rules` file
3. Click **Publish**

The provided rules ensure:
- Users can only access their own data
- Products are readable by all (writable by authenticated users)
- Orders, addresses, payment methods, and cart items are only accessible by their owners

## Project Structure

```
lunarz-web/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── products/          # Product catalog
│   ├── profile/           # User profile
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── firebase-services.ts # Firebase CRUD operations
│   ├── firebase-init.ts  # Data initialization
│   ├── auth-context.tsx  # Authentication context
│   ├── cart-context.tsx  # Shopping cart context
│   └── constants.ts      # App constants
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-firebase` - Initialize Firebase with sample data

## Firebase Services

The application includes comprehensive Firebase services:

### Authentication (`AuthService`)
- Email/password registration and login
- Google OAuth integration
- User profile management

### Products (`ProductService`)
- CRUD operations for products
- Product catalog management

### Orders (`OrderService`)
- Order creation and management
- Order status updates
- Order history

### Addresses (`AddressService`)
- Multiple address management
- Default address handling

### Payment Methods (`PaymentMethodService`)
- Payment method storage
- Default payment method handling

### Cart (`CartService`)
- Shopping cart management
- Item quantity updates
- Cart persistence

## Deployment

### Quick Deploy on Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy

For detailed deployment instructions for Vercel, Netlify, Railway, DigitalOcean, and self-hosted options, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Important: Post-Deployment Steps

After deploying:
1. Add your production domain to Firebase Authentication authorized domains
2. Update Firestore security rules using the provided `firestore.rules` file
3. Test all functionality in production environment

## Troubleshooting

### Common Issues

**Firebase Configuration Errors**
- Ensure all environment variables are set correctly in `.env.local`
- Verify your Firebase project has Firestore and Authentication enabled
- Check that your domain is authorized in Firebase Authentication settings

**Authentication Issues**
- For Google OAuth, ensure your domain is added to authorized domains
- Check that the Google provider is enabled in Firebase Authentication

**Database Permission Errors**
- Update your Firestore security rules using the provided `firestore.rules` file
- Ensure you're testing with authenticated users

**Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Check that your Node.js version is 18 or higher

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Ensure your Firestore security rules are properly set
4. Check that all required environment variables are set

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
