import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productsAPI, aiAPI } from '../api'
import {
  Leaf, Search, Heart, User, ShoppingCart, MapPin, ChevronDown,
  Camera, Package, Settings, LogOut, Menu, X, Sun, Moon, ChevronRight
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
  { name: 'My Orders', path: '/orders', icon: Package },
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
        <div className="header-top">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-4)', flexWrap: 'nowrap' }}>

            {/* Mobile menu trigger */}
            <button className="mob-menu-btn" onClick={() => setMobMenuOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="logo" style={{ minWidth: 'fit-content' }}>
              <div className="logo-icon">
                <Leaf size={20} strokeWidth={2.5} />
              </div>
              <div className="logo-text">
                Fresh<span>Mart</span>
              </div>
            </Link>

            {/* Search Bar Wrap - Only visible when logged in */}
            {user && (
              <div className="search-wrap hide-mob" ref={wrapRef} style={{ flex: 1, maxWidth: 450, margin: '0 20px' }}>
                <Search className="search-icon" size={18} />
                <input
                  className="search-input"
                  placeholder={recognizing ? 'Analyzing image…' : 'Search fresh groceries…'}
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  onFocus={() => search.length > 0 && setSuggOpen(true)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  aria-label="Search products"
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
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', 
                      height: 34, width: 34, borderRadius: 'var(--r-sm)', background: 'var(--canvas)',
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--muted)', transition: '0.2s'
                    }}
                  >
                    {recognizing ? <span className="animate-spin" style={{ fontSize: 14 }}>⏳</span> : <Camera size={16} />}
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
                      <div style={{ padding: '12px 18px 8px', fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Suggestions
                      </div>
                      {suggestions.map(p => (
                        <div key={p.id} className="sugg-item" onClick={() => { navigate(`/products/${p.id}`); setSuggOpen(false); setSearch('') }}>
                          <div style={{ width: 42, height: 42, background: 'var(--canvas)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, border: '1px solid var(--border)' }}>
                            {p.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--ink)', marginBottom: 2 }}>{p.name}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{p.cat} · {p.weight}</div>
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 'var(--text-sm)', flexShrink: 0 }}>₹{p.price}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Right Actions */}
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {/* Delivery chip */}
              <motion.button 
                whileHover={{ y: -3 }}
                className="delivery-chip hide-mob" onClick={onLocOpen} aria-label="Change delivery location"
                style={{ padding: '6px 12px', minWidth: 'fit-content' }}
              >
                <MapPin size={16} color="var(--primary)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', lineHeight: 1 }}>Deliver to</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{location}</div>
                </div>
              </motion.button>

              {/* Theme Toggle */}
              <button 
                className="ha-btn"
                onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
              </button>

              {/* Wishlist */}
              {user && (
                <button className="ha-btn hide-mob" onClick={() => navigate('/wishlist')} aria-label="Wishlist">
                  <motion.div whileHover={{ scale: 1.15 }}>
                    <Heart size={18} fill={wishlist.length > 0 ? 'var(--error)' : 'none'} color={wishlist.length > 0 ? 'var(--error)' : 'currentColor'} />
                  </motion.div>
                </button>
              )}

              {/* Auth / Profile */}
              {user ? (
                <div className="profile-dropdown-wrap">
                  <button className="ha-btn" style={{ width: 40, height: 40, borderRadius: '50%', position: 'relative' }} aria-label="Profile">
                    <img
                      src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || user.email}&background=0EB48F&color=fff`}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--primary)' }}
                    />
                  </button>
                  <div className="profile-dropdown">
                    <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600 }}>Account</div>
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </div>
                    </div>
                    <div className="pdd-item" onClick={() => navigate('/orders')}>
                      <Package size={16} /> My Orders
                    </div>
                    <div className="pdd-item" onClick={() => navigate('/settings')}>
                       <Settings size={16} /> Settings
                    </div>
                    <div className="pdd-divider" />
                    <div className="pdd-item sign-out" onClick={logout}>
                      <LogOut size={16} /> Sign Out
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                  style={{ padding: '10px 20px', fontSize: 'var(--text-sm)' }}
                >
                  Log In
                </motion.button>
              )}

              {/* Cart */}
              {user && (
                <button
                  className="btn btn-primary"
                  onClick={onCartOpen}
                  style={{ padding: '10px 18px', borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-md)' }}
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  {totals.itemCount > 0 && (
                    <span style={{ background: '#fff', color: 'var(--primary)', borderRadius: 'var(--r-full)', fontSize: 10, fontWeight: 900, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
                      {totals.itemCount}
                    </span>
                  )}
                </button>
              )}
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
                    className="nav-link"
                    onClick={() => navigate(link.path || `/products?cat=${link.cat}`)}
                  >
                    {link.icon && <link.icon size={15} style={{ marginRight: 6 }} />}
                    {link.name}
                  </button>
                </li>
              ))}
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
              className="mob-drawer"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <div className="logo-text">
                  Fresh<span>Mart</span>
                </div>
                <button
                  onClick={() => setMobMenuOpen(false)}
                  style={{ background: 'var(--canvas)', border: 'none', borderRadius: 'var(--r)', padding: 8, color: 'var(--ink)', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={{ display: 'grid', gap: 4 }}>
                {/* Theme Toggle in Drawer */}
                <div 
                  className="pdd-item" 
                  style={{ padding: '14px 16px', fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--ink)' }}
                  onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </div>
                </div>

                {(user 
                  ? ['Home', ...NAV_LINKS.map(l => l.name), 'My Basket', 'My Orders']
                  : ['Home', ...NAV_LINKS.map(l => l.name)]
                ).map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => { 
                      setMobMenuOpen(false); 
                      if (item === 'My Basket') onCartOpen();
                      else navigate(item === 'Home' ? '/' : item === 'My Orders' ? '/orders' : `/products?cat=${item}`);
                    }}
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
                    {item === 'My Basket' ? <ShoppingCart size={18} color="var(--primary)" /> : <ChevronRight size={16} style={{ color: 'var(--muted)' }} />}
                  </motion.div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                {user ? (
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={logout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setMobMenuOpen(false); navigate('/login') }}>
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
