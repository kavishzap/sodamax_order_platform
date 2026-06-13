import { createClient } from '@supabase/supabase-js'
import { normalizeColorRows } from '../utils/colors'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env file.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const PRODUCT_SELECT = `
  id,
  name,
  image_base64,
  price,
  created_at,
  updated_at,
  whatsapp_product_colors (
    id,
    color_name,
    color_hex,
    sort_order
  )
`

/** Flatten Supabase product + relation into app product shape. */
export function normalizeProduct(row) {
  const colors = normalizeColorRows(row.whatsapp_product_colors)
  const { whatsapp_product_colors: _colors, ...product } = row

  return {
    ...product,
    colors,
  }
}

/**
 * Fetch products via the direct Supabase client (requires public RLS read policy).
 */
async function fetchProductsDirect() {
  const { data, error } = await supabase
    .from('whatsapp_products')
    .select(PRODUCT_SELECT)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(normalizeProduct)
}

/**
 * Fetch products via the Vite dev API proxy (uses service role server-side).
 */
async function fetchProductsViaApi() {
  const response = await fetch('/api/products')

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      body.error ||
        'Could not load products. Enable public read on whatsapp_products in Supabase (see supabase/enable_public_read.sql).',
    )
  }

  const data = await response.json()
  return (data ?? []).map(normalizeProduct)
}

/**
 * Fetch all products with colors from whatsapp_product_colors.
 */
export async function fetchProducts() {
  const direct = await fetchProductsDirect()

  if (direct.length > 0) {
    return direct
  }

  return fetchProductsViaApi()
}
