import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const HeroBanner = ({ onShop, onSignup }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  // Smooth Parallax Transforms
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0])

  return (
    <div 
      ref={ref} 
      className="hero-banner"
    >
      {/* Background Shader Layer */}
      <motion.div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          y: yBg,
          background: 'radial-gradient(circle at 70% 30%, var(--primary-700) 0%, transparent 60%), radial-gradient(circle at 20% 70%, var(--primary-800) 0%, transparent 50%)',
          zIndex: 1
        }} 
      />

      {/* GPU Optimized Mesh Grids */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'linear-gradient(var(--primary-100) 1px, transparent 1px), linear-gradient(90deg, var(--primary-100) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          opacity: 0.05,
          zIndex: 2,
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)'
        }} 
      />

      {/* Content Layer with Parallax */}
      <motion.div 
        className="hero-content"
        style={{ 
          y: yText, 
          opacity, 
          position: 'relative',
          zIndex: 10
        }}
      >
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span style={{ 
            display: 'inline-block', 
            background: 'var(--primary-light)', 
            padding: '8px 16px', 
            borderRadius: 'var(--r-full)', 
            fontSize: 'var(--text-xs)', 
            color: 'var(--primary)', 
            fontWeight: 800, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase', 
            marginBottom: '32px',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)'
          }}>
            Premium Grocery Selection
          </span>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
            fontWeight: 900, 
            color: '#fff', /* Force white */
            lineHeight: 1.02, 
            marginBottom: '24px', 
            letterSpacing: '-0.04em' 
          }}>
            Freshness delivered <br/> to your <span style={{ color: 'var(--accent)' }}>Doorstep</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
            color: 'rgba(255,255,255,0.7)', /* Force light muted */
            marginBottom: '48px', 
            maxWidth: '650px', 
            margin: '0 auto 48px',
            fontWeight: 500
          }}>
            Hand-picked organic produce, farm-to-table freshness, and 10-minute delivery. Why shop anywhere else?
          </p>
          <div className="hero-actions">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShop}
              className="btn btn-primary"
              style={{ 
                padding: '20px 48px', fontSize: 'var(--text-md)', 
                borderRadius: 'var(--r-md)', border: 'none', 
                fontWeight: 900, cursor: 'pointer', boxShadow: 'var(--sh-lg)',
                background: 'var(--accent)', color: 'var(--primary-900)' /* Premium contrast */
              }}
            >
              Shop Now
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignup}
              className="btn btn-outline"
              style={{ 
                padding: '18px 46px', fontSize: 'var(--text-md)', background: 'transparent', 
                color: '#fff', borderRadius: 'var(--r-md)', borderColor: 'rgba(255,255,255,0.3)',
                fontWeight: 800, cursor: 'pointer', backdropFilter: 'blur(10px)' 
              }}
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative Blur Spheres */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          x: [0, 50, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{ 
          position: 'absolute', top: '15%', right: '10%', width: '350px', height: '350px', 
          background: 'var(--primary-500)', filter: 'blur(120px)', opacity: 0.15, zIndex: 1 
        }} 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, -40, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
        style={{ 
          position: 'absolute', bottom: '10%', left: '5%', width: '400px', height: '400px', 
          background: 'var(--primary-600)', filter: 'blur(140px)', opacity: 0.1, zIndex: 1 
        }} 
      />
    </div>
  )
}

export default HeroBanner
