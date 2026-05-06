-- Brands table
CREATE TABLE public.brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are viewable by everyone" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update brands" ON public.brands FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete brands" ON public.brands FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_brands_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed existing 11 brands + 3 new ones
INSERT INTO public.brands (id, name, logo, sort_order) VALUES
  ('shell', 'Shell', '🐚', 10),
  ('castrol', 'Castrol', '🛢️', 20),
  ('engen', 'Engen', '⛽', 30),
  ('fuchs', 'Fuchs', '🔶', 40),
  ('valvoline', 'Valvoline', '⚙️', 50),
  ('motolube', 'MOTOLUBE', '🔧', 60),
  ('winners', 'Winners', '🏆', 70),
  ('blixem', 'Blixem', '⚡', 80),
  ('g4', 'G4 Lubricants', '🏭', 90),
  ('bmw', 'BMW', '🚗', 100),
  ('plexus', 'Plexus', '❄️', 110),
  ('ngk', 'NGK', '🔌', 120),
  ('newlook', 'New Look', '✨', 130),
  ('extreme', 'Extreme', '🔥', 140);

-- Brand logos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);

CREATE POLICY "Brand logos are publicly viewable"
ON storage.objects FOR SELECT USING (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated can upload brand logos"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated can update brand logos"
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated can delete brand logos"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand-logos');