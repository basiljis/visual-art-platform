ALTER TABLE public.works ADD COLUMN hidden boolean NOT NULL DEFAULT false;
DROP POLICY "Public read works" ON public.works;
CREATE POLICY "Public read works" ON public.works FOR SELECT TO anon, authenticated USING (NOT hidden OR public.has_role(auth.uid(), 'admin'));