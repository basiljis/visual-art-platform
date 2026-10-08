CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ru text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  body_ru text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  event_date text NOT NULL DEFAULT '',
  address_ru text NOT NULL DEFAULT '',
  address_en text NOT NULL DEFAULT '',
  link text,
  image text,
  published boolean NOT NULL DEFAULT true,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read news" ON public.news FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin write news" ON public.news FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));