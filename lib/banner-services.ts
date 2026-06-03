/**
 * Banner Slide Services
 * Reads/writes the banner_slides table and banners storage bucket in Supabase.
 */

import { supabase } from './supabase';

export interface BannerSlide {
  id: string;
  desktop_url: string;
  mobile_url: string;
  href: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Public: fetch active slides ordered for the hero ──────────────────────────

export async function getActiveBannerSlides(): Promise<BannerSlide[]> {
  const { data, error } = await supabase
    .from('banner_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching banner slides:', error);
    return [];
  }
  return data ?? [];
}

// ── Admin: fetch ALL slides (including inactive) ──────────────────────────────

export async function getAllBannerSlides(): Promise<BannerSlide[]> {
  // Use service-level fetch — bypasses the is_active RLS filter for admin use
  const { data, error } = await supabase
    .from('banner_slides')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching all banner slides:', error);
    // Fallback: try without order (in case index doesn't exist yet)
    const { data: fallback } = await supabase.from('banner_slides').select('*');
    return (fallback ?? []).sort((a, b) => a.sort_order - b.sort_order);
  }
  return data ?? [];
}

// ── Admin: create a slide ─────────────────────────────────────────────────────

export async function createBannerSlide(
  slide: Omit<BannerSlide, 'id' | 'created_at' | 'updated_at'>
): Promise<BannerSlide> {
  const { data, error } = await supabase
    .from('banner_slides')
    .insert([slide])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: update a slide ─────────────────────────────────────────────────────

export async function updateBannerSlide(
  id: string,
  updates: Partial<Omit<BannerSlide, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('banner_slides')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ── Admin: delete a slide + its storage files ─────────────────────────────────

export async function deleteBannerSlide(slide: BannerSlide): Promise<void> {
  // Delete from DB
  const { error } = await supabase
    .from('banner_slides')
    .delete()
    .eq('id', slide.id);

  if (error) throw new Error(error.message);

  // Best-effort: remove images from storage
  const toDelete = [slide.desktop_url, slide.mobile_url]
    .map(extractStoragePath)
    .filter(Boolean) as string[];

  if (toDelete.length > 0) {
    await supabase.storage.from('banners').remove(toDelete);
  }
}

// ── Admin: bulk reorder ───────────────────────────────────────────────────────

export async function reorderBannerSlides(
  orderedIds: string[]
): Promise<void> {
  // Run sequentially to avoid overwhelming the DB with parallel requests
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from('banner_slides')
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq('id', orderedIds[i]);
    if (error) throw new Error(`Failed to reorder slide ${orderedIds[i]}: ${error.message}`);
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────────

/**
 * Upload a banner image to Supabase storage.
 * Returns the public URL.
 */
export async function uploadBannerImage(
  file: File,
  folder: 'desktop' | 'mobile'
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('banners')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('banners').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a single image from storage by its public URL.
 */
export async function deleteBannerImage(publicUrl: string): Promise<void> {
  const path = extractStoragePath(publicUrl);
  if (!path) return;
  await supabase.storage.from('banners').remove([path]);
}

// Extract the storage object path from a Supabase public URL
function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    // Supabase public URLs follow: /storage/v1/object/public/<bucket>/<path>
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/banners\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
