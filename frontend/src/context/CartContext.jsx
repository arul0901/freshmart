import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { couponsAPI, cartAPI, wishlistAPI } from '../api'
import { useAuth } from './AuthContext'
import { useNotif } from './NotifContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useAuth()
  const { showNotif } = useNotif()
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [coupon, setCoupon] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load cart & wishlist on auth change
  useEffect(() => {
    const loadState = async () => {
      setLoading(true)

      if (!user || !user.id) {
        // Guest: use localStorage
        const localCart = JSON.parse(localStorage.getItem('fm_cart') || '[]')
        const localWish = JSON.parse(localStorage.getItem('fm_wishlist') || '[]')
        setCart(localCart)
        setWishlist(localWish)
        setLoading(false)
        return
      }

      // Authenticated: fetch from server (user isolated)
      try {
        const [cartRes, wishRes] = await Promise.all([
          cartAPI.get(user.id),
          wishlistAPI.get(user.id)
        ])
        setCart(cartRes.data || [])
        setWishlist(wishRes.data || [])
        localStorage.removeItem('fm_cart')
        localStorage.removeItem('fm_wishlist')
      } catch (err) {
        console.error('Server data load failed:', err)
        showNotif('Failed to load cart data. Using local session.', 'warning')
      } finally {
        setLoading(false)
      }
    }

    loadState()
  }, [user])

  const addToCart = useCallback(async (product, qty = 1) => {
    // Optimistic update
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { ...product, qty }]
    })

    if (user) {
      try {
        await cartAPI.add(product.id, qty)
      } catch (err) {
        console.error('Failed to persist cart item:', err)
      }
    } else {
      const current = JSON.parse(localStorage.getItem('fm_cart') || '[]')
      const index = current.findIndex(p => p.id === product.id)
      if (index > -1) {
        current[index].qty += qty
      } else {
        current.push({ ...product, qty })
      }
      localStorage.setItem('fm_cart', JSON.stringify(current))
    }
  }, [user])

  const updateQty = useCallback(async (id, delta) => {
    let newQty = 0
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      if (!item) return prev
      newQty = Math.max(0, item.qty + delta)
      return prev.map(i => i.id === id ? { ...i, qty: newQty } : i).filter(i => i.qty > 0)
    })

    if (user) {
      try {
        if (newQty > 0) await cartAPI.add(id, newQty)
        else await cartAPI.remove(id)
      } catch (err) {
        console.error('Failed to sync quantity update:', err)
      }
    } else {
      const current = JSON.parse(localStorage.getItem('fm_cart') || '[]')
      const next = current.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item).filter(p => p.qty > 0)
      localStorage.setItem('fm_cart', JSON.stringify(next))
    }
  }, [user])

  const toggleWishlist = useCallback(async (product) => {
    const isAdding = !wishlist.some(i => i.id === product.id)
    setWishlist(prev => isAdding ? [...prev, product] : prev.filter(i => i.id !== product.id))

    if (user) {
      try {
        if (isAdding) await wishlistAPI.add(product.id)
        else await wishlistAPI.remove(product.id)
      } catch (err) {
        console.error('Wishlist persistence failed:', err)
      }
    } else {
      const current = JSON.parse(localStorage.getItem('fm_wishlist') || '[]')
      const filtered = isAdding ? [...current, product] : current.filter(p => p.id !== product.id)
      localStorage.setItem('fm_wishlist', JSON.stringify(filtered))
    }
  }, [user, wishlist])

  const clearCart = useCallback(async () => {
    setCart([])
    if (!user) localStorage.removeItem('fm_cart')
  }, [user])

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
    const discount = coupon ? (coupon.discount || 0) : 0
    return {
      subtotal,
      delivery,
      discount,
      total: subtotal + delivery - discount,
      itemCount: cart.reduce((s, i) => s + i.qty, 0)
    }
  })()

  return (
    <CartContext.Provider value={{
      cart, wishlist, coupon, totals, loading,
      addToCart, updateQty, clearCart, toggleWishlist,
      isInWishlist, isInCart, applyCoupon, setCoupon
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
