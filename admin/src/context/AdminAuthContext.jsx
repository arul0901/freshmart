import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('fm_admin_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Basic verification of token persistence
    const savedAdmin = localStorage.getItem('fm_admin_user')
    if (token && savedAdmin) {
      setAdmin(JSON.parse(savedAdmin))
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      
      if (data.success && data.user.role === 'admin') {
        localStorage.setItem('fm_admin_token', data.token)
        localStorage.setItem('fm_admin_user', JSON.stringify(data.user))
        setToken(data.token)
        setAdmin(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.user?.role !== 'admin' ? 'Unauthorized: Admin access only' : data.error }
      }
    } catch (err) {
      return { success: false, error: 'Connection failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('fm_admin_token')
    localStorage.removeItem('fm_admin_user')
    setToken(null)
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
