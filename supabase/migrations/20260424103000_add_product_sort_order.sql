-- Add durable per-product ordering for cross-device consistency.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sort_order integer;

-- Backfill a stable in-brand order from historical creation time.
WITH ranked AS (
  SELECT
    id,
    ((ROW_NUMBER() OVER (PARTITION BY brand ORDER BY created_at ASC, id ASC)) * 10) AS next_sort_order
  FROM public.products
)
UPDATE public.products AS p
SET sort_order = ranked.next_sort_order
FROM ranked
WHERE p.id = ranked.id
  AND p.sort_order IS NULL;

ALTER TABLE public.products
ALTER COLUMN sort_order SET DEFAULT 0;

UPDATE public.products
SET sort_order = 0
WHERE sort_order IS NULL;

ALTER TABLE public.products
ALTER COLUMN sort_order SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_brand_sort_order
ON public.products (brand, sort_order, created_at);
