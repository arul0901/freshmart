import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'
import { ordersAPI, paymentAPI } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, CheckCircle2, ArrowRight, Package,
  MapPin, CreditCard, ChevronRight, Sparkles, Star
} from 'lucide-react'

/** Success celebration animation */
function SuccessCelebration() {
  return (
    <div style={{ position: 'relative', zIndex: 10, width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px' }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        style={{ position: 'absolute', width: '150%', height: '150%', background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)', borderRadius: '50%' }}
      />
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        style={{
          background: 'var(--success)', color: '#fff',
          width: 120, height: 120, borderRadius: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,180,120,0.3)', zIndex: 2
        }}
      >
        <CheckCircle2 size={60} strokeWidth={2.5} />
      </motion.div>
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
          {i % 3 === 0 ? <Star size={12} fill="currentColor" /> : i % 3 === 1 ? <Sparkles size={14} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
        </motion.div>
      ))}
    </div>
  )
}

/** Dynamically load Razorpay checkout script */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Checkout() {
  const { cart, totals, clearCart } = useCart()
  const { user } = useAuth()
  const { showNotif } = useNotif()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Info, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState(null)
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
    if (cart.length === 0 && step !== 3) navigate('/')
  }, [cart, step, navigate])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showNotif('Please fill all required details (Name, Phone, Address)', 'warning')
      return
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      showNotif('Please enter a valid 10-digit mobile number', 'warning')
      return
    }
    setStep(2)
  }

  const createAndPlaceOrder = useCallback(async (paymentId = null) => {
    console.log('🔍 [CHECKOUT DEBUG] Creating order with payment ID:', paymentId);
    
    const orderPayload = {
      userId: user?.id,
      customer: formData.name,
      email: user?.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      items: cart,
      total: totals.total,
      payment_mode: formData.paymentMode,
      razorpay_payment_id: paymentId,
    }

    console.log('🔍 [CHECKOUT DEBUG] Order payload:', JSON.stringify(orderPayload, null, 2));
    
    const { data: result } = await ordersAPI.create(orderPayload)
    console.log('🔍 [CHECKOUT DEBUG] Order creation result:', JSON.stringify(result, null, 2));
    return result
  }, [user, formData, cart, totals])

  const handleRazorpay = async () => {
    setLoading(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        showNotif('Razorpay failed to load. Please try again.', 'error')
        setLoading(false)
        return
      }

      // Step 1: Create Razorpay order on backend
      const { data: orderData } = await paymentAPI.createOrder({
        amount: totals.total,
        userId: user?.id,
      })

      // Step 2: Open Razorpay modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FreshMart',
        description: 'Fresh Grocery Delivery',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.name,
          email: user?.email,
          contact: formData.phone,
        },
        theme: { color: '#0EB48F' },
        handler: async (response) => {
          try {
            console.log('🔍 [CHECKOUT DEBUG] Razorpay payment successful');
            console.log('🔍 [CHECKOUT DEBUG] Razorpay response:', JSON.stringify(response, null, 2));
            
            // Step 3: Create order FIRST to get orderId
            console.log('🔍 [CHECKOUT DEBUG] Creating order before payment verification...');
            const result = await createAndPlaceOrder(response.razorpay_payment_id)
            console.log('🔍 [CHECKOUT DEBUG] Order created with ID:', result?.orderId);
            
            // Step 4: Verify payment with orderId
            const { data: verified } = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.id,
              orderId: result?.orderId, // CRITICAL: Pass the actual order ID
            })
            
            console.log('🔍 [CHECKOUT DEBUG] Payment verification result:', JSON.stringify(verified, null, 2));

            if (!verified.success) {
              showNotif('Payment verification failed. Contact support.', 'error')
              return
            }

            // Step 5: Complete the flow
            clearCart()
            setCompletedOrderId(result?.orderId)
            setStep(3)
            showNotif('Payment successful! Order placed.', 'success')
          } catch (err) {
            console.error('🔍 [CHECKOUT DEBUG] Payment handler error:', err);
            showNotif(err?.response?.data?.error || 'Order placement failed after payment.', 'error')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            showNotif('Payment cancelled.', 'warning')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        showNotif(`Payment failed: ${response.error.description}`, 'error')
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      showNotif(err?.response?.data?.error || 'Failed to initiate payment.', 'error')
      setLoading(false)
    }
  }

  const placeOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showNotif('Please fill in all shipping details.', 'error')
      return
    }

    if (formData.paymentMode === 'razorpay') {
      await handleRazorpay()
      return
    }

    // COD or UPI flow
    setLoading(true)
    try {
      const result = await createAndPlaceOrder()
      clearCart()
      setCompletedOrderId(result?.orderId)
      setStep(3)
      showNotif('Order placed successfully!', 'success')
    } catch (err) {
      showNotif(err?.response?.data?.error || 'Error placing your order.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Success Screen ──
  if (step === 3) {
    return (
      <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            width: '100%', maxWidth: 540,
            textAlign: 'center', padding: '60px 40px',
            borderRadius: 'var(--r-squircle)', border: '2px solid var(--border)', background: 'var(--canvas)'
          }}
        >
          <SuccessCelebration />
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Order Confirmed!
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: 600, lineHeight: 1.6, marginBottom: 40 }}>
            Your fresh groceries are being prepared. <br />
            We've sent the details to <strong>{user?.email}</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40, textAlign: 'left' }}>
            <div style={{ padding: 20, background: 'var(--canvas-sub)', borderRadius: 'var(--r-squircle)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Order ID</div>
              <div style={{ fontWeight: 800, color: 'var(--ink)' }}>#{completedOrderId || 'FM-XXXXX'}</div>
            </div>
            <div style={{ padding: 20, background: 'var(--canvas-sub)', borderRadius: 'var(--r-squircle)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Delivery</div>
              <div style={{ fontWeight: 800, color: 'var(--ink)' }}>45 – 60 Mins</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <button className="btn btn-primary" onClick={() => navigate('/orders')} style={{ height: 64, borderRadius: 'var(--r-squircle)', fontSize: '1.1rem', fontWeight: 800 }}>
              Track My Order
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/')} style={{ height: 56, borderRadius: 'var(--r-squircle)', fontWeight: 700 }}>
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Checkout Form ──
  return (
    <div className="checkout-page" style={{ padding: '120px 20px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40 }}>

        {/* Left: Form Steps */}
        <div style={{ display: 'grid', gap: 32 }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 10 }}>
            {[{ n: 1, label: 'Delivery Info' }, { n: 2, label: 'Payment' }].map(({ n, label }) => (
              <div key={n} style={{ opacity: step >= n ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= n ? 'var(--primary)' : 'var(--muted)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>{n}</div>
                <span style={{ fontWeight: 800, color: step >= n ? 'var(--ink)' : 'var(--muted)' }}>{label}</span>
                {n < 2 && <div style={{ width: 60, height: 1, background: 'var(--border)' }} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="glass-card" style={{ padding: 40, borderRadius: 'var(--r-squircle)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32, letterSpacing: '-0.02em' }}>Shipping Details</h2>
                <div style={{ display: 'grid', gap: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Full Name *</label>
                      <input name="name" className="search-input" value={formData.name} onChange={handleInputChange} style={{ width: '100%', height: 52, borderRadius: 14 }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Phone Number *</label>
                      <input name="phone" className="search-input" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', height: 52, borderRadius: 14 }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Delivery Address *</label>
                    <textarea name="address" className="search-input" value={formData.address} onChange={handleInputChange} placeholder="House No, Street, Landmark" style={{ width: '100%', height: 100, borderRadius: 16, padding: '16px' }} />
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
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="glass-card" style={{ padding: 40, borderRadius: 'var(--r-squircle)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32, letterSpacing: '-0.02em' }}>Choose Payment</h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: <Package size={20} /> },
                    { id: 'razorpay', label: 'Razorpay (UPI / Card / Netbanking)', desc: 'Secure online payment gateway', icon: <CreditCard size={20} /> },
                  ].map(method => (
                    <div
                      key={method.id}
                      onClick={() => setFormData({ ...formData, paymentMode: method.id })}
                      style={{
                        padding: 24, borderRadius: 20, border: '2px solid',
                        borderColor: formData.paymentMode === method.id ? 'var(--primary)' : 'var(--border)',
                        background: formData.paymentMode === method.id ? 'rgba(14,180,143,0.05)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ color: formData.paymentMode === method.id ? 'var(--primary)' : 'var(--muted)' }}>{method.icon}</div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{method.label}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>{method.desc}</div>
                        </div>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {formData.paymentMode === method.id && <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }} />}
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, marginTop: 24 }}>
                    <button onClick={() => setStep(1)} className="btn-outline" style={{ height: 60, borderRadius: 'var(--r-squircle)' }}>Back</button>
                    <button onClick={placeOrder} disabled={loading} className="btn btn-primary" style={{ height: 60, borderRadius: 'var(--r-squircle)', fontWeight: 800 }}>
                      {loading ? 'Processing...' : formData.paymentMode === 'razorpay' ? `Pay ₹${totals.total} via Razorpay` : `Place Order — ₹${totals.total}`}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order Summary */}
        <div style={{ position: 'sticky', top: 120, height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: 32, borderRadius: 'var(--r-squircle)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 24 }}>Order Summary</h3>
            <div style={{ display: 'grid', gap: 16, maxHeight: 300, overflowY: 'auto', marginBottom: 24, paddingRight: 10 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 60, height: 60, background: 'var(--canvas)', borderRadius: 12, border: '1px solid var(--border)', padding: 8, flexShrink: 0 }}>
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
                <span>Subtotal</span><span>₹{totals.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontWeight: 700 }}>
                <span>Delivery</span>
                <span style={{ color: totals.delivery === 0 ? 'var(--success)' : 'inherit' }}>
                  {totals.delivery === 0 ? 'FREE' : `₹${totals.delivery}`}
                </span>
              </div>
              {totals.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 700 }}>
                  <span>Discount</span><span>−₹{totals.discount}</span>
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
