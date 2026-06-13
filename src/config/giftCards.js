/** Configurable mock gift card codes and their discount percentages. */
export const GIFT_CARDS = {
  WELCOME10: { discount: 10, label: '10% off' },
  SODAMAX20: { discount: 20, label: '20% off' },
  VIP50: { discount: 50, label: '50% off' },
}

/**
 * Validate a gift card code and return its discount info.
 * @param {string} code
 * @returns {{ valid: boolean, discount?: number, label?: string }}
 */
export function validateGiftCard(code) {
  const normalized = code.trim().toUpperCase()
  const card = GIFT_CARDS[normalized]

  if (!card) {
    return { valid: false }
  }

  return {
    valid: true,
    code: normalized,
    discount: card.discount,
    label: card.label,
  }
}
