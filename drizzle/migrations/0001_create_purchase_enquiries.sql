CREATE TABLE public.purchase_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  artwork text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.purchase_enquiries TO service_role;
ALTER TABLE public.purchase_enquiries ENABLE ROW LEVEL SECURITY;