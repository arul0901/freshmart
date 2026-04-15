import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { aiAPI } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageSquare, Bot, Sparkles, Minus } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL;
console.log('FreshBot initialized with API_BASE:', API_BASE);

function TypewriterMsg({ content, isNew }) {
  const [displayed, setDisplayed] = useState(isNew ? '' : content)
  
  useEffect(() => {
    if (!isNew) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(content.substring(0, i))
      i++
      if (i > content.length) clearInterval(interval)
    }, 10) 
    return () => clearInterval(interval)
  }, [content, isNew])

  return <div>{displayed}</div>
}

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const { addToCart, updateQty } = useCart()
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! I\'m FreshBot. I can help find products, manage your cart, and more. Try saying "Add 2 apples to my cart".', isNew: false }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatBodyRef = useRef(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages, open])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input, isNew: false }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await aiAPI.chat({
        message: input,
        history: messages.slice(1).map(m => ({ role: m.role, content: m.content }))
      })
      
      const { message, actions } = res.data;
      setMessages(prev => [...prev, { role: 'bot', content: message, isNew: true }])
      
      if (actions && Array.isArray(actions)) {
        actions.forEach(action => {
          if (action.type === 'ADD_TO_CART') {
            addToCart(action.product, action.quantity || 1)
          } else if (action.type === 'REMOVE_FROM_CART') {
            updateQty(action.product.id, -(action.quantity || 1))
          }
        })
      }
    } catch (err) {
      console.error('FreshBot Connection Error:', err);
      const errorMsg = err.response?.data?.error || 'Sorry, I\'m having trouble connecting right now.';
      setMessages(prev => [...prev, { role: 'bot', content: errorMsg, isNew: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 2000 }}>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass"
            style={{ 
              width: '380px', height: '550px', marginBottom: '24px', 
              borderRadius: '24px', overflow: 'hidden', display: 'flex', 
              flexDirection: 'column', boxShadow: 'var(--sh-lg)', border: '1px solid var(--border)' 
            }}
          >
            <div style={{ background: 'var(--primary-900)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={22} color="var(--primary-100)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    FreshBot <span style={{ background: 'var(--primary-100)', color: 'var(--primary-900)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>AI</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 600 }}>Zero-Lag Assistant</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}>
                <Minus size={20} />
              </button>
            </div>

            <div ref={chatBodyRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg)' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ 
                   padding: '12px 18px',
                   borderRadius: m.role === 'bot' ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                   background: m.role === 'bot' ? 'var(--surface)' : 'var(--primary)',
                   color: m.role === 'bot' ? 'var(--ink)' : '#fff',
                   fontSize: '1rem', /* Increased from 0.9rem */
                   lineHeight: 1.6,
                   fontWeight: 600, /* Increased from 500 */
                   boxShadow: 'var(--sh-md)',
                   border: m.role === 'bot' ? '1.5px solid var(--border)' : 'none'
                }}>
                  {m.role === 'bot' ? <TypewriterMsg content={m.content} isNew={m.isNew} /> : m.content}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--surface)', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '0.9rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={14} className="spinning" /> Processing...
                </div>
              )}
            </div>

            <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: 12 }}>
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Talk to FreshBot..."
                style={{ 
                  flex: 1, padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border)', 
                  outline: 'none', fontSize: '1rem', background: 'var(--bg)', color: 'var(--ink)',
                  fontWeight: 600
                }}
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                style={{ width: 44, height: 44, background: 'var(--primary)', color: '#fff', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Send size={18} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        style={{ 
          width: '64px', height: '64px', borderRadius: '22px', 
          background: 'var(--primary)', color: '#fff', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: 'var(--sh-lg)', border: 'none', cursor: 'pointer' 
        }}
      >
        {open ? <X size={28} /> : <MessageSquare size={28} fill="currentColor" />}
      </motion.button>
    </div>
  )
}
