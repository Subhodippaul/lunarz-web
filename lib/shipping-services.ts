import { supabase } from './supabase';

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
    const { data, error } = await supabase
      .from('shipping_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      // Return default settings if none exist
      return {
        id: undefined,
        ...DEFAULT_SHIPPING_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return {
      id: data.id,
      codShippingCharge: data.cod_shipping_charge,
      freeShippingThreshold: data.free_shipping_threshold,
      standardShippingCharge: data.standard_shipping_charge,
      expressShippingCharge: data.express_shipping_charge,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    // Return default settings on error
    return {
      id: undefined,
      ...DEFAULT_SHIPPING_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
};

export const updateShippingSettings = async (settings: Partial<ShippingSettings>): Promise<void> => {
  try {
    // First, check if settings exist
    const { data: existing } = await supabase
      .from('shipping_settings')
      .select('id')
      .limit(1)
      .single();

    const updateData: any = {};
    
    if (settings.codShippingCharge !== undefined) updateData.cod_shipping_charge = settings.codShippingCharge;
    if (settings.freeShippingThreshold !== undefined) updateData.free_shipping_threshold = settings.freeShippingThreshold;
    if (settings.standardShippingCharge !== undefined) updateData.standard_shipping_charge = settings.standardShippingCharge;
    if (settings.expressShippingCharge !== undefined) updateData.express_shipping_charge = settings.expressShippingCharge;
    if (settings.isActive !== undefined) updateData.is_active = settings.isActive;

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('shipping_settings')
        .update(updateData)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('shipping_settings')
        .insert({
          ...updateData,
          cod_shipping_charge: updateData.cod_shipping_charge || 50,
          free_shipping_threshold: updateData.free_shipping_threshold || 999,
          standard_shipping_charge: updateData.standard_shipping_charge || 0,
          express_shipping_charge: updateData.express_shipping_charge || 100,
          is_active: updateData.is_active !== undefined ? updateData.is_active : true,
        });

      if (error) throw error;
    }
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
