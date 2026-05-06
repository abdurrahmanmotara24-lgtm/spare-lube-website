
CREATE TABLE IF NOT EXISTS public.contact_team (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  title text NOT NULL,
  phone text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read contact_team" ON public.contact_team FOR SELECT USING (true);
CREATE POLICY "Authenticated write contact_team" ON public.contact_team FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER contact_team_set_updated_at BEFORE UPDATE ON public.contact_team
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.page_content (
  id text NOT NULL PRIMARY KEY,
  eyebrow text NOT NULL DEFAULT '',
  heading text NOT NULL DEFAULT '',
  subheading text NOT NULL DEFAULT '',
  body_paragraph_1 text,
  body_paragraph_2 text,
  body_paragraph_3 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read page_content" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "Authenticated write page_content" ON public.page_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER page_content_set_updated_at BEFORE UPDATE ON public.page_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
