import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { db, auth } from "./firebase";
import { Order, Address, PaymentMethod } from "./profile-data";
import { Product } from "./data";

// User interface for Firebase
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "email" | "google";
  isAdmin?: boolean;
}

// Collections
const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  ADDRESSES: "addresses",
  PAYMENT_METHODS: "paymentMethods",
  CART_ITEMS: "cartItems",
} as const;

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export class AuthService {
  static async registerWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userData: Omit<User, "id"> = {
        email: firebaseUser.email!,
        name,
        provider: "email",
        isAdmin: false,
      };

      await addDoc(collection(db, COLLECTIONS.USERS), {
        ...userData,
        uid: firebaseUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        id: firebaseUser.uid,
        ...userData,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await this.getUserByUid(firebaseUser.uid);
      return userDoc;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async loginWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Check if user exists in Firestore
      let userDoc = await this.getUserByUid(firebaseUser.uid).catch(() => null);

      if (!userDoc) {
        // Create new user document
        const userData: Omit<User, "id"> = {
          email: firebaseUser.email!,
          name: firebaseUser.displayName || "Google User",
          avatar: firebaseUser.photoURL || undefined,
          provider: "google",
          isAdmin: false,
        };

        await addDoc(collection(db, COLLECTIONS.USERS), {
          ...userData,
          uid: firebaseUser.uid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        userDoc = {
          id: firebaseUser.uid,
          ...userData,
        };
      }

      return userDoc;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async logout(): Promise<void> {
    await signOut(auth);
  }

  static async getUserByUid(uid: string): Promise<User> {
    const q = query(collection(db, COLLECTIONS.USERS), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("User not found");
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    return {
      id: uid,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      provider: userData.provider,
      isAdmin: userData.isAdmin || false,
    };
  }
}

// ============================================================================
// PRODUCT SERVICES
// ============================================================================

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id, // Use string ID from Firestore
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  static async addProduct(product: Omit<Product, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// ============================================================================
// ORDER SERVICES
// ============================================================================

export class OrderService {
  static async createOrder(userId: string, orderData: Omit<Order, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...orderData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  static async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async cancelOrder(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, "cancelled");
  }

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// ============================================================================
// ADDRESS SERVICES
// ============================================================================

export class AddressService {
  static async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ADDRESSES),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Address[];
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
  }

  static async addAddress(userId: string, addressData: Omit<Address, "id">): Promise<string> {
    try {
      // If this is set as default, update other addresses
      if (addressData.isDefault) {
        await this.unsetDefaultAddresses(userId);
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.ADDRESSES), {
        ...addressData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateAddress(addressId: string, updates: Partial<Address>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ADDRESSES, addressId);
      
      // If setting as default, unset other defaults first
      if (updates.isDefault) {
        const addressDoc = await getDoc(docRef);
        if (addressDoc.exists()) {
          const addressData = addressDoc.data();
          await this.unsetDefaultAddresses(addressData.userId);
        }
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async deleteAddress(addressId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ADDRESSES, addressId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    try {
      // Unset all default addresses for user
      await this.unsetDefaultAddresses(userId);
      
      // Set the specified address as default
      const docRef = doc(db, COLLECTIONS.ADDRESSES, addressId);
      await updateDoc(docRef, {
        isDefault: true,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private static async unsetDefaultAddresses(userId: string): Promise<void> {
    const q = query(
      collection(db, COLLECTIONS.ADDRESSES),
      where("userId", "==", userId),
      where("isDefault", "==", true)
    );
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false });
    });
    await batch.commit();
  }
}

// ============================================================================
// PAYMENT METHOD SERVICES
// ============================================================================

export class PaymentMethodService {
  static async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PAYMENT_METHODS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PaymentMethod[];
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return [];
    }
  }

  static async addPaymentMethod(userId: string, paymentData: Omit<PaymentMethod, "id">): Promise<string> {
    try {
      // If this is set as default, update other payment methods
      if (paymentData.isDefault) {
        await this.unsetDefaultPaymentMethods(userId);
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENT_METHODS), {
        ...paymentData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updatePaymentMethod(paymentId: string, updates: Partial<PaymentMethod>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PAYMENT_METHODS, paymentId);
      
      // If setting as default, unset other defaults first
      if (updates.isDefault) {
        const paymentDoc = await getDoc(docRef);
        if (paymentDoc.exists()) {
          const paymentData = paymentDoc.data();
          await this.unsetDefaultPaymentMethods(paymentData.userId);
        }
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async deletePaymentMethod(paymentId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PAYMENT_METHODS, paymentId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async setDefaultPaymentMethod(userId: string, paymentId: string): Promise<void> {
    try {
      // Unset all default payment methods for user
      await this.unsetDefaultPaymentMethods(userId);
      
      // Set the specified payment method as default
      const docRef = doc(db, COLLECTIONS.PAYMENT_METHODS, paymentId);
      await updateDoc(docRef, {
        isDefault: true,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private static async unsetDefaultPaymentMethods(userId: string): Promise<void> {
    const q = query(
      collection(db, COLLECTIONS.PAYMENT_METHODS),
      where("userId", "==", userId),
      where("isDefault", "==", true)
    );
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false });
    });
    await batch.commit();
  }
}

// ============================================================================
// CART SERVICES
// ============================================================================

export interface CartItem {
  id: string;
  userId: string;
  productId: string; // Changed from number to string to match Product.id
  quantity: number;
  selectedSize: string;
  selectedVariant?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class CartService {
  static async getUserCartItems(userId: string): Promise<CartItem[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CART_ITEMS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CartItem[];
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }
  }

  static async addToCart(
    userId: string,
    productId: string, // Changed from number to string
    quantity: number,
    selectedSize: string,
    selectedVariant?: string
  ): Promise<string> {
    try {
      // Check if item already exists in cart
      const existingItem = await this.findCartItem(userId, productId, selectedSize, selectedVariant);
      
      if (existingItem) {
        // Update quantity
        await this.updateCartItemQuantity(existingItem.id, existingItem.quantity + quantity);
        return existingItem.id;
      } else {
        // Add new item
        const docRef = await addDoc(collection(db, COLLECTIONS.CART_ITEMS), {
          userId,
          productId,
          quantity,
          selectedSize,
          selectedVariant,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        return docRef.id;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeFromCart(cartItemId);
        return;
      }

      const docRef = doc(db, COLLECTIONS.CART_ITEMS, cartItemId);
      await updateDoc(docRef, {
        quantity,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async removeFromCart(cartItemId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CART_ITEMS, cartItemId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async clearUserCart(userId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTIONS.CART_ITEMS), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private static async findCartItem(
    userId: string,
    productId: string, // Changed from number to string
    selectedSize: string,
    selectedVariant?: string
  ): Promise<CartItem | null> {
    try {
      let q = query(
        collection(db, COLLECTIONS.CART_ITEMS),
        where("userId", "==", userId),
        where("productId", "==", productId),
        where("selectedSize", "==", selectedSize)
      );

      if (selectedVariant) {
        q = query(q, where("selectedVariant", "==", selectedVariant));
      }

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        } as CartItem;
      }
      
      return null;
    } catch (error) {
      console.error("Error finding cart item:", error);
      return null;
    }
  }
}

// ============================================================================
// USER PROFILE SERVICES
// ============================================================================

export class UserService {
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where("uid", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async checkUserExists(email: string): Promise<boolean> {
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error: any) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  static async resetPassword(email: string, newPassword: string): Promise<boolean> {
    try {
      // Note: Firebase Auth doesn't allow direct password updates without current password
      // In a real implementation, you would need to use Firebase Admin SDK on the server
      // For now, we'll just update the user document to indicate password was reset
      
      const q = query(collection(db, COLLECTIONS.USERS), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          passwordResetAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        
        // In production, you would use Firebase Admin SDK here:
        // await admin.auth().updateUser(uid, { password: newPassword });
        
        console.log(`Password reset recorded for user: ${email}`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error resetting password:", error);
      return false;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user document
      const q = query(collection(db, COLLECTIONS.USERS), where("uid", "==", userId));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);

      // Delete user document
      if (!querySnapshot.empty) {
        batch.delete(querySnapshot.docs[0].ref);
      }

      // Delete related data
      const collections = [
        COLLECTIONS.ADDRESSES,
        COLLECTIONS.PAYMENT_METHODS,
        COLLECTIONS.CART_ITEMS,
        COLLECTIONS.ORDERS,
      ];

      for (const collectionName of collections) {
        const relatedQuery = query(
          collection(db, collectionName),
          where("userId", "==", userId)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        relatedSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}