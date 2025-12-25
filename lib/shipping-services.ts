import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

export interface ShippingSettings {
  id?: string;
  codShippingCharge: number;
  freeShippingThreshold: number;
  standardShippingCharge: number;
  expressShippingCharge: number;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const SHIPPING_SETTINGS_DOC = 'shippingSettings';
const SETTINGS_COLLECTION = 'settings';

// Default shipping settings
const DEFAULT_SHIPPING_SETTINGS: Omit<ShippingSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  codShippingCharge: 50,
  freeShippingThreshold: 999,
  standardShippingCharge: 0,
  expressShippingCharge: 100,
  isActive: true,
};

export const getShippingSettings = async (): Promise<ShippingSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SHIPPING_SETTINGS_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ShippingSettings;
    } else {
      // Create default settings if they don't exist
      const defaultSettings = {
        ...DEFAULT_SHIPPING_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(docRef, defaultSettings);
      
      return {
        id: SHIPPING_SETTINGS_DOC,
        ...defaultSettings,
      };
    }
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    // Return default settings on error
    return {
      id: SHIPPING_SETTINGS_DOC,
      ...DEFAULT_SHIPPING_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
};

export const updateShippingSettings = async (settings: Partial<ShippingSettings>): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SHIPPING_SETTINGS_DOC);
    
    // Remove id and timestamps from the update data
    const { id, createdAt, ...updateData } = settings;
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating shipping settings:', error);
    throw error;
  }
};

export const calculateShippingCost = (
  subtotal: number, 
  paymentMethod: string, 
  settings: ShippingSettings
): number => {
  // Free shipping if above threshold (regardless of payment method)
  if (subtotal >= settings.freeShippingThreshold) {
    return 0;
  }

  // COD specific charges
  if (paymentMethod === 'cod') {
    return settings.codShippingCharge;
  }

  // Standard shipping for other payment methods
  return settings.standardShippingCharge;
};