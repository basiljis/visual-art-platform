ALTER TABLE public.blog_posts
  ADD COLUMN topic_keys text[] NOT NULL DEFAULT '{}',
  ADD COLUMN work_ids uuid[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.blog_posts.topic_keys IS 'Разделы галереи (categories.key), связанные с записью';
COMMENT ON COLUMN public.blog_posts.work_ids IS 'Работы галереи (works.id), связанные с записью';