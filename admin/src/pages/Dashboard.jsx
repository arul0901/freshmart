import { useState, useEffect } from 'react'
import { analyticsAPI, ordersAPI, productsAPI } from '../api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [orders, setOrders] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      analyticsAPI.getSummary().then(res => setData(res.data)),
      ordersAPI.getAll().then(res => setOrders(res.data.slice(0, 5))),
      productsAPI.getAll().then(res => setLowStock(res.data.filter(p => p.stock < 50).slice(0, 4)))
    ])
    .catch(err => {
      console.error('Dashboard data fetch error:', err)
      setError('Failed to load dashboard data. Please check if the backend is running.')
    })
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-card">Loading dashboard statistics...</div>
  if (error) return <div className="admin-card" style={{ color: 'var(--coral)', padding: 20 }}>{error}</div>
  if (!data) return <div className="admin-card">No data available</div>

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon green">📊</div>
          <div className="stat-val">₹{data.todayRevenue.toLocaleString()}</div>
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-change up">↑ 12% vs yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div className="stat-val">{data.todayOrders}</div>
          <div className="stat-label">Orders Today</div>
          <div className="stat-change up">↑ 5% vs yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">👥</div>
          <div className="stat-val">{data.totalCustomers.toLocaleString()}</div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-change up">↑ 114 this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⚠️</div>
          <div className="stat-val">{data.lowStockCount}</div>
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-change down">Action required</div>
        </div>
      </div>

      <div className="two-col">
        <div className="chart-wrap">
          <div className="chart-title">Revenue (Last 7 Days)</div>
          <div className="chart-bars">
            {data.revenueChart.map(day => {
              const max = Math.max(...data.revenueChart.map(d => d.revenue), 1)
              const height = `${(day.revenue / max) * 100}%`
              return (
                <div key={day.date} className="chart-bar-col">
                  <div className="chart-bar" style={{ height }} title={`₹${day.revenue}`} />
                  <div className="chart-bar-label">{day.label}</div>
                  <div className="chart-bar-value">₹{Math.round(day.revenue/1000)}k</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="chart-wrap">
          <div className="chart-title">Sales by Category</div>
          <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            {data.categoryBreakdown.map((cat, i) => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: ['var(--sage)', 'var(--gold)', 'var(--coral)', 'var(--blue)', 'var(--lighter)'][i] }} />
                <div style={{ flex: 1, fontSize: '.84rem', fontWeight: 600 }}>{cat.name}</div>
                <div style={{ fontSize: '.84rem', color: 'var(--muted)' }}>{cat.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <div className="table-header"><h3>Recent Orders</h3><button className="btn btn-outline btn-sm">View All</button></div>
        <table className="admin-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>{o.id}</td>
                <td><div className="name">{o.customer}</div></td>
                <td style={{ fontWeight: 600 }}>₹{o.amount}</td>
                <td><span className={`status-pill ${o.status}`}>{o.status.toUpperCase()}</span></td>
                <td>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
