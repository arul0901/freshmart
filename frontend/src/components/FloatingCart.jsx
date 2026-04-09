import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function FloatingCart({ onOpen }) {
  const { totals } = useCart()
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show if scrolled down > 300px OR if on mobile
      const scrolled = window.scrollY > 300
      const isMobile = window.innerWidth < 768
      setIsVisible((scrolled || isMobile) && totals.itemCount > 0 && !!user)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [totals.itemCount, user])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpen}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000,
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(var(--primary-rgb), 0.4)',
            cursor: 'pointer',
            padding: 0
          }}
        >
          {/* Glass Overlay for depth */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            pointerEvents: 'none'
          }} />
          
          <ShoppingCart size={28} strokeWidth={2.5} />
          
          {/* Count Badge */}
          <motion.span
            key={totals.itemCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#fff',
              color: 'var(--primary)',
              borderRadius: '50%',
              fontSize: '12px',
              fontWeight: 900,
              minWidth: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              border: '2px solid var(--primary)'
            }}
          >
            {totals.itemCount}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
