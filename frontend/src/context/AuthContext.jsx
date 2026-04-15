import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { authAPI } from '../api'

const AuthContext = createContext()

/**
 * Converts raw Supabase auth errors into clear, user-friendly messages.
 * @param {Object} error - The error object returned by Supabase
 * @returns {string} A human-readable error message
 */
function translateAuthError(error) {
  if (!error) return null

  const msg = error.message?.toLowerCase() || ''
  const status = error.status

  // 429 — Rate limit hit (too many signups/OTPs from this IP)
  if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  // 422 — Email not confirmed yet (user exists but hasn't verified)
  if (status === 422 || msg.includes('email not confirmed')) {
    return 'Your email is not verified yet. Please check your inbox for a confirmation link.'
  }

  // 400 — Bad request: signups disabled, password policy, or invalid email
  if (status === 400) {
    if (msg.includes('signup') && (msg.includes('disabled') || msg.includes('not allowed'))) {
      return 'New account registration is currently disabled. Please contact support.'
    }
    if (msg.includes('password')) {
      return 'Password does not meet the requirements. Use at least 6 characters.'
    }
    if (msg.includes('email')) {
      return 'The email address is invalid or not accepted. Please use a different email.'
    }
    // Generic 400 fallback — show raw message so developer can diagnose
    return error.message || 'Invalid request. Please check your details and try again.'
  }

  // Invalid login credentials
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.'
  }

  // User already registered
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in instead.'
  }

  // Weak / short password (policy violation outside of 400)
  if (msg.includes('password should be') || msg.includes('weak password') || msg.includes('password')) {
    return 'Password does not meet the requirements. Use at least 6 characters.'
  }

  // Network / fetch failure
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Network error. Please check your internet connection and try again.'
  }

  // Fallback: return the original message
  return error.message || 'An unexpected error occurred. Please try again.'
}



/** Helper: fire login notification email (non-blocking) */
const sendLoginNotify = (email, name, method) => {
  console.log('🔍 [FRONTEND AUTH] sendLoginNotify called');
  console.log('🔍 [FRONTEND AUTH] Email:', email, 'Name:', name, 'Method:', method);
  
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  console.log('🔍 [FRONTEND AUTH] API URL:', API);
  
  fetch(`${API}/auth/login-notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, method }),
  })
  .then(response => {
    console.log('🔍 [FRONTEND AUTH] Login notify response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('🔍 [FRONTEND AUTH] Login notify response data:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('🔍 [FRONTEND AUTH] Login notify failed:', error);
  })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    // Listen to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'select_account' }
      }
    })
    if (error) console.error('Google Login Error:', error.message)
    else authAPI.logEvent('LOGIN', { mode: 'Google' })
  }

  const signupWithEmail = async (email, password, displayName) => {
    console.log('🔍 [FRONTEND AUTH] Starting signup process');
    console.log('🔍 [FRONTEND AUTH] Email:', email);
    console.log('🔍 [FRONTEND AUTH] Name:', displayName);
    console.log('🔍 [FRONTEND AUTH] Password length:', password?.length || 0);
    
    const res = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, full_name: displayName } }
    })
    
    console.log('🔍 [FRONTEND AUTH] Supabase signup response:', JSON.stringify(res, null, 2));
    
    // Log raw error for debugging, then translate to user-friendly message
    if (res.error) {
      console.error('[Signup Error] status:', res.error.status, '| message:', res.error.message, '| full:', res.error)
      return { ...res, error: { ...res.error, message: translateAuthError(res.error) } }
    }
    
    if (res.data?.user) {
      console.log('🔍 [FRONTEND AUTH] User created successfully:', res.data.user.id);
      authAPI.logEvent('SIGNUP', { email })
      
      // Send welcome email (non-blocking)
      console.log('🔍 [FRONTEND AUTH] Sending welcome email notification...');
      try {
        const emailResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/signup-notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: displayName }),
        })
        console.log('🔍 [FRONTEND AUTH] Email notification response:', emailResponse.status);
        const emailData = await emailResponse.json();
        console.log('🔍 [FRONTEND AUTH] Email notification data:', JSON.stringify(emailData, null, 2));
      } catch (emailError) {
        console.error('🔍 [FRONTEND AUTH] Email notification failed:', emailError);
      }
    } else {
      console.log('🔍 [FRONTEND AUTH] No user data in response - might need email verification');
    }
    
    return res
  }

  const loginWithEmail = async (email, password) => {
    console.log('🔍 [FRONTEND AUTH] Starting login process');
    console.log('🔍 [FRONTEND AUTH] Email:', email);
    console.log('🔍 [FRONTEND AUTH] Password length:', password?.length || 0);
    
    const res = await supabase.auth.signInWithPassword({ email, password })
    console.log('🔍 [FRONTEND AUTH] Supabase login response:', JSON.stringify(res, null, 2));
    
    // Translate any error to a friendly message
    if (res.error) {
      console.error('🔍 [FRONTEND AUTH] Login error:', res.error);
      return { ...res, error: { ...res.error, message: translateAuthError(res.error) } }
    }
    
    if (res.data?.user) {
      console.log('🔍 [FRONTEND AUTH] Login successful for user:', res.data.user.id);
      authAPI.logEvent('LOGIN', { mode: 'Email' })
      
      // Send login success security alert email (non-blocking)
      const u = res.data.user
      console.log('🔍 [FRONTEND AUTH] Sending login notification...');
      sendLoginNotify(
        u.email,
        u.user_metadata?.full_name || u.user_metadata?.display_name || '',
        'Email & Password'
      )
    } else {
      console.log('🔍 [FRONTEND AUTH] No user data in login response');
    }
    
    return res
  }

  const signInWithEmailOtp = async (email) => {
    return await supabase.auth.signInWithOtp({ email })
  }

  const verifyEmailOtp = async (email, token) => {
    const res = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (!res.error && res.data?.user) {
      authAPI.logEvent('LOGIN', { mode: 'OTP' })
      // Send login notification for OTP logins too
      const u = res.data.user
      sendLoginNotify(
        u.email,
        u.user_metadata?.full_name || '',
        'One-Time Password (OTP)'
      )
    }
    return res
  }

  const logout = async () => {
    authAPI.logEvent('LOGOUT')
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      loginWithGoogle, signupWithEmail, loginWithEmail,
      signInWithEmailOtp, verifyEmailOtp, logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
