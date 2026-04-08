import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useNotif } from '../context/NotifContext'
import { useAuth } from '../context/AuthContext'
import { ordersAPI } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import { ChevronRight, CreditCard, ShieldCheck, ArrowLeft, Smartphone, Wallet, Building, Clock } from 'lucide-react'

// Success Lottie - High quality celebration
const successAnim = "https://lottie.host/8e2b8655-0810-4c4d-9654-7628867a5b3a/yZpZ3F9T3W.json"

export default function Checkout() {
  const { cart, totals, clearCart } = useCart()
  const { showNotif } = useNotif()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [payMethod, setPayMethod] = useState('upi')
  const [activeSlot, setActiveSlot] = useState(0)
  const [orderDone, setOrderDone] = useState(false)
  const [form, setForm] = useState({ firstName:'', lastName:'', address:'', city:'Chennai', pincode:'', state:'Tamil Nadu', phone:'' })

  const placeOrder = async () => {
    if (cart.length === 0) { showNotif('🛒 Your cart is empty!', 'error'); return }
    try {
      await ordersAPI.create({ 
        customer: `${form.firstName} ${form.lastName}`, 
        email: user?.email || '', 
        items: cart.length, 
        amount: totals.total, 
        slot: ['7-9AM','10-12PM','2-4PM','4-6PM','6-8PM'][activeSlot], 
        products: cart.map(i => i.id) 
      })
      clearCart()
      setOrderDone(true)
      showNotif('🎉 Order placed successfully!', 'success')
      // Auto-navigate after some time
      setTimeout(() => { navigate('/orders') }, 8000)
    } catch { showNotif('❌ Failed to place order. Please try again.', 'error') }
  }

  const slots = ['7–9 AM','10 AM–12','2–4 PM','4–6 PM','6–8 PM']

  if (orderDone) return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="container" 
      style={{ textAlign: 'center', padding: '100px 0', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ width: 350, height: 350 }}>
        <Lottie animationData={null} path={successAnim} loop={false} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '24px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>Order Confirmed!</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--muted)', marginBottom: '48px', maxWidth: 600, lineHeight: 1.6 }}>
        Your premium farm-fresh groceries are being handpicked. <br/> Access your real-time tracking in the orders panel.
      </p>
      <button className="btn-primary" onClick={() => navigate('/orders')} style={{ padding: '20px 48px', borderRadius: '18px', fontWeight: 800, fontSize: '1.1rem' }}>Track Order Status</button>
    </motion.div>
  )

  return (
    <div className="container" style={{ paddingTop: 80, paddingBottom: 120 }}>
      <div className="checkout-header" style={{ marginBottom: 64 }}>
        <motion.button 
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', border: 'none', background: 'none', fontWeight: 700, marginBottom: 24, cursor: 'pointer' }}
        >
          <ArrowLeft size={18} /> Back to Shopping
        </motion.button>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Secure Checkout</h1>
      </div>

      <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '80px' }}>
        <div className="checkout-main">
          {/* Step Indicators */}
          <div style={{ display: 'flex', gap: 48, marginBottom: 48 }}>
            {[{id:1, label:'Delivery Details'}, {id:2, label:'Payment Option'}].map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: step >= s.id ? 1 : 0.4 }}>
                <div style={{ 
                  width: 36, height: 36, borderRadius: '12px', background: step >= s.id ? 'var(--primary)' : 'var(--muted)', 
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' 
                }}>{s.id}</div>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: step >= s.id ? 'var(--ink)' : 'var(--muted)' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass"
                style={{ padding: '48px', borderRadius: '40px', border: '1px solid var(--border)' }}
              >
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '36px', display: 'flex', alignItems: 'center', gap: 14, color: 'var(--ink)' }}>
                  <Building size={24} color="var(--primary)" /> Shipping Address
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8, display: 'block' }}>First Name</label>
                    <input className="search-input" style={{ borderRadius: '16px', padding: '16px' }} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="e.g. Arul" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8, display: 'block' }}>Last Name</label>
                    <input className="search-input" style={{ borderRadius: '16px', padding: '16px' }} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="e.g. Kumar" />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '40px' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8, display: 'block' }}>Complete Address</label>
                  <textarea 
                    className="search-input" 
                    style={{ borderRadius: '20px', padding: '16px', minHeight: '120px', resize: 'none' }} 
                    value={form.address} 
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                    placeholder="Specific house details, building name, street..." 
                  />
                </div>

                <div style={{ marginTop: '48px' }}>
                  <label className="form-label" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>
                    <Clock size={20} color="var(--primary)" /> Preferred Delivery Slot
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                    {slots.map((s, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -4 }}
                        onClick={() => setActiveSlot(i)}
                        style={{ 
                          padding: '24px 12px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer',
                          border: '2px solid ' + (activeSlot === i ? 'var(--primary)' : 'var(--border)'),
                          background: activeSlot === i ? 'var(--primary-light)' : 'var(--bg)',
                          transition: '0.3s'
                        }}
                      >
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: activeSlot === i ? 'var(--primary)' : 'var(--ink)' }}>{s}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px', fontWeight: 700, textTransform: 'uppercase' }}>Express</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '48px', height: '68px', borderRadius: '20px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }} 
                  onClick={() => setStep(2)}
                >
                  Continue to Payment <ChevronRight size={24} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass"
                style={{ padding: '48px', borderRadius: '40px', border: '1px solid var(--border)' }}
              >
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '36px', display: 'flex', alignItems: 'center', gap: 14, color: 'var(--ink)' }}>
                  <CreditCard size={24} color="var(--primary)" /> Choose Payment Method
                </h3>

                <div style={{ display: 'grid', gap: '20px', marginBottom: '48px' }}>
                  {[
                    { id: 'upi', label: 'UPI Instant Pay', icon: <Smartphone size={24} />, desc: 'GPay, PhonePe, Paytm' },
                    { id: 'card', label: 'Cards', icon: <CreditCard size={24} />, desc: 'Credit / Debit Cards' },
                    { id: 'cod', label: 'Cash / Pay on Delivery', icon: <Wallet size={24} />, desc: 'Pay at your doorstep' }
                  ].map(opt => (
                    <motion.div 
                      key={opt.id} 
                      whileHover={{ x: 8 }}
                      onClick={() => setPayMethod(opt.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '24px', padding: '28px', borderRadius: '24px', 
                        cursor: 'pointer', border: '2px solid ' + (payMethod === opt.id ? 'var(--primary)' : 'var(--border)'),
                        background: payMethod === opt.id ? 'var(--bg-alt)' : 'var(--bg)',
                        transition: '0.3s'
                      }}
                    >
                      <div style={{ 
                        width: 52, height: 52, background: 'var(--surface-2)', borderRadius: '16px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: payMethod === opt.id ? 'var(--primary)' : 'var(--muted)',
                        boxShadow: 'var(--sh-sm)'
                      }}>
                        {opt.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: payMethod === opt.id ? 'var(--primary)' : 'var(--ink)' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>{opt.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <button className="btn-outline" style={{ flex: 1, height: '64px', borderRadius: '18px', fontWeight: 700 }} onClick={() => setStep(1)}>Go Back</button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary" 
                    style={{ flex: 2, height: '64px', borderRadius: '18px', fontSize: '1.1rem', fontWeight: 800 }} 
                    onClick={placeOrder}
                  >
                    Confirm & Pay • ₹{totals.total}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Bill Showcase */}
        <aside className="checkout-sidebar">
          <div className="glass" style={{ padding: '36px', borderRadius: '36px', position: 'sticky', top: '100px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '32px', color: 'var(--ink)' }}>Order Summary</h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '12px', marginBottom: '32px', display: 'grid', gap: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', background: 'var(--bg)', borderRadius: '18px', padding: '12px', position: 'relative', border: '1px solid var(--border)' }}>
                    <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={item.name} />
                    <span style={{ position: 'absolute', top: '-10px', right: '-10px', width: '28px', height: '28px', background: 'var(--primary)', color: '#fff', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>{item.qty}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{item.weight}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>₹{item.price * item.qty}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '32px', display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600, color: 'var(--muted)' }}>
                <span>Basket Subtotal</span><span>₹{totals.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600, color: 'var(--muted)' }}>
                <span>Delivery Charges</span>
                {totals.delivery === 0 ? <span style={{ color: 'var(--primary)', fontWeight: 800 }}>FREE</span> : <span>₹{totals.delivery}</span>}
              </div>
              {totals.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600, color: 'var(--success)' }}>
                  <span>Coupon Discount</span><span>-₹{totals.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)', marginTop: '16px' }}>
                <span>Total</span><span>₹{totals.total}</span>
              </div>
            </div>

            <div style={{ 
              marginTop: '40px', padding: '24px', background: 'var(--bg-alt)', borderRadius: '28px', 
              display: 'flex', gap: '16px', border: '1px solid var(--border)' 
            }}>
              <ShieldCheck color="var(--primary)" size={32} />
              <div style={{ fontSize: '0.85rem', color: 'var(--ink)', lineHeight: 1.6 }}>
                <strong style={{ display: 'block', marginBottom: '4px', fontWeight: 800 }}>Satisfaction Guaranteed</strong>
                If any item doesn't meet our premium standards, we'll refund it instantly.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .checkout-layout { grid-template-columns: 1fr !important; gap: 48px !important; }
          .checkout-sidebar { order: -1; }
          .checkout-sidebar .glass { position: relative !important; top: 0 !important; }
          h1 { font-size: 2.5rem !important; }
        }
      `}</style>
    </div>
  )
}
