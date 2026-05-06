-- Site settings table (single-row pattern keyed by 'main')
CREATE TABLE public.site_settings (
  id text NOT NULL PRIMARY KEY DEFAULT 'main',
  -- Color tokens (HSL strings like "0 85% 46%")
  primary_color text NOT NULL DEFAULT '0 85% 46%',
  secondary_color text NOT NULL DEFAULT '0 0% 96%',
  accent_color text NOT NULL DEFAULT '45 100% 51%',
  background_color text NOT NULL DEFAULT '0 0% 100%',
  foreground_color text NOT NULL DEFAULT '0 0% 8%',
  button_color text NOT NULL DEFAULT '0 85% 46%',
  button_foreground_color text NOT NULL DEFAULT '0 0% 100%',
  -- Hero section
  hero_image_url text DEFAULT '',
  hero_overlay_opacity numeric NOT NULL DEFAULT 0.85,
  hero_eyebrow text NOT NULL DEFAULT 'Trusted Wholesale Partner',
  hero_heading text NOT NULL DEFAULT 'Wholesale Lubricants Supplier',
  hero_subheading text NOT NULL DEFAULT 'Shell, Castrol, and More',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can insert site settings"
  ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update site settings"
  ON public.site_settings FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the single settings row
INSERT INTO public.site_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;