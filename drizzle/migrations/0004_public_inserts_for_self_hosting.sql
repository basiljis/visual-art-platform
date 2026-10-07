GRANT INSERT ON public.purchase_enquiries TO anon;
GRANT INSERT ON public.blog_subscribers TO anon;
CREATE POLICY "Anyone can send an enquiry" ON public.purchase_enquiries FOR INSERT TO anon
  WITH CHECK (char_length(name) BETWEEN 1 AND 100 AND char_length(email) BETWEEN 3 AND 254 AND char_length(message) BETWEEN 1 AND 2000);
CREATE POLICY "Anyone can subscribe" ON public.blog_subscribers FOR INSERT TO anon
  WITH CHECK (char_length(email) BETWEEN 3 AND 254);
CREATE POLICY "Public read media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');