-- Brand theme overrides
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS theme_primary_color text,
ADD COLUMN IF NOT EXISTS theme_accent_color text,
ADD COLUMN IF NOT EXISTS theme_button_color text,
ADD COLUMN IF NOT EXISTS theme_button_foreground_color text;

-- Weekly specials
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

ALTER TABLE public.weekly_specials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weekly specials are viewable by everyone"
ON public.weekly_specials FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can insert weekly specials"
ON public.weekly_specials FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update weekly specials"
ON public.weekly_specials FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete weekly specials"
ON public.weekly_specials FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_weekly_specials_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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