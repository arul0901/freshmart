import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'
import { ordersAPI } from '../api'
import Skeleton from '../components/Skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronRight, X, Clock } from 'lucide-react'

const OrderTimeline = ({ status }) => {
  const stages = [
    { label: 'Pending', icon: '🕒', color: '#ecc59a' },
    { label: 'Processing', icon: '⚙️', color: 'var(--primary)' },
    { label: 'Delivered', icon: '✅', color: 'var(--success)' }
  ];

  const currentIdx = stages.findIndex(s => s.label.toLowerCase() === status.toLowerCase());
  const isCancelled = status.toLowerCase() === 'cancelled';

  if (isCancelled) return (
    <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '16px', borderRadius: 'var(--r-squircle)', textAlign: 'center', fontWeight: 700 }}>
       ORDER CANCELLED ❌
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '32px 0 48px' }}>
      <div style={{ position: 'absolute', top: '24px', left: 40, right: 40, height: 4, background: 'var(--border)', zIndex: 0 }} />
      <div 
        style={{ 
          position: 'absolute', top: '24px', left: 40, height: 4, background: 'var(--primary)', 
          width: `${(currentIdx / (stages.length - 1)) * 100}%`, 
          zIndex: 1, transition: 'width 1s ease-in-out' 
        }} 
      />
      
      {stages.map((s, i) => {
        const active = i <= currentIdx;
        return (
          <div key={s.label} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <motion.div 
              animate={active ? { scale: [1, 1.2, 1], rotate: active ? [0, 5, -5, 0] : 0 } : {}}
              transition={{ repeat: active ? Infinity : 0, duration: 2 }}
              style={{ 
                width: 54, height: 54, borderRadius: '50%', background: active ? s.color : 'var(--bg-alt)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', 
                boxShadow: active ? '0 0 15px ' + s.color + '44' : 'none', border: '3px solid var(--paper)' 
              }}
            >
              {s.icon}
            </motion.div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: active ? 'var(--ink)' : 'var(--muted)', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { showNotif } = useNotif()

  const fetchOrders = async () => {
    if (!user) return
    try {
      const { data } = await ordersAPI.getAll({ email: user.email })
      setOrders(data || [])
      if (data?.length > 0 && !selectedOrder) setSelectedOrder(data[0])
    } catch (err) {
      console.error("Orders Load Error:", err)
      showNotif('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
    if (user) fetchOrders()
  }, [user, authLoading])

  const handleCancel = async (order) => {
    const createdDate = new Date(order.date);
    const diffDays = Math.ceil((new Date() - createdDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      showNotif('Cancellation window expired (7 days max).', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await ordersAPI.update(order.id, { status: 'cancelled' });
      showNotif('Order cancelled successfully', 'success');
      fetchOrders();
      setSelectedOrder(prev => ({ ...prev, status: 'cancelled' }));
    } catch { showNotif('Failed to cancel order', 'error'); }
  }

  if (authLoading || loading) return <div className="container" style={{ padding: '100px 24px' }}><Skeleton height="500px" borderRadius="var(--r-squircle)" /></div>

  return (
    <div className="container" style={{ padding: '60px 24px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
        <div>
          <h1 className="section-title">Order History</h1>
          <p className="section-sub">Track and manage your fresh deliveries</p>
        </div>
        <div style={{ background: 'var(--canvas)', padding: '12px 24px', borderRadius: 'var(--r-squircle)', border: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{orders.length}</span> <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Total Orders</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 420px' : '1fr', gap: 32, transition: 'all 0.5s var(--ease)' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {orders.map(o => (
            <motion.div 
              key={o.id}
              layoutId={o.id}
              onClick={() => setSelectedOrder(o)}
              style={{ 
                background: selectedOrder?.id === o.id ? 'var(--primary-light)' : 'var(--surface)',
                padding: '24px', borderRadius: 'var(--r-squircle)', border: '1.5px solid',
                borderColor: selectedOrder?.id === o.id ? 'var(--primary)' : 'var(--border)',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ width: 50, height: 50, background: 'var(--paper)', borderRadius: 'var(--r-squircle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 800 }}>#{o.id}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--ink)', margin: '2px 0' }}>₹{o.total_amount}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(o.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`status-pill ${o.status}`} style={{ textTransform: 'uppercase' }}>{o.status}</span>
                <ChevronRight size={18} color="var(--muted)" />
              </div>
            </motion.div>
          ))}
          {orders.length === 0 && <div style={{ textAlign: 'center', padding: 100, color: 'var(--muted)', background: 'var(--bg-alt)', borderRadius: 'var(--r-squircle)' }}>No orders found.</div>}
        </div>

        <AnimatePresence>
          {selectedOrder && (
            <motion.div 
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              style={{ background: 'var(--surface)', padding: '32px', borderRadius: 'var(--r-squircle)', border: '1px solid var(--border)', position: 'sticky', top: 120, height: 'fit-content', boxShadow: 'var(--sh-xl)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>Detailed Tracking</h3>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={20}/></button>
              </div>

              <OrderTimeline status={selectedOrder.status} />

              <div style={{ display: 'grid', gap: 16, marginBottom: 32, maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {selectedOrder.order_items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 50, height: 50, background: 'var(--canvas)', borderRadius: 'var(--r-squircle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      {item.products?.emoji || '📦'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.products?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.quantity} x ₹{item.price_at_purchase}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '24px', background: 'var(--canvas)', borderRadius: 'var(--r-squircle)', display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--muted)' }}>Delivery Charge</span>
                  <span>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900 }}>
                  <span>Total Paid</span>
                  <span style={{ color: 'var(--primary)' }}>₹{selectedOrder.total_amount}</span>
                </div>
              </div>

              {selectedOrder.status.toLowerCase() !== 'cancelled' && (
                  <button 
                    onClick={() => handleCancel(selectedOrder)}
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: 24, padding: '16px', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--r-squircle)', border: '1px solid var(--error)', fontWeight: 800 }}
                  >
                    Cancel Order
                  </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
