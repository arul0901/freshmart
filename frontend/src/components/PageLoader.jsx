import React from 'react'
import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

export default function PageLoader() {
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        gap: 24
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Glow behind logo */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 100, height: 100,
            background: 'var(--primary)',
            filter: 'blur(40px)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            width: 80, height: 80,
            background: 'var(--primary)',
            borderRadius: 'var(--r-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--sh-lg)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Leaf size={40} strokeWidth={2.5} />
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 800, 
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          Fresh<span style={{ color: 'var(--primary)' }}>Mart</span>
        </motion.div>
        
        <div style={{ 
          width: 140, 
          height: 4, 
          background: 'var(--canvas)', 
          borderRadius: 99, 
          overflow: 'hidden',
          border: '1px solid var(--border)'
        }}>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ 
              width: '60%', 
              height: '100%', 
              background: 'var(--primary)',
              borderRadius: 99,
              boxShadow: '0 0 10px var(--primary)'
            }}
          />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5 }}
        style={{ 
          fontSize: 'var(--text-xs)', 
          fontWeight: 700, 
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}
      >
        Delivering Farm-Fresh Goodness
      </motion.p>
    </div>
  )
}
