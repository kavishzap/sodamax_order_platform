import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env file.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Fetch all products from the whatsapp_products table.
 */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('whatsapp_products')
    .select('id, name, image_base64, price, created_at, updated_at')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
