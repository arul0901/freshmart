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
      style={{ 
        position: 'relative', 
        height: '85vh', 
        minHeight: '600px', 
        background: 'var(--primary-900)', 
        overflow: 'hidden', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
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
        style={{ 
          zIndex: 10, 
          y: yText, 
          opacity, 
          maxWidth: '900px', 
          padding: '0 40px' 
        }}
      >
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span style={{ 
            display: 'inline-block', 
            background: 'rgba(255,255,255,0.1)', 
            padding: '8px 16px', 
            borderRadius: '99px', 
            fontSize: '0.8rem', 
            color: 'var(--primary-100)', 
            fontWeight: 700, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase', 
            marginBottom: '32px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            Premium Grocery Selection
          </span>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
            fontWeight: 800, 
            color: '#fff', 
            lineHeight: 1.05, 
            marginBottom: '24px', 
            letterSpacing: '-0.03em' 
          }}>
            Freshness delivered <br/> to your <span style={{ color: 'var(--accent)' }}>Doorstep</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
            color: 'rgba(255,255,255,0.7)', 
            marginBottom: '48px', 
            maxWidth: '650px', 
            margin: '0 auto 48px' 
          }}>
            Hand-picked organic produce, farm-to-table freshness, and 10-minute delivery. Why shop anywhere else?
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShop}
              style={{ 
                padding: '18px 40px', fontSize: '1.1rem', background: '#fff', 
                color: 'var(--primary-900)', borderRadius: '16px', border: 'none', 
                fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' 
              }}
            >
              Shop Now
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignup}
              style={{ 
                padding: '18px 40px', fontSize: '1.1rem', background: 'transparent', 
                color: '#fff', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)', 
                fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' 
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
