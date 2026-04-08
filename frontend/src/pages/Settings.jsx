import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Settings as SettingsIcon, Bell, Shield, LogOut, 
  ChevronRight, Camera, Moon, Sun, Globe, Mail, Lock, Crown, Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, logout } = useAuth()
  const { showNotif } = useNotif()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [theme, setTheme] = useState(() => localStorage.getItem('fm_theme') || 'dark')
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || 'Arul Kumar',
    email: user?.email || '',
    language: 'English',
    orderUpdates: true,
    promoOffers: false
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fm_theme', theme)
  }, [theme])

  const handleSave = () => {
    showNotif('Settings updated successfully!', 'success')
  }

  const SectionTitle = ({ children }) => (
    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--ink)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
      {children}
    </h3>
  )

  const InputGroup = ({ label, icon, value, onChange, placeholder, type = 'text', disabled = false }) => (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
          {icon}
        </div>
        <input 
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="search-input"
          style={{ paddingLeft: 48, borderRadius: 'var(--r-md)', height: 52, background: disabled ? 'var(--bg-alt)' : 'var(--surface)' }}
        />
      </div>
    </div>
  )

  const Toggle = ({ active, onToggle, label, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
      <div>
        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <button 
        onClick={onToggle}
        style={{ 
          width: 52, height: 28, borderRadius: 20, 
          background: active ? 'var(--primary)' : 'var(--border)',
          position: 'relative', border: 'none', cursor: 'pointer', transition: '0.3s'
        }}
      >
        <motion.div 
          animate={{ x: active ? 24 : 4 }}
          style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 4 }}
        />
      </button>
    </div>
  )

  const tabs = [
    { id: 'account', label: 'Account', icon: <User size={18} /> },
    { id: 'membership', label: 'Membership', icon: <Crown size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> }
  ]

  const isPremium = user?.user_metadata?.is_premium || false

  return (
    <div className="container" style={{ padding: '80px 24px', minHeight: '85vh' }}>
      <div style={{ marginBottom: 60 }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>
          Settings
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-lg)', fontWeight: 600, marginTop: 8 }}>
          Manage your account preferences and digital presence.
        </p>
      </div>

      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 60, alignItems: 'start' }}>
        {/* Navigation */}
        <aside style={{ position: 'sticky', top: 100 }}>
          <div style={{ padding: 8, borderRadius: 'var(--r-2xl)', background: 'var(--surface)', border: '1.5px solid var(--border)', boxShadow: 'var(--sh-md)' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', 
                  padding: '16px 20px', borderRadius: 'var(--r-xl)', border: 'none', 
                  background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--ink)',
                  fontWeight: 800, fontSize: 'var(--text-sm)', cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 20px' }} />
            <button 
              onClick={logout}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', 
                padding: '16px 20px', borderRadius: 'var(--r-xl)', border: 'none', 
                background: 'transparent', color: 'var(--error)',
                fontWeight: 800, fontSize: 'var(--text-sm)', cursor: 'pointer'
              }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content */}
        <main style={{ padding: '40px 60px', borderRadius: '40px', background: 'var(--surface)', border: '1.5px solid var(--border)', boxShadow: 'var(--sh-lg)', minHeight: 600 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SectionTitle><User size={22} color="var(--primary)" /> Profile Identity</SectionTitle>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 48, background: 'var(--bg-alt)', padding: 24, borderRadius: 'var(--r-2xl)', border: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${formData.name}&background=0EB48F&color=fff`}
                      alt="Avatar"
                      style={{ width: 110, height: 110, borderRadius: '40px', border: '5px solid var(--surface)', objectFit: 'cover', boxShadow: 'var(--sh-md)' }}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ 
                        position: 'absolute', bottom: -5, right: -5, 
                        width: 40, height: 40, borderRadius: '14px', 
                        background: 'var(--primary)', color: '#fff', border: '3px solid var(--surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--sh-md)', cursor: 'pointer'
                      }}
                    >
                      <Camera size={18} />
                    </motion.button>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 900, color: 'var(--ink)', fontSize: '1.4rem', letterSpacing: '-0.02em' }}>{formData.name}</h4>
                    <p style={{ color: 'var(--muted)', fontSize: 'var(--text-md)', fontWeight: 600 }}>{user?.email}</p>
                    <div className="badge badge-delivered" style={{ marginTop: 12, fontSize: 10, fontWeight: 900 }}>VERIFIED CUSTOMER</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <InputGroup 
                    label="Display Name" 
                    icon={<User size={18} />} 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                  <InputGroup 
                    label="Primary Email" 
                    icon={<Mail size={18} />} 
                    value={formData.email} 
                    disabled 
                  />
                </div>
                <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 24, padding: '16px 40px', borderRadius: 'var(--r-xl)', fontSize: 'var(--text-sm)', fontWeight: 900 }}>Update Profile</button>
              </motion.div>
            )}

            {activeTab === 'membership' && (
              <motion.div key="membership" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SectionTitle><Crown size={22} color="var(--primary)" /> Membership Status</SectionTitle>
                
                <div style={{ 
                  background: isPremium ? 'var(--primary)' : 'var(--bg-alt)', 
                  padding: 40, borderRadius: 'var(--r-2xl)', color: isPremium ? '#fff' : 'var(--ink)',
                  border: isPremium ? 'none' : '1.5px dashed var(--border)',
                  textAlign: 'center', marginBottom: 32
                }}>
                  <Crown size={48} style={{ marginBottom: 16, color: isPremium ? '#fff' : 'var(--muted)' }} />
                  <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, marginBottom: 8 }}>
                    {isPremium ? 'FreshMart Premium Active' : 'Basic Membership'}
                  </h3>
                  <p style={{ fontSize: 'var(--text-md)', opacity: 0.8, fontWeight: 600, maxWidth: 400, margin: '0 auto 24px' }}>
                    {isPremium 
                      ? 'Enjoy hyper-fast delivery, exclusive pricing and zero delivery fees on all orders.'
                      : 'Unlock the full potential of FreshMart with a Premium subscription.'
                    }
                  </p>
                  <button 
                  onClick={() => navigate('/premium')}
                  className="btn" 
                  style={{ background: isPremium ? '#fff' : 'var(--primary)', color: isPremium ? 'var(--primary)' : '#fff', padding: '14px 32px', fontWeight: 900, borderRadius: 'var(--r-lg)' }}>
                    {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {[
                    { label: 'Hyper-Fast Delivery', active: isPremium },
                    { label: 'Exclusive Shop', active: isPremium },
                    { label: 'Zero Delivery Fees', active: isPremium },
                    { label: 'Concierge Support', active: isPremium }
                  ].map((benefit, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'var(--canvas)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', opacity: benefit.active ? 1 : 0.5 }}>
                      <Check size={18} color={benefit.active ? 'var(--primary)' : 'var(--muted)'} strokeWidth={3} />
                      <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>{benefit.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SectionTitle><SettingsIcon size={22} color="var(--primary)" /> App Settings</SectionTitle>
                
                <div style={{ padding: '0 8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', borderBottom: '1.5px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 900, color: 'var(--ink)', fontSize: 'var(--text-md)' }}>Visual Appearance</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>{theme === 'dark' ? 'Exclusive Dark Mode' : 'Clean Light Mode'}</div>
                    </div>
                    <button 
                      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                      style={{ 
                        padding: '12px 24px', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--border)',
                        background: 'var(--bg-alt)', color: 'var(--ink)', fontWeight: 900,
                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                        boxShadow: 'var(--sh-sm)', transition: 'all 0.2s'
                      }}
                    >
                      {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                      Toggle Theme
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0' }}>
                    <div>
                      <div style={{ fontWeight: 900, color: 'var(--ink)', fontSize: 'var(--text-md)' }}>Regional Language</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>Localized experience settings</div>
                    </div>
                    <select 
                      className="search-input" 
                      style={{ width: 160, height: 48, borderRadius: 'var(--r-lg)', padding: '0 16px', fontWeight: 900, fontSize: 'var(--text-sm)', background: 'var(--canvas)', border: '1.5px solid var(--border)' }}
                      value={formData.language}
                      onChange={e => setFormData({...formData, language: e.target.value})}
                    >
                      <option>English (US)</option>
                      <option>Tamil (Ta)</option>
                      <option>Hindi (Hi)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SectionTitle><Bell size={22} color="var(--primary)" /> Intelligent Alerts</SectionTitle>
                <div style={{ display: 'grid', gap: 8 }}>
                  <Toggle 
                    label="Live Order Tracking" 
                    desc="Push notifications when your farm-fresh package is in transit"
                    active={formData.orderUpdates}
                    onToggle={() => setFormData({...formData, orderUpdates: !formData.orderUpdates})}
                  />
                  <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                  <Toggle 
                    label="Seasonal Flash Deals" 
                    desc="Be the first to know about rare fruit arrivals and organic discounts"
                    active={formData.promoOffers}
                    onToggle={() => setFormData({...formData, promoOffers: !formData.promoOffers})}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SectionTitle><Shield size={22} color="var(--primary)" /> Security Citadel</SectionTitle>
                
                <div style={{ display: 'grid', gap: 40 }}>
                  <div style={{ background: 'var(--bg-alt)', padding: 32, borderRadius: 'var(--r-2xl)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Lock size={18} /> Update Password
                    </h4>
                    <div style={{ display: 'grid', gap: 16 }}>
                      <InputGroup label="Secure Current Password" type="password" icon={<Lock size={18} />} placeholder="••••••••" />
                      <InputGroup label="New Security Key" type="password" icon={<Shield size={18} />} placeholder="••••••••" />
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 8, padding: '14px 32px', borderRadius: 'var(--r-lg)', fontWeight: 900 }}>Update Security</button>
                  </div>
                  
                  <div style={{ padding: '0 8px' }}>
                    <h4 style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>Digital Sovereignty</h4>
                    <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: 24, fontWeight: 600 }}>We respect your privacy. Manage or erase your data from our servers instantly.</p>
                    <div style={{ display: 'flex', gap: 20 }}>
                       <button className="btn btn-outline" style={{ border: 'none', color: 'var(--error)', background: 'var(--error-bg)', fontWeight: 800 }}>Permanently Erase Profile</button>
                       <button className="btn btn-ghost" style={{ fontWeight: 800 }}>Terms of Service</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
