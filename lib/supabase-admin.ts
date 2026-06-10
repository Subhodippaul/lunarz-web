/**
 * Supabase Admin Client (server-side only)
 * Uses the service role key to bypass Row Level Security (RLS).
 * NEVER import this in client components or expose to the browser.
 *
 * This module is safe to import anywhere — it only throws at call-time
 * if the env vars are missing, not at module evaluation time.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'This client must only be used in API routes or server components.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Lazily instantiated — the error only fires when a function actually calls it,
// not when the module is first imported by the browser bundle.
let _client: SupabaseClient | null = null;

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) _client = createAdminClient();
    return (_client as any)[prop];
  },
});
