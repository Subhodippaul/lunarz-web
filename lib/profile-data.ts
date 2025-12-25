// Mock data for user profile

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: {
    productId: string; // Changed from number to string to match Product.id
    name: string;
    size: string;
    variant?: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  shippingAddress: Address;
}

export interface Address {
  id: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: "credit" | "debit";
  cardNumber: string; // Last 4 digits
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  joinDate: string;
}

// Mock data
export const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "LNZ001234",
    date: "2024-12-20",
    status: "delivered",
    items: [
      {
        productId: "1", // Changed from number to string
        name: "Anime Oversized Tee",
        size: "L",
        variant: "Black",
        quantity: 2,
        price: 999,
      },
      {
        productId: "3", // Changed from number to string
        name: "Pink Floyd Tee",
        size: "M",
        quantity: 1,
        price: 1099,
      },
    ],
    total: 3097,
    shippingAddress: {
      id: "addr1",
      type: "home",
      isDefault: true,
      fullName: "John Doe",
      phone: "+91 9876543210",
      addressLine1: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    },
  },
  {
    id: "2",
    orderNumber: "LNZ001235",
    date: "2024-12-18",
    status: "shipped",
    items: [
      {
        productId: "2", // Changed from number to string
        name: "Football Fan Tee",
        size: "XL",
        variant: "Blue",
        quantity: 1,
        price: 899,
      },
    ],
    total: 899,
    shippingAddress: {
      id: "addr2",
      type: "work",
      isDefault: false,
      fullName: "John Doe",
      phone: "+91 9876543210",
      addressLine1: "456 Business Park",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      country: "India",
    },
  },
  {
    id: "3",
    orderNumber: "LNZ001236",
    date: "2024-12-15",
    status: "pending",
    items: [
      {
        productId: "4", // Changed from number to string
        name: "Streetwear Black Tee",
        size: "L",
        quantity: 1,
        price: 949,
      },
    ],
    total: 949,
    shippingAddress: {
      id: "addr1",
      type: "home",
      isDefault: true,
      fullName: "John Doe",
      phone: "+91 9876543210",
      addressLine1: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    },
  },
];

export const mockAddresses: Address[] = [
  {
    id: "addr1",
    type: "home",
    isDefault: true,
    fullName: "John Doe",
    phone: "+91 9876543210",
    addressLine1: "123 Main Street",
    addressLine2: "Apartment 4B",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
  },
  {
    id: "addr2",
    type: "work",
    isDefault: false,
    fullName: "John Doe",
    phone: "+91 9876543210",
    addressLine1: "456 Business Park",
    addressLine2: "Floor 5, Office 502",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    country: "India",
  },
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "card1",
    type: "credit",
    cardNumber: "1234",
    cardholderName: "John Doe",
    expiryMonth: "12",
    expiryYear: "26",
    isDefault: true,
  },
  {
    id: "card2",
    type: "debit",
    cardNumber: "5678",
    cardholderName: "John Doe",
    expiryMonth: "08",
    expiryYear: "25",
    isDefault: false,
  },
];

export const mockUserProfile: UserProfile = {
  id: "user1",
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "+91 9876543210",
  joinDate: "2024-01-15",
};