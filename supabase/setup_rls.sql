-- Run this once in Supabase Dashboard → SQL Editor
-- Enables public product + color reads for the deployed storefront

-- Products
ALTER TABLE public.whatsapp_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.whatsapp_products;

CREATE POLICY "Allow public read access"
  ON public.whatsapp_products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Product colors
ALTER TABLE public.whatsapp_product_colors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.whatsapp_product_colors;

CREATE POLICY "Allow public read access"
  ON public.whatsapp_product_colors
  FOR SELECT
  TO anon, authenticated
  USING (true);
