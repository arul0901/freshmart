import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useNotif } from '../context/NotifContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Leaf } from 'lucide-react'

export default function AdminLogin() {
  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirm: '' })

  const { login, signup } = useAdminAuth()
  const { showNotif } = useNotif()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      showNotif('Please enter your email and password', 'warning')
      return
    }
    setLoading(true)
    const res = await login(loginData.email, loginData.password)
    if (res.success) {
      showNotif('Welcome back, Admin!', 'success')
      navigate('/')
    } else {
      showNotif(res.error || 'Login failed', 'error')
    }
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!signupData.name || !signupData.email || !signupData.password) {
      showNotif('Please fill all required fields', 'warning')
      return
    }
    if (signupData.password !== signupData.confirm) {
      showNotif('Passwords do not match', 'error')
      return
    }
    if (signupData.password.length < 8) {
      showNotif('Password must be at least 8 characters', 'warning')
      return
    }
    setLoading(true)
    const res = await signup(signupData.name, signupData.email, signupData.password)
    if (res.success) {
      showNotif(res.message || 'Account created! Please log in.', 'success')
      setTab('login')
      setLoginData({ email: signupData.email, password: '' })
    } else {
      showNotif(res.error || 'Signup failed', 'error')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', height: 52, borderRadius: 12,
    border: '1.5px solid var(--border)',
    background: 'var(--paper)', color: 'var(--ink)',
    fontSize: '0.95rem', paddingLeft: 44, paddingRight: 16,
    outline: 'none', transition: 'border 0.2s',
    boxSizing: 'border-box'
  }
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 800,
    color: 'var(--muted)', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: 8
  }
  const iconStyle = {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    color: 'var(--muted)', pointerEvents: 'none'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--paper)',
      backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
      backgroundSize: '40px 40px', padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--pure)', padding: '48px 44px',
          borderRadius: 24, boxShadow: 'var(--sh-md)',
          border: '1px solid var(--border)', width: '100%', maxWidth: 460
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              Fresh<span style={{ color: 'var(--sage)' }}>Mart</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <ShieldCheck size={14} color="var(--muted)" />
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              Admin Control Panel
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--paper)', borderRadius: 12,
          padding: 4, marginBottom: 32, border: '1px solid var(--border)'
        }}>
          {['login', 'signup'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px', borderRadius: 10, border: 'none',
                background: tab === t ? 'var(--sage)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--muted)',
                fontWeight: 800, fontSize: '0.9rem',
                cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
              }}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              onSubmit={handleLogin}
            >
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={iconStyle} />
                  <input
                    type="email"
                    placeholder="admin@freshmart.in"
                    value={loginData.email}
                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={iconStyle} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 52, borderRadius: 12, border: 'none',
                  background: loading ? 'var(--muted)' : 'var(--sage)',
                  color: '#fff', fontWeight: 900, fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                }}
              >
                {loading ? 'Signing in…' : 'Sign In to Dashboard'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              onSubmit={handleSignup}
            >
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={iconStyle} />
                  <input
                    type="text"
                    placeholder="Admin Name"
                    value={signupData.name}
                    onChange={e => setSignupData({ ...signupData, name: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={iconStyle} />
                  <input
                    type="email"
                    placeholder="admin@freshmart.in"
                    value={signupData.email}
                    onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={iconStyle} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={signupData.password}
                    onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={iconStyle} />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={signupData.confirm}
                    onChange={e => setSignupData({ ...signupData, confirm: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 52, borderRadius: 12, border: 'none',
                  background: loading ? 'var(--muted)' : 'var(--sage)',
                  color: '#fff', fontWeight: 900, fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                }}
              >
                {loading ? 'Creating Account…' : 'Create Admin Account'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
                New admin accounts are added to the allowlist automatically.<br />
                Contact super-admin if access is denied after sign-up.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
