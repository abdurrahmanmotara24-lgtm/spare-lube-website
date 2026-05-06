CREATE TABLE public.sizes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sizes are viewable by everyone"
  ON public.sizes FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert sizes"
  ON public.sizes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update sizes"
  ON public.sizes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete sizes"
  ON public.sizes FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_sizes_updated_at
  BEFORE UPDATE ON public.sizes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.sizes (name, sort_order) VALUES
  ('250ml', 10),
  ('500ml', 20),
  ('750ml', 30),
  ('1L', 40),
  ('5L', 50),
  ('20L', 60),
  ('210L', 70);