import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Check, Crown, Zap, ShieldCheck, Clock, Star, ArrowRight, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BenefitCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    style={{
      background: 'var(--surface)',
      padding: 'var(--sp-8)',
      borderRadius: 'var(--r-2xl)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--sh-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}
  >
    <div style={{ 
      width: 48, height: 48, borderRadius: 'var(--r-lg)', 
      background: 'linear-gradient(135deg, var(--primary), var(--p500))',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
    }}>
      <Icon size={24} />
    </div>
    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 900, color: 'var(--ink)' }}>{title}</h3>
    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
  </motion.div>
)

export default function Premium() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    if (user?.user_metadata?.is_premium) {
      setIsPremium(true)
    }
  }, [user])

  const handleUpgrade = () => {
    // Mock upgrade logic - in real app, this would trigger payment
    alert('Thank you for choosing FreshMart Premium! This is a demo.')
  }

  return (
    <div className="container" style={{ padding: '80px 24px', minHeight: '90vh' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, 
            background: 'linear-gradient(90deg, #FFD700, #FFA500)', 
            padding: '8px 16px', borderRadius: 'var(--r-full)',
            color: '#fff', fontWeight: 900, fontSize: 'var(--text-xs)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24,
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)'
          }}
        >
          <Crown size={14} /> membership
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 24 }}
        >
          Elevate Your <span style={{ color: 'var(--primary)' }}>Grocery Game.</span>
        </motion.h1>
        
        <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           style={{ fontSize: 'var(--text-lg)', color: 'var(--muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}
        >
          Experience priority delivery, exclusive organic collections, and 24/7 concierge support with FreshMart Premium.
        </motion.p>
      </div>

      {/* Benefits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-8)', marginBottom: 100 }}>
        <BenefitCard 
          icon={Zap} title="Hyper-Fast Delivery" 
          desc="Guaranteed delivery within 45 minutes for all your essential organic daily needs." 
          delay={0.1}
        />
        <BenefitCard 
          icon={Star} title="Exclusive Collections" 
          desc="Early access to limited-edition seasonal produce and rare artisanal imports." 
          delay={0.2}
        />
        <BenefitCard 
          icon={ShieldCheck} title="Quality Guarantee" 
          desc="Each item manually checked and triple-certified organic before reaching your door." 
          delay={0.3}
        />
        <BenefitCard 
          icon={Clock} title="24/7 Concierge" 
          desc="Priority support line with dedicated personal shoppers to help with your weekly planning." 
          delay={0.4}
        />
      </div>

      {/* Pricing / CTA Section */}
      <div style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          {!isPremium ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'linear-gradient(135deg, var(--bg-alt), var(--surface))',
                borderRadius: 'var(--r-2xl)',
                border: '1.5px solid var(--border)',
                padding: '60px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--sh-xl)'
              }}
            >
              {/* Glassmorphism Overlay for content if needed */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(var(--primary-rgb), 0.03)', zIndex: 0 }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--ink)', marginBottom: 16 }}>FreshMart Premium</h2>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: 8 }}>₹199<span style={{ fontSize: 'var(--text-lg)', color: 'var(--muted)', fontWeight: 600 }}>/month</span></div>
                <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 40 }}>Cancel anytime. Money-back quality guarantee.</p>
                
                <ul style={{ listStyle: 'none', padding: 0, display: 'inline-block', textAlign: 'left', marginBottom: 48 }}>
                  {[
                    'Unlimited Free Delivery on all orders',
                    'Extra 5% off on all Organic collections',
                    'Priority slot booking for peak hours',
                    'Zero surge fees during rain or festivals'
                  ].map((text, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontWeight: 700, color: 'var(--ink)' }}>
                      <Check size={18} color="var(--primary)" strokeWidth={3} /> {text}
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                   <button 
                     onClick={handleUpgrade}
                     className="btn btn-primary" 
                     style={{ padding: '18px 48px', fontSize: 'var(--text-md)', borderRadius: 'var(--r-xl)', boxShadow: '0 8px 30px rgba(var(--primary-rgb), 0.3)' }}
                   >
                     Get Premium Now <ArrowRight size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: 'var(--r-2xl)',
                padding: '60px 40px',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(var(--primary-rgb), 0.4)'
              }}
            >
              <Crown size={64} style={{ marginBottom: 24, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} />
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, marginBottom: 12 }}>You're a Premium Member!</h2>
              <p style={{ fontSize: 'var(--text-lg)', opacity: 0.9, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
                Your benefits are active. Enjoy hyper-fast delivery and exclusive shop prices on every order.
              </p>
              <button 
                onClick={() => navigate('/products')}
                className="btn" 
                style={{ background: '#fff', color: 'var(--primary)', padding: '16px 40px', fontWeight: 900, borderRadius: 'var(--r-lg)' }}
              >
                Start Shopping Exclusive Deals
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Restricted Section Preview (Blurred) */}
      {!isPremium && (
        <div style={{ marginTop: 100, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(var(--bg-rgb), 0.3)', borderRadius: 'var(--r-2xl)' }}>
            <div style={{ textAlign: 'center', background: 'var(--surface)', padding: '40px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', boxShadow: 'var(--sh-xl)' }}>
              <Lock size={40} style={{ marginBottom: 16, color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--ink)' }}>Premium Exclusive Products</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Upgrade to unlock our most exclusive collections.</p>
              <button className="btn btn-outline" style={{ borderRadius: 'var(--r-lg)' }} onClick={handleUpgrade}>Unlock Gallery</button>
            </div>
          </div>
          
          <div style={{ opacity: 0.3, userSelect: 'none', pointerEvents: 'none' }}>
            <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--ink)', marginBottom: 32 }}>Member-Only Collections</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--sp-6)' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 320, background: 'var(--bg-alt)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
