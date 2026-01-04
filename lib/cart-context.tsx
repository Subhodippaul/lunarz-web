"use client";
import { createContext, useContext, useReducer, ReactNode } from "react";
import { Product } from "./data";

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedVariant?: string;
  // Custom product fields
  isCustom?: boolean;
  customDesign?: {
    image: string | null;
    text: string;
    textColor: string;
    textSize: number;
    textPosition: { x: number; y: number };
    imagePosition: { x: number; y: number };
    imageSize: number;
    rotation: number;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> | any } // Allow flexible payload for custom products
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      // Handle both regular products and custom products
      let newItem: CartItem;
      
      if (action.payload.isCustom) {
        // Custom product - create CartItem from custom product data
        newItem = {
          id: Date.now(),
          product: {
            id: action.payload.id,
            name: action.payload.name,
            price: action.payload.price,
            category: action.payload.category,
            images: [action.payload.image],
            sizes: [action.payload.size],
            description: "Custom designed t-shirt",
            material: "100% Cotton",
            care: "Machine wash cold",
            origin: "India",
            manufacturer: "Lunarz Custom"
          },
          quantity: action.payload.quantity,
          selectedSize: action.payload.size,
          selectedVariant: action.payload.color,
          isCustom: true,
          customDesign: action.payload.customDesign
        };
      } else {
        // Regular product
        const existingItemIndex = state.items.findIndex(
          (item) =>
            item.product.id === action.payload.product.id &&
            item.selectedSize === action.payload.selectedSize &&
            item.selectedVariant === action.payload.selectedVariant &&
            !item.isCustom
        );

        if (existingItemIndex > -1) {
          // Update existing item quantity
          const newItems = state.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          );
          
          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return { items: newItems, total };
        }

        newItem = {
          id: Date.now(),
          ...action.payload,
        };
      }

      const newItems = [...state.items, newItem];
      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      return { items: newItems, total };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      return { items: newItems, total };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      return { items: newItems, total };
    }

    case "CLEAR_CART":
      return { items: [], total: 0 };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}