import { useState, useEffect } from 'react'
import { ordersAPI } from '../api'
import { useNotif } from '../context/NotifContext'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showNotif } = useNotif()

  const load = async () => {
    setLoading(true)
    try {
      const res = await ordersAPI.getAll()
      setOrders(res.data || [])
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    try {
      await ordersAPI.update(id, { status })
      showNotif(`Order ${id} marked as ${status}`)
      load()
    } catch { showNotif('Error updating order', 'error') }
  }

  let filtered = orders.filter(o => o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase()))
  if (filter !== 'all') filtered = filtered.filter(o => o.status === filter)

  if (loading) return <div className="admin-card">Loading orders...</div>
  if (error) return <div className="admin-card" style={{ color: 'var(--coral)', padding: 20 }}>{error}</div>

  return (
    <div>
      <div className="search-bar">
        <input placeholder="Search orders by ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Slot</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>{o.id}</td>
                <td><div className="name">{o.customer}</div><div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{o.email}</div></td>
                <td>{o.items} items</td>
                <td style={{ fontWeight: 600 }}>₹{o.amount}</td>
                <td>{o.slot}</td>
                <td><span className={`status-pill ${o.status}`}>{o.status.toUpperCase()}</span></td>
                <td>
                  <select className="form-select" style={{ padding: '6px 10px', fontSize: '.8rem', width: 130 }} value={o.status} onChange={e => handleStatus(o.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No orders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
