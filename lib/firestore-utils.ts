// Utility functions for Firestore data handling

/**
 * Removes undefined values from an object to prevent Firestore errors
 * Firestore doesn't allow undefined values in documents
 */
export function removeUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

/**
 * Converts Firestore Timestamp to ISO string, handles both Timestamp and string values
 */
export function timestampToString(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  return new Date().toISOString();
}

/**
 * Safely converts a document from Firestore to a typed object
 */
export function convertFirestoreDoc<T>(doc: any): T {
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    // Convert any Timestamp fields to ISO strings
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt),
    timestamp: data.timestamp ? timestampToString(data.timestamp) : undefined,
    date: data.date ? timestampToString(data.date) : undefined,
  } as T;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates required fields for chat session creation
 */
export function validateChatSessionData(data: {
  userId?: string;
  guestEmail?: string;
  guestName?: string;
}): { isValid: boolean; error?: string } {
  // Must have either userId or both guestEmail and guestName
  if (data.userId) {
    return { isValid: true };
  }
  
  if (data.guestEmail && data.guestName) {
    if (!isValidEmail(data.guestEmail)) {
      return { isValid: false, error: "Invalid email format" };
    }
    return { isValid: true };
  }
  
  return { 
    isValid: false, 
    error: "Must provide either userId or both guestEmail and guestName" 
  };
}