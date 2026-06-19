import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, BarChart2, Settings } from 'lucide-react'

const TABS = [
  { path: '/dashboard', label: 'Bosh',     icon: LayoutDashboard },
  { path: '/apps',      label: 'Ilovalar', icon: Package },
  { path: '/analytics', label: 'Tahlil',   icon: BarChart2 },
  { path: '/settings',  label: 'Sozlama',  icon: Settings },
]

export function BottomNav() {
  const loc = useLocation()
  const nav = useNavigate()

  return (
    <div className="bottom-nav">
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = loc.pathname === path || loc.pathname.startsWith(path + '/')
        return (
          <button
            key={path}
            className={`nav-btn ${active ? 'active' : ''}`}
            onClick={() => nav(path)}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
