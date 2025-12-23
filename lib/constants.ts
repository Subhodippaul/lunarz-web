// Site-wide constants and text content
export const SITE_CONFIG = {
  name: "Lunarz",
  description: "Premium Oversized T-Shirts",
  tagline: "Anime • Football • Music • Streetwear",
} as const;

// Navigation
export const NAV_LINKS = {
  home: "/",
  shop: "/products",
  cart: "/cart",
  checkout: "/checkout",
  profile: "/profile",
  login: "/login",
  signup: "/signup",
} as const;

export const NAV_TEXT = {
  shop: "Shop",
  profile: "Profile",
  login: "Login",
  logout: "Logout",
} as const;

// Hero Section
export const HERO = {
  title: "Premium Oversized T-Shirts",
  subtitle: "Anime • Football • Music • Streetwear",
  cta: "Shop Now",
} as const;

// Product Pages
export const PRODUCTS = {
  pageTitle: "All T-Shirts",
  addToCart: "Add to Cart",
  addToCartSuccess: "Product added to cart!",
  buyNow: "Buy Now",
} as const;

// Product Details
export const PRODUCT_DETAILS = {
  newCollection: "New Collection",
  priceIncludesTax: "Price incl. of all taxes",
  shopByVariant: "Shop by Variant/Look:",
  selectSize: "Please select a size:",
  sizeChart: "SIZE CHART",
  quantity: "Quantity:",
  addToCart: "ADD TO CART",
  buyNow: "BUY NOW",
  addToWishlist: "ADD TO WISHLIST",
  share: "Share:",
  deliveryDetails: "Delivery Details",
  enterPincode: "Enter Pincode",
  check: "CHECK",
  returnPolicy: "This product is eligible for return & exchange under our 30-day return and exchange policy",
  earnPoints: "🎯 Earn ₹ 149.50 as TSS Points on this purchase",
  productDetails: "Product Details",
  materialCare: "Material & Care:",
  countryOrigin: "Country of Origin:",
  manufacturer: "Manufactured & Sold By:",
  productDescription: "Product Description",
} as const;

// Cart Page
export const CART = {
  pageTitle: "Your Cart",
  shoppingCart: "Shopping Cart",
  clearCart: "Clear Cart",
  emptyCart: "Your cart is empty",
  continueShopping: "Continue Shopping",
  size: "Size:",
  color: "Color:",
  orderSummary: "Order Summary",
  subtotal: "Subtotal",
  items: "items",
  shipping: "Shipping",
  freeShipping: "Free",
  total: "Total",
  proceedToCheckout: "Proceed to Checkout",
  deliveryInfo: "Delivery Information",
  deliveryText: "Free delivery on orders above ₹999. Estimated delivery: 3-5 business days.",
} as const;

// Login Page
export const LOGIN = {
  title: "Login to Lunarz",
  emailLabel: "Email or Phone",
  emailPlaceholder: "you@example.com / 9876543210",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  forgotPassword: "Forgot password?",
  loginButton: "Login",
  loginWithGoogle: "Continue with Google",
  noAccount: "Don't have an account?",
  signUp: "Sign up",
  invalidCredentials: "Invalid email or password",
  loginSuccess: "Welcome back!",
} as const;

// Signup Page
export const SIGNUP = {
  title: "Create Account",
  nameLabel: "Full Name",
  namePlaceholder: "John Doe",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  confirmPasswordLabel: "Confirm Password",
  confirmPasswordPlaceholder: "••••••••",
  signupButton: "Create Account",
  signupWithGoogle: "Sign up with Google",
  haveAccount: "Already have an account?",
  login: "Login",
  passwordMismatch: "Passwords do not match",
  emailExists: "Email already exists",
  signupSuccess: "Account created successfully!",
  termsText: "By creating an account, you agree to our Terms of Service and Privacy Policy",
} as const;

