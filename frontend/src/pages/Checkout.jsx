import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, CheckCircle2, ArrowRight, Package, 
  MapPin, CreditCard, ChevronRight, Search, Menu, 
  Leaf, Star, Sparkles, PartyPopper
} from 'lucide-react'

/**
 * Premium Success Animation using Framer Motion
 */
function SuccessCelebration() {
  return (
    <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px' }}>
      {/* Background Aura */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        style={{ position: 'absolute', width: '150%', height: '150%', background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)', borderRadius: '50%' }}
      />
      
      {/* Main Checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        style={{ 
          background: 'var(--success)', 
          color: '#fff', 
          width: 120, height: 120, 
          borderRadius: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(var(--success-rgb), 0.3)',
          zIndex: 2
        }}
      >
        <CheckCircle2 size={60} strokeWidth={2.5} />
      </motion.div>

      {/* Bursting Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{ 
            scale: [0, 1, 0.5],
            x: Math.cos(i * 30 * Math.PI / 180) * 120,
            y: Math.sin(i * 30 * Math.PI / 180) * 120,
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, repeatDelay: 1 }}
          style={{ position: 'absolute', color: i % 2 === 0 ? 'var(--success)' : 'var(--accent)' }}
        >
          {i % 3 === 0 ? <Star size={12} fill="currentColor" /> : i % 3 === 1 ? <Sparkles size={14} /> : <div style={{width: 6, height: 6, borderRadius: '50%', background: 'currentColor'}} />}
        </motion.div>
      ))}
    </div>
  )
}

export default function Checkout() {
  const { cart, totals, clearCart } = useCart()
  const { user } = useAuth()
  const { showNotif } = useNotif()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Info, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.display_name || '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMode: 'cod'
  })

  // Redirect if cart empty (unless on success step)
  useEffect(() => {
    if (cart.length === 0 && step !== 3) {
      navigate('/')
    }
  }, [cart, step, navigate])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showNotif('Please fill all required details (Name, Phone, Address)', 'warning')
      return
    }
    // Simple phone validation
    if (formData.phone.replace(/\D/g, '').length < 10) {
      showNotif('Please enter a valid 10-digit mobile number', 'warning')
      return
    }
    setStep(2)
  }
  const handleBack = () => setStep(1)

  const placeOrder = async () => {
    setLoading(true)
    try {
      const orderData = {
        customer: formData.name,
        email: user?.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        items: cart,
        total: totals.total,
        payment_mode: formData.paymentMode,
        status: 'pending'
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) throw new Error('Failed to place order')

      const data = await response.json()
      clearCart()
      setStep(3)
      showNotif('Order placed successfully!', 'success')
    } catch (err) {
      showNotif(err.message || 'Error placing order', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ 
            width: '100%', maxWidth: 540, 
            textAlign: 'center', 
            padding: '60px 40px',
            borderRadius: 40,
            border: '2px solid var(--border)',
            background: 'var(--canvas)'
          }}
        >
          <SuccessCelebration />
          
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Order Confirmed!
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: 600, lineHeight: 1.6, marginBottom: 40 }}>
            Your premium harvest is being prepared. <br/> We've sent the details to <strong>{user?.email}</strong>
          </p>

          <div style={{ 
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40,
            textAlign: 'left'
          }}>
            <div style={{ padding: 20, background: 'var(--canvas-sub)', borderRadius: 20, border: '1px solid var(--border)' }}>
               <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Order ID</div>
               <div style={{ fontWeight: 800, color: 'var(--ink)' }}>#FM-{Math.floor(Math.random()*90000) + 10000}</div>
            </div>
            <div style={{ padding: 20, background: 'var(--canvas-sub)', borderRadius: 20, border: '1px solid var(--border)' }}>
               <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Delivery</div>
               <div style={{ fontWeight: 800, color: 'var(--ink)' }}>45 - 60 Mins</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/orders')}
              style={{ height: 64, borderRadius: 20, fontSize: '1.1rem', fontWeight: 800 }}
            >
              Track My Order
            </button>
            <button 
              className="btn-outline" 
              onClick={() => navigate('/')}
              style={{ height: 56, borderRadius: 16, fontWeight: 700 }}
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="checkout-page" style={{ padding: '120px 20px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40 }}>
        
        {/* Left: Form */}
        <div style={{ display: 'grid', gap: 32 }}>
          {/* Progress Header */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 10 }}>
            <div style={{ opacity: step >= 1 ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : 'var(--muted)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>1</div>
              <span style={{ fontWeight: 800, color: step >= 1 ? 'var(--ink)' : 'var(--muted)' }}>Delivery Info</span>
            </div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)', alignSelf: 'center' }} />
            <div style={{ opacity: step >= 2 ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : 'var(--muted)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>2</div>
              <span style={{ fontWeight: 800, color: step >= 2 ? 'var(--ink)' : 'var(--muted)' }}>Payment</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card" style={{ padding: 40, borderRadius: 32, border: '1px solid var(--border)' }}
              >
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32, letterSpacing: '-0.02em' }}>Shipping Details</h2>
                <div style={{ display: 'grid', gap: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Full Name</label>
                      <input name="name" className="search-input" value={formData.name} onChange={handleInputChange} style={{ width: '100%', height: 52, borderRadius: 14 }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Phone Number</label>
                      <input name="phone" className="search-input" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', height: 52, borderRadius: 14 }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Delivery Address</label>
                    <textarea name="address" className="search-input" value={formData.address} onChange={handleInputChange} style={{ width: '100%', height: 100, borderRadius: 16, padding: '16px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>City</label>
                      <input name="city" className="search-input" value={formData.city} onChange={handleInputChange} style={{ width: '100%', height: 52, borderRadius: 14 }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Pincode</label>
                      <input name="pincode" className="search-input" value={formData.pincode} onChange={handleInputChange} style={{ width: '100%', height: 52, borderRadius: 14 }} />
                    </div>
                  </div>
                  <button onClick={handleNext} className="btn-primary" style={{ height: 60, borderRadius: 18, marginTop: 10, fontWeight: 800 }}>
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card" style={{ padding: 40, borderRadius: 32, border: '1px solid var(--border)' }}
              >
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32, letterSpacing: '-0.02em' }}>Choose Payment</h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: <Package size={20} /> },
                    { id: 'upi', label: 'UPI (Paytm / PhonePe)', icon: <ArrowRight size={20} /> },
                    { id: 'card', label: 'Debit / Credit Card', icon: <CreditCard size={20} /> }
                  ].map(method => (
                    <div 
                      key={method.id}
                      onClick={() => setFormData({...formData, paymentMode: method.id})}
                      style={{ 
                        padding: 24, borderRadius: 20, border: '2px solid', 
                        borderColor: formData.paymentMode === method.id ? 'var(--primary)' : 'var(--border)',
                        background: formData.paymentMode === method.id ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ color: formData.paymentMode === method.id ? 'var(--primary)' : 'var(--muted)' }}>{method.icon}</div>
                        <span style={{ fontWeight: 800, color: 'var(--ink)' }}>{method.label}</span>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {formData.paymentMode === method.id && <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }} />}
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, marginTop: 24 }}>
                    <button onClick={handleBack} className="btn-outline" style={{ height: 60, borderRadius: 18 }}>Back</button>
                    <button onClick={placeOrder} disabled={loading} className="btn-primary" style={{ height: 60, borderRadius: 18, fontWeight: 800 }}>
                      {loading ? 'Processing...' : `Pay ₹${totals.total}`}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Summary */}
        <div style={{ position: 'sticky', top: 120, height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: 32, borderRadius: 32, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 24 }}>Order Summary</h3>
            <div style={{ display: 'grid', gap: 16, maxHeight: 300, overflowY: 'auto', marginBottom: 24, paddingRight: 10 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 60, height: 60, background: 'var(--canvas)', borderRadius: 12, border: '1px solid var(--border)', padding: 8 }}>
                    <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={item.name} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ink)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>{item.qty} × ₹{item.price}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>₹{item.price * item.qty}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: 12, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontWeight: 700 }}>
                 <span>Subtotal</span>
                 <span>₹{totals.subtotal}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontWeight: 700 }}>
                 <span>Delivery</span>
                 <span style={{ color: 'var(--success)' }}>{totals.delivery === 0 ? 'FREE' : `₹${totals.delivery}`}</span>
               </div>
               {totals.discount > 0 && (
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 700 }}>
                   <span>Discount</span>
                   <span>−₹{totals.discount}</span>
                 </div>
               )}
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '2px dashed var(--border)' }}>
                 <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>Total</span>
                 <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)' }}>₹{totals.total}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
