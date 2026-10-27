ALTER TABLE public.site_page_views ADD COLUMN IF NOT EXISTS visitor_id uuid;
DROP FUNCTION IF EXISTS public.record_page_view(uuid, text);
CREATE OR REPLACE FUNCTION public.record_page_view(_session_id uuid, _path text, _visitor_id uuid DEFAULT NULL)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
 IF _session_id IS NULL OR _path IS NULL OR char_length(_path) > 220 THEN RETURN; END IF;
 IF _path NOT IN ('/', '/blog') AND NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE published AND '/blog/' || slug = _path) THEN RETURN; END IF;
 INSERT INTO public.site_page_views(session_id, path, visitor_id) VALUES (_session_id, _path, COALESCE(_visitor_id, _session_id)) ON CONFLICT (session_id, path) DO NOTHING;
END; $$;
GRANT EXECUTE ON FUNCTION public.record_page_view(uuid, text, uuid) TO anon, authenticated;
CREATE OR REPLACE FUNCTION public.admin_visit_statistics(_days integer DEFAULT 30)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
 IF _days NOT IN (7, 30, 90) THEN RAISE EXCEPTION 'Invalid period'; END IF;
 WITH filtered AS (SELECT *, COALESCE(visitor_id, session_id) AS vid FROM public.site_page_views WHERE viewed_at >= (date_trunc('day', now() AT TIME ZONE 'Europe/Moscow') AT TIME ZONE 'Europe/Moscow') - ((_days - 1) || ' days')::interval),
 daily AS (SELECT (viewed_at AT TIME ZONE 'Europe/Moscow')::date AS day, count(*) AS views, count(DISTINCT session_id) AS visits, count(DISTINCT vid) AS visitors FROM filtered GROUP BY 1),
 posts AS (SELECT p.slug, p.title, count(v.id) AS views FROM public.blog_posts p LEFT JOIN filtered v ON v.path = '/blog/' || p.slug GROUP BY p.slug, p.title)
 SELECT jsonb_build_object(
 'visitors', (SELECT count(DISTINCT vid) FROM filtered),
 'visits', (SELECT count(DISTINCT session_id) FROM filtered),
 'pageViews', (SELECT count(*) FROM filtered),
 'blogViews', (SELECT count(*) FROM filtered WHERE path LIKE '/blog/%'),
 'startedAt', (SELECT min(viewed_at) FROM public.site_page_views),
 'daily', COALESCE((SELECT jsonb_agg(to_jsonb(d) ORDER BY d.day DESC) FROM daily d), '[]'::jsonb),
 'posts', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.views DESC, p.title) FROM posts p), '[]'::jsonb)
 ) INTO result;
 RETURN result;
END; $$;