import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createOrderInDb } from './api/lib/createOrder.js'
import {
  PRODUCT_COMPANY_FILTER,
  PRODUCT_IMAGE_SELECT,
  PRODUCT_LIST_ORDER,
  PRODUCT_LIST_SELECT,
} from './lib/catalogSelect.js'

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
          const requestUrl = new URL(req.url, 'http://localhost')
          const productId = requestUrl.searchParams.get('id')
          const fields = requestUrl.searchParams.get('fields')

          if (productId && fields === 'image') {
            const url =
              `${supabaseUrl}/rest/v1/whatsapp_bot_items` +
              `?select=${encodeURIComponent(PRODUCT_IMAGE_SELECT)}` +
              `&id=eq.${encodeURIComponent(productId)}` +
              `&${PRODUCT_COMPANY_FILTER}` +
              `&limit=1`

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

            const [row] = await response.json()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ image_base64: row?.image_base64 ?? null }))
            return
          }

          const url =
            `${supabaseUrl}/rest/v1/whatsapp_bot_items` +
            `?select=${encodeURIComponent(PRODUCT_LIST_SELECT)}` +
            `&${PRODUCT_COMPANY_FILTER}` +
            `&order=${PRODUCT_LIST_ORDER}`

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

      server.middlewares.use('/api/orders', async (req, res) => {
        if (req.method !== 'POST') {
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
                'Missing SUPABASE_SERVICE_ROLE_KEY in .env (required for order creation).',
            }),
          )
          return
        }

        try {
          const chunks = []
          for await (const chunk of req) {
            chunks.push(chunk)
          }
          const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')

          const order = await createOrderInDb(body, { supabaseUrl, serviceKey })

          res.statusCode = 201
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(order))
        } catch (err) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message || 'Failed to create order' }))
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
