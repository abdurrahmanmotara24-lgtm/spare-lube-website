-- Weekly specials table for catalog-only promo ordering.
CREATE TABLE IF NOT EXISTS public.weekly_specials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  special_price numeric(10,2) NOT NULL CHECK (special_price > 0),
  original_price numeric(10,2),
  header_label text NOT NULL DEFAULT '🔥 Weekly Deal',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT weekly_specials_price_check
    CHECK (original_price IS NULL OR special_price < original_price)
);

CREATE INDEX IF NOT EXISTS idx_weekly_specials_active_sort
ON public.weekly_specials (is_active, sort_order, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_specials_product_unique
ON public.weekly_specials (product_id);

CREATE OR REPLACE FUNCTION public.update_weekly_specials_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_weekly_specials_updated_at ON public.weekly_specials;
CREATE TRIGGER trg_update_weekly_specials_updated_at
BEFORE UPDATE ON public.weekly_specials
FOR EACH ROW
EXECUTE FUNCTION public.update_weekly_specials_updated_at();
