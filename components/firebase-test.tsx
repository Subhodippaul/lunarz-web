"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';

export default function FirebaseTest() {
  const [status, setStatus] = useState<{
    auth: string;
    firestore: string;
    config: any;
  }>({
    auth: 'Testing...',
    firestore: 'Testing...',
    config: null
  });

  useEffect(() => {
    // Test Firebase Auth
    try {
      if (auth) {
        setStatus(prev => ({ ...prev, auth: '✅ Connected' }));
      } else {
        setStatus(prev => ({ ...prev, auth: '❌ Failed to initialize' }));
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, auth: `❌ Error: ${error}` }));
    }

    // Test Firestore
    try {
      if (db) {
        setStatus(prev => ({ ...prev, firestore: '✅ Connected' }));
      } else {
        setStatus(prev => ({ ...prev, firestore: '❌ Failed to initialize' }));
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, firestore: `❌ Error: ${error}` }));
    }

    // Get Firebase config
    try {
      const config = auth.app.options;
      setStatus(prev => ({ ...prev, config }));
    } catch (error) {
      console.error('Error getting Firebase config:', error);
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">Firebase Connection Test</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Firebase Auth:</strong> {status.auth}
        </div>
        <div>
          <strong>Firestore:</strong> {status.firestore}
        </div>
      </div>

      {status.config && (
        <div className="mt-4">
          <strong>Firebase Config:</strong>
          <pre className="bg-white p-2 rounded text-xs overflow-auto">
            {JSON.stringify(status.config, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>If you see ❌ errors above, check the Firebase troubleshooting guide.</p>
      </div>
    </div>
  );
}