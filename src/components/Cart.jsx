import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import CartItem from './CartItem'

export default function Cart() {
  const [searchParams] = useSearchParams()
  const sessionToken = searchParams.get('s')
  const checkoutPath = sessionToken
    ? `/checkout?s=${encodeURIComponent(sessionToken)}`
    : '/checkout'

  const {
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    total,
    giftCardCode,
    refillGiftCardCode,
    giftCardMessage,
    isCartOpen,
    closeCart,
    applyGiftCard,
    removeGiftCard,
  } = useCart()

  const [codeInput, setCodeInput] = useState('')

  const handleApplyGiftCard = (e) => {
    e.preventDefault()
    if (!codeInput.trim()) return
    applyGiftCard(codeInput)
  }

  if (!isCartOpen) return null

  return (
    <>
      <div className="cart-overlay" onClick={closeCart} aria-hidden="true" />

      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">Your Cart</h2>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 6h15l-1.5 9H7.5L6 6z" />
              <path d="M6 6 5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <p>Your cart is empty</p>
            <button type="button" className="btn btn--secondary" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="cart-drawer__footer">
              {/* Gift card input */}
              <form className="gift-card-form" onSubmit={handleApplyGiftCard}>
                <input
                  type="text"
                  className="gift-card-form__input"
                  placeholder="Gift card code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  aria-label="Gift card code"
                />
                <button type="submit" className="btn btn--secondary btn--sm">
                  Apply
                </button>
              </form>

              {giftCardMessage && (
                <p className={`gift-card-form__message gift-card-form__message--${giftCardMessage.type}`}>
                  {giftCardMessage.text}
                </p>
              )}

              {giftCardCode && (
                <div className="gift-card-applied">
                  <span>Code: <strong>{giftCardCode}</strong></span>
                  <button type="button" className="gift-card-applied__remove" onClick={removeGiftCard}>
                    Remove
                  </button>
                </div>
              )}

              {refillGiftCardCode && (
                <div className="gift-card-applied">
                  <span>Refill card: <strong>{refillGiftCardCode}</strong></span>
                </div>
              )}

              <div className="cart-totals">
                <div className="cart-totals__row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="cart-totals__row">
                    <span>Delivery fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="cart-totals__row cart-totals__row--discount">
                    <span>Gift card discount</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="cart-totals__row cart-totals__row--total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                to={checkoutPath}
                className="btn btn--primary btn--full"
                onClick={closeCart}
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
