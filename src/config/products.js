/** Delivery fee for gift-card refill redemptions (Rs) */
export const GIFT_REFILL_DELIVERY_FEE = 150

/**
 * Find the product used for gift-card refill redemption.
 * Uses the first product whose name contains "refill" (case-insensitive).
 * When you add a separate gift-refill SKU in Supabase, set its id here.
 */
export const GIFT_REFILL_PRODUCT_ID = null

export function isRefillProduct(product) {
  return product.name.toLowerCase().includes('refill')
}

export function getGiftRefillProduct(products) {
  if (GIFT_REFILL_PRODUCT_ID) {
    return products.find((p) => p.id === GIFT_REFILL_PRODUCT_ID)
  }
  return products.find((p) => isRefillProduct(p))
}

/** Cart line id for a gift-card refill (separate from paid refill line). */
export function giftRefillLineId(productId) {
  return `${productId}::gift-refill`
}

export function isGiftRefillLineId(lineId) {
  return String(lineId).endsWith('::gift-refill')
}

/** Build a unique cart line id (supports color variants). */
export function buildCartLineId(productId, { isGiftRefill = false, color = null } = {}) {
  if (isGiftRefill) return giftRefillLineId(productId)
  if (color) return `${productId}::color::${encodeURIComponent(color)}`
  return String(productId)
}

export function getColorFromLineId(lineId) {
  const str = String(lineId)
  const marker = '::color::'
  if (!str.includes(marker)) return null
  return decodeURIComponent(str.split(marker)[1])
}
