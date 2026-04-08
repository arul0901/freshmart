import { createContext, useContext, useState, useCallback } from 'react'
const NotifContext = createContext()
export function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState([])
  const showNotif = useCallback((msg, type = 'green') => {
    const id = Date.now()
    setNotifs(prev => [...prev, { id, msg, type }])
    setTimeout(() => setNotifs(prev => prev.filter(n => n.id !== id)), 4000)
  }, [])
  return (
    <NotifContext.Provider value={{ showNotif }}>
      {children}
      <div className="notif-container">
        {notifs.map(n => (
          <div key={n.id} className={`notif ${n.type === 'error' ? 'error' : ''}`}>
            <span>{n.type === 'error' ? '❌' : '✅'}</span>
            <span className="msg">{n.msg}</span>
            <button style={{ background:'none', border:'none', cursor:'pointer', color:'#999', marginLeft:'auto' }} onClick={() => setNotifs(prev => prev.filter(x => x.id !== n.id))}>✕</button>
          </div>
        ))}
      </div>
    </NotifContext.Provider>
  )
}
export const useNotif = () => useContext(NotifContext)
