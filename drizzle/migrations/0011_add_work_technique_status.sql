ALTER TABLE public.works ADD COLUMN IF NOT EXISTS technique text NOT NULL DEFAULT '';
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available';
COMMENT ON COLUMN public.works.technique IS 'Техника и материал, например: холст, масло / линогравюра, тираж 20';
COMMENT ON COLUMN public.works.status IS 'Статус продажи: available (в продаже), sold (продана), collection (в частной коллекции), inquiry (по запросу)';