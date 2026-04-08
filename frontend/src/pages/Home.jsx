import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsAPI, flashDealsAPI } from '../api'
import ProductCard from '../components/ProductCard'
import Skeleton from '../components/Skeleton'
import HeroBanner from '../components/HeroBanner'
import { useNotif } from '../context/NotifContext'
import { Truck, ShieldCheck, Zap, Star, Apple, Carrot, Milk, Cookie, Coffee, Croissant, Drumstick, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'

function Countdown() {
  const [rem, setRem] = useState(4 * 3600 + 23 * 60 + 47)
  useEffect(() => { const t = setInterval(() => setRem(r => Math.max(0, r - 1)), 1000); return () => clearInterval(t) }, [])
  const h = String(Math.floor(rem / 3600)).padStart(2, '0')
  const m = String(Math.floor((rem % 3600) / 60)).padStart(2, '0')
  const s = String(rem % 60).padStart(2, '0')
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {[[h,'HRS'],[m,'MIN'],[s,'SEC']].map(([n, l], i) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            background: 'var(--surface)', color: 'var(--primary)', width: 50, height: 50, 
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 800, fontSize: '1.25rem', boxShadow: 'var(--sh)', border: '1px solid var(--border)'
          }}>
            {n}
          </div>
          {i < 2 && <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, fontSize: '1.5rem' }}>:</span>}
        </div>
      ))}
    </div>
  )
}

