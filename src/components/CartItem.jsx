import { formatPrice, toImageSrc } from '../utils/format'
import { useCart } from '../context/CartContext'

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()
  const imageSrc = toImageSrc(item.image_base64)
  const lineTotal = item.price * item.quantity
  const isGiftRefill = item.isGiftRefill

  return (
    <div className={`cart-item${isGiftRefill ? ' cart-item--gift' : ''}`}>
      <div className="cart-item__image-wrap">
        {imageSrc ? (
          <img src={imageSrc} alt={item.name} className="cart-item__image" />
        ) : (
          <div className="cart-item__placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="cart-item__details">
        <div className="cart-item__top">
          <h4 className="cart-item__name">
            {item.name}
            {item.color && (
              <span className="cart-item__color"> — {item.color}</span>
            )}
          </h4>
          <button
            type="button"
            className="cart-item__remove"
            onClick={() => removeFromCart(item.id)}
            aria-label={`Remove ${item.name}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="cart-item__unit-price">
          {isGiftRefill ? 'Free (gift card)' : `${formatPrice(item.price)} each`}
        </p>

        <div className="cart-item__footer">
          {isGiftRefill ? (
            <span className="cart-item__gift-tag">One-time redemption</span>
          ) : (
            <div className="quantity-control">
              <button
                type="button"
                className="quantity-control__btn"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="quantity-control__value">{item.quantity}</span>
              <button
                type="button"
                className="quantity-control__btn"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
          <span className="cart-item__line-total">
            {isGiftRefill ? 'Free' : formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
