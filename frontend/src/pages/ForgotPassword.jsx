import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotif } from '../context/NotifContext'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, ArrowRight, Key, ShieldCheck } from 'lucide-react'

function PasswordResetAnimation() {
  return (
    <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Aura */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ 
          position: 'absolute', width: '100%', height: '100%', 
          background: 'radial-gradient(circle, var(--warning) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0
        }}
      />
      
      {/* Main Container */}
      <div style={{ 
        padding: 50, background: 'rgba(255,255,255,0.1)', 
        borderRadius: 40, backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255,255,255,0.2)',
        position: 'relative', zIndex: 2,
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
      }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Key size={100} strokeWidth={1.5} color="#fff" style={{ opacity: 0.9 }} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { showNotif } = useNotif()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('FORGOT PASSWORD: Form submitted', { email })
    
    if (!email.trim()) {
      console.log('FORGOT PASSWORD: Email validation failed')
      showNotif('Please enter your email address', 'error')
      return
    }

    setLoading(true)
    try {
      console.log('FORGOT PASSWORD: Sending reset request...')
      const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
      
      const response = await fetch(`${API}/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      console.log('FORGOT PASSWORD: Response status:', response.status)
      const data = await response.json()
      console.log('FORGOT PASSWORD: Response data:', JSON.stringify(data, null, 2))

      if (response.ok) {
        setSubmitted(true)
        showNotif('Password reset link sent! Check your email.', 'success')
      } else {
        showNotif(data.error || 'Failed to send reset link', 'error')
      }
    } catch (err) {
      console.error('FORGOT PASSWORD: Error:', err)
      showNotif('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-page" style={{ 
        minHeight: '100vh', 
        display: 'grid', 
        gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr',
        background: 'var(--canvas)'
      }}>
        {/* Left side - Visuals */}
        <div style={{ 
          background: 'var(--warning)', 
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
            <PasswordResetAnimation />
          </motion.div>
          
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: 40 }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Check Your <br/> Email.
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: 20, fontWeight: 500 }}>
              We've sent a password reset link to <br/> <strong>{email}</strong>
            </p>
          </div>
        </div>

        {/* Right side - Success Message */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ width: '100%', maxWidth: 420 }}
          >
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Reset Link Sent!</h2>
              <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>
                Check your inbox and click the reset link.
              </p>
            </div>

            <div style={{ background: 'var(--canvas-sub)', padding: 24, borderRadius: 16, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Mail size={20} style={{ color: 'var(--warning)' }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--ink)' }}>Email Sent</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{email}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--ink)' }}>Secure Link</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Expires in 24 hours</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <button 
                onClick={() => window.location.reload()}
                className="btn-outline" 
                style={{ height: 56, borderRadius: 16, fontWeight: 700 }}
              >
                Send Again
              </button>
              
              <Link to="/login">
                <button 
                  className="btn-primary" 
                  style={{ height: 56, borderRadius: 16, fontWeight: 800, width: '100%' }}
                >
                  Back to Login <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
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
        background: 'var(--warning)', 
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
          <PasswordResetAnimation />
        </motion.div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: 40 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Forgot <br/> Password?
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: 20, fontWeight: 500 }}>
            No worries! We'll send you a reset <br/> link to get back into your account.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Reset Password</h2>
            <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>
              Remember your password? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Back to login</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="email" 
                  className="search-input" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: 48, height: 52, borderRadius: 14 }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ height: 56, borderRadius: 16, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 }}
            >
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'} <ArrowRight size={20} />
            </button>
          </form>

          <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
            <ShieldCheck size={20} color="var(--success)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
              We'll send a secure link to your email. The link will expire in 24 hours for your security.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
