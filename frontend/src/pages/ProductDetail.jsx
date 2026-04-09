import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsAPI } from '../api'
import { useCart } from '../context/CartContext'
import { useNotif } from '../context/NotifContext'
import ProductCard from '../components/ProductCard'
import Skeleton from '../components/Skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Truck, ShieldCheck, Zap, Heart, ShoppingCart, Minus, Plus, ChevronRight, Share2, Info } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeVariant, setActiveVariant] = useState(0)
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const { showNotif } = useNotif()
  const navigate = useNavigate()
  
  const inWish = product ? isInWishlist(product.id) : false

  useEffect(() => {
    setLoading(true)
    productsAPI.getOne(id).then(({ data }) => {
      setProduct(data)
      setQty(1)
      window.scrollTo(0, 0)
    }).catch(() => navigate('/products'))
    .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!product) return
    productsAPI.getAll({ cat: product.cat }).then(({ data }) => {
      setRelated(data.filter(p => p.id !== product.id).slice(0, 4))
    })
  }, [product])

  const handleAdd = () => {
    addToCart(product, qty)
    showNotif(`🛒 ${product.name} added to cart!`, 'success')
  }

  if (loading || !product) return (
    <div className="container" style={{ padding: 'var(--sp-10) 0' }}>
      <div className="detail-layout">
        <Skeleton height="500px" borderRadius="32px" />
        <div>
          <Skeleton height="40px" width="60%" borderRadius="10px" style={{ marginBottom: '20px' }} />
          <Skeleton height="30px" width="40%" borderRadius="10px" style={{ marginBottom: '40px' }} />
          <Skeleton height="200px" borderRadius="20px" style={{ marginBottom: '30px' }} />
          <Skeleton height="60px" width="80%" borderRadius="16px" />
        </div>
      </div>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container" 
      style={{ padding: '40px 16px' }}
    >
      <div className="breadcrumb" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>Home</button>
        <ChevronRight size={14} />
        <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>Products</button>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div className="detail-layout">
        {/* Left: Gallery Showcase */}
        <div className="detail-gallery">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="main-img-wrap" 
          >
            <div style={{ position: 'absolute', top: '20%', left: '20%', width: '60%', height: '60%', background: 'var(--primary-100)', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }} />
            <img src={product.image} alt={product.name} style={{ maxWidth: '80%', maxHeight: '400px', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
            <button 
              onClick={() => toggleWishlist(product)}
              style={{ 
                position: 'absolute', top: '30px', right: '30px', width: '50px', height: '50px', 
                borderRadius: '50%', background: '#fff', border: 'none', boxShadow: 'var(--sh)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
              }}
            >
              <Heart size={24} fill={inWish ? 'var(--error)' : 'none'} color={inWish ? 'var(--error)' : 'var(--ink)'} />
            </button>
          </motion.div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
            {[product.image, product.image, product.image, product.image].map((img, i) => (
              <div key={i} style={{ padding: '10px', background: '#fff', borderRadius: '16px', border: i === 0 ? '2px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer' }}>
                <img src={img} style={{ width: '100%', height: '60px', objectFit: 'contain', opacity: i === 0 ? 1 : 0.5 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="detail-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ padding: '4px 12px', background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{product.cat}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700 }}>
              <Star size={16} fill="#f59e0b" /> {product.rating} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(4.8k Reviews)</span>
            </div>
          </div>

          <h1 className="detail-title">{product.name}</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '32px', lineHeight: 1.6 }}>The finest {product.name.toLowerCase()} selected from organic farms. Guaranteed {product.weight} of pure freshness delivered to your door.</p>

          <div style={{ background: 'var(--canvas)', borderRadius: '24px', padding: '32px', marginBottom: '40px', border: '1.5px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary)' }}>₹{product.price}</span>
              <span style={{ fontSize: '1.4rem', color: 'var(--lighter)', textDecoration: 'line-through' }}>₹{product.price + 40}</span>
              <span style={{ background: 'var(--success)', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800 }}>-20% OFF</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>Inclusive of all taxes • <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Free delivery</span></div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', padding: '6px', border: '1.5px solid var(--border)', boxShadow: 'var(--sh-sm)', minWidth: '130px', justifyContent: 'center' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Minus size={20} /></button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Plus size={20} /></button>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="btn btn-primary"
              style={{ 
                flex: 1, minWidth: '240px', height: '60px', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: 'var(--text-md)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                boxShadow: 'var(--sh-md)', cursor: 'pointer'
              }}
            >
              <ShoppingCart size={22} /> Add to Cart — ₹{product.price * qty}
            </motion.button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { icon: <Truck />, title: 'Fresh Delivery', sub: 'Within 2 hours' },
              { icon: <ShieldCheck />, title: 'Quality Assured', sub: '100% Organic' }
            ].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--pure)', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--primary)' }}>{x.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{x.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{x.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section style={{ marginTop: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>More to Explore</h2>
          <button onClick={() => navigate('/products')} style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>View All <ChevronRight size={18} /></button>
        </div>
        <div className="products-grid">
          {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

    </motion.div>
  )
}
