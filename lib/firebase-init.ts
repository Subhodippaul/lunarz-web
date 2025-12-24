import { collection, addDoc, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";
import { products } from "./data";

// Initialize Firebase with sample data
export async function initializeFirebaseData() {
  try {
    console.log("Initializing Firebase data...");

    // Check if products already exist
    const productsSnapshot = await getDocs(collection(db, "products"));
    
    if (productsSnapshot.empty) {
      console.log("Adding sample products...");
      
      // Add sample products
      for (const product of products) {
        const { id, ...productData } = product; // Remove the id field
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      console.log("Sample products added successfully!");
    } else {
      console.log("Products already exist in database");
    }

    console.log("Firebase initialization complete!");
  } catch (error) {
    console.error("Error initializing Firebase data:", error);
  }
}

// Function to clear all data (use with caution)
export async function clearFirebaseData() {
  try {
    console.log("Clearing Firebase data...");
    
    const collections = ["products", "users", "orders", "addresses", "paymentMethods", "cartItems"];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        
        snapshot.docs.forEach(docRef => {
          batch.delete(docRef.ref);
        });
        
        await batch.commit();
        console.log(`Cleared ${collectionName} collection`);
      }
    }
    
    console.log("All data cleared successfully!");
  } catch (error) {
    console.error("Error clearing Firebase data:", error);
  }
}