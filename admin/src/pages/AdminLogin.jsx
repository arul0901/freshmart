import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useNotif } from '../context/NotifContext'
import { motion } from 'framer-motion'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAdminAuth()
  const { addNotif } = useNotif()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const res = await login(email, password)
    
    if (res.success) {
      addNotif('Welcome back, Admin!', 'success')
      navigate('/')
    } else {
      addNotif(res.error || 'Login failed', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <div className="admin-logo" style={{ border: 'none', textAlign: 'center', fontSize: '2rem' }}>
          Fresh<span>Mart</span> Admin
        </div>
        <p style={{ textAlign: 'center', marginBottom: 32, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Please sign in to manage your store
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="admin@freshmart.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 32, padding: '14px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </motion.div>
      
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--paper);
          background-image: radial-gradient(var(--border) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .login-card {
          background: var(--pure);
          padding: 48px;
          border-radius: 20px;
          box-shadow: var(--sh-md);
          border: 1px solid var(--border);
          width: 100%;
          max-width: 440px;
        }
      `}</style>
    </div>
  )
}
