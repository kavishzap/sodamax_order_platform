import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { formatPrice, toImageSrc } from '../utils/format'
import { buildOrderMessage, redirectToWhatsApp } from '../utils/whatsapp'

export default function Checkout() {
  const navigate = useNavigate()
  const {
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    total,
    giftCardCode,
    refillGiftCardCode,
    giftCardMessage,
    applyGiftCard,
    removeGiftCard,
    clearCart,
  } = useCart()

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [giftCardInput, setGiftCardInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required'
    if (!form.phone.trim()) next.phone = 'Phone number is required'
    if (!form.address.trim()) next.address = 'Address is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleApplyGiftCard = (e) => {
    e.preventDefault()
    if (!giftCardInput.trim()) return
    applyGiftCard(giftCardInput)
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault()
    if (!validate()) return
    if (items.length === 0) return

    setSubmitting(true)

    const message = buildOrderMessage({
      customer: form,
      items,
      giftCardCode,
      refillGiftCardCode,
      subtotal,
      discount: discountAmount,
      deliveryFee,
      total,
    })

    redirectToWhatsApp(message)
    clearCart()
    navigate('/')
    setSubmitting(false)
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <Header showSearch={false} searchQuery="" onSearchChange={() => {}} />
        <main className="checkout checkout--empty">
          <div className="checkout__empty">
            <h1>Your cart is empty</h1>
            <p>Add some products before checking out.</p>
            <Link to="/" className="btn btn--primary">
              Back to Store
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Header showSearch={false} searchQuery="" onSearchChange={() => {}} />

      <main className="checkout">
        <div className="checkout__header">
          <Link to="/" className="checkout__back">
            ← Continue shopping
          </Link>
          <h1 className="checkout__title">Checkout</h1>
        </div>

        <div className="checkout__layout">
          {/* Customer details form */}
          <section className="checkout__form-section">
            <h2 className="checkout__section-title">Delivery Details</h2>
            <form className="checkout-form" onSubmit={handlePlaceOrder} noValidate>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className={errors.fullName ? 'input--error' : ''}
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={errors.phone ? 'input--error' : ''}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="52525252"
                  autoComplete="tel"
                />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  className={errors.address ? 'input--error' : ''}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, city, postal code"
                  rows={3}
                />
                {errors.address && <span className="form-error">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Delivery instructions, preferred time, etc."
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="btn btn--whatsapp btn--full checkout-form__submit"
                disabled={submitting}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Place Order via WhatsApp
              </button>
            </form>
          </section>

          {/* Order summary */}
          <aside className="checkout__summary">
            <h2 className="checkout__section-title">Order Summary</h2>

            <ul className="summary-items">
              {items.map((item) => {
                const imageSrc = toImageSrc(item.image_base64)
                return (
                  <li key={item.id} className="summary-item">
                    <div className="summary-item__image-wrap">
                      {imageSrc ? (
                        <img src={imageSrc} alt={item.name} />
                      ) : (
                        <div className="summary-item__placeholder" />
                      )}
                      <span className="summary-item__qty">{item.quantity}</span>
                    </div>
                    <div className="summary-item__info">
                      <span className="summary-item__name">
                        {item.name}
                        {item.color && (
                          <span className="summary-item__color"> ({item.color})</span>
                        )}
                      </span>
                      <span className="summary-item__price">
                        {item.isGiftRefill
                          ? 'Free'
                          : formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>

            {/* Gift card on checkout */}
            <form className="gift-card-form" onSubmit={handleApplyGiftCard}>
              <input
                type="text"
                className="gift-card-form__input"
                placeholder="Gift card code"
                value={giftCardInput}
                onChange={(e) => setGiftCardInput(e.target.value)}
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
          </aside>
        </div>
      </main>
    </div>
  )
}
