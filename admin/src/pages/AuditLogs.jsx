import { useState, useEffect, useCallback } from 'react'
import { logsAPI } from '../api'
import { Search, ShieldAlert, ShieldCheck, Clock, User, Activity, Eye, X, Download, RefreshCw } from 'lucide-react'

// ── CSV Export Helper (client-side from loaded logs) ──
function downloadLogs(logs, format = 'csv') {
  if (!logs.length) return

  const dateStr = new Date().toISOString().split('T')[0]
  let content, mimeType, filename

  if (format === 'csv') {
    const headers = ['id', 'created_at', 'action_type', 'entity_type', 'status', 'api_route', 'user_id', 'ip_address', 'error_message']
    const escape = (val) => {
      if (val === null || val === undefined) return ''
      const s = typeof val === 'object' ? JSON.stringify(val) : String(val)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = logs.map(row => headers.map(h => escape(row[h])).join(','))
    content = [headers.join(','), ...rows].join('\n')
    mimeType = 'text/csv'
    filename = `freshmart_logs_${dateStr}.csv`
  } else {
    content = JSON.stringify(logs, null, 2)
    mimeType = 'application/json'
    filename = `freshmart_logs_${dateStr}.json`
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ action: '', status: '', search: '' })
  const [selectedLog, setSelectedLog] = useState(null)
  const [exporting, setExporting] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await logsAPI.getAll(filters)
      setLogs(data || [])
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 400)
    return () => clearTimeout(timer)
  }, [fetchLogs])

  const handleExport = async (format) => {
    setExporting(true)
    try {
      // Client-side export from already-loaded logs
      downloadLogs(logs, format)
    } finally {
      setExporting(false)
    }
  }

  // Full server-side export (all rows, no pagination limit)
  const handleFullExport = async (format) => {
    setExporting(true)
    try {
      const { data } = await logsAPI.getAll({ ...filters, limit: 10000 })
      downloadLogs(data || [], format)
    } catch (err) {
      console.error('Full export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'FAILED') return 'var(--coral)'
    if (status === 'WARNING') return 'var(--sun)'
    return 'var(--sage)'
  }

  const getActionIcon = (action) => {
    if (!action) return <ShieldCheck size={14} />
    if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('SIGNUP')) return <User size={14} />
    if (action.includes('ORDER')) return <Clock size={14} />
    if (action.includes('AI')) return <Activity size={14} />
    return <ShieldCheck size={14} />
  }

  const totalLogs = logs.length
  const failedCount = logs.filter(l => l.status === 'FAILED').length

  return (
    <div className="admin-page">
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Events', value: totalLogs, color: 'var(--sage)' },
          { label: 'Failed Events', value: failedCount, color: 'var(--coral)' },
          { label: 'Success Rate', value: totalLogs ? `${Math.round(((totalLogs - failedCount) / totalLogs) * 100)}%` : '—', color: 'var(--ink)' },
        ].map(stat => (
          <div key={stat.label} className="admin-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Export Toolbar */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div className="search-box" style={{ flex: 1, minWidth: '180px' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search logs…"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          {/* Action Filter */}
          <select
            className="input"
            style={{ width: 'auto', minWidth: 140 }}
            value={filters.action}
            onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Logins</option>
            <option value="SIGNUP">Sign Ups</option>
            <option value="LOGOUT">Logouts</option>
            <option value="ORDER_PLACED">Orders Placed</option>
            <option value="CHECKOUT_FAILED">Failed Checkouts</option>
            <option value="CART_ADD">Cart Additions</option>
            <option value="AI_RECOGNITION_SUCCESS">AI Success</option>
            <option value="SYSTEM_ERROR">System Errors</option>
          </select>

          {/* Status Filter */}
          <select
            className="input"
            style={{ width: 'auto' }}
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="WARNING">Warnings</option>
          </select>

          {/* Refresh */}
          <button
            className="btn-secondary"
            onClick={fetchLogs}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--paper)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>

          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || !logs.length}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 40, padding: '0 14px', borderRadius: 8,
                border: '1px solid var(--sage)', background: 'transparent',
                color: 'var(--sage)', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem',
                opacity: (!logs.length || exporting) ? 0.5 : 1
              }}
            >
              <Download size={14} />
              CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting || !logs.length}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 40, padding: '0 14px', borderRadius: 8,
                border: '1px solid var(--sage)', background: 'var(--sage)',
                color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem',
                opacity: (!logs.length || exporting) ? 0.5 : 1
              }}
            >
              <Download size={14} />
              JSON
            </button>
          </div>
        </div>

        {logs.length > 0 && (
          <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
            Showing {logs.length} events · Exports include current filtered view.{' '}
            <button
              onClick={() => handleFullExport('csv')}
              style={{ background: 'none', border: 'none', color: 'var(--sage)', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', padding: 0 }}
            >
              Export all logs (full CSV)
            </button>
          </div>
        )}
      </div>

      {/* Log Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action / Type</th>
              <th>User</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="5">
                    <div style={{ height: 16, background: 'var(--border)', borderRadius: 4, margin: '6px 0', opacity: 0.5 }} />
                  </td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
                  No log entries match your filters.
                </td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{new Date(log.created_at).toLocaleTimeString()}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{new Date(log.created_at).toLocaleDateString()}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.88rem' }}>
                    {getActionIcon(log.action_type)}
                    {log.action_type || '—'}
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 2 }}>{log.api_route || 'Internal'}</div>
                </td>
                <td>
                  <div style={{ fontSize: '.85rem', fontFamily: 'monospace' }}>{log.user_id ? `${log.user_id.slice(0, 8)}…` : 'Anonymous'}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>IP: {log.ip_address || 'N/A'}</div>
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: '99px', fontSize: '.7rem', fontWeight: 800,
                    background: getStatusColor(log.status) + '18', color: getStatusColor(log.status)
                  }}>
                    {log.status === 'FAILED' ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                    {log.status || 'OK'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => setSelectedLog(log)} className="admin-action-btn" title="View Detail">
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: 680, maxHeight: '82vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Audit Entry Detail</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '4px 0 0', fontWeight: 600 }}>
                  {selectedLog.action_type} · {new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => downloadLogs([selectedLog], 'json')}
                  style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem', color: 'var(--ink)' }}
                >
                  <Download size={13} /> Export
                </button>
                <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  ['Status', <span style={{ color: getStatusColor(selectedLog.status), fontWeight: 800 }}>{selectedLog.status}</span>],
                  ['Route', <code style={{ fontSize: '0.85rem' }}>{selectedLog.api_route || '—'}</code>],
                  ['User ID', <code style={{ fontSize: '0.82rem' }}>{selectedLog.user_id || 'Anonymous'}</code>],
                  ['IP Address', selectedLog.ip_address || 'N/A'],
                  ['Error', <span style={{ color: 'var(--coral)', fontWeight: 600 }}>{selectedLog.error_message || 'None'}</span>],
                ].map(([key, val]) => (
                  <>
                    <div key={key + '_k'} style={{ color: 'var(--muted)', fontWeight: 700, fontSize: '0.82rem', paddingTop: 2 }}>{key}</div>
                    <div key={key + '_v'}>{val}</div>
                  </>
                ))}
              </div>

              <div style={{ color: 'var(--muted)', fontWeight: 700, fontSize: '0.82rem', marginBottom: 8 }}>Metadata Payload</div>
              <pre style={{
                background: 'var(--paper)', padding: 16, borderRadius: 10, fontSize: '.78rem',
                whiteSpace: 'pre-wrap', border: '1px solid var(--border)', lineHeight: 1.6,
                maxHeight: 260, overflowY: 'auto'
              }}>
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <button className="btn-primary" onClick={() => setSelectedLog(null)} style={{ marginTop: 20 }}>Close</button>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
