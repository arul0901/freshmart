import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { NotifProvider } from './context/NotifContext'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Inventory from './pages/Inventory'
import Coupons from './pages/Coupons'
import Analytics from './pages/Analytics'
import FlashDeals from './pages/FlashDeals'
import Settings from './pages/Settings'

function Sidebar() {
  const { pathname } = useLocation()
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">Fresh<span>Mart</span> Admin</div>
      <div style={{ flex: 1, padding: '16px 0' }}>
        <div className="admin-nav-section">Main Menu</div>
        <Link to="/" className={`admin-nav-item ${pathname === '/' ? 'active' : ''}`}><span className="icon">📊</span>Dashboard</Link>
        <Link to="/products" className={`admin-nav-item ${pathname.includes('/products') ? 'active' : ''}`}><span className="icon">🛒</span>Products</Link>
        <Link to="/orders" className={`admin-nav-item ${pathname.includes('/orders') ? 'active' : ''}`}><span className="icon">📦</span>Orders</Link>
        <Link to="/customers" className={`admin-nav-item ${pathname.includes('/customers') ? 'active' : ''}`}><span className="icon">👥</span>Customers</Link>
        
        <div className="admin-nav-section" style={{ marginTop: 20 }}>Store Management</div>
        <Link to="/inventory" className={`admin-nav-item ${pathname.includes('/inventory') ? 'active' : ''}`}><span className="icon">🏭</span>Inventory</Link>
        <Link to="/flash-deals" className={`admin-nav-item ${pathname.includes('/flash-deals') ? 'active' : ''}`}><span className="icon">⚡</span>Flash Deals</Link>
        <Link to="/coupons" className={`admin-nav-item ${pathname.includes('/coupons') ? 'active' : ''}`}><span className="icon">🏷️</span>Coupons</Link>
        <Link to="/analytics" className={`admin-nav-item ${pathname.includes('/analytics') ? 'active' : ''}`}><span className="icon">📈</span>Analytics</Link>
      </div>
      <div style={{ padding: '0 0' }}>
        <Link to="/settings" className={`admin-nav-item ${pathname.includes('/settings') ? 'active' : ''}`}><span className="icon">⚙️</span>Settings</Link>
      </div>
    </aside>
  )
}

function Layout({ children }) {
  const { pathname } = useLocation()
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
      <Sidebar />
      <main className="admin-main">
        <header className="admin-topbar">
          <h1>{titles[pathname] || 'Admin Panel'}</h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔔</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '99px', background: 'var(--sage)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>A</div>
              <div><div style={{ fontSize: '.85rem', fontWeight: 700 }}>Admin</div><div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>Store Manager</div></div>
            </div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <NotifProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </NotifProvider>
  )
}
