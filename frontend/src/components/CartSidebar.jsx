import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'
import { X, ShoppingBag, Plus, Minus, Trash2, Truck, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartSidebar({ open, onClose, onAuthOpen }) {
  const { user } = useAuth()
  const { cart, totals, updateQty, coupon, applyCoupon } = useCart()
  const { showNotif } = useNotif()
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const FREE_SHIP = 499
  const progress = Math.min((totals.subtotal / FREE_SHIP) * 100, 100)
  const remaining = Math.max(FREE_SHIP - totals.subtotal, 0)

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setLoading(true)
    const res = await applyCoupon(couponCode)
    if (res.success) {
      showNotif(res.message, 'success')
      setCouponCode('')
    } else {
      showNotif(res.message, 'error')
    }
    setLoading(false)
  }

  const handleRemoveCoupon = () => {
    setCoupon(null)
    showNotif('Coupon removed', 'info')
  }

  const handleCheckout = () => { 
    if (!user) {
      showNotif('Please login to place an order', 'info')
      onClose()
      navigate('/login')
      return
    }
    onClose() 
    navigate('/checkout') 
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overlay open"
            onClick={onClose}
            style={{ zIndex: 1250 }}
          />

          <motion.aside
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            className="glass-sidebar"
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: 'min(460px, 100vw)',
              zIndex: 1300,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--sh-xl)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  width: 44, height: 44,
                  borderRadius: 'var(--r-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.25)'
                }}>
                  <ShoppingBag size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 'var(--text-lg)', color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.01em' }}>
                    My Basket
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ha-btn"
                style={{ background: 'var(--canvas)', border: '1px solid var(--border)' }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {/* Free shipping bar */}
              <div className="glass" style={{
                marginBottom: 28,
                padding: '18px 20px',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>
                    {remaining > 0
                      ? `₹${remaining} more for FREE shipping`
                      : '🚀 FREE shipping unlocked!'}
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
                    目标 ₹{FREE_SHIP}
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--canvas)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'var(--primary)', borderRadius: 99, boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.5)' }}
                  />
                </div>
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: '5rem', marginBottom: 24, opacity: 0.2 }}>🛒</div>
                  <h3 style={{ fontWeight: 900, fontSize: 'var(--text-xl)', marginBottom: 12, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                    Your basket is empty
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: 'var(--text-md)', marginBottom: 32, lineHeight: 1.6, fontWeight: 500 }}>
                    Looks like you haven't added anything yet. Explore our farm-fresh collection!
                  </p>
                  <button className="btn btn-primary" onClick={onClose} style={{ borderRadius: 'var(--r-xl)', padding: '16px 36px', fontSize: 'var(--text-md)' }}>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 20 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Review Items
                  </div>
                  {cart.map(item => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="hover-bg"
                      style={{
                        display: 'flex',
                        gap: 16,
                        padding: 12,
                        borderRadius: 'var(--r-xl)',
                        border: '1px solid transparent'
                      }}
                    >
                      <div style={{
                        width: 84, height: 84,
                        background: 'var(--canvas)',
                        borderRadius: 'var(--r-lg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, padding: 12,
                        border: '1px solid var(--border)'
                      }}>
                        <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={item.name} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--ink)', paddingRight: 8, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                            {item.name}
                          </div>
                          <button
                            onClick={() => updateQty(item.id, -item.qty)}
                            style={{
                              color: 'var(--muted)', padding: 6, background: 'var(--canvas)',
                              border: 'none', cursor: 'pointer', flexShrink: 0,
                              borderRadius: '50%', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'var(--canvas)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 12, fontWeight: 600 }}>
                          {item.weight} · ₹{item.price}/unit
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            background: 'var(--primary)',
                            borderRadius: 'var(--r-md)',
                            padding: 2,
                            gap: 2,
                            boxShadow: '0 4px 10px rgba(var(--primary-rgb), 0.15)'
                          }}>
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              style={{
                                width: 28, height: 28, borderRadius: 'var(--r-sm)',
                                border: 'none', background: 'none',
                                cursor: 'pointer', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span style={{ width: 28, textAlign: 'center', fontWeight: 900, fontSize: 'var(--text-sm)', color: '#fff' }}>
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              style={{
                                width: 28, height: 28, borderRadius: 'var(--r-sm)',
                                border: 'none', background: 'none',
                                cursor: 'pointer', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                          <div style={{ fontWeight: 900, color: 'var(--ink)', fontSize: 'var(--text-md)', letterSpacing: '-0.01em' }}>
                            ₹{item.price * item.qty}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div style={{
                padding: '28px',
                borderTop: '1px solid var(--border)',
                background: 'transparent',
                flexShrink: 0
              }}>
                {/* Coupon Section */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                    Have a promo code?
                  </div>
                  {coupon ? (
                    <div className="glass" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 'var(--r-lg)',
                      background: 'var(--success-bg)', border: '1px solid var(--success)',
                      color: 'var(--success)', fontWeight: 700
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 'var(--text-sm)', background: 'var(--success)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--r-sm)', textTransform: 'uppercase' }}>
                          {coupon.code}
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)' }}>Applied Successfully!</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', display: 'flex' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 10 }}>
                      <input
                        className="input"
                        placeholder="Enter Code (e.g. FRESH20)"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        style={{ flex: 1, height: 48, borderRadius: 'var(--r-lg)', fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase' }}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-outline"
                        style={{ height: 48, borderRadius: 'var(--r-lg)', padding: '0 20px', fontSize: 'var(--text-sm)' }}
                      >
                        {loading ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}
                </div>

                <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-base)' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 700 }}>Basket Subtotal</span>
                    <span style={{ fontWeight: 800, color: 'var(--ink)' }}>₹{totals.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-base)' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 700 }}>Delivery & Handling</span>
                    <span style={{ color: totals.delivery === 0 ? 'var(--success)' : 'var(--ink)', fontWeight: 800 }}>
                      {totals.delivery === 0 ? 'FREE' : `₹${totals.delivery}`}
                    </span>
                  </div>
                  {totals.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-base)', color: 'var(--success)' }}>
                      <span style={{ fontWeight: 700 }}>Coupon Savings</span>
                      <span style={{ fontWeight: 900 }}>−₹{totals.discount}</span>
                    </div>
                  )}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12, paddingTop: 20,
                    borderTop: '2px dashed var(--border)'
                  }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Payable</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
                        ₹{totals.total}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: '16px 32px',
                        fontSize: 'var(--text-md)',
                        borderRadius: 'var(--r-xl)',
                        gap: 12,
                        boxShadow: '0 12px 24px rgba(var(--primary-rgb), 0.3)'
                      }}
                      onClick={handleCheckout}
                    >
                      Checkout <ArrowRight size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 32, opacity: 0.6 }}>
                  {[
                    { icon: <ShieldCheck size={14} />, text: 'Safe Pay' },
                    { icon: <CreditCard size={14} />, text: 'Card/UPI' }
                  ].map(({ icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', color: 'var(--ink)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {icon} {text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
