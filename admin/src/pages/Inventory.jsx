import { useState, useEffect } from 'react'
import { productsAPI } from '../api'
import { useNotif } from '../context/NotifContext'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showNotif } = useNotif()

  const load = async () => {
    setLoading(true)
    try {
      const res = await productsAPI.getAll()
      setProducts(res.data.sort((a,b) => a.stock - b.stock))
    } catch (err) {
      setError('Failed to load inventory')
      showNotif('Error loading products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase()))

  const handleRestock = async (p, amount) => {
    try {
      await productsAPI.update(p.id, { stock: p.stock + amount })
      showNotif(`Added ${amount} units to ${p.name}`, 'green')
      load()
    } catch { showNotif('Error updating stock', 'error') }
  }

  if (loading) return <div className="admin-card">Loading inventory...</div>
  if (error) return <div className="admin-card" style={{ color: 'var(--coral)', padding: 20 }}>{error}</div>

  return (
    <div>
      <div className="stat-grid summary-grid">
        <div className="stat-card">
          <div className="stat-icon red">⚠️</div><div className="stat-val">{products.filter(p => p.stock < 20).length}</div><div className="stat-label">Critical Stock (&lt;20)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">🔔</div><div className="stat-val">{products.filter(p => p.stock >= 20 && p.stock < 50).length}</div><div className="stat-label">Low Stock (20-50)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📦</div><div className="stat-val">{products.reduce((s, p) => s + p.stock, 0)}</div><div className="stat-label">Total Items in Warehouse</div>
        </div>
      </div>

      <div className="search-bar">
        <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>Item</th><th>SKU / Category</th><th>Current Stock</th><th>Status</th><th>Quick Restock</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width: 40, height: 40, overflow: 'hidden', borderRadius: 6 }}><img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                    <div className="name">{p.name}</div>
                  </div>
                </td>
                <td><div style={{ fontSize:'.8rem' }}>FM-PRD-{p.id.toString().padStart(4,'0')}</div><div style={{ fontSize:'.74rem', color:'var(--muted)' }}>{p.cat}</div></td>
                <td>
                  <div style={{ fontWeight:700, fontSize:'1.1rem', color:p.stock<20?'var(--coral)':p.stock<50?'var(--gold)':'var(--sage)' }}>{p.stock}</div>
                </td>
                <td>
                  <span className={`status-pill ${p.stock < 20 ? 'cancelled' : p.stock < 50 ? 'pending' : 'active'}`}>
                    {p.stock < 20 ? 'CRITICAL' : p.stock < 50 ? 'LOW' : 'GOOD'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleRestock(p, 50)}>+50</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleRestock(p, 100)}>+100</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleRestock(p, 500)}>+500</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
