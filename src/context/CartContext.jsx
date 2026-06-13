import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { validateGiftCard } from '../config/giftCards'

const STORAGE_KEY = 'sodamax-cart'

const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], giftCardCode: '', giftCardDiscount: 0 }
    const parsed = JSON.parse(raw)
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      giftCardCode: parsed.giftCardCode ?? '',
      giftCardDiscount: parsed.giftCardDiscount ?? 0,
    }
  } catch {
    return { items: [], giftCardCode: '', giftCardDiscount: 0 }
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart().items)
  const [giftCardCode, setGiftCardCode] = useState(() => loadCart().giftCardCode)
  const [giftCardDiscount, setGiftCardDiscount] = useState(
    () => loadCart().giftCardDiscount,
  )
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [giftCardMessage, setGiftCardMessage] = useState(null)

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items, giftCardCode, giftCardDiscount }),
    )
  }, [items, giftCardCode, giftCardDiscount])

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_base64: product.image_base64,
          quantity: 1,
        },
      ]
    })
    setIsCartOpen(true)
  }, [])

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setGiftCardCode('')
    setGiftCardDiscount(0)
    setGiftCardMessage(null)
  }, [])

  const applyGiftCard = useCallback((code) => {
    const result = validateGiftCard(code)

    if (!result.valid) {
      setGiftCardCode('')
      setGiftCardDiscount(0)
      setGiftCardMessage({ type: 'error', text: 'Invalid gift card code.' })
      return false
    }

    setGiftCardCode(result.code)
    setGiftCardDiscount(result.discount)
    setGiftCardMessage({
      type: 'success',
      text: `Gift card applied! ${result.label}`,
    })
    return true
  }, [])

  const removeGiftCard = useCallback(() => {
    setGiftCardCode('')
    setGiftCardDiscount(0)
    setGiftCardMessage(null)
  }, [])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const discountAmount = useMemo(
    () => (giftCardDiscount > 0 ? (subtotal * giftCardDiscount) / 100 : 0),
    [subtotal, giftCardDiscount],
  )

  const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const value = {
    items,
    itemCount,
    subtotal,
    discountAmount,
    total,
    giftCardCode,
    giftCardDiscount,
    giftCardMessage,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyGiftCard,
    removeGiftCard,
    openCart,
    closeCart,
    setGiftCardMessage,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