export default function Home({ onAuthOpen }) {
  const [bestSellers, setBestSellers] = useState([])
  const [flashProducts, setFlashProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      productsAPI.getAll().then(({ data }) => setBestSellers(data.slice(0, 5))),
      flashDealsAPI.getAll().then(({ data }) => setFlashProducts(data || [])).catch(() => setFlashProducts([]))
    ]).finally(() => setLoading(false))
  }, [])

  const cats = [
    { cat: 'Fruits', icon: <Apple size={32} />, color: 'var(--primary-50)', count: '120+ Items' },
    { cat: 'Vegetables', icon: <Carrot size={32} />, color: 'var(--primary-50)', count: '200+ Items' },
    { cat: 'Dairy', icon: <Milk size={32} />, color: 'var(--primary-50)', count: '60+ Items' },
    { cat: 'Snacks', icon: <Cookie size={32} />, color: 'var(--primary-50)', count: '300+ Items' },
    { cat: 'Beverages', icon: <Coffee size={32} />, color: 'var(--primary-50)', count: '150+ Items' },
    { cat: 'Bakery', icon: <Croissant size={32} />, color: 'var(--primary-50)', count: '80+ Items' },
    { cat: 'Meat', icon: <Drumstick size={32} />, color: 'var(--primary-50)', count: '90+ Items' },
    { cat: 'Organic', icon: <Leaf size={32} />, color: 'var(--primary-50)', count: '250+ Items' }
  ]

  return (
    <main>
      <HeroBanner onShop={() => navigate('/products')} onSignup={onAuthOpen} />

      <div style={{ position: 'relative', marginTop: '-50px', zIndex: 20 }}>
        <div className="container">
          <div className="glass" style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '40px 0', 
            borderRadius: '24px', background: 'var(--surface)', border: '1px solid var(--border)' 
          }}>
            {[
              { icon: <Truck size={24} />, val: 'Express Delivery', lbl: 'Within 2 hours' },
              { icon: <ShieldCheck size={24} />, val: 'Pure Assurance', lbl: 'Organic certified' },
              { icon: <Zap size={24} />, val: 'Fast Checkout', lbl: 'One-click pay' },
              { icon: <Star size={24} />, val: 'Top Rated', lbl: '4.9/5 TrustScore' }
            ].map((t, i) => (
              <div key={i} style={{ 
                borderRight: i < 3 ? '1px solid var(--border)' : 'none', 
                padding: '0 40px', display: 'flex', alignItems: 'center', gap: '20px' 
              }}>
                <div style={{ background: 'var(--primary-100)', color: 'var(--primary)', padding: 14, borderRadius: 16 }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>{t.val}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-sub">Fresh, curated selections from farm to table</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/products')} style={{ borderRadius: '14px', padding: '12px 28px' }}>
              View All
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 24 }}>
            {cats.map((c, i) => (
              <motion.div 
                key={c.cat} 
                initial={{ y: 20, opacity: 0 }} 
                whileInView={{ y: 0, opacity: 1 }} 
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/products?cat=${c.cat}`)} 
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <div style={{ 
                  background: c.color, color: 'var(--primary)', width: 90, height: 90, 
                  borderRadius: '24px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', margin: '0 auto 16px', transition: '0.3s', 
                  border: '1px solid var(--primary-100)', boxShadow: 'var(--sh-sm)' 
                }}>
                  {c.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{c.cat}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>{c.count}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <h2 className="section-title">Trending Now</h2>
            <p className="section-sub">Most loved by our community this week</p>
          </div>
          <div className="products-grid">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} style={{ display: 'grid', gap: 16 }}>
                  <Skeleton height="280px" borderRadius="20px" />
                  <Skeleton height="20px" width="70%" />
                  <Skeleton height="15px" width="40%" />
                </div>
              ))
            ) : (
              bestSellers.map(p => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </section>

      {flashProducts.length > 0 && (
        <section className="section" style={{ background: 'var(--primary-900)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            position: 'absolute', inset: 0, 
            background: 'radial-gradient(circle at 70% 30%, var(--primary-800) 0%, transparent 70%)',
            opacity: 0.5
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <h2 className="section-title" style={{ color: '#fff', marginBottom: 0 }}>Flash Deals</h2>
                <div style={{ 
                  background: 'var(--accent)', color: 'var(--primary-900)', 
                  padding: '8px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 800 
                }}>
                  LIVE NOW ⚡
                </div>
              </div>
              <Countdown />
            </div>
            <div className="products-grid">
              {flashProducts.map((f, i) => {
                if (!f || !f.product) return null
                return <ProductCard key={f.id} product={f.product} />
              })}
            </div>
          </div>
        </section>
      )}

      {/* LUXURY BANNER */}
      <section className="section">
        <div className="container">
          <motion.div 
            whileInView={{ y: [40, 0], opacity: [0, 1] }} 
            viewport={{ once: true }}
            style={{ 
              background: 'var(--primary-900)', borderRadius: '40px', padding: '80px', 
              display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 60, 
              alignItems: 'center', color: '#fff', position: 'relative', overflow: 'hidden' 
            }}
          >
            <div style={{ 
              position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '100%', 
              background: 'var(--primary-500)', filter: 'blur(120px)', opacity: 0.2, borderRadius: '50%' 
            }} />
            <div style={{ zIndex: 1, position: 'relative' }}>
              <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24 }}>
                Exclusive Membership
              </div>
              <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 800, marginBottom: 24, lineHeight: 1.1 }}>
                Smarter Grocery <br/> Shopping is Here
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', marginBottom: 48, maxWidth: '500px', lineHeight: 1.7 }}>
                Join our premium community and get unlimited free deliveries, early access to farm picks, and exclusive rewards.
              </p>
              <div style={{ display: 'flex', gap: 20 }}>
                <button className="btn-primary" onClick={() => navigate('/premium')} style={{ background: 'var(--accent)', color: 'var(--primary-900)', padding: '18px 40px', borderRadius: '16px' }}>
                  Join Now
                </button>
                <button className="btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', padding: '18px 40px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)' }}>
                  Learn More
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, zIndex: 1 }}>
              {[
                { icon: <Leaf size={32} />, val: '5k+', lbl: 'Organic Items' },
                { icon: <Zap size={32} />, val: '10m', lbl: 'Avg Delivery' },
                { icon: <Star size={32} />, val: '4.9', lbl: 'App Rating' },
                { icon: <ShieldCheck size={32} />, val: '100%', lbl: 'Fresh Guarantee' }
              ].map((x, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -8, background: 'rgba(255,255,255,0.08)' }} 
                  style={{ 
                    background: 'rgba(255,255,255,0.04)', padding: '32px', borderRadius: '24px', 
                    textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{ color: 'var(--accent)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{x.icon}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{x.val}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>{x.lbl}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
