import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, ShoppingBag, Leaf, Sparkles } from 'lucide-react'

/**
 * Premium Code-Based Animation for Login
 * A floating, glowing cart with particle effects
 */
function FloatingCartAnimation() {
  return (
    <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer Glows */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ 
          position: 'absolute', width: '100%', height: '100%', 
          background: 'radial-gradient(circle, var(--primary-400) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0
        }}
      />
      
      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <div style={{ 
          padding: 50, background: 'rgba(255,255,255,0.1)', 
          borderRadius: 40, backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
        }}>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShoppingBag size={100} strokeWidth={1.5} color="#fff" />
          </motion.div>
        </div>
        
        {/* Floating Sparks */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -100], 
              opacity: [0, 1, 0],
              x: [0, (i % 2 === 0 ? 30 : -30)]
            }}
            transition={{ 
              duration: 2 + i, 
              repeat: Infinity, 
              delay: i * 0.5,
              ease: 'easeOut'
            }}
            style={{ 
              position: 'absolute', top: '50%', left: '50%', 
              color: 'var(--accent)', zIndex: 3 
            }}
          >
            <Sparkles size={16} />
          </motion.div>
        ))}
      </motion.div>

      {/* Rotating Leaf */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: -20, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '50%' }}
      >
        <motion.div style={{ position: 'absolute', top: '10%', left: '10%', color: 'var(--accent)' }}>
           <Leaf size={24} fill="currentColor" />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithEmail, loginWithGoogle, user } = useAuth()
  const { showNotif } = useNotif()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const origin = location.state?.from?.pathname || '/'
      navigate(origin)
    }
  }, [user, navigate, location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await loginWithEmail(email, password)
      if (error) {
        showNotif(error.message, 'error')
      } else {
        showNotif('Welcome back!', 'success')
      }
    } catch (err) {
      showNotif('An unexpected error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ 
      minHeight: '100vh', 
      display: 'grid', 
      gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr',
      background: 'var(--canvas)'
    }}>
      {/* Left side - Visuals */}
      <div style={{ 
        background: 'var(--primary)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '60px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}
        >
          <FloatingCartAnimation />
        </motion.div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: 40 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Freshness <br/> Simplified.
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: 20, fontWeight: 500 }}>
            Login to access your premium grocery collection <br/> and personalized member benefits.
          </p>
        </div>

        {/* Decorative elements */}
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
      </div>

      {/* Right side - Form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Welcome Back</h2>
            <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>
              New to FreshMart? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Create an account</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="email" 
                  className="search-input" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: 48, height: 56, borderRadius: 16 }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="password" 
                  className="search-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 48, height: 56, borderRadius: 16 }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ height: 60, borderRadius: 18, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 }}
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '32px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button 
            type="button" 
            onClick={loginWithGoogle}
            className="btn-outline" 
            style={{ width: '100%', height: 56, borderRadius: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google
          </button>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-page { grid-template-columns: 1fr !important; }
          .auth-page > div:first-child { display: none !important; }
        }
      `}</style>
    </div>
  )
}
