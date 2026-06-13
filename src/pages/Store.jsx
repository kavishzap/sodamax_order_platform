import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
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

  return (
    <div className="page">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="store">
        <section className="store__hero">
          <h1 className="store__title">Order Your Favourites</h1>
          <p className="store__subtitle">
            Premium beverages delivered to your door. Browse, add to cart, and order via WhatsApp.
          </p>
        </section>

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
                : 'No products available at the moment.'}
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
