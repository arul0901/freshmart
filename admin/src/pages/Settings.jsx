import { useState } from 'react'
import { useNotif } from '../context/NotifContext'

export default function Settings() {
  const [form, setForm] = useState({ name: 'FreshMart', email: 'support@freshmart.in', phone: '+91 98765 43210', address: '123 Market Street, Chennai 600001', freeShippingMin: 499, deliveryFee: 40, currency: 'INR', taxRate: 5 })
  const { showNotif } = useNotif()

  const handleSave = (e) => {
    e.preventDefault()
    showNotif('Settings saved successfully', 'green')
  }

  return (
    <div>
      <div className="two-col">
        <form className="form-card" onSubmit={handleSave}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>General Store Settings</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Store Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Currency</label><select className="form-select" value={form.currency} onChange={e => setForm({...form, currency:e.target.value})}><option value="INR">INR (₹)</option><option value="USD">USD ($)</option></select></div>
            <div className="form-group"><label className="form-label">Support Email</label><input className="form-input" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Support Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} /></div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Store Address</label><textarea className="form-input" rows={2} value={form.address} onChange={e => setForm({...form, address:e.target.value})} /></div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 24 }}>Save General Settings</button>
        </form>

        <form className="form-card" onSubmit={handleSave}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Shipping & Tax Settings</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Default Delivery Fee (₹)</label><input type="number" className="form-input" value={form.deliveryFee} onChange={e => setForm({...form, deliveryFee:+e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Free Shipping Minimum (₹)</label><input type="number" className="form-input" value={form.freeShippingMin} onChange={e => setForm({...form, freeShippingMin:+e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Default Tax Rate (%)</label><input type="number" className="form-input" value={form.taxRate} onChange={e => setForm({...form, taxRate:+e.target.value})} /></div>
          </div>
          <div style={{ marginTop: 24, fontSize: '.84rem', color: 'var(--muted)', background: 'var(--paper)', padding: 16, borderRadius: 8 }}>
            Note: Changes to shipping settings will apply to all new orders immediately. Existing pending orders will retain their original shipping costs.
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 24 }}>Save Shipping Settings</button>
        </form>
      </div>
    </div>
  )
}
