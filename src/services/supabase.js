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
  product_name,
  image_base64,
  description,
  price,
  created_at,
  updated_at,
  whatsapp_bot_item_colors (
    id,
    color_name,
    color_hex,
    sort_order
  )
`

const SETUP_HINT =
  'Run supabase/setup_rls.sql in Supabase Dashboard → SQL Editor to allow public product reads.'

function parseItemPrice(value) {
  if (value == null || value === '') return 0
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

/** Flatten whatsapp_bot_items row into app product shape. */
export function normalizeProduct(row) {
  const colors = normalizeColorRows(row.whatsapp_bot_item_colors)
  const {
    whatsapp_bot_item_colors: _colors,
    product_name,
    price,
    ...rest
  } = row

  return {
    ...rest,
    name: product_name?.trim() || 'Unnamed product',
    price: parseItemPrice(price),
    colors,
  }
}

/**
 * Fetch products via the direct Supabase client (requires public RLS read policy).
 */
async function fetchProductsDirect() {
  const { data, error } = await supabase
    .from('whatsapp_bot_items')
    .select(PRODUCT_SELECT)
    .eq('company', 'sodamax')
    .order('product_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(normalizeProduct)
}

/**
 * Fetch products via /api/products (dev Vite proxy or production serverless).
 */
async function fetchProductsViaApi() {
  const response = await fetch('/api/products')

  if (response.status === 404) {
    throw new Error(SETUP_HINT)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || SETUP_HINT)
  }

  const data = await response.json()
  return (data ?? []).map(normalizeProduct)
}

/**
 * Fetch all products from whatsapp_bot_items (with colors when available).
 */
export async function fetchProducts() {
  try {
    const direct = await fetchProductsDirect()
    if (direct.length > 0) {
      return direct
    }
  } catch (err) {
    // RLS or schema error on direct client — try server API next
    console.warn('Direct Supabase fetch failed:', err.message)
  }

  try {
    const viaApi = await fetchProductsViaApi()
    if (viaApi.length > 0) {
      return viaApi
    }
  } catch (err) {
    throw new Error(err.message || SETUP_HINT)
  }

  throw new Error(SETUP_HINT)
}
