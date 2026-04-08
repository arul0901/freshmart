import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Wishlist() {
  const { wishlist, clearWishlist } = useCart()
  const navigate = useNavigate()

  return (
    <div className="container" style={{ minHeight: '80vh', padding: 'var(--sp-16) var(--sp-6)' }}>
      <div style={{ marginBottom: 'var(--sp-12)' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost"
          style={{ marginBottom: 'var(--sp-6)', border: 'none', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontWeight: 700 }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              My Wishlist
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-lg)', fontWeight: 500, marginTop: 8 }}>
              {wishlist.length} items saved for later
            </p>
          </div>
          {wishlist.length > 0 && (
             <button className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error-light)' }} onClick={() => {}}>
               Clear All
             </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {wishlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              textAlign: 'center', padding: '100px 40px', background: 'var(--bg-alt)', 
              borderRadius: 'var(--r-2xl)', border: '2px dashed var(--border)', 
              display: 'flex', flexDirection: 'column', alignItems: 'center' 
            }}
          >
            <div style={{ 
              width: 100, height: 100, background: 'var(--surface)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 32, fontSize: '3rem', boxShadow: 'var(--sh-md)'
            }}>
              ❤️
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 16, color: 'var(--ink)' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 40, maxWidth: '400px', fontSize: 'var(--text-md)', lineHeight: 1.6 }}>
              Save items you love to find them easily and get notified of price drops.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ padding: '16px 40px' }}>
              Explore Products
            </button>
          </motion.div>
        ) : (
          <div className="products-grid">
            {wishlist.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ position: 'relative' }}>
                  <ProductCard product={p} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
