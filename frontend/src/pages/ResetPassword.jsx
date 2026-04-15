import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useNotif } from '../context/NotifContext'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react'

function PasswordSuccessAnimation() {
  return (
    <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Aura */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ 
          position: 'absolute', width: '100%', height: '100%', 
          background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)',
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
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        >
          <CheckCircle2 size={100} strokeWidth={2.5} color="#fff" style={{ opacity: 0.9 }} />
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  const { showNotif } = useNotif()
  const navigate = useNavigate()

  useEffect(() => {
    // Extract custom token and email from URL parameters
    const customToken = searchParams.get('token')
    const email = searchParams.get('email')
    
    console.log('RESET PASSWORD: URL params', { token: !!customToken, email })
    
    if (customToken && email) {
      setToken(customToken)
      // Store email for later use
      window.resetEmail = decodeURIComponent(email)
    } else {
      console.log('RESET PASSWORD: No token or email found in URL')
      showNotif('Invalid or expired reset link', 'error')
      navigate('/forgot-password')
    }
  }, [searchParams, showNotif, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('RESET PASSWORD: Form submitted', { passwordLength: password.length, token: !!token })
    
    // Validation
    if (!password.trim()) {
      showNotif('Please enter a new password', 'error')
      return
    }
    
    if (password.length < 6) {
      showNotif('Password must be at least 6 characters long', 'error')
      return
    }
    
    if (password !== confirmPassword) {
      showNotif('Passwords do not match', 'error')
      return
    }

    setLoading(true)
    try {
      console.log('RESET PASSWORD: Sending reset request...')
      const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
      
      const response = await fetch(`${API}/password-reset/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          newPassword: password,
          email: window.resetEmail
        }),
      })
      
      console.log('RESET PASSWORD: Response status:', response.status)
      const data = await response.json()
      console.log('RESET PASSWORD: Response data:', JSON.stringify(data, null, 2))

      if (response.ok) {
        setSuccess(true)
        showNotif('Password reset successfully!', 'success')
      } else {
        showNotif(data.error || 'Failed to reset password', 'error')
      }
    } catch (err) {
      console.error('RESET PASSWORD: Error:', err)
      showNotif('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page" style={{ 
        minHeight: '100vh', 
        display: 'grid', 
        gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr',
        background: 'var(--canvas)'
      }}>
        {/* Left side - Visuals */}
        <div style={{ 
          background: 'var(--success)', 
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
            <PasswordSuccessAnimation />
          </motion.div>
          
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: 40 }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Password <br/> Reset!
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: 20, fontWeight: 500 }}>
              Your account is now secured with <br/> your new password.
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
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>All Set!</h2>
              <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>
                Your password has been successfully reset.
              </p>
            </div>

            <div style={{ background: 'var(--canvas-sub)', padding: 24, borderRadius: 16, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--ink)' }}>Password Updated</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Your account is now secure</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--ink)' }}>Ready to Login</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Use your new password</div>
                </div>
              </div>
            </div>

            <Link to="/login">
              <button 
                className="btn-primary" 
                style={{ height: 56, borderRadius: 16, fontWeight: 800, width: '100%' }}
              >
                Login to Your Account <ArrowRight size={18} />
              </button>
            </Link>
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
              <Lock size={100} strokeWidth={1.5} color="#fff" style={{ opacity: 0.9 }} />
            </motion.div>
          </div>
        </motion.div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: 40 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Set New <br/> Password.
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: 20, fontWeight: 500 }}>
            Choose a strong password to secure <br/> your FreshMart account.
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
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>New Password</h2>
            <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>
              <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                <ArrowLeft size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                Back to login
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="search-input" 
                  placeholder="Enter new password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 48, paddingRight: 48, height: 52, borderRadius: 14 }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: 16, top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none', border: 'none', 
                    color: 'var(--muted)', cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="search-input" 
                  placeholder="Confirm new password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 48, height: 52, borderRadius: 14 }}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                Use at least 6 characters. Include a mix of letters, numbers, and symbols for better security.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ height: 56, borderRadius: 16, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'} <CheckCircle2 size={20} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
