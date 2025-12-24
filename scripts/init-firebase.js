#!/usr/bin/env node

/**
 * Firebase Data Initialization Script
 * 
 * This script initializes your Firebase Firestore database with sample data.
 * Run this after setting up your Firebase project and environment variables.
 * 
 * Usage: node scripts/init-firebase.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Sample products data
const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    image: "/api/placeholder/400/400",
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation and premium sound quality.",
    sizes: ["One Size"],
    variants: ["Black", "White", "Silver"],
    inStock: true,
    rating: 4.8,
    reviews: 156
  },
  {
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    image: "/api/placeholder/400/400",
    category: "Electronics",
    description: "Advanced fitness tracking with heart rate monitoring and GPS.",
    sizes: ["Small", "Medium", "Large"],
    variants: ["Black", "Blue", "Rose Gold"],
    inStock: true,
    rating: 4.6,
    reviews: 89
  },
  {
    name: "Organic Cotton T-Shirt",
    price: 29.99,
    originalPrice: 39.99,
    image: "/api/placeholder/400/400",
    category: "Clothing",
    description: "Comfortable organic cotton t-shirt with sustainable materials.",
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: ["White", "Black", "Navy", "Gray"],
    inStock: true,
    rating: 4.4,
    reviews: 234
  },
  {
    name: "Professional Camera Lens",
    price: 899.99,
    originalPrice: 1099.99,
    image: "/api/placeholder/400/400",
    category: "Electronics",
    description: "Professional grade camera lens for stunning photography.",
    sizes: ["One Size"],
    variants: ["Black"],
    inStock: true,
    rating: 4.9,
    reviews: 67
  }
];

async function initializeFirebase() {
  try {
    console.log('🔥 Initializing Firebase...');
    
    // Validate environment variables
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Missing Firebase configuration. Please check your .env.local file.');
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized successfully');
    console.log(`📊 Connected to project: ${firebaseConfig.projectId}`);

    // Check if products already exist
    console.log('🔍 Checking existing data...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    if (productsSnapshot.empty) {
      console.log('📦 Adding sample products...');
      
      let addedCount = 0;
      for (const product of sampleProducts) {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        addedCount++;
        console.log(`   ✓ Added: ${product.name}`);
      }
      
      console.log(`🎉 Successfully added ${addedCount} sample products!`);
    } else {
      console.log(`ℹ️  Database already contains ${productsSnapshot.size} products`);
    }

    console.log('🚀 Firebase initialization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run "npm run dev" to start your development server');
    console.log('2. Visit http://localhost:3000 to see your app');
    console.log('3. Create an account or sign in to test the features');
    
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Make sure you have created a .env.local file');
    console.log('2. Verify your Firebase configuration values');
    console.log('3. Ensure your Firebase project has Firestore enabled');
    console.log('4. Check that your Firestore security rules allow writes');
    process.exit(1);
  }
}

// Run the initialization
initializeFirebase();