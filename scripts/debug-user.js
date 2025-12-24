const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugUser() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.error('Usage: node scripts/debug-user.js <email>');
      process.exit(1);
    }

    console.log(`Looking for user with email: ${email}`);

    // First, let's see all users
    console.log('\n=== ALL USERS ===');
    const allUsersSnapshot = await getDocs(collection(db, 'users'));
    allUsersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`UID: ${data.uid}`);
      console.log(`Email: ${data.email}`);
      console.log(`Name: ${data.name}`);
      console.log(`isAdmin: ${data.isAdmin}`);
      console.log('---');
    });

    // Now search by email
    console.log(`\n=== SEARCHING FOR ${email} ===`);
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No user found with that email');
    } else {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        console.log('Found user:');
        console.log(`Document ID: ${doc.id}`);
        console.log(`UID: ${data.uid}`);
        console.log(`Email: ${data.email}`);
        console.log(`Name: ${data.name}`);
        console.log(`Provider: ${data.provider}`);
        console.log(`isAdmin: ${data.isAdmin}`);
        console.log(`Created: ${data.createdAt?.toDate()}`);
        console.log(`Updated: ${data.updatedAt?.toDate()}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugUser();