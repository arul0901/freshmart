import React from 'react'
import { motion } from 'framer-motion'

const ShaderHero = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="shader-lines">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="2" seed="2">
            <animate attributeName="baseFrequency" values="0.01 0.1; 0.01 0.2; 0.01 0.1" dur="10s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="30" />
        </filter>
      </svg>

      <motion.div 
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ 
          position: 'absolute', 
          inset: '-50%', 
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
          filter: 'url(#shader-lines)',
          backgroundSize: '100% 100%'
        }} 
      />

      {/* Modern Shader Lines */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: ['-100%', '100%'],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 8 + i * 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 1.5
            }}
            style={{
              position: 'absolute',
              top: `${15 * i}%`,
              left: 0,
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
              transform: `rotate(${i % 2 === 0 ? 5 : -5}deg)`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default ShaderHero
