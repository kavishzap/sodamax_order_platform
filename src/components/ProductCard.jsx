import { useState } from 'react'
import { formatPrice, toImageSrc } from '../utils/format'
import { getProductColors, productHasColors } from '../utils/colors'
import { useCart } from '../context/CartContext'
import ColorSelectModal from './ColorSelectModal'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const imageSrc = toImageSrc(product.image_base64)
  const colors = getProductColors(product)
  const hasColors = productHasColors(product)
  const [modalOpen, setModalOpen] = useState(false)

  const handleAddToCart = () => {
    if (hasColors) {
      setModalOpen(true)
      return
    }
    addToCart(product, null)
  }

  const handleColorConfirm = (selectedColor) => {
    addToCart(product, selectedColor)
  }

  return (
    <>
      <article className="product-card">
        <div className="product-card__image-wrap">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="product-card__image"
              loading="lazy"
            />
          ) : (
            <div className="product-card__placeholder" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>

        <div className="product-card__body">
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__price">{formatPrice(product.price)}</p>
          {hasColors && (
            <p className="product-card__colors-hint">{colors.length} colors available</p>
          )}
          <button
            type="button"
            className="btn btn--primary product-card__btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </article>

      {hasColors && (
        <ColorSelectModal
          product={product}
          colors={colors}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleColorConfirm}
        />
      )}
    </>
  )
}
