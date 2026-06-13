import { useState } from 'react'
import { formatPrice } from '../utils/format'
import { GIFT_REFILL_DELIVERY_FEE } from '../config/products'
import { useCart } from '../context/CartContext'

export default function GiftCardRefillBanner({ refillProduct }) {
  const { redeemGiftRefill, refillBannerMessage } = useCart()
  const [code, setCode] = useState('')

  if (!refillProduct) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!code.trim()) return
    redeemGiftRefill(refillProduct, code)
  }

  return (
    <section className="refill-banner" aria-labelledby="refill-banner-title">
      <div className="refill-banner__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M20 12v10H4V12" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      </div>

      <div className="refill-banner__content">
        <h2 id="refill-banner-title" className="refill-banner__title">
          Have a gift card?
        </h2>
        <p className="refill-banner__text refill-banner__text--full">
          Redeem your <strong>one-time free refill</strong>. A delivery fee of{' '}
          <strong>{formatPrice(GIFT_REFILL_DELIVERY_FEE)}</strong> applies.
          Use the product grid below if you are ordering a paid refill without a gift card.
        </p>
        <p className="refill-banner__text refill-banner__text--short">
          Free refill redemption. <strong>{formatPrice(GIFT_REFILL_DELIVERY_FEE)}</strong> delivery fee.
        </p>

        <form className="refill-banner__form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="refill-banner__input"
            placeholder="Gift card code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label="Gift card code for free refill"
          />
          <button type="submit" className="btn btn--primary btn--sm refill-banner__btn">
            Redeem
          </button>
        </form>

        {refillBannerMessage && (
          <p
            className={`refill-banner__message refill-banner__message--${refillBannerMessage.type}`}
            role="alert"
          >
            {refillBannerMessage.text}
          </p>
        )}
      </div>
    </section>
  )
}
