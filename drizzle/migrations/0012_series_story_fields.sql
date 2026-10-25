ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS curator_ru text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS curator_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS exhibited_ru text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS exhibited_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS process_images text[] NOT NULL DEFAULT '{}';