import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import GiftCardRefillBanner from '../components/GiftCardRefillBanner'
import { getGiftRefillProduct } from '../config/products'
import { fetchProducts } from '../services/supabase'

export default function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProducts()
        if (!cancelled) setProducts(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products
    return products.filter((p) => p.name.toLowerCase().includes(query))
  }, [products, searchQuery])

  const giftRefillProduct = useMemo(
    () => getGiftRefillProduct(products),
    [products],
  )

  return (
    <div className="page">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="store">
        <section className="store__hero">
          <h1 className="store__title">Order Your Favourites</h1>
        </section>

        {!loading && !error && giftRefillProduct && (
          <GiftCardRefillBanner refillProduct={giftRefillProduct} />
        )}

        {loading && (
          <div className="store__loading">
            <div className="spinner" aria-hidden="true" />
            <p>Loading products...</p>
          </div>
        )}

        {error && (
          <div className="store__error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="store__empty">
            <p>
              {searchQuery
                ? `No products found for "${searchQuery}"`
                : 'No products available. If you have products in Supabase, run supabase/enable_public_read.sql in the SQL Editor to allow public read access.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
