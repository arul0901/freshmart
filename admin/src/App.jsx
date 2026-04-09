import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { NotifProvider } from './context/NotifContext'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Inventory from './pages/Inventory'
import Coupons from './pages/Coupons'
import Analytics from './pages/Analytics'
import FlashDeals from './pages/FlashDeals'
import Settings from './pages/Settings'
import AdminLogin from './pages/AdminLogin'
import { Menu, X, LayoutDashboard, ShoppingCart, Package, Users, Factory, Zap, Tag, BarChart3, Settings as SettingsIcon, LogOut, Bell } from 'lucide-react'

function Sidebar({ open, setOpen }) {
  const { pathname } = useLocation()
  const { logout } = useAdminAuth()

  return (
    <>
      {open && <div className="admin-sidebar-overlay" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-logo-wrap">
          <div className="admin-logo">Fresh<span>Mart</span> Admin</div>
          <button className="sidebar-close-btn" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ flex: 1, padding: '16px 0' }}>
          <div className="admin-nav-section">Main Menu</div>
          <Link to="/" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname === '/' ? 'active' : ''}`}><span className="icon"><LayoutDashboard size={18} /></span>Dashboard</Link>
          <Link to="/products" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname.includes('/products') ? 'active' : ''}`}><span className="icon"><ShoppingCart size={18} /></span>Products</Link>
          <Link to="/orders" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname.includes('/orders') ? 'active' : ''}`}><span className="icon"><Package size={18} /></span>Orders</Link>
          <Link to="/customers" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname.includes('/customers') ? 'active' : ''}`}><span className="icon"><Users size={18} /></span>Customers</Link>
          
          <div className="admin-nav-section" style={{ marginTop: 20 }}>Store Management</div>
          <Link to="/inventory" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname.includes('/inventory') ? 'active' : ''}`}><span className="icon"><Factory size={18} /></span>Inventory</Link>
          <Link to="/flash-deals" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname.includes('/flash-deals') ? 'active' : ''}`}><span className="icon"><Zap size={18} /></span>Flash Deals</Link>
          <Link to="/coupons" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname.includes('/coupons') ? 'active' : ''}`}><span className="icon"><Tag size={18} /></span>Coupons</Link>
          <Link to="/analytics" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname.includes('/analytics') ? 'active' : ''}`}><span className="icon"><BarChart3 size={18} /></span>Analytics</Link>
        </div>
        <div style={{ padding: '0 0' }}>
          <Link to="/settings" onClick={() => setOpen(false)} className={`admin-nav-item ${pathname.includes('/settings') ? 'active' : ''}`}><span className="icon"><SettingsIcon size={18} /></span>Settings</Link>
          <button className="admin-nav-item" onClick={logout} style={{ color: 'var(--coral)', marginTop: 8 }}>
            <span className="icon"><LogOut size={18} /></span>Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

function Layout({ children }) {
  const { pathname } = useLocation()
  const { admin } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const titles = {
    '/': 'Overview Dashboard',
    '/products': 'Product Management',
    '/orders': 'Order Tracking',
    '/customers': 'Customer Directory',
    '/inventory': 'Stock & Inventory',
    '/flash-deals': 'Flash Sale Management',
    '/coupons': 'Discount Coupons',
    '/analytics': 'Business Analytics',
    '/settings': 'Store Settings'
  }

  return (
    <div className="admin-shell">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="admin-mob-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h1>{titles[pathname] || 'Admin Panel'}</h1>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}><Bell size={20} /></span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '99px', background: 'var(--sage)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {admin?.name?.[0] || 'A'}
              </div>
              <div className="hide-mob">
                <div style={{ fontSize: '.85rem', fontWeight: 700 }}>{admin?.name || 'Admin'}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>Store Manager</div>
              </div>
            </div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}


function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<PrivateRoute />}>
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/flash-deals" element={<FlashDeals />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        } />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <NotifProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <AdminApp />
        </BrowserRouter>
      </AdminAuthProvider>
    </NotifProvider>
  )
}
