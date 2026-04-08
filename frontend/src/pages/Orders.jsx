import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, productsAPI } from '../api'
import Skeleton from '../components/Skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Clock, CheckCircle, ChevronRight, FileText, ShoppingBag, MapPin, CreditCard, ArrowLeft, ExternalLink } from 'lucide-react'

export default function Orders({ onAuthOpen }) {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    // Remove immediate navigation to Home
    if (!user) return

    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          ordersAPI.getAll({ email: user.email }),
          productsAPI.getAll()
        ])
        setOrders(ordersRes.data || [])
        setProducts(productsRes.data || [])
        if (ordersRes.data?.length > 0) setSelectedOrder(ordersRes.data[0])
      } catch (err) {
        console.error("Failed to load orders", err)
      } finally {
        setTimeout(() => setLoading(false), 500)
      }
    }
    fetchData()
  }, [user, authLoading, navigate])

  const getProductDetails = (ids) => {
    return ids.map(id => products.find(p => p.id === id)).filter(Boolean)
  }

  const selectedDetails = selectedOrder ? getProductDetails(selectedOrder.products || []) : []

  if (authLoading) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <Skeleton height="60px" width="350px" style={{ marginBottom: '48px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '40px', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <Skeleton height="20px" width="120px" style={{ marginBottom: 10 }} />
            {[...Array(4)].map((_, i) => <Skeleton key={i} height="100px" borderRadius="16px" />)}
          </div>
          <div style={{ marginTop: '30px' }}>
             <Skeleton height="600px" borderRadius="24px" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: 450, padding: 60, borderRadius: 'var(--r-2xl)', background: 'var(--surface)', border: '1.5px solid var(--border)', boxShadow: 'var(--sh-lg)' }}
        >
          <div style={{ fontSize: '4.5rem', marginBottom: 32 }}>🔒</div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--ink)', marginBottom: 16, letterSpacing: '-0.04em' }}>Login to View Orders</h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 40, lineHeight: 1.6 }}>
            Please sign in to your FreshMart account to track your orders, manage deliveries and view transaction history.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={onAuthOpen} 
            style={{ width: '100%', padding: '16px 32px', fontSize: 'var(--text-md)', fontWeight: 900, borderRadius: 'var(--r-xl)' }}
          >
            Sign In to Account
          </button>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <Skeleton height="60px" width="350px" style={{ marginBottom: '48px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '40px', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <Skeleton height="20px" width="120px" style={{ marginBottom: 10 }} />
            {[...Array(4)].map((_, i) => <Skeleton key={i} height="100px" borderRadius="16px" />)}
          </div>
          <div style={{ marginTop: '30px' }}>
             <Skeleton height="600px" borderRadius="24px" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container" 
      style={{ minHeight: '85vh', padding: '80px 24px' }}
    >
      <div style={{ marginBottom: 'var(--sp-12)' }}>
        <motion.button 
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')} 
          className="btn btn-ghost"
          style={{ marginBottom: 'var(--sp-6)', border: 'none', background: 'transparent', padding: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft size={16} /> <span>Back to Shopping</span>
        </motion.button>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.04em', marginBottom: '8px', lineHeight: 1 }}>
          Order History
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
          Manage your premium farm-fresh deliveries.
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ 
          textAlign: 'center', padding: '120px 40px', background: 'var(--bg-alt)', 
          borderRadius: 'var(--r-2xl)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' 
        }}>
          <div style={{ fontSize: '6rem', marginBottom: '32px', filter: 'grayscale(1) opacity(0.3)' }}>🛒</div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, marginBottom: '16px', color: 'var(--ink)' }}>Your basket history is empty</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '40px', maxWidth: '400px', fontSize: 'var(--text-md)', fontWeight: 600, lineHeight: 1.6 }}>Experience the difference of handpicked organic produce delivered to your door in minutes.</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ padding: '16px 48px', fontSize: 'var(--text-md)', borderRadius: 'var(--r-xl)' }}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: 'var(--sp-10)', alignItems: 'start' }}>
          {/* List Section */}
          <div className="orders-list">
            <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={14} /> Recent Activity
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {orders.map((order, i) => (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedOrder(order)}
                  style={{ 
                    padding: 'var(--sp-5)', 
                    cursor: 'pointer',
                    borderRadius: 'var(--r-xl)',
                    border: '1.5px solid ' + (selectedOrder?.id === order.id ? 'var(--primary)' : 'var(--border)'),
                    background: selectedOrder?.id === order.id ? 'var(--primary-light)' : 'var(--surface)',
                    boxShadow: selectedOrder?.id === order.id ? 'var(--sh-md)' : 'none',
                    transition: 'all 0.2s'
                  }}
                  whileHover={{ borderColor: 'var(--primary)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 'var(--text-md)', color: 'var(--ink)', marginBottom: '4px' }}>Order #{order.id}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 800 }}>{order.date} • {order.items} Items</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: 'var(--ink)', fontSize: 'var(--text-md)', marginBottom: '6px' }}>₹{order.amount}</div>
                      <div className={`badge badge-${order.status === 'delivered' ? 'delivered' : 'transit'}`} style={{ fontSize: 10 }}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Detailed View */}
          <div className="order-details-view" style={{ minHeight: 600 }}>
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div 
                  key={selectedOrder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="premium-card"
                  style={{ 
                    padding: 'var(--sp-10)', 
                    borderRadius: 'var(--r-2xl)', 
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    boxShadow: 'var(--sh-lg)',
                    position: 'sticky',
                    top: '100px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--sp-8)', paddingBottom: 'var(--sp-8)', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div className={`badge badge-${selectedOrder.status === 'delivered' ? 'delivered' : 'transit'}`} style={{ marginBottom: 16, padding: '6px 14px' }}>
                        STATUS: {selectedOrder.status.toUpperCase()}
                      </div>
                      <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>Purchase #{selectedOrder.id}</h2>
                      <div style={{ color: 'var(--muted)', fontWeight: 700, marginTop: '8px', fontSize: 'var(--text-sm)' }}>Order date: {selectedOrder.date} at 04:30 PM</div>
                    </div>
                    <button className="btn btn-outline" style={{ borderRadius: 'var(--r-lg)', padding: '12px 24px', fontWeight: 800 }}>
                      <FileText size={18} /> Invoice
                    </button>
                  </div>

                  {/* Status Timeline */}
                  <div style={{ background: 'var(--bg-alt)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-10)', marginBottom: 'var(--sp-10)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-6)', position: 'relative', border: '1px solid var(--border)' }}>
                    <div style={{ position: 'absolute', top: '75px', left: '15%', right: '15%', height: '2px', background: 'var(--border)', zIndex: 0 }} />
                    {[
                      { icon: <Clock size={20} />, label: 'Confirmed', time: '04:30 PM', done: true },
                      { icon: <Package size={20} />, label: 'Shipped', time: '05:10 PM', done: true },
                      { icon: <CheckCircle size={20} />, label: 'Arrived', time: '06:15 PM', done: selectedOrder.status === 'delivered' }
                    ].map((step, i) => (
                      <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1, opacity: step.done ? 1 : 0.35 }}>
                        <div style={{ 
                          width: '52px', height: '52px', borderRadius: 'var(--r-lg)', margin: '0 auto 16px',
                          background: step.done ? 'var(--primary)' : 'var(--surface)',
                          color: step.done ? '#fff' : 'var(--muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: step.done ? '0 8px 16px rgba(var(--primary-rgb), 0.3)' : 'none',
                          border: step.done ? 'none' : '1.5px solid var(--border)'
                        }}>
                          {step.icon}
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>{step.label}</div>
                        {step.done && <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', marginTop: '4px' }}>{step.time}</div>}
                      </div>
                    ))}
                  </div>

                  <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ink)' }}>
                    <ShoppingBag size={20} color="var(--primary)" /> Package Contents
                  </h4>
                  <div style={{ display: 'grid', gap: '16px', marginBottom: 'var(--sp-10)' }}>
                    {selectedDetails.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '12px', borderRadius: 'var(--r-xl)', border: '1.5px solid var(--border)', background: 'var(--canvas)' }}>
                        <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: 'var(--r-lg)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                          <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={item.name} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 900, fontSize: 'var(--text-base)', color: 'var(--ink)' }}>{item.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 700 }}>{item.weight || '1 Unit'} • {item.cat}</div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 'var(--text-md)', color: 'var(--ink)' }}>₹{item.price}</div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Summary */}
                  <div style={{ background: 'var(--bg-alt)', padding: 'var(--sp-10)', borderRadius: 'var(--r-2xl)', color: 'var(--ink)', border: '1.5px solid var(--border)' }}>
                    <div style={{ display: 'grid', gap: 14, borderBottom: '1.5px dashed var(--border)', paddingBottom: '24px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--muted)' }}>
                        <span>Subtotal</span><span>₹{selectedOrder.amount - 40}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--muted)' }}>
                        <span>Delivery & Handling</span><span>₹40</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Total Paid</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1 }}>₹{selectedOrder.amount}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 900, fontSize: 'var(--text-xs)' }}>
                          <CreditCard size={18} /> UPI ENCRYPTED
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '10px', fontWeight: 700, marginTop: '10px' }}>ID: FRM_{selectedOrder.id}X77</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-alt)', borderRadius: 'var(--r-2xl)', border: '2px dashed var(--border)' }}>
                   <div style={{ fontSize: '4rem', opacity: 0.15, marginBottom: '24px' }}>📦</div>
                   <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--ink)', opacity: 0.4 }}>Select an order to view details</h3>
                   <p style={{ color: 'var(--muted)', fontWeight: 700, marginTop: '12px' }}>Track live status, invoices and delivery proofs.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  )
}
