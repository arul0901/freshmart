import { useState, useEffect } from 'react'
import { analyticsAPI } from '../api'

export default function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    analyticsAPI.getSummary().then(res => setData(res.data))
  }, [])

  if (!data) return <div>Loading...</div>

  return (
    <div>
      <div className="two-col" style={{ marginBottom: 24 }}>
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
          <div className="chart-title">Orders by Day</div>
          <div className="chart-bars">
            {data.revenueChart.map(day => {
              const max = Math.max(...data.revenueChart.map(d => d.orders), 1)
              const height = `${(day.orders / max) * 100}%`
              return (
                <div key={day.date} className="chart-bar-col">
                  <div className="chart-bar" style={{ height, background: 'var(--blue)' }} title={`${day.orders} orders`} />
                  <div className="chart-bar-label">{day.label}</div>
                  <div className="chart-bar-value">{day.orders}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="chart-wrap">
          <div className="chart-title">Sales by Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.categoryBreakdown.map((cat, i) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem', fontWeight: 600, marginBottom: 6 }}>
                  <span>{cat.name}</span><span>{cat.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--paper)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: ['var(--sage)', 'var(--gold)', 'var(--coral)', 'var(--blue)', 'var(--lighter)'][i], width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chart-wrap">
          <div className="chart-title">Top Performing Zip Codes</div>
          <table className="admin-table" style={{ width: '100%', marginTop: 20 }}>
            <thead><tr><th>Pincode</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>
              <tr><td style={{ fontWeight: 600 }}>600001 (George Town)</td><td>4,205</td><td>₹1.2M</td></tr>
              <tr><td style={{ fontWeight: 600 }}>600028 (RA Puram)</td><td>3,890</td><td>₹1.1M</td></tr>
              <tr><td style={{ fontWeight: 600 }}>600040 (Anna Nagar)</td><td>3,120</td><td>₹980K</td></tr>
              <tr><td style={{ fontWeight: 600 }}>600020 (Adyar)</td><td>2,800</td><td>₹750K</td></tr>
              <tr><td style={{ fontWeight: 600 }}>600017 (T. Nagar)</td><td>1,950</td><td>₹540K</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
