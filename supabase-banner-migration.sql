-- =============================================================================
-- Banner Slides Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create the banner_slides table
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.banner_slides (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_url  text        NOT NULL,
  mobile_url   text        NOT NULL,
  href         text        NOT NULL DEFAULT '/',
  sort_order   integer     NOT NULL DEFAULT 0,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz          DEFAULT now(),
  updated_at   timestamptz          DEFAULT now()
);

-- Index for the most common query pattern: fetch active slides in order
CREATE INDEX IF NOT EXISTS idx_banner_slides_active_order
  ON public.banner_slides (sort_order ASC)
  WHERE is_active = true;

-- -----------------------------------------------------------------------------
-- 2. Auto-update updated_at on row changes
-- -----------------------------------------------------------------------------

-- Reuse the trigger function if it already exists in your schema,
-- otherwise create it here.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_banner_slides_updated_at
  BEFORE UPDATE ON public.banner_slides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Enable Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. RLS Policies
-- -----------------------------------------------------------------------------

-- Policy 1: Anyone (including anonymous visitors) can read active slides.
CREATE POLICY "Public can view active banner slides"
  ON public.banner_slides
  FOR SELECT
  USING (is_active = true);

-- Policy 2: Authenticated users whose profile has is_admin = true can INSERT.
CREATE POLICY "Admins can insert banner slides"
  ON public.banner_slides
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_admin = true
    )
  );

-- Policy 3: Authenticated admin users can UPDATE any slide.
CREATE POLICY "Admins can update banner slides"
  ON public.banner_slides
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_admin = true
    )
  );

-- Policy 4: Authenticated admin users can DELETE any slide.
CREATE POLICY "Admins can delete banner slides"
  ON public.banner_slides
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_admin = true
    )
  );

-- -----------------------------------------------------------------------------
-- 5. Storage bucket: banners
-- -----------------------------------------------------------------------------
-- NOTE: Supabase storage bucket policies cannot be created via SQL alone.
-- Follow these steps in the Supabase Dashboard instead:
--
--   Dashboard → Storage → New Bucket
--     Name:        banners
--     Public:      ✅  (enables unauthenticated read of all objects)
--
--   Then add these Storage Policies (Dashboard → Storage → banners → Policies):
--
--   ① Public read  (SELECT)
--     Allowed operation : SELECT
--     Policy name       : "Public can read banner images"
--     Target roles      : (leave blank = all roles including anon)
--     USING expression  : true
--
--   ② Admin upload  (INSERT)
--     Allowed operation : INSERT
--     Policy name       : "Admins can upload banner images"
--     Target roles      : authenticated
--     WITH CHECK        :
--       (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
--
--   ③ Admin update  (UPDATE)
--     Allowed operation : UPDATE
--     Policy name       : "Admins can update banner images"
--     Target roles      : authenticated
--     USING expression  :
--       (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
--
--   ④ Admin delete  (DELETE)
--     Allowed operation : DELETE
--     Policy name       : "Admins can delete banner images"
--     Target roles      : authenticated
--     USING expression  :
--       (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
--
-- Alternatively, if you prefer SQL via the Supabase Storage schema:
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('banners', 'banners', true)
--   ON CONFLICT (id) DO NOTHING;
--
--   CREATE POLICY "Public can read banner images"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'banners');
--
--   CREATE POLICY "Admins can upload banner images"
--     ON storage.objects FOR INSERT TO authenticated
--     WITH CHECK (
--       bucket_id = 'banners'
--       AND (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
--     );
--
--   CREATE POLICY "Admins can update banner images"
--     ON storage.objects FOR UPDATE TO authenticated
--     USING (
--       bucket_id = 'banners'
--       AND (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
--     );
--
--   CREATE POLICY "Admins can delete banner images"
--     ON storage.objects FOR DELETE TO authenticated
--     USING (
--       bucket_id = 'banners'
--       AND (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
--     );
-- -----------------------------------------------------------------------------

-- =============================================================================
-- Migration complete.
-- =============================================================================
