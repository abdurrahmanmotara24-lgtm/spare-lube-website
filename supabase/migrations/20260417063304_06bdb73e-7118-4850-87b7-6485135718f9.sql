CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert categories"
ON public.categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update categories"
ON public.categories FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete categories"
ON public.categories FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categories (name, sort_order) VALUES
  ('Engine Oil', 1),
  ('Gear Oil', 2),
  ('Brake Fluid', 3),
  ('Coolant', 4),
  ('Additives', 5),
  ('Transmission Fluid', 6),
  ('Grease', 7),
  ('Hand Cleaners', 8),
  ('Degreasers', 9),
  ('Fine Gel', 10),
  ('Dishwashing Liquid', 11)
ON CONFLICT (name) DO NOTHING;