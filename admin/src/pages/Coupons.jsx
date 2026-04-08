import { useState, useEffect } from 'react'
import { couponsAPI } from '../api'
import { useNotif } from '../context/NotifContext'

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', discount: '', type: 'percent', minOrder: '', maxUses: '' })
  const { showNotif } = useNotif()

  const load = () => couponsAPI.getAll().then(res => setCoupons(res.data))
  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await couponsAPI.create({ ...form, discount: +form.discount, minOrder: +form.minOrder, maxUses: +form.maxUses })
      showNotif('Coupon created successfully')
      setShowModal(false); load()
    } catch { showNotif('Error creating coupon', 'error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return
    try { await couponsAPI.delete(id); showNotif('Coupon deleted'); load() } catch { showNotif('Error deleting', 'error') }
  }

  return (
    <div>
      <div className="search-bar" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => { setForm({ code: '', discount: '', type: 'percent', minOrder: '', maxUses: '' }); setShowModal(true) }}>+ Create Coupon</button>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id}>
                <td><div className="name" style={{ fontFamily: 'monospace', letterSpacing: '.05em', color: 'var(--sage)' }}>{c.code}</div></td>
                <td><div style={{ fontWeight: 600 }}>{c.discount}{c.type === 'percent' ? '%' : '₹'} OFF</div></td>
                <td>₹{c.minOrder}</td>
                <td><div style={{ fontSize: '.8rem' }}>{c.uses} / {c.maxUses} uses</div><div style={{ height: 4, background: 'var(--paper)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}><div style={{ height: '100%', background: 'var(--blue)', width: `${(c.uses / c.maxUses) * 100}%` }} /></div></td>
                <td><span className={`status-pill ${c.uses < c.maxUses && c.active ? 'active' : 'cancelled'}`}>{c.uses < c.maxUses && c.active ? 'Active' : 'Expired'}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ width: 440 }}>
            <div className="modal-head"><h3>Create New Coupon</h3></div>
            <form onSubmit={handleSave}>
              <div className="modal-body form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group"><label className="form-label">Coupon Code</label><input className="form-input" style={{ textTransform: 'uppercase' }} required value={form.code} onChange={e => setForm({...form, code:e.target.value.toUpperCase()})} placeholder="e.g. SUMMER50" /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Discount Value</label><input type="number" className="form-input" required value={form.discount} onChange={e => setForm({...form, discount:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e => setForm({...form, type:e.target.value})}><option value="percent">Percent (%)</option><option value="flat">Flat Amount (₹)</option></select></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Min. Order Value (₹)</label><input type="number" className="form-input" required value={form.minOrder} onChange={e => setForm({...form, minOrder:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Total Usage Limit</label><input type="number" className="form-input" required value={form.maxUses} onChange={e => setForm({...form, maxUses:e.target.value})} /></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Coupon</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
