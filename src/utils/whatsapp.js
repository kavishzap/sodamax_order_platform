import { formatPrice } from './format'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '230XXXXXXXX'

/**
 * Build the order summary message for WhatsApp.
 */
export function buildOrderMessage({ customer, items, giftCardCode, subtotal, discount, total }) {
  const lines = [
    `Customer: ${customer.fullName}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}`,
  ]

  if (customer.notes?.trim()) {
    lines.push(`Notes: ${customer.notes.trim()}`)
  }

  lines.push('', 'Items:')

  items.forEach((item) => {
    const lineTotal = item.price * item.quantity
    lines.push(`${item.quantity} x ${item.name} - ${formatPrice(lineTotal)}`)
  })

  lines.push('')

  if (giftCardCode) {
    lines.push(`Gift Card: ${giftCardCode}`)
    lines.push(`Subtotal: ${formatPrice(subtotal)}`)
    lines.push(`Discount: -${formatPrice(discount)}`)
  }

  lines.push(`Total: ${formatPrice(total)}`)

  return lines.join('\n')
}

/**
 * Open WhatsApp with a pre-filled order message.
 */
export function redirectToWhatsApp(message) {
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
