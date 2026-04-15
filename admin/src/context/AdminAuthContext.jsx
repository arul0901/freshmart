import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id)
        if (isAdmin) {
          setSession(session)
          setAdmin(session.user)
        } else {
          // Valid Supabase user but not an admin — sign out
          await supabase.auth.signOut()
        }
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id)
        if (isAdmin) {
          setSession(session)
          setAdmin(session.user)
        } else {
          setAdmin(null)
          setSession(null)
        }
      } else {
        setAdmin(null)
        setSession(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Check if a Supabase user ID exists in the admin_users allowlist table
   */
  const checkAdminRole = async (userId) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    return !!data && !error
  }

  /**
   * Login with email + password
   * Verifies admin role after successful auth
   */
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { success: false, error: error.message }

      const isAdmin = await checkAdminRole(data.user.id)
      if (!isAdmin) {
        await supabase.auth.signOut()
        return { success: false, error: 'Access denied. This account does not have admin privileges.' }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Connection failed. Please try again.' }
    }
  }

  /**
   * Sign up a new admin user
   * Creates a Supabase Auth account + inserts into admin_users allowlist
   */
  const signup = async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role: 'admin' }
        }
      })
      if (error) return { success: false, error: error.message }

      // Insert into admin allowlist table
      const { error: insertErr } = await supabase
        .from('admin_users')
        .insert({ id: data.user.id, full_name: name, email })

      if (insertErr) {
        console.error('Admin allowlist insert failed:', insertErr.message)
        return { success: false, error: 'Account created but admin role assignment failed. Contact super-admin.' }
      }

      return { success: true, message: 'Admin account created successfully! You can now log in.' }
    } catch (err) {
      return { success: false, error: 'Signup failed. Please try again.' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setAdmin(null)
    setSession(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, session, loading, login, signup, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
