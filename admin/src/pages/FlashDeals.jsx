import { useState, useEffect } from 'react'
import { flashDealsAPI, productsAPI } from '../api'
import { useNotif } from '../context/NotifContext'

export default function FlashDeals() {
  const [deals, setDeals] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [newDeal, setNewDeal] = useState({ product_id: '', discount: 0, total: 100 })
  const { showNotif } = useNotif()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dealsRes, productsRes] = await Promise.all([
        flashDealsAPI.getAdmin(),
        productsAPI.getAll()
      ])
      setDeals(dealsRes.data || [])
      setProducts(productsRes.data || [])
    } catch (err) {
      showNotif('Failed to fetch data from server', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newDeal.product_id) return showNotif('Please select a product', 'error')
    
    try {
      await flashDealsAPI.create(newDeal)
      showNotif('Flash deal created!', 'green')
      setShowAdd(false)
      setNewDeal({ product_id: '', discount: 0, total: 100 })
      fetchData()
    } catch (err) {
      showNotif('Failed to create deal', 'error')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await flashDealsAPI.update(editingDeal.id, {
        discount: editingDeal.discount,
        total: editingDeal.total,
        active: editingDeal.active
      })
      showNotif('Deal updated!', 'green')
      setEditingDeal(null)
      fetchData()
    } catch (err) {
      showNotif('Update failed', 'error')
    }
  }

  const handleToggle = async (id, active) => {
    try {
      await flashDealsAPI.update(id, { active: !active })
      fetchData()
    } catch (err) {
      showNotif('Toggle failed', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this flash deal?')) return
    try {
      await flashDealsAPI.delete(id)
      showNotif('Deal removed', 'green')
      fetchData()
    } catch (err) {
      showNotif('Delete failed', 'error')
    }
  }

  const totalActive = deals.filter(d => d.active).length
  const totalSold = deals.reduce((sum, d) => sum + (d.sold || 0), 0)
  const totalItems = deals.reduce((sum, d) => sum + (d.total || 0), 0)
  const avgDiscount = deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + d.discount, 0) / deals.length) : 0

  if (loading) return <div className="admin-card">Loading...</div>

  return (
    <div className="admin-section fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Flash Deals</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>Manage products appearing in the homepage flash section.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Flash Deal</button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'var(--sage-pale)', color: 'var(--sage)' }}>⚡</div>
          <div className="summary-txt">
             <div className="summary-val">{totalActive}</div>
             <div className="summary-lbl">Active Deals</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>🛒</div>
          <div className="summary-txt">
             <div className="summary-val">{totalSold} / {totalItems}</div>
             <div className="summary-lbl">Total Units Sold</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#e8f0fe', color: 'var(--blue)' }}>🏷️</div>
          <div className="summary-txt">
             <div className="summary-val">{avgDiscount}%</div>
             <div className="summary-lbl">Avg. Discount</div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showAdd && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-head">
              <h3>Create Flash Deal</h3>
              <button className="pa-btn" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Product</label>
                  <select 
                    className="form-input" 
                    value={newDeal.product_id}
                    onChange={e => setNewDeal({...newDeal, product_id: e.target.value})}
                  >
                    <option value="">Choose item...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                </div>
                <div className="form-grid" style={{ marginTop: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Discount (%)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newDeal.discount}
                      onChange={e => setNewDeal({...newDeal, discount: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Stock</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newDeal.total}
                      onChange={e => setNewDeal({...newDeal, total: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Start Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingDeal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-head">
              <h3>Edit Flash Deal</h3>
              <button className="pa-btn" onClick={() => setEditingDeal(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 12, background: 'var(--paper)', borderRadius: 10 }}>
                   <div className="admin-table-img">
                      <img src={editingDeal.product?.image} alt="" />
                   </div>
                   <div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{editingDeal.product?.name}</div>
                      <div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>Current Price: ₹{editingDeal.product?.price}</div>
                   </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Discount (%)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editingDeal.discount}
                      onChange={e => setEditingDeal({...editingDeal, discount: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Stock</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editingDeal.total}
                      onChange={e => setEditingDeal({...editingDeal, total: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 20 }}>
                   <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={editingDeal.active}
                        onChange={e => setEditingDeal({...editingDeal, active: e.target.checked})}
                      />
                      Active Sale
                   </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingDeal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Product</th>
              <th>Price Info</th>
              <th>Progress</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>No flash deals scheduled</td></tr>
            ) : deals.map(deal => (
              <tr key={deal.id}>
                <td>
                  <span className={`status-pill ${deal.active ? 'active' : 'cancelled'}`} onClick={() => handleToggle(deal.id, deal.active)} style={{ cursor: 'pointer' }}>
                    {deal.active ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="admin-table-img">
                      <img src={deal.product?.image} alt="" />
                    </div>
                    <div className="name">{deal.product?.name || 'Deleted Product'}</div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '.86rem', fontWeight: 600, color: 'var(--coral)' }}>-{deal.discount}% OFF</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>Final: ₹{Math.round(deal.product?.price * (1 - deal.discount/100))}</div>
                </td>
                <td>
                  <div className="admin-progress-wrap" style={{ width: 140 }}>
                     <div className="admin-progress-label">
                        <span>{deal.sold} sold</span>
                        <span>{deal.total} total</span>
                     </div>
                     <div className="admin-progress-bar">
                        <div 
                          className={`admin-progress-fill ${(deal.sold / deal.total) > 0.8 ? 'danger' : (deal.sold / deal.total) > 0.5 ? 'warning' : ''}`} 
                          style={{ width: `${Math.min(100, (deal.sold / deal.total) * 100)}%` }} 
                        />
                     </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditingDeal(deal)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deal.id)}>✕</button>
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
