/**
 * Production API route (Vercel serverless).
 * Uses service role server-side — never expose this key with VITE_ prefix.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error:
        'Server misconfigured. Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your hosting environment, or run supabase/setup_rls.sql in Supabase.',
    })
  }

  try {
    const select = [
      'id',
      'name',
      'image_base64',
      'price',
      'created_at',
      'updated_at',
      'whatsapp_product_colors(id,color_name,color_hex,sort_order)',
    ].join(',')

    const url =
      `${supabaseUrl}/rest/v1/whatsapp_products` +
      `?select=${encodeURIComponent(select)}&order=name.asc`

    const response = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Supabase error ${response.status}`)
    }

    const data = await response.json()

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(data ?? [])
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Failed to fetch products',
    })
  }
}
