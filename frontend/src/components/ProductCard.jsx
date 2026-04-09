import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useNotif } from '../context/NotifContext'
import { useAuth } from '../context/AuthContext'
import { Plus, Minus, Heart, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const HeartBurst = ({ x, y }) => {
  const particles = [...Array(6)]
  return (
    <>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: 0, 
            scale: 0.5,
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() - 0.5) * 60 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--error)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      ))}
    </>
  )
}

export default function ProductCard({ product }) {
  const { addToCart, updateQty, isInCart, toggleWishlist, isInWishlist } = useCart()
  const { showNotif } = useNotif()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [showBurst, setShowBurst] = useState(false)
  const cartItem = isInCart(product.id)
  const inWish = isInWishlist(product.id)
  const qty = cartItem ? cartItem.qty : 0

  const handleAdd = (e) => {
    e.stopPropagation()
    addToCart(product)
    showNotif(`Added ${product.name} to cart`, 'success')
  }

  const handleQty = (e, delta) => {
    e.stopPropagation()
    updateQty(product.id, delta)
  }

  const handleWish = (e) => {
    e.stopPropagation()
    if (!user) {
      showNotif('Please login to wishlist items', 'info')
      // You could also trigger the auth modal here if you pass a prop
      return
    }
    
    if (!inWish) {
      setShowBurst(true)
      setTimeout(() => setShowBurst(false), 600)
    }
    
    toggleWishlist(product)
    showNotif(inWish ? `Removed ${product.name} from wishlist` : `Added ${product.name} to wishlist`, inWish ? 'red' : 'success')
  }

  const offPct = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="product-card" 
      onClick={() => navigate(`/products/${product.id}`)}
      style={{ position: 'relative' }}
    >
      <div className="product-img-wrap">
        <AnimatePresence>
          {showBurst && <HeartBurst x="85%" y="15%" />}
        </AnimatePresence>

        {offPct > 0 && (
          <span className="discount-badge">
            {offPct}% OFF
          </span>
        )}
        
        <motion.button 
          whileTap={{ scale: 1.3 }}
          onClick={handleWish}
          className="wishlist-btn"
          style={{ 
            color: (inWish && user) ? 'var(--error)' : 'var(--muted)',
          }}
        >
          <Heart 
            size={18} 
            fill={(inWish && user) ? 'var(--error)' : 'none'} 
            strokeWidth={2.5} 
          />
        </motion.button>

        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy"
          className="product-img"
          style={{ width: '85%', height: '85%', objectFit: 'contain', transition: 'transform 0.4s var(--ease)' }} 
        />
      </div>
      
      <div className="product-info" style={{ padding: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ 
            fontSize: '10px', 
            fontWeight: 800, 
            color: 'var(--primary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            background: 'var(--primary-light)',
            padding: '2px 8px',
            borderRadius: 'var(--r-xs)'
          }}>
            {product.brand || 'Farm Fresh'}
          </span>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4, 
            fontSize: 'var(--text-xs)', 
            fontWeight: 700,
            color: 'var(--ink)'
          }}>
            <Star size={12} fill="var(--accent)" color="var(--accent)" />
            <span>{product.rating || '4.8'}</span>
          </div>
        </div>
        
        <h3 className="product-name">
          {product.name}
        </h3>
        
        <p style={{ 
          fontSize: 'var(--text-xs)', 
          color: 'var(--muted)', 
          marginBottom: 16, 
          fontWeight: 500,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.8em'
        }}>
          {product.shortDesc || `Fresh and high-quality ${product.name.toLowerCase()} sourced directly from local farms.`}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="product-price">
              ₹{product.price}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>
              {product.weight}
            </div>
          </div>
          
          {qty > 0 ? (
            <div 
              style={{ 
                background: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                borderRadius: 'var(--r-md)', 
                padding: '3px',
                boxShadow: '0 2px 8px rgba(var(--primary-rgb), 0.15)'
              }} 
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={e => handleQty(e, -1)} 
                style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span style={{ width: 28, textAlign: 'center', fontWeight: 900, fontSize: 'var(--text-base)', color: '#fff' }}>
                {qty}
              </span>
              <button 
                onClick={e => handleQty(e, 1)} 
                style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <motion.button 
              whileTap={{ scale: 0.96 }}
              className="btn btn-primary" 
              onClick={handleAdd} 
              style={{ 
                padding: '9px 24px', 
                fontSize: 'var(--text-sm)', 
                borderRadius: 'var(--r-md)',
                letterSpacing: '0.02em'
              }}
            >
              ADD
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
