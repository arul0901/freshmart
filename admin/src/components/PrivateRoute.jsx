import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function PrivateRoute() {
  const { token, loading } = useAdminAuth()

  if (loading) return <div>Loading...</div>

  return token ? <Outlet /> : <Navigate to="/login" replace />
}
