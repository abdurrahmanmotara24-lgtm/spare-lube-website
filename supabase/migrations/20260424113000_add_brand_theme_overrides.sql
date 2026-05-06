-- Persist per-brand theme overrides in DB so mobile/desktop share the same theme.
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS theme_primary_color text,
ADD COLUMN IF NOT EXISTS theme_accent_color text,
ADD COLUMN IF NOT EXISTS theme_button_color text,
ADD COLUMN IF NOT EXISTS theme_button_foreground_color text;
