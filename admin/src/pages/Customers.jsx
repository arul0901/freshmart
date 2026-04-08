import { useState, useEffect } from 'react'
import { customersAPI } from '../api'

export default function Customers() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    customersAPI.getAll()
      .then(res => setCustomers(res.data))
      .catch(err => {
        console.error('Customers fetch error:', err)
        setError('Failed to load customers')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))

  if (loading) return <div className="admin-card">Loading customer directory...</div>
  if (error) return <div className="admin-card" style={{ color: 'var(--coral)', padding: 20 }}>{error}</div>

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div><div className="stat-val">{customers.length}</div><div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">💎</div><div className="stat-val">{customers.filter(c => c.tier === 'Platinum').length}</div><div className="stat-label">Platinum Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📈</div><div className="stat-val">₹{Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length)}</div><div className="stat-label">Avg. Customer Value</div>
        </div>
      </div>

      <div className="search-bar">
        <input placeholder="Search customers by name, email, or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary">Export CSV</button>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>Customer Name</th><th>Contact Data</th><th>Orders</th><th>Total Spent</th><th>Tier</th><th>Last Active</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '99px', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{c.name.charAt(0)}</div>
                    <div><div className="name">{c.name}</div><div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>Joined {c.joined}</div></div>
                  </div>
                </td>
                <td><div style={{ fontSize: '.8rem' }}>{c.email}</div><div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>{c.phone}</div></td>
                <td><div style={{ fontWeight: 600 }}>{c.orders}</div></td>
                <td><div style={{ fontWeight: 600, color: 'var(--sage)' }}>₹{c.totalSpent.toLocaleString()}</div></td>
                <td><span className={`tier-pill ${c.tier.toLowerCase()}`}>{c.tier}</span></td>
                <td>{c.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
