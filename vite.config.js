import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Dev-only API route that fetches products with colors via service role.
 */
function productsApiPlugin(env) {
  return {
    name: 'products-api',
    configureServer(server) {
      server.middlewares.use('/api/products', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const supabaseUrl = env.VITE_SUPABASE_URL
        const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceKey) {
          res.statusCode = 500
          res.end(
            JSON.stringify({
              error:
                'Missing SUPABASE_SERVICE_ROLE_KEY in .env (required until RLS public read is enabled).',
            }),
          )
          return
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

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data ?? []))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message || 'Failed to fetch products' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), productsApiPlugin(env)],
  }
})
