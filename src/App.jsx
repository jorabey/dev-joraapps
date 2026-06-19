import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './store'
import { FullLoader, Toasts } from './components/ui'
import { AppLayout } from './components/layout/Layout'
import { LoginPage, RegisterPage, ForgotPassPage } from './pages/Auth'
import { DashboardPage } from './pages/Dashboard'
import { AppsPage } from './pages/Apps'
import { AnalyticsPage } from './pages/Analytics'
import { ApiKeysPage, DocsPage, SettingsPage } from './pages/OtherPages'
import { SettingsPagebek } from './pages/Settings'

function RequireAuth({ children }) {
  const { dev, ready } = useAuth()
  const loc = useLocation()
  if (!ready) return <FullLoader />
  if (!dev) return <Navigate to="/login" state={{ from: loc }} replace />
  return <AppLayout>{children}</AppLayout>
}

function GuestOnly({ children }) {
  const { dev, ready } = useAuth()
  if (!ready) return <FullLoader />
  if (dev) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { init } = useAuth()
  useEffect(() => { init() }, [])

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/login"       element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register"    element={<GuestOnly><RegisterPage /></GuestOnly>} />
        <Route path="/forgot-pass" element={<GuestOnly><ForgotPassPage /></GuestOnly>} />

        {/* Protected */}
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/apps"      element={<RequireAuth><AppsPage /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
        <Route path="/api-keys"  element={<RequireAuth><ApiKeysPage /></RequireAuth>} />
        <Route path="/docs"      element={<DocsPage />} />
        <Route path="/settings"  element={<RequireAuth><SettingsPagebek /></RequireAuth>} />

        {/* Redirects */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:12 }}>
            <p style={{ fontSize:72, fontWeight:800, color:'var(--bg-3)' }}>404</p>
            <p style={{ color:'var(--t3)' }}>Sahifa topilmadi</p>
            <a href="/dashboard" style={{ color:'var(--brand)', fontWeight:600 }}>Bosh sahifaga →</a>
          </div>
        } />
      </Routes>
      <Toasts />
    </>
  )
}
