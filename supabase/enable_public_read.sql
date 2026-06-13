-- Allow public (anonymous) read access to whatsapp_products
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE public.whatsapp_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.whatsapp_products;

CREATE POLICY "Allow public read access"
  ON public.whatsapp_products
  FOR SELECT
  TO anon, authenticated
  USING (true);
