import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { productsAPI } from '../api'
import ProductCard from '../components/ProductCard'
import Skeleton from '../components/Skeleton'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, SlidersHorizontal, Grid, List as ListIcon, Search as SearchIcon } from 'lucide-react'

export default function Listing() {
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState({ cats: [], minPrice: 0, maxPrice: 2000, rating: 0 })
  const [sort, setSort] = useState('popular')
  const [searchParams, setSearchParams] = useSearchParams()
  const [showMobFilters, setShowMobFilters] = useState(false)
  const { totals } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    productsAPI.getAll().then(({ data }) => {
      setAllProducts(data)
      const uniqueCats = [...new Set(data.map(p => p.cat))]
      setCats(uniqueCats)
      setTimeout(() => setLoading(false), 500)
    })
  }, [])

  // Sync state with URL but allow local overrides for multi-select
  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat && !activeFilters.cats.includes(cat)) {
      setActiveFilters(f => ({ ...f, cats: [cat] }))
    } else if (!cat && activeFilters.cats.length === 1 && searchParams.get('cat') === null) {
      // Logic for initial load or back navigation
    }
  }, [searchParams])

  useEffect(() => {
    let filtered = [...allProducts]
    const querySearch = searchParams.get('search')
    
    // URL Search query
    if (querySearch) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(querySearch.toLowerCase()))
    }
    
    // Category filtering (Primary logic)
    if (activeFilters.cats.length > 0) {
      filtered = filtered.filter(p => activeFilters.cats.includes(p.cat))
    }
    
    // Range and Rating
    filtered = filtered.filter(p => 
      p.price >= activeFilters.minPrice && 
      p.price <= activeFilters.maxPrice && 
      p.rating >= activeFilters.rating
    )
    
    // Sorting
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating)
    else filtered.sort((a, b) => b.reviews - a.reviews)
    
    setProducts(filtered)
  }, [allProducts, activeFilters, sort, searchParams])

  const toggleCat = (cat) => {
    const newCats = activeFilters.cats.includes(cat) 
      ? activeFilters.cats.filter(c => c !== cat) 
      : [...activeFilters.cats, cat]
    
    setActiveFilters(f => ({ ...f, cats: newCats }))
    
    // Update URL for single selection (or clear if multiple)
    if (newCats.length === 1) {
      setSearchParams({ cat: newCats[0] })
    } else {
      const params = {}
      const search = searchParams.get('search')
      if (search) params.search = search
      setSearchParams(params)
    }
  }

  const clearFilters = () => {
    setActiveFilters({ cats: [], minPrice: 0, maxPrice: 2000, rating: 0 })
    setSearchParams({})
  }

  const FilterContent = () => (
    <div className="filter-content">
      <div className="filter-group">
        <div className="f-label">Categories</div>
        <div className="f-options">
          {cats.map(cat => (
            <div key={cat} className={`f-pill ${activeFilters.cats.includes(cat) ? 'active' : ''}`} onClick={() => toggleCat(cat)}>
              {cat}
              <span className="f-count">{allProducts.filter(p => p.cat === cat).length}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="f-label">Price Range <span style={{ color: 'var(--primary)' }}>₹{activeFilters.minPrice} - ₹{activeFilters.maxPrice}</span></div>
        <div style={{ padding: '10px 0' }}>
          <input 
            type="range" 
            min="0" 
            max="2000" 
            step="50"
            value={activeFilters.maxPrice} 
            onChange={e => setActiveFilters(f => ({ ...f, maxPrice: +e.target.value }))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="f-label">Minimum Rating</div>
        <div className="f-options">
          {[4, 3, 0].map(r => (
            <div key={r} className={`f-pill ${activeFilters.rating === r ? 'active' : ''}`} onClick={() => setActiveFilters(f => ({ ...f, rating: r }))}>
              {r === 0 ? 'All Ratings' : `${r}★ & Up`}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', borderRadius: 'var(--r-squircle)' }} onClick={clearFilters}>Reset All Filters</button>
    </div>
  )

  return (
    <div className="listing-page">
      <div className="listing-header">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 900, marginBottom: '8px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              {searchParams.get('cat') || (searchParams.get('search') ? `Results for "${searchParams.get('search')}"` : 'Shop Full Catalog')}
            </h1>
            <div style={{ fontSize: 'var(--text-md)', color: 'var(--muted)', fontWeight: 500 }}>
              Discover {products.length} premium quality items handpicked for you
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-16)' }}>
        <div className="listing-main">
          {/* Desktop Filters */}
          <aside className="sidebar-filters">
            <div className="card" style={{ padding: 'var(--sp-6)', borderRadius: 'var(--r-squircle)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--sp-6)', fontWeight: 800, color: 'var(--ink)', fontSize: 'var(--text-md)' }}>
                <SlidersHorizontal size={18} color="var(--primary)" /> Filters
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Product Feed */}
          <div className="feed-wrap">
            <div className="feed-utils">
               <button className="mob-filter-trigger btn btn-ghost" onClick={() => setShowMobFilters(true)} style={{ display: 'none' }}>
                 <Filter size={18} /> Filters
               </button>

               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                 <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort by:</span>
                 <select 
                   value={sort} 
                   onChange={e => setSort(e.target.value)} 
                   className="input"
                   style={{ 
                     padding: '8px 36px 8px 16px', 
                     width: 'auto', 
                     minWidth: '160px',
                     fontWeight: 700,
                     cursor: 'pointer',
                     appearance: 'none',
                     backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")',
                     backgroundRepeat: 'no-repeat',
                     backgroundPosition: 'right 10px center',
                     backgroundSize: '16px'
                   }}
                 >
                    <option value="popular">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                 </select>
               </div>
            </div>

            <div className="products-grid">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="card" style={{ padding: 'var(--sp-5)', border: 'none', background: 'transparent' }}>
                      <Skeleton height="240px" borderRadius="var(--r-squircle)" />
                      <Skeleton height="24px" width="70%" style={{ marginTop: 20 }} />
                      <Skeleton height="16px" width="40%" style={{ marginTop: 10 }} />
                    </div>
                  ))
                ) : products.length > 0 ? (
                  products.map((p, i) => (
                    <motion.div
                      layout
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '120px 0' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🔍</div>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--ink)' }}>No items found</h3>
                    <p style={{ color: 'var(--muted)', fontSize: 'var(--text-md)', marginBottom: 32 }}>Try adjusting your filters or search terms</p>
                    <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay open" onClick={() => setShowMobFilters(false)} />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="sidebar open"
              style={{ 
                top: 'auto', 
                height: 'auto', 
                maxHeight: '90vh',
                borderTopLeftRadius: 'var(--r-squircle)', 
                borderTopRightRadius: 'var(--r-squircle)',
                padding: 'var(--sp-8)',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--ink)' }}>Filter Options</div>
                <button 
                  onClick={() => setShowMobFilters(false)}
                  style={{ background: 'var(--canvas)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="drawer-filter-content">
                <FilterContent />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '32px', height: '56px', borderRadius: 'var(--r-squircle)', fontSize: 'var(--text-md)' }} 
                onClick={() => setShowMobFilters(false)}
              >
                Show Results ({products.length})
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
