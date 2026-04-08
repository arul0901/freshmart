import { useState, useEffect, useRef } from 'react'
import { productsAPI, uploadAPI } from '../api'
import { useNotif } from '../context/NotifContext'

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { showNotif } = useNotif()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await productsAPI.getAll()
      setProducts(res.data || [])
    } catch (err) {
      setError('Failed to load products')
      showNotif('Error fetching products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase()))

  const handleEdit = (p) => { setForm(p); setShowModal(true) }
  const handleAdd = () => { setForm({ name: '', brand: '', cat: 'Fruits', price: '', oldPrice: '', image: '', weight: '', stock: 100, desc: '' }); setShowModal(true) }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const res = await uploadAPI.uploadImage(file)
      setForm({ ...form, image: res.data.url })
      showNotif('Image uploaded successfully', 'green')
    } catch (err) {
      showNotif('Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (form.id) await productsAPI.update(form.id, form)
      else await productsAPI.create(form)
      showNotif(`Product ${form.id ? 'updated' : 'added'} successfully`)
      setShowModal(false); load()
    } catch { showNotif('Error saving product', 'error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await productsAPI.delete(id); showNotif('Product deleted'); load() } catch { showNotif('Error deleting', 'error') }
  }

  if (loading) return <div className="admin-card">Loading product management...</div>
  if (error) return <div className="admin-card" style={{ color: 'var(--coral)', padding: 20 }}>{error}</div>

  return (
    <div>
      <div className="search-bar">
        <input placeholder="Search products by name or category..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={handleAdd}>+ Add Product</button>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:8, background:'var(--paper)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}><img src={p.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>
                    <div><div className="name">{p.name}</div><div style={{ fontSize:'.74rem', color:'var(--muted)' }}>{p.brand} • {p.weight}</div></div>
                  </div>
                </td>
                <td>{p.cat}</td>
                <td><div style={{ fontWeight:700 }}>₹{p.price}</div><div style={{ fontSize:'.72rem', textDecoration:'line-through', color:'var(--lighter)' }}>{p.oldPrice > p.price ? `₹${p.oldPrice}` : ''}</div></td>
                <td>
                  <div style={{ fontWeight:600, color:p.stock<20?'var(--coral)':p.stock<50?'var(--gold)':'var(--sage)' }}>{p.stock} units</div>
                  <div style={{ height:4, background:'var(--paper)', borderRadius:99, marginTop:4, overflow:'hidden' }}><div style={{ height:'100%', background:p.stock<20?'var(--coral)':p.stock<50?'var(--gold)':'var(--sage)', width:`${Math.min(100, p.stock)}%` }} /></div>
                </td>
                <td><span className={`status-pill ${p.stock > 0 ? 'active' : 'cancelled'}`}>{p.stock > 0 ? 'Active' : 'Out of Stock'}</span></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight:8 }} onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-head"><h3>{form.id ? 'Edit Product' : 'New Product'}</h3></div>
            <form onSubmit={handleSave}>
              <div className="modal-body form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Name</label><input className="form-input" required value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product Image</label>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 100, height: 100, border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--canvas)' }}>
                      {form.image ? <img src={form.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '2rem', opacity: .2 }}>🖼️</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                        ref={fileInputRef} 
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Choose File'}
                      </button>
                      <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 8 }}>Recommended: Square image, max 2MB.</p>
                      <input className="form-input" style={{ marginTop: 8, fontSize: '.72rem' }} placeholder="Or paste URL here..." value={form.image} onChange={e => setForm({...form, image:e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.cat} onChange={e => setForm({...form, cat:e.target.value})}><option>Fruits</option><option>Vegetables</option><option>Dairy</option><option>Snacks</option><option>Beverages</option><option>Meat</option><option>Bakery</option></select></div>
                <div className="form-group"><label className="form-label">Brand</label><input className="form-input" required value={form.brand} onChange={e => setForm({...form, brand:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Weight</label><input className="form-input" required value={form.weight} onChange={e => setForm({...form, weight:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Price (₹)</label><input type="number" className="form-input" required value={form.price} onChange={e => setForm({...form, price:+e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Old Price (₹)</label><input type="number" className="form-input" required value={form.oldPrice} onChange={e => setForm({...form, oldPrice:+e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Stock</label><input type="number" className="form-input" required value={form.stock} onChange={e => setForm({...form, stock:+e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea className="form-input" rows={3} required value={form.desc} onChange={e => setForm({...form, desc:e.target.value})} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Product</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
