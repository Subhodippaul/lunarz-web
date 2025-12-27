"use client";
import { useEffect } from "react";

export default function UniqueIdGenerator() {
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Always generate a new UUID on every refresh (don't check for existing)
      // Fetch UUID from server API that uses crypto.randomUUID
      fetch('/api/generate-uuid')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Replace the existing uniqueId in localStorage
            localStorage.setItem('uniqueId', data.uniqueId);
            
            // Dispatch a custom event to notify other components
            window.dispatchEvent(new CustomEvent('uniqueIdUpdated', { 
              detail: { uniqueId: data.uniqueId } 
            }));
          } else {
            console.error('Failed to generate UUID from server');
          }
        })
        .catch(error => {
          console.error('Error fetching UUID:', error);
        });
    }
  }, []); // Empty dependency array means this runs once on component mount (every page load)

  // This component doesn't render anything
  return null;
}