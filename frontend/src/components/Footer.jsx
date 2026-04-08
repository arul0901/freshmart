import { useNavigate } from 'react-router-dom'
import { Share2, Camera, MessageCircle, Briefcase, Tv, AppWindow as AppStore, Play as PlayStore, Mail, Send } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border)', background: 'var(--primary-900)', color: 'rgba(255,255,255,0.6)', padding: '80px 0 0' }}>
      <div className="container">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', gap: 60, marginBottom: 80 }}>
          <div className="footer-col">
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 24 }}>
              Fresh<span style={{ color: 'var(--primary-100)' }}>Mart</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 32, maxWidth: 300 }}>
              India's most trusted premium grocery delivery platform. Farm-fresh produce, daily essentials, and gourmet selections — delivered with perfection.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              {[Share2, Camera, MessageCircle, Briefcase, Tv].map((Icon, idx) => (
                <motion.a 
                  key={idx}
                  href="#" 
                  whileHover={{ y: -4, color: 'var(--primary-100)' }}
                  style={{ color: 'rgba(255,255,255,0.4)', transition: '0.3s' }}
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Shop</h4>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 14, fontSize: '0.9rem' }}>
              {['All Products', 'Offers & Deals', 'New Arrivals', 'Best Sellers', 'Organic Range'].map(l => (
                <li key={l} style={{ cursor: 'pointer', transition: '0.3s' }} className="footer-link-item" onClick={() => navigate('/products')}>{l}</li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support</h4>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 14, fontSize: '0.9rem' }}>
              {['Track Order', 'Return Policy', 'Delivery Info', 'FAQs', 'Contact Us'].map(l => (
                <li key={l} style={{ cursor: 'pointer', transition: '0.3s' }} className="footer-link-item">{l}</li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 14, fontSize: '0.9rem' }}>
              {['About Us', 'Careers', 'Blog', 'Partnership', 'Press'].map(l => (
                <li key={l} style={{ cursor: 'pointer', transition: '0.3s' }} className="footer-link-item">{l}</li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Newsletter</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Stay updated with fresh arrival and exclusive offers.</p>
            <div style={{ position: 'relative', marginBottom: 40 }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input 
                placeholder="Enter your email" 
                style={{ 
                  width: '100%', padding: '14px 100px 14px 48px', borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff', fontSize: '0.9rem', outline: 'none' 
                }} 
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  position: 'absolute', right: 6, top: 6, bottom: 6, 
                  background: 'var(--primary-100)', color: 'var(--primary-900)', 
                  border: 'none', borderRadius: '8px', padding: '0 16px', 
                  fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' 
                }}
              >
                JOIN
              </motion.button>
            </div>
            
            <h4 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Download Our Experience</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                <AppStore size={20} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.6 }}>Download on</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>App Store</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                <PlayStore size={20} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.6 }}>Get it on</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Play Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem' }}>
            © 2026 FreshMart Premium Organics. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['UPI', 'VISA', 'MASTERCARD', 'AMEX', 'COD'].map(p => (
              <span key={p} style={{ fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{p}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: '0.85rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </div>
      <style>{`
        .footer-link-item:hover { color: #fff; transform: translateX(4px); }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
