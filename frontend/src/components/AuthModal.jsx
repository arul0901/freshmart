import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { X, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuthModal({ open, onClose }) {
  const { signInWithEmailOtp, verifyEmailOtp, loginWithGoogle, user } = useAuth()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    if (user && open) {
      onClose()
      setStep(1); setEmail(''); setOtp(''); setErrorMsg('')
    }
  }, [user, open, onClose])

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  if (!open || user) return null

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true); setErrorMsg('')
    try {
      const { error } = await signInWithEmailOtp(email)
      if (error) setErrorMsg(error.message)
      else {
        setStep(2)
        setTimer(60)
      }
    } catch (err) { setErrorMsg('Failed to send OTP') }
    finally { setLoading(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true); setErrorMsg('')
    try {
      const { error } = await verifyEmailOtp(email, otp)
      if (error) setErrorMsg(error.message)
    } catch (err) { setErrorMsg('Invalid OTP') }
    finally { setLoading(false) }
  }

  const inputBase = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: 'var(--r-md)',
    border: '1.5px solid var(--border)',
    background: 'var(--canvas)',
    color: 'var(--ink)',
    fontFamily: 'var(--font)',
    fontSize: 'var(--text-base)',
    marginBottom: 14,
    outline: 'none',
    transition: 'all 0.2s',
  }

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 2000 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: 440, maxWidth: '94vw',
          background: 'var(--surface)', borderRadius: 'var(--r-2xl)',
          overflow: 'hidden', border: '1px solid var(--border)',
          boxShadow: 'var(--sh-xl)',
        }}
      >
        <button onClick={onClose} className="close-btn" style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <X size={20} />
        </button>

        <div style={{ background: 'var(--primary)', padding: '40px 32px 32px', color: '#fff' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8, marginBottom: 8 }}>
            FRESHMART ACCOUNT
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {step === 1 ? 'Sign In' : 'Verification'}
          </h2>
          <p style={{ fontSize: 'var(--text-base)', opacity: 0.85, marginTop: 12, lineHeight: 1.5, fontWeight: 500 }}>
            {step === 1 
              ? 'Premium groceries are just a login away.'
              : `A secret code has been sent to ${email}`
            }
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', padding: '12px', borderRadius: 'var(--r)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {errorMsg}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              >
                <button
                  onClick={loginWithGoogle}
                  className="btn"
                  style={{ 
                    width: '100%', padding: '14px', borderRadius: 'var(--r-md)', 
                    fontSize: 'var(--text-md)', fontWeight: 800, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    background: 'var(--surface)', color: 'var(--ink)', 
                    border: '1.5px solid var(--border)', boxShadow: 'var(--sh-sm)',
                    marginBottom: 24, transition: '0.2s'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Continue with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR CONTINUE WITH</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                      <input
                        style={{ ...inputBase, paddingLeft: 48 }}
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '16px', borderRadius: 'var(--r-md)', fontSize: '1rem', fontWeight: 900 }}
                  >
                     {loading ? 'Sending...' : 'Continue with Email'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyOtp}
              >
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>Security Code</label>
                  <input
                    style={{ ...inputBase, letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.4rem', fontWeight: 900 }}
                    type="text"
                    placeholder="••••••"
                    required
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                    <button 
                      type="button"
                      disabled={timer > 0 || loading}
                      onClick={handleSendOtp}
                      style={{ background: 'none', border: 'none', color: timer > 0 ? 'var(--muted)' : 'var(--primary)', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }}
                    >
                      {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
                    </button>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '16px', borderRadius: 'var(--r-md)', fontSize: '1rem', fontWeight: 900 }}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  style={{ width: '100%', background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 700, fontSize: '12px', marginTop: 16, cursor: 'pointer' }}
                >
                  Change Email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
