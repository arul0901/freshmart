import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productsAPI, aiAPI } from '../api'
import {
  Leaf, Search, Heart, User, ShoppingCart, MapPin, ChevronDown,
  Camera, Package, Settings, LogOut, Menu, X, Sun, Moon, ChevronRight,
  Crown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ANNOUNCE_ITEMS = [
  '🌿 <b>Premium Quality</b> — Farm-to-door freshness guaranteed',
  '🚀 <b>Fast Delivery</b> — Within 2 hours for all essentials',
  '⭐ <b>Trusted by 50,000+</b> — Rated 4.9/5 across India',
  '💚 <b>Organic Certified</b> — 100% natural, no preservatives',
]

const NAV_CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Bakery', 'Meat', 'Organic']

const NAV_LINKS = [
  { name: 'Fruits & Veg', cat: 'Fruits' },
  { name: 'Dairy', cat: 'Dairy' },
  { name: 'Meat & Fish', cat: 'Meat' },
  { name: 'Snacks', cat: 'Snacks' },
  { name: 'Beverages', cat: 'Beverages' },
  { name: 'Premium', path: '/premium', isHighlight: true },
]

export default function Header({ onCartOpen, onAuthOpen, onLocOpen, location }) {
  const { totals, wishlist } = useCart()
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggOpen, setSuggOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [mobMenuOpen, setMobMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('fm_theme') || 'dark')
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const fileInputRef = useRef(null)

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fm_theme', theme)
  }, [theme])

  // Scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    const fn = (e) => { if (!wrapRef.current?.contains(e.target)) setSuggOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleSearch = async (val) => {
    setSearch(val)
    if (val.length < 2) { setSuggOpen(false); return }
    try {
      const { data } = await productsAPI.getAll({ search: val })
      setSuggestions(data.slice(0, 5))
      setSuggOpen(true)
    } catch { setSuggestions([]) }
  }

  const doSearch = () => {
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`)
      setSuggOpen(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = null
    setRecognizing(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1]
      try {
        const res = await aiAPI.recognizeImage(base64Data, file.type)
        if (res.data.product && res.data.product !== 'No match') {
          const { data } = await productsAPI.getAll({ search: res.data.product })
          if (data?.length > 0) {
            navigate(`/products/${data[0].id}`)
            setSearch(''); setSuggOpen(false)
          } else {
            setSearch(res.data.product)
            handleSearch(res.data.product)
          }
        }
      } catch (err) { console.error(err) }
      finally { setRecognizing(false) }
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="announce-bar" aria-hidden="true">
        <div className="announce-track">
          {[...ANNOUNCE_ITEMS, ...ANNOUNCE_ITEMS].map((t, i) => (
            <span key={i} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        {/* Top Row */}
        <div className="header-top" style={{ padding: scrolled ? '10px 0' : '14px 0', transition: 'padding 0.25s' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

            {/* Mobile menu trigger */}
            <button className="mob-menu-btn" onClick={() => setMobMenuOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="logo">
              <div className="logo-icon">
                <Leaf size={20} strokeWidth={2.5} />
              </div>
              <div className="logo-text">Fresh<span>Mart</span></div>
            </Link>

              <div className="search-wrap" ref={wrapRef} style={{ flex: 1, maxWidth: 540, position: 'relative' }}>
                <Search className="search-icon" size={18} />
                <input
                  className="search-input"
                  placeholder={recognizing ? 'Analyzing image…' : 'Search fresh groceries…'}
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  onFocus={() => search.length > 0 && setSuggOpen(true)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  aria-label="Search products"
                  style={{ paddingRight: 50 }}
                />
                <motion.div 
                  className="search-glow"
                  initial={false}
                  whileHover={{ scale: 1.01 }}
                  style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r-md)', pointerEvents: 'none', boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.1)' }}
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  className="pa-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={recognizing}
                  aria-label="Search by image"
                  title="Search by image"
                  style={{ 
                    position: 'absolute', 
                    right: 8, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    height: 38, 
                    width: 38,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--canvas)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--muted)',
                    transition: '0.2s'
                  }}
                >
                  {recognizing
                    ? <span className="animate-spin" style={{ fontSize: 16 }}>⏳</span>
                    : <Camera size={17} />
                  }
                </button>

              {/* Suggestions */}
              <AnimatePresence>
                {suggOpen && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="search-suggestions"
                  >
                    <div style={{
                      padding: '12px 18px 8px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 800,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}>
                      Suggestions
                    </div>
                    {suggestions.map(p => (
                      <div
                        key={p.id}
                        className="sugg-item"
                        onClick={() => { navigate(`/products/${p.id}`); setSuggOpen(false); setSearch('') }}
                      >
                        <div style={{
                          width: 42, height: 42,
                          background: 'var(--canvas)',
                          borderRadius: 'var(--r)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem', flexShrink: 0,
                          border: '1px solid var(--border)'
                        }}>
                          {p.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--ink)', marginBottom: 2 }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                            {p.cat} · {p.weight}
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 'var(--text-sm)', flexShrink: 0 }}>
                          ₹{p.price}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="header-actions">
              {/* Delivery chip */}
              <motion.button 
                whileHover={{ y: -3 }}
                className="delivery-chip" onClick={onLocOpen} aria-label="Change delivery location"
              >
                <MapPin size={16} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
                    Deliver to
                  </div>
                  <div style={{
                    fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--primary)',
                    maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', lineHeight: 1.3, marginTop: 2
                  }}>
                    {location}
                  </div>
                </div>
              </motion.button>

              {/* Theme toggle */}
              <button
                className="ha-btn"
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Wishlist */}
              <button 
                className="ha-btn" 
                onClick={() => navigate('/wishlist')} 
                aria-label="Wishlist"
                style={{ position: 'relative' }}
              >
                <motion.div whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}>
                  <Heart size={20} fill={wishlist.length > 0 ? 'var(--error)' : 'none'} color={wishlist.length > 0 ? 'var(--error)' : 'currentColor'} />
                </motion.div>
                {wishlist.length > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    background: 'var(--error)', color: '#fff',
                    borderRadius: '50%', fontSize: 9, fontWeight: 900,
                    width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                  }}>
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Auth / Profile */}
              {user ? (
                <div className="profile-dropdown-wrap">
                  <button className="ha-btn" style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden' }} aria-label="Profile">
                    <img
                      src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || user.email}&background=0EB48F&color=fff`}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                    />
                  </button>
                  <div className="profile-dropdown">
                    <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600 }}>Signed in as</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </div>
                    </div>
                    <div className="pdd-item" onClick={() => navigate('/orders')}>
                      <Package size={16} /> My Orders
                    </div>
                    <div className="pdd-item" onClick={() => navigate('/settings')}>
                      <motion.div whileHover={{ rotate: 90 }} transition={{ type: 'spring' }} style={{ display: 'flex' }}>
                         <Settings size={16} />
                      </motion.div> 
                      Settings
                    </div>
                    <div className="pdd-divider" />
                    <div className="pdd-item sign-out" onClick={logout}>
                      <LogOut size={16} /> Sign Out
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary login-btn-premium"
                  onClick={onAuthOpen}
                  style={{ 
                    padding: '12px 28px', 
                    fontSize: 'var(--text-sm)', 
                    background: 'var(--primary)', 
                    color: '#fff',
                    fontWeight: 900,
                    borderRadius: 'var(--r-lg)',
                    boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1.5px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <User size={16} />
                  <span>Log In / Sign Up</span>
                </motion.button>
              )}

              {/* Cart */}
              <button
                className="btn btn-primary"
                onClick={onCartOpen}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--r-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  position: 'relative',
                  fontWeight: 800
                }}
                aria-label={`Cart — ${totals.itemCount} items`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <motion.div whileHover={{ scale: 1.1, rotate: -5 }}>
                    <ShoppingCart size={18} strokeWidth={2.5} />
                  </motion.div>
                  <span className="cart-label">My Cart</span>
                </div>
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.3)' }} />
                <span>₹{totals.total}</span>
                {totals.itemCount > 0 && (
                  <span style={{
                    background: '#fff',
                    color: 'var(--primary)',
                    borderRadius: 'var(--r-full)',
                    fontSize: 10,
                    fontWeight: 900,
                    minWidth: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px',
                    marginLeft: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {totals.itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Nav Row ── */}
        <nav className="header-nav">
          <div className="container">
            <ul className="nav-list" style={{ padding: '6px 0' }}>
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => navigate('/products')}>
                  Shop All <ChevronDown size={13} />
                </button>
                <div className="nav-dropdown">
                  {NAV_CATEGORIES.map(cat => (
                    <div
                      key={cat}
                      className="nav-dd-item"
                      onClick={() => navigate(`/products?cat=${cat}`)}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </li>
              {NAV_LINKS.map(link => (
                <li key={link.name} className="nav-item">
                  <button
                    className={`nav-link ${link.isHighlight ? 'nav-link-premium' : ''}`}
                    onClick={() => navigate(link.path || `/products?cat=${link.cat}`)}
                  >
                    {link.isHighlight && <Crown size={14} style={{ marginRight: 6 }} />}
                    {link.name}
                  </button>
                </li>
              ))}
              <li className="nav-item" style={{ marginLeft: 'auto' }}>
                <button className="nav-link" onClick={() => navigate('/orders')}>
                  <Package size={15} /> My Orders
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overlay open"
              style={{ zIndex: 1900 }}
              onClick={() => setMobMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              style={{
                position: 'fixed',
                inset: '0 25% 0 0',
                zIndex: 2000,
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                boxShadow: 'var(--sh-xl)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <div className="logo-text">Fresh<span>Mart</span></div>
                <button
                  onClick={() => setMobMenuOpen(false)}
                  style={{ background: 'var(--canvas)', border: 'none', borderRadius: 'var(--r)', padding: 8, color: 'var(--ink)', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={{ display: 'grid', gap: 4 }}>
                {['Home', ...NAV_LINKS.map(l => l.name), 'My Orders'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setMobMenuOpen(false)}
                    style={{
                      padding: '14px 16px',
                      fontSize: 'var(--text-md)',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      borderRadius: 'var(--r)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.15s'
                    }}
                    whileHover={{ backgroundColor: 'var(--canvas)' }}
                  >
                    {item}
                    <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
                  </motion.div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                {user ? (
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={logout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setMobMenuOpen(false); onAuthOpen() }}>
                    Login / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
