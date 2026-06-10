-- =============================================================================
-- Color + Size + Category Shared Inventory Migration
-- Run this in Supabase SQL Editor
-- =============================================================================

-- 1. Drop old table if it exists (safe — only run on fresh setup)
--    If you already have data, comment this out and use the ALTER TABLE below instead.
DROP TABLE IF EXISTS public.color_inventory_log;
DROP TABLE IF EXISTS public.color_inventory;

-- ── OR, if you have existing data, run this instead of DROP: ────────────────
-- ALTER TABLE public.color_inventory ADD COLUMN IF NOT EXISTS size text NOT NULL DEFAULT '';
-- ALTER TABLE public.color_inventory DROP CONSTRAINT IF EXISTS color_inventory_color_category_key;
-- ALTER TABLE public.color_inventory ADD CONSTRAINT color_inventory_color_size_category_key UNIQUE (color, size, category);
-- ────────────────────────────────────────────────────────────────────────────

-- 2. color_inventory — one row per (color, size, category)
CREATE TABLE IF NOT EXISTS public.color_inventory (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  color         text          NOT NULL,   -- e.g. "Black"
  size          text          NOT NULL,   -- e.g. "M", "L", "XL"
  category      text          NOT NULL,   -- e.g. "Oversized", "Regular", "Hoodie"
  stock         integer       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_threshold integer       NOT NULL DEFAULT 10,
  notes         text,
  created_at    timestamptz   DEFAULT now(),
  updated_at    timestamptz   DEFAULT now(),
  UNIQUE (color, size, category)
);

CREATE INDEX IF NOT EXISTS idx_color_inventory_color    ON public.color_inventory (color);
CREATE INDEX IF NOT EXISTS idx_color_inventory_size     ON public.color_inventory (size);
CREATE INDEX IF NOT EXISTS idx_color_inventory_category ON public.color_inventory (category);

-- 3. color_inventory_log — audit trail
CREATE TABLE IF NOT EXISTS public.color_inventory_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  color_inv_id    uuid        NOT NULL REFERENCES public.color_inventory(id) ON DELETE CASCADE,
  type            text        NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity        integer     NOT NULL,
  reason          text        NOT NULL,
  reference       text,
  user_id         uuid        REFERENCES public.users(id),
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_color_inv_log_inv_id ON public.color_inventory_log (color_inv_id);
CREATE INDEX IF NOT EXISTS idx_color_inv_log_created ON public.color_inventory_log (created_at DESC);

-- 4. auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE TRIGGER trg_color_inventory_updated_at
  BEFORE UPDATE ON public.color_inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RLS
ALTER TABLE public.color_inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_inventory_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read color inventory"
  ON public.color_inventory FOR SELECT USING (true);

CREATE POLICY "Admins can manage color inventory"
  ON public.color_inventory FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Public can read color inventory log"
  ON public.color_inventory_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Service can insert color inventory log"
  ON public.color_inventory_log FOR INSERT WITH CHECK (true);

-- 6. Atomic decrement function — now takes size as well
CREATE OR REPLACE FUNCTION public.decrement_color_inventory(
  p_color    text,
  p_size     text,
  p_category text,
  p_qty      integer,
  p_ref      text DEFAULT NULL
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id    uuid;
  v_stock integer;
BEGIN
  SELECT id, stock INTO v_id, v_stock
  FROM public.color_inventory
  WHERE color = p_color AND size = p_size AND category = p_category
  FOR UPDATE;

  IF NOT FOUND THEN RETURN -1; END IF;
  IF v_stock < p_qty THEN RETURN v_stock; END IF;

  UPDATE public.color_inventory SET stock = stock - p_qty WHERE id = v_id;

  INSERT INTO public.color_inventory_log (color_inv_id, type, quantity, reason, reference)
  VALUES (v_id, 'out', p_qty, 'order', p_ref);

  RETURN v_stock - p_qty;
END;
$$;
