-- =============================================================================
-- Migration: Add `size` column to existing color_inventory table
-- Run this in Supabase SQL Editor if the table already exists
-- =============================================================================

-- 1. Add the size column (default empty string so existing rows don't break)
ALTER TABLE public.color_inventory
  ADD COLUMN IF NOT EXISTS size text NOT NULL DEFAULT '';

-- 2. Drop the old unique constraint (color, category)
ALTER TABLE public.color_inventory
  DROP CONSTRAINT IF EXISTS color_inventory_color_category_key;

-- 3. Add new unique constraint (color, size, category)
ALTER TABLE public.color_inventory
  DROP CONSTRAINT IF EXISTS color_inventory_color_size_category_key;

ALTER TABLE public.color_inventory
  ADD CONSTRAINT color_inventory_color_size_category_key UNIQUE (color, size, category);

-- 4. Add index on size
CREATE INDEX IF NOT EXISTS idx_color_inventory_size ON public.color_inventory (size);

-- 5. Update the decrement function to include size
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
