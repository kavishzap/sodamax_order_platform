-- Product colors are stored in whatsapp_product_colors (not on whatsapp_products).
-- See enable_public_read_colors.sql for RLS policy.

-- Example: add colors for a product
-- INSERT INTO public.whatsapp_product_colors (product_id, color_name, color_hex, sort_order)
-- VALUES
--   ('your-product-uuid', 'Black', '#000000', 0),
--   ('your-product-uuid', 'White', '#ffffff', 1);
