import { useState } from 'react'

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false)
  return (
    <div className="whatsapp-float">
      {open && <div className="wa-bubble">📦 Order via WhatsApp!</div>}
      <button className="wa-main" onClick={() => setOpen(o => !o)} title="Order on WhatsApp">💬</button>
    </div>
  )
}
