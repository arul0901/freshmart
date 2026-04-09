import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { NotifProvider } from './context/NotifContext'
import Header from './components/Header'
import CartSidebar from './components/CartSidebar'
import AIChat from './components/AIChat'
import LocationSidebar from './components/LocationSidebar'
import PageLoader from './components/PageLoader'
import FloatingCart from './components/FloatingCart'
import { useState, useEffect, lazy, Suspense } from 'react'

import UserProtectedRoute from './components/UserProtectedRoute'

// Lazy load pages for performance (Code Splitting)
// Lazy load pages for performance (Code Splitting)
const Home = lazy(() => import('./pages/Home'))
const Listing = lazy(() => import('./pages/Listing'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Orders = lazy(() => import('./pages/Orders'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Settings = lazy(() => import('./pages/Settings'))
const Premium = lazy(() => import('./pages/Premium'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))

/**
 * Top Loading Bar component that triggers on route changes
 */
function TopLoadingBar() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timeout)
  }, [location])

  if (!loading) return null
  return <div className="top-progress-bar" />
}

/**
 * Component to manage dynamic page titles based on route
 */
function PageTitleManager() {
  const location = useLocation()
  
  useEffect(() => {
    const path = location.pathname
    let title = 'FreshMart — Premium Grocery Delivery'
    
    if (path === '/') title = 'FreshMart — Farm Fresh Essentials'
    else if (path === '/login') title = 'Welcome Back — FreshMart Login'
    else if (path === '/signup') title = 'Create Account — Join FreshMart'
    else if (path.startsWith('/products')) title = 'Shop Premium Groceries — FreshMart'
    else if (path === '/checkout') title = 'Secure Checkout — FreshMart'
    else if (path === '/orders') title = 'My Deliveries — FreshMart'
    else if (path === '/wishlist') title = 'My Wishlist — FreshMart'
    else if (path === '/settings') title = 'Account Settings — FreshMart'
    else if (path === '/premium') title = 'FreshMart Premium Membership'
    
    document.title = title
  }, [location])

  return null
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [locOpen, setLocOpen] = useState(false)
  const [location, setLocation] = useState(localStorage.getItem('fm_location') || 'Chennai, TN 600001')

  useEffect(() => {
    localStorage.setItem('fm_location', location)
  }, [location])

  return (
    <NotifProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <TopLoadingBar />
            <PageTitleManager />
            <Header onCartOpen={() => setCartOpen(true)} onLocOpen={() => setLocOpen(true)} location={location} />
            <CartSidebar 
              open={cartOpen} 
              onClose={() => setCartOpen(false)} 
            />
            <FloatingCart onOpen={() => setCartOpen(true)} />
            <LocationSidebar open={locOpen} onClose={() => setLocOpen(false)} onSelect={(l) => setLocation(l)} />
            <AIChat />
            
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home onCartOpen={() => setCartOpen(true)} />} />
                <Route path="/products" element={<Listing />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route element={<UserProtectedRoute />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/premium" element={<Premium />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </NotifProvider>
  )
}


