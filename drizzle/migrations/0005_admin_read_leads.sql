GRANT SELECT, DELETE ON public.purchase_enquiries TO authenticated;
GRANT SELECT, DELETE ON public.blog_subscribers TO authenticated;
GRANT INSERT ON public.purchase_enquiries TO anon;
GRANT INSERT ON public.blog_subscribers TO anon;
CREATE POLICY "Admin read enquiries" ON public.purchase_enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete enquiries" ON public.purchase_enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read subscribers" ON public.blog_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete subscribers" ON public.blog_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));