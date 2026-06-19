import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { useCheckoutSession } from '../hooks/useCheckoutSession'
import { formatPrice, toImageSrc } from '../utils/format'
import { formatPhoneForDisplay } from '../utils/phone'
import { createOrder } from '../services/orders'

export default function Checkout() {
  const navigate = useNavigate()
  const {
    session,
    phone: whatsAppPhone,
    name: whatsAppName,
    fromWhatsApp,
    lockedName,
    lockedPhone,
    loading: sessionLoading,
    error: sessionError,
  } = useCheckoutSession()
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
  })
  const [errors, setErrors] = useState({})
  const [giftCardInput, setGiftCardInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session) return
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || session.name || '',
      phone: prev.phone || session.phone || '',
    }))
  }, [session])

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

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (items.length === 0) return

    setSubmitting(true)
    setErrors((prev) => ({ ...prev, submit: '' }))

    try {
      const { order_ref: orderRef } = await createOrder({
        customer: form,
        items,
        total,
        deliveryFee,
        discountAmount,
      })

      clearCart()
      navigate('/order-success', { state: { orderRef } })
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to place order. Please try again.',
      }))
    } finally {
      setSubmitting(false)
    }
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

        {sessionLoading && (
          <p className="checkout__whatsapp-note">Verifying your WhatsApp checkout link…</p>
        )}

        {sessionError && (
          <p className="checkout__whatsapp-note checkout__whatsapp-note--error" role="alert">
            {sessionError}
          </p>
        )}

        {fromWhatsApp && !sessionLoading && (
          <p className="checkout__whatsapp-note">
            Ordering as {whatsAppName ? `${whatsAppName} · ` : ''}
            {formatPhoneForDisplay(whatsAppPhone)} — finish on WhatsApp after checkout.
          </p>
        )}

        <div className="checkout__layout">
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
                  disabled={lockedName}
                />
                {lockedName && (
                  <span className="form-hint">Linked from WhatsApp profile.</span>
                )}
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
                  disabled={lockedPhone}
                />
                {lockedPhone && (
                  <span className="form-hint">Linked from WhatsApp — use the same number to confirm your order.</span>
                )}
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className={errors.address ? 'input--error' : ''}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, city, postal code"
                  autoComplete="street-address"
                />
                {errors.address && <span className="form-error">{errors.address}</span>}
              </div>

              {errors.submit && (
                <p className="form-error checkout-form__submit-error" role="alert">
                  {errors.submit}
                </p>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--full checkout-form__submit"
                disabled={submitting || sessionLoading}
              >
                {submitting ? 'Saving order…' : 'Save order & continue on WhatsApp'}
              </button>
            </form>
          </section>

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
                        <span className="summary-item__qty-text">{item.quantity}×</span>
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
