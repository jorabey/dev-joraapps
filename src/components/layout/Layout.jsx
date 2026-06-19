import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, BarChart2, Key,
  BookOpen, Settings, LogOut, Menu, X, Code2,
  ChevronDown, Bell
} from 'lucide-react'
import { useAuth, useLang } from '../../store'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav_dashboard' },
  { to: '/apps',      icon: Package,         key: 'nav_apps' },
  { to: '/analytics', icon: BarChart2,       key: 'nav_analytics' },
  { to: '/api-keys',  icon: Key,             key: 'nav_apikeys' },
  { to: '/docs',      icon: BookOpen,        key: 'nav_docs' },
]

const BOTTOM_TABS = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav_dashboard' },
  { to: '/apps',      icon: Package,         key: 'nav_apps' },
  { to: '/analytics', icon: BarChart2,       key: 'nav_analytics' },
  { to: '/settings',  icon: Settings,        key: 'nav_settings' },
]

export function AppLayout({ children }) {
  const { dev, logout } = useAuth()
  const { t, lang } = useLang()
  const nav = useNavigate()
  const loc = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [loc.pathname])

  const handleLogout = async () => {
    await logout()
    nav('/login', { replace: true })
  }

  const initials = (dev?.companyName || dev?.fullName || 'D')
    .split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">D</div>
        <div className="logo-text">
          <span className="logo-name">Dev Console</span>
          <span className="logo-sub">JoraApps Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="nav-group-label">Main</span>
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            {t(key)}
          </NavLink>
        ))}

        <span className="nav-group-label">Account</span>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={16} />
          {t('nav_settings')}
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Dev info */}
        <div style={{
          display:'flex', alignItems:'center', gap:9,
          padding:'10px', borderRadius:'var(--r)',
          background:'var(--bg-2)', border:'1px solid var(--bd)',
          marginBottom:8, cursor:'pointer',
        }}
        onClick={() => nav('/settings')}
        >
          <div style={{
            width:30,height:30,borderRadius:'50%',
            background:'linear-gradient(135deg,var(--brand),#e11d48)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:12,fontWeight:700,color:'#fff',flexShrink:0,
          }}>{initials}</div>
          <div style={{flex:1,overflow:'hidden'}}>
            <p style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{dev?.companyName || dev?.fullName}</p>
            <p style={{fontSize:10,color:'var(--t4)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{dev?.email}</p>
          </div>
          <ChevronDown size={12} color="var(--t4)" />
        </div>

        <button
          onClick={handleLogout}
          className="nav-item"
          style={{width:'100%',color:'var(--red)'}}
        >
          <LogOut size={16} color="var(--red)" style={{opacity:1}} />
          {t('nav_logout')}
        </button>
      </div>
    </>
  )

  return (
    <div className="app-shell">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <div className="main-wrap">
        {/* Desktop topbar */}
        <div className="topbar">
          <div style={{flex:1}} />
          {/* Status indicator */}
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'4px 10px',
            background:'var(--green-s)',
            border:'1px solid rgba(34,197,94,0.2)',
            borderRadius:'var(--r-f)',
          }}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',animation:'pulse 2s infinite'}} />
            <span style={{fontSize:11,fontWeight:700,color:'var(--green)'}}>API Online</span>
          </div>

          {/* Notif placeholder */}
          <button className="btn btn-ghost btn-icon btn-icon-lg" style={{position:'relative'}}>
            <Bell size={16} />
          </button>

          {/* Avatar */}
          <button
            onClick={() => nav('/settings')}
            style={{
              width:32,height:32,borderRadius:'50%',
              background:'linear-gradient(135deg,var(--brand),#e11d48)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:12,fontWeight:700,color:'#fff',flexShrink:0,cursor:'pointer',
              border:'none',
            }}
          >{initials}</button>
        </div>

        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button
            className="btn btn-ghost btn-icon btn-icon-lg"
            onClick={() => setSidebarOpen(true)}
          ><Menu size={20}/></button>
          <div style={{flex:1}}>
            <p style={{fontWeight:700,fontSize:14,letterSpacing:'-0.02em'}}>Dev Console</p>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-lg"><Bell size={18}/></button>
          <button
            onClick={() => nav('/settings')}
            style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand),#e11d48)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',border:'none',cursor:'pointer',flexShrink:0}}
          >{initials}</button>
        </div>

        {/* Page content */}
        <div className="page-content">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <div className="mobile-bottom-nav">
          {BOTTOM_TABS.map(({ to, icon: Icon, key }) => {
            const active = loc.pathname === to || loc.pathname.startsWith(to+'/')
            return (
              <button key={to} className={`mob-nav-btn ${active?'active':''}`} onClick={() => nav(to)}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span>{t(key)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.35} }
      `}</style>
    </div>
  )
}
