CREATE TABLE public.site_page_views (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 session_id uuid NOT NULL,
 path text NOT NULL,
 viewed_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(session_id, path)
);
GRANT SELECT ON public.site_page_views TO authenticated;
GRANT ALL ON public.site_page_views TO service_role;
ALTER TABLE public.site_page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read visitor statistics" ON public.site_page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX site_page_views_date_idx ON public.site_page_views(viewed_at);
CREATE INDEX site_page_views_path_idx ON public.site_page_views(path);

CREATE FUNCTION public.record_page_view(_session_id uuid, _path text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF _session_id IS NULL OR _path IS NULL OR char_length(_path) > 220 THEN RETURN; END IF;
 IF _path NOT IN ('/', '/blog') AND NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE published AND '/blog/' || slug = _path) THEN RETURN; END IF;
 INSERT INTO public.site_page_views(session_id, path) VALUES (_session_id, _path) ON CONFLICT (session_id, path) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.record_page_view(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_page_view(uuid, text) TO anon, authenticated;

CREATE FUNCTION public.blog_view_counts() RETURNS TABLE(slug text, views bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT p.slug, count(v.id) FROM public.blog_posts p LEFT JOIN public.site_page_views v ON v.path = '/blog/' || p.slug WHERE p.published GROUP BY p.slug;
$$;
REVOKE ALL ON FUNCTION public.blog_view_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_view_counts() TO anon, authenticated;

CREATE FUNCTION public.admin_visit_statistics(_days integer DEFAULT 30) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
 IF _days NOT IN (7, 30, 90) THEN RAISE EXCEPTION 'Invalid period'; END IF;
 WITH filtered AS (SELECT * FROM public.site_page_views WHERE viewed_at >= (date_trunc('day', now() AT TIME ZONE 'Europe/Moscow') AT TIME ZONE 'Europe/Moscow') - ((_days - 1) || ' days')::interval),
 daily AS (SELECT (viewed_at AT TIME ZONE 'Europe/Moscow')::date AS day, count(*) AS views, count(DISTINCT session_id) AS visits FROM filtered GROUP BY 1),
 posts AS (SELECT p.slug, p.title, count(v.id) AS views FROM public.blog_posts p LEFT JOIN filtered v ON v.path = '/blog/' || p.slug GROUP BY p.slug, p.title)
 SELECT jsonb_build_object(
 'visits', (SELECT count(DISTINCT session_id) FROM filtered),
 'pageViews', (SELECT count(*) FROM filtered),
 'blogViews', (SELECT count(*) FROM filtered WHERE path LIKE '/blog/%'),
 'startedAt', (SELECT min(viewed_at) FROM public.site_page_views),
 'daily', COALESCE((SELECT jsonb_agg(to_jsonb(d) ORDER BY d.day DESC) FROM daily d), '[]'::jsonb),
 'posts', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.views DESC, p.title) FROM posts p), '[]'::jsonb)
 ) INTO result;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_visit_statistics(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_visit_statistics(integer) TO authenticated;