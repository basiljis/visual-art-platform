CREATE TABLE public.blog_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.blog_subscribers TO service_role;
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;