// Auth Messages
export const AUTH = {
  loginRequired: "Please login to continue",
  loginRequiredCheckout: "You need to login before placing an order",
  sessionExpired: "Your session has expired. Please login again",
} as const;

// Footer
export const FOOTER = {
  copyright: "All rights reserved.",
} as const;

// Common UI Text
export const UI = {
  loading: "Loading...",
  error: "Something went wrong",
  retry: "Try again",
  close: "Close",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  view: "View",
  back: "Back",
  next: "Next",
  previous: "Previous",
} as const;

// Currency
export const CURRENCY = {
  symbol: "₹",
  code: "INR",
} as const;

// Product Categories
export const CATEGORIES = {
  tshirts: "T-Shirts",
  anime: "Anime",
  football: "Football",
  music: "Music",
  streetwear: "Streetwear",
} as const;

// Size Options
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

// Default Values
export const DEFAULTS = {
  defaultSize: "M",
  maxQuantity: 5,
  minOrderForFreeShipping: 999,
  estimatedDeliveryDays: "3-5 business days",
} as const;

// Checkout Page
export const CHECKOUT = {
  pageTitle: "Checkout",
  orderSummary: "Order Summary",
  billingAddress: "Billing Address",
  shippingAddress: "Shipping Address",
  paymentMethod: "Payment Method",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
  country: "Country",
  sameAsBilling: "Same as billing address",
  creditCard: "Credit Card",
  debitCard: "Debit Card",
  upi: "UPI",
  netBanking: "Net Banking",
  cod: "Cash on Delivery",
  cardNumber: "Card Number",
  expiryDate: "MM/YY",
  cvv: "CVV",
  cardholderName: "Cardholder Name",
  placeOrder: "Place Order",
  processingOrder: "Processing Order...",
  subtotal: "Subtotal",
  shipping: "Shipping",
  tax: "Tax",
  total: "Total",
  free: "Free",
} as const;

// Profile Page
export const PROFILE = {
  pageTitle: "My Profile",
  myOrders: "My Orders",
  addresses: "Saved Addresses",
  paymentMethods: "Payment Methods",
  accountSettings: "Account Settings",
  
  // Orders
  orderNumber: "Order #",
  orderDate: "Order Date",
  orderStatus: "Status",
  orderTotal: "Total",
  viewDetails: "View Details",
  cancelOrder: "Cancel Order",
  trackOrder: "Track Order",
  reorder: "Reorder",
  
  // Order Status
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  
  // Addresses
  addNewAddress: "Add New Address",
  editAddress: "Edit Address",
  deleteAddress: "Delete Address",
  setAsDefault: "Set as Default",
  defaultAddress: "Default",
  homeAddress: "Home",
  workAddress: "Work",
  otherAddress: "Other",
  
  // Payment Methods
  addNewCard: "Add New Card",
  editCard: "Edit Card",
  deleteCard: "Delete Card",
  cardEnding: "•••• ",
  expiresOn: "Expires",
  
  // Account Settings
  personalInfo: "Personal Information",
  changePassword: "Change Password",
  notifications: "Notification Preferences",
  privacy: "Privacy Settings",
  logout: "Logout",
  
  // Form Labels
  fullName: "Full Name",
  emailAddress: "Email Address",
  phoneNumber: "Phone Number",
  currentPassword: "Current Password",
  newPassword: "New Password",
  confirmPassword: "Confirm Password",
  
  // Actions
  save: "Save",
  cancel: "Cancel",
  update: "Update",
  delete: "Delete",
  add: "Add",
  edit: "Edit",
  
  // Messages
  orderCancelled: "Order cancelled successfully",
  addressAdded: "Address added successfully",
  addressUpdated: "Address updated successfully",
  addressDeleted: "Address deleted successfully",
  cardAdded: "Card added successfully",
  cardDeleted: "Card deleted successfully",
  profileUpdated: "Profile updated successfully",
} as const;