import { useState, useEffect } from 'react'
import { X, Search, Navigation, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LocationSidebar({ open, onClose, onSelect }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const popular = [
    'T. Nagar, Chennai',
    'Adyar, Chennai',
    'Velachery, Chennai',
    'Anna Nagar, Chennai',
    'Mylapore, Chennai'
  ]

  const detectLocation = () => {
    setLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const address = data.display_name.split(',').slice(0, 3).join(',');
            onSelect(address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            onClose();
          } catch (err) {
            onSelect(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            onClose();
          }
          setLoading(false)
        },
        (error) => {
          alert("Error detecting location: " + error.message)
          setLoading(false)
        }
      );
    } else {
      alert("Geolocation is not supported by your browser")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (search.length < 3) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=5&countrycodes=in`)
        const data = await response.json()
        setResults(data.map(item => item.display_name))
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overlay open" 
            onClick={onClose} 
            style={{ zIndex: 1200 }} 
          />
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="sidebar glass" 
            style={{ 
              position: 'fixed', top: 0, left: 0, height: '100vh', width: 'min(420px, 100%)', 
              zIndex: 1300, display: 'flex', flexDirection: 'column'
            }}
          >
            <div className="ls-header" style={{ padding: '32px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>Select Delivery Address</h2>
                <motion.button 
                  whileHover={{ rotate: 90 }}
                  onClick={onClose} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  <X size={24} />
                </motion.button>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search for your area..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ 
                    width: '100%', padding: '16px 20px 16px 52px', borderRadius: '16px', 
                    border: '1.5px solid var(--border)', background: 'var(--bg)', 
                    color: 'var(--ink)', fontSize: '1rem', outline: 'none' 
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="ls-body" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={detectLocation}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', 
                  background: 'var(--primary-50)', color: 'var(--primary)', 
                  borderRadius: '24px', cursor: 'pointer', border: '1px solid var(--primary-100)' 
                }}
              >
                <div style={{ 
                  width: 44, height: 44, background: '#fff', borderRadius: '14px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  boxShadow: 'var(--sh-sm)', color: 'var(--primary)' 
                }}>
                  <Navigation size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{loading ? 'Locating...' : 'Get current location'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Using your device GPS</div>
                </div>
              </motion.div>

              <div style={{ margin: '40px 0 16px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.1em' }}>POPULAR AREAS</div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {(results.length > 0 ? results : popular).map((res, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 8, background: 'var(--bg)' }}
                    onClick={() => { onSelect(res); onClose(); }}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                      borderRadius: '16px', cursor: 'pointer', border: '1px solid transparent', 
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div style={{ color: 'var(--primary)', opacity: 0.6 }}>
                      <MapPin size={20} />
                    </div>
                    <span style={{ fontSize: '1rem', color: 'var(--ink-light)', fontWeight: 600 }}>{res}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
