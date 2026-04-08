import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { couponsAPI } from '../api'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('fm_cart')
    return saved ? JSON.parse(saved) : []
  })
  
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('fm_wishlist')
    return saved ? JSON.parse(saved) : []
  })

  const [coupon, setCoupon] = useState(null)

  // Persist State
  useEffect(() => {
    localStorage.setItem('fm_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('fm_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty }]
    })
  }, [])

  const updateQty = useCallback((id, delta) => {
    setCart(prev => {
      const next = prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      return next.filter(i => i.qty > 0)
    })
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => prev.find(i => i.id === product.id) ? prev.filter(i => i.id !== product.id) : [...prev, product])
  }, [])

  const isInWishlist = useCallback((id) => wishlist.some(i => i.id === id), [wishlist])
  const isInCart = useCallback((id) => cart.find(i => i.id === id), [cart])

  const applyCoupon = async (code) => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
    try {
      const { data } = await couponsAPI.validate({ code, subtotal })
      if (data.valid) { setCoupon(data); return { success: true, message: data.message } }
      return { success: false, message: data.message }
    } catch { return { success: false, message: 'Error validating coupon' } }
  }

  const totals = (() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
    const delivery = subtotal >= 499 ? 0 : 40
    const discount = coupon ? coupon.discount : 0
    return { subtotal, delivery, discount, total: subtotal + delivery - discount, itemCount: cart.reduce((s, i) => s + i.qty, 0) }
  })()

  return (
    <CartContext.Provider value={{ cart, wishlist, coupon, totals, addToCart, updateQty, clearCart, toggleWishlist, isInWishlist, isInCart, applyCoupon, setCoupon }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
