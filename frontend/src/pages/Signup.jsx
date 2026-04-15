import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, ShieldCheck, UserPlus, Leaf } from 'lucide-react'

/**
 * Premium Code-Based Animation for Signup
 * A blooming leaf / growth animation
 */
function WelcomeLeafAnimation() {
  return (
    <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Aura */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{ 
          position: 'absolute', width: '120%', height: '120%', 
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          zIndex: 0
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
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <UserPlus size={100} strokeWidth={1} color="#fff" style={{ opacity: 0.9 }} />
          </motion.div>
        </motion.div>
        
        {/* Floating Leaves */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -40, 0], 
              rotate: [0, 45, -45, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 4 + i, 
              repeat: Infinity, 
              delay: i * 0.8,
              ease: 'easeInOut'
            }}
            style={{ 
              position: 'absolute', 
              top: i === 0 ? -20 : i === 1 ? '80%' : -10,
              left: i === 2 ? -20 : '80%',
              color: 'var(--accent)', zIndex: 3 
            }}
          >
            <Leaf size={24} fill="currentColor" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signupWithEmail, user } = useAuth()
  const { showNotif } = useNotif()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔍 [SIGNUP FORM] Form submitted');
    console.log('🔍 [SIGNUP FORM] Form data:', { name, email, passwordLength: password?.length || 0 });
    
    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      console.log('🔍 [SIGNUP FORM] Validation failed - empty fields');
      showNotif('Please fill in all fields', 'error');
      return;
    }
    
    if (password.length < 8) {
      console.log('🔍 [SIGNUP FORM] Password too short');
      showNotif('Password must be at least 8 characters', 'error');
      return;
    }
    
    setLoading(true)
    try {
      console.log('🔍 [SIGNUP FORM] Calling signupWithEmail...');
      const { error } = await signupWithEmail(email, password, name)
      console.log('🔍 [SIGNUP FORM] Signup response:', { error: error?.message });
      
      if (error) {
        showNotif(error.message, 'error')
      } else {
        console.log('🔍 [SIGNUP FORM] Signup successful - showing success notification');
        showNotif('Check your email for verification link!', 'success')
      }
    } catch (err) {
      console.error('🔍 [SIGNUP FORM] Unexpected error:', err);
      showNotif('Failed to create account', 'error')
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
        background: 'var(--sage)', 
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
          <WelcomeLeafAnimation />
        </motion.div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: 40 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Join the <br/> Fresh Club.
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: 20, fontWeight: 500 }}>
            Create an account to start your journey <br/> with premium farm-to-door deliveries.
          </p>
        </div>

        {/* Decorative elements */}
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
      </div>

      {/* Right side - Form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Create Account</h2>
            <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log in here</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Arul Kumar" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', paddingLeft: 48, height: 52, borderRadius: 14 }}
                  required
                />
              </div>
            </div>

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

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="password" 
                  className="search-input" 
                  placeholder="Minimum 8 characters" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 48, height: 52, borderRadius: 14 }}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                By creating an account, you agree to our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ height: 56, borderRadius: 16, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 }}
            >
              {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={20} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
            Quick join? <button onClick={() => showNotif('Google Social Join Coming Soon', 'info')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Continue with Social</button>
          </p>
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
