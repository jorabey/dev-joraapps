import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Lock, Globe, Info, LogOut, ChevronRight,
  Eye, EyeOff, Shield, Bell, Code2, ExternalLink,
  CheckCircle, Building2, Mail
} from 'lucide-react'
import { useAuth, toast } from '../store'
import { Btn, Input, Modal, InfoCard, Avatar, Toggle } from '../components/ui'

/* ── Menu Row ───────────────────────────── */
function MenuRow({ icon: Icon, label, sub, color = 'var(--brand)', onClick, danger, right, badge }) {
  return (
    <div
      className="list-row"
      onClick={onClick}
      style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.2s ease',
        borderRadius: 8,
        margin: '2px 4px'
      }}
    >
      <div 
        className="list-icon" 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          background: danger ? 'rgba(239, 68, 68, 0.1)' : `${color}15` 
        }}
      >
        <Icon size={18} color={danger ? 'var(--red, #ef4444)' : color} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ fontSize: 14, fontWeight: 550, color: danger ? 'var(--red, #ef4444)' : 'var(--t1, #0f172a)', margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--t3, #64748b)', marginTop: 2, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</p>}
      </div>
      {badge && (
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-soft, rgba(99,102,241,0.1))', padding: '2px 8px', borderRadius: 99, marginRight: 4 }}>{badge}</span>
      )}
      {right !== undefined ? right : <ChevronRight size={16} color="var(--t3, #94a3b8)" style={{ flexShrink: 0 }} />}
    </div>
  )
}

/* ── Password Change Modal ──────────────── */
function PasswordModal({ open, onClose }) {
  const [form, set] = useState({ oldPassword: '', newPassword: '' })
  const [show, setShow] = useState({ old: false, new: false })
  const [loading, setLoading] = useState(false)
  const f = k => e => set(p => ({ ...p, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.ok("Parol muvaffaqiyatli o'zgartirildi!")
      setLoading(false)
      onClose()
      set({ oldPassword: '', newPassword: '' })
    }, 1000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Parolni o'zgartirish">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Joriy parol"
          icon={Lock}
          type={show.old ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.oldPassword}
          onChange={f('oldPassword')}
          required
          suffix={
            <button type="button" onClick={() => setShow(s => ({ ...s, old: !s.old }))} style={{ color: 'var(--t3)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              {show.old ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Input
          label="Yangi parol"
          icon={Lock}
          type={show.new ? 'text' : 'password'}
          placeholder="Kamida 8 belgi..."
          value={form.newPassword}
          onChange={f('newPassword')}
          required
          suffix={
            <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))} style={{ color: 'var(--t3)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <div style={{ background: 'var(--bg-3, #f8fafc)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--bd, #e2e8f0)' }}>
          {['Kamida 8 ta belgi', 'Katta va kichik harf', 'Raqam yoki maxsus belgi (@$!%*?&)'].map(r => (
            <p key={r} style={{ fontSize: 12, color: 'var(--t2, #475569)', lineHeight: 1.8, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--brand, #6366f1)', fontWeight: 'bold' }}>✓</span> {r}
            </p>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Btn type="button" variant="secondary" size="md" onClick={onClose} style={{ flex: 1 }}>Bekor</Btn>
          <Btn type="submit" variant="brand" size="md" full loading={loading} icon={CheckCircle} style={{ flex: 2 }}>Saqlash</Btn>
        </div>
      </form>
    </Modal>
  )
}

/* ── Language Modal ─────────────────────── */
const LANGS = [
  { code: 'uz', flag: '🇺🇿', name: "O'zbek tili" },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'kk', flag: '🇰🇿', name: 'Қазақша' },
]

function LangModal({ open, onClose, current, onChange }) {
  return (
    <Modal open={open} onClose={onClose} title="Tilni tanlang">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => { onChange(l.code); toast.ok(`${l.name} tanlandi`); onClose() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 14px', borderRadius: 10,
              background: current === l.code ? 'var(--brand-soft, rgba(99,102,241,0.06))' : 'var(--bg-2, #ffffff)',
              border: `1.5px solid ${current === l.code ? 'var(--brand, #6366f1)' : 'var(--bd, #e2e8f0)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
              width: '100%'
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{l.flag}</span>
            <span style={{ fontSize: 15, fontWeight: 600, flex: 1, textAlign: 'left', color: current === l.code ? 'var(--brand, #6366f1)' : 'var(--t1, #0f172a)' }}>
              {l.name}
            </span>
            {current === l.code && <CheckCircle size={18} color="var(--brand, #6366f1)" style={{ flexShrink: 0 }} />}
          </button>
        ))}
      </div>
    </Modal>
  )
}

/* ── Logout Modal ───────────────────────── */
function LogoutModal({ open, onClose, onLogout }) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    await onLogout()
    setLoading(false)
  }
  return (
    <Modal open={open} onClose={onClose} title="Tizimdan chiqish">
      <p style={{ fontSize: 14, color: 'var(--t2, #475569)', lineHeight: 1.6, marginBottom: 24, marginTop: 0 }}>
        Developer consoldan chiqmoqchimisiz? Barcha faol sessiyalar saqlanib qoladi.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="secondary" size="md" full onClick={onClose} style={{ flex: 1 }}>Bekor</Btn>
        <Btn variant="danger" size="md" full onClick={handle} loading={loading} icon={LogOut} style={{ flex: 1 }}>Chiqish</Btn>
      </div>
    </Modal>
  )
}

/* ── Profile Edit Modal ─────────────────── */
function ProfileModal({ open, onClose, dev }) {
  const { setDev } = useAuth()
  const [form, set] = useState({ fullName: dev?.fullName || '', companyName: dev?.companyName || '', website: dev?.website || '' })
  const [loading, setLoading] = useState(false)
  const f = k => e => set(p => ({ ...p, [k]: e.target.value }))

  const save = async e => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setDev({ ...dev, ...form })
      toast.ok('Profil yangilandi!')
      setLoading(false)
      onClose()
    }, 800)
  }

  return (
    <Modal open={open} onClose={onClose} title="Profilni tahrirlash">
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="To'liq ism" icon={User} placeholder="Ali Valiyev" value={form.fullName} onChange={f('fullName')} />
        <Input label="Kompaniya" icon={Building2} placeholder="My Company" value={form.companyName} onChange={f('companyName')} />
        <Input label="Vebsayt" icon={ExternalLink} type="url" placeholder="https://company.com" value={form.website} onChange={f('website')} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Btn type="button" variant="secondary" size="md" onClick={onClose} style={{ flex: 1 }}>Bekor</Btn>
          <Btn type="submit" variant="brand" size="md" full loading={loading} icon={CheckCircle} style={{ flex: 2 }}>Saqlash</Btn>
        </div>
      </form>
    </Modal>
  )
}

/* ══ SETTINGS PAGE ══════════════════════════ */
export function SettingsPagebek() {
  const nav = useNavigate()
  const { dev, logout } = useAuth()
  const [modal, setModal] = useState(null)
  const [lang, setLang] = useState('uz')
  const [notifs, setNotifs] = useState(true)

  const handleLogout = async () => {
    await logout()
    nav('/login', { replace: true })
  }

  const langLabel = LANGS.find(l => l.code === lang)?.name || "O'zbek tili"
  const initials = (dev?.fullName || dev?.companyName || 'Dev').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const APP_VERSION = '1.0.0'
  const BUILD = '2025.06'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-1, #f1f5f9)' }}>
      {/* ── TOPBAR ── */}
      <div className="topbar" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: 56, 
        padding: '0 20px', 
        background: 'var(--bg-2, #ffffff)', 
        borderBottom: '1px solid var(--bd, #e2e8f0)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--t1, #0f172a)' }}>Sozlamalar</p>
      </div>

      {/* ── MAIN CONTENT PAGE CONTAINER ── */}
      <div className="page" style={{ flex: 1, padding: '16px 0', maxWidth: 600, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* ── PROFILE HEADER ── */}
        <div style={{
          margin: '0 16px 20px 16px',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(99,102,241,0.06))',
          border: '1px solid var(--bd, #e2e8f0)',
          borderRadius: 16,
          padding: '18px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
        onClick={() => setModal('profile')}
        >
          <Avatar name={initials} size={52} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--t1, #0f172a)' }} className="truncate">{dev?.companyName || dev?.fullName || 'Developer'}</p>
            <p style={{ fontSize: 12, color: 'var(--t2, #475569)', marginTop: 3, margin: 0 }} className="truncate">{dev?.email}</p>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color:`${dev.isVerified?'#10b981':'orange'}`, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 99 }}>
                {dev.isVerified?"✓ Tasdiqlangan":"Tasdiqlanmagan"}
              </span>
            </div>
          </div>
          <ChevronRight size={18} color="var(--t3, #94a3b8)" style={{ flexShrink: 0 }} />
        </div>

        {/* ── ACCOUNT ── */}
        <p className="sec-title" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--t3, #64748b)', margin: '0 16px 8px 20px' }}>Hisob</p>
        <div style={{ margin: '0 16px 20px 16px', background: 'var(--bg-2, #ffffff)', border: '1px solid var(--bd, #e2e8f0)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
          <MenuRow
            icon={User} label="Profilni tahrirlash" sub="Ism, kompaniya, vebsayt"
            color="var(--brand, #6366f1)" onClick={() => setModal('profile')}
          />
          <div className="divider" style={{ height: 1, background: 'var(--bd, #e2e8f0)', marginLeft: 64 }} />
          <MenuRow
            icon={Lock} label="Parolni o'zgartirish" sub="Xavfsizlik sozlamalari"
            color="#ec4899" onClick={() => setModal('password')}
          />
          <div className="divider" style={{ height: 1, background: 'var(--bd, #e2e8f0)', marginLeft: 64 }} />
          <MenuRow
            icon={Mail} label="Email" sub={dev?.email || '—'}
            color="#3b82f6" right={<span />}
          />
        </div>

        {/* ── NOTIFICATIONS ── */}
        <p className="sec-title" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--t3, #64748b)', margin: '0 16px 8px 20px' }}>Bildirishnomalar</p>
        <div style={{ margin: '0 16px 20px 16px', background: 'var(--bg-2, #ffffff)', border: '1px solid var(--bd, #e2e8f0)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
          <div className="list-row" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
            <div className="list-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.1)', flexShrink: 0 }}>
              <Bell size={18} color="var(--amber, #f59e0b)" />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontSize: 14, fontWeight: 550, margin: 0, color: 'var(--t1, #0f172a)' }}>Push bildirishnomalar</p>
              <p style={{ fontSize: 12, color: 'var(--t3, #64748b)', marginTop: 2, margin: 0 }}>Ilova holati yangilanishlari</p>
            </div>
            <Toggle on={notifs} onChange={setNotifs} />
          </div>
        </div>

        {/* ── PREFERENCES ── */}
        <p className="sec-title" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--t3, #64748b)', margin: '0 16px 8px 20px' }}>Afzalliklar</p>
        <div style={{ margin: '0 16px 20px 16px', background: 'var(--bg-2, #ffffff)', border: '1px solid var(--bd, #e2e8f0)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
          <MenuRow
            icon={Globe} label="Interfeys tili" sub={langLabel}
            color="#8b5cf6" onClick={() => setModal('lang')}
            badge={LANGS.find(l => l.code === lang)?.flag}
            right={<ChevronRight size={16} color="var(--t3, #94a3b8)" />}
          />
        </div>

        {/* ── DEV RESOURCES ── */}
        <p className="sec-title" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--t3, #64748b)', margin: '0 16px 8px 20px' }}>Resurslar</p>
        <div style={{ margin: '0 16px 20px 16px', background: 'var(--bg-2, #ffffff)', border: '1px solid var(--bd, #e2e8f0)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
          {[
            { icon: Code2,       label: 'API Hujjatlar',    sub: 'docs.joranet.uz',      color: '#10b981' },
            { icon: Shield,      label: 'Xavfsizlik siyosati', sub: 'Maxfiylik va shart-sharoitlar', color: '#64748b' },
            { icon: ExternalLink, label: 'JoraApps saytiga o\'tish', sub: 'joraapps.vercel.app', color: '#3b82f6' },
          ].map((item, i, arr) => (
            <div key={item.label}>
              <MenuRow {...item} onClick={() => window.open('https://' + item.sub, '_blank')} />
              {i < arr.length - 1 && <div className="divider" style={{ height: 1, background: 'var(--bd, #e2e8f0)', marginLeft: 64 }} />}
            </div>
          ))}
        </div>

        {/* ── APP INFO ── */}
        <p className="sec-title" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--t3, #64748b)', margin: '0 16px 8px 20px' }}>Ilova haqida</p>
        <div style={{ margin: '0 16px 20px 16px', background: 'var(--bg-2, #ffffff)', border: '1px solid var(--bd, #e2e8f0)', borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, var(--brand, #6366f1), #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Code2 size={20} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: 'var(--t1, #0f172a)' }}>JoraApps Dev Console</p>
              <p style={{ fontSize: 12, color: 'var(--t3, #64748b)', marginTop: 2, margin: 0 }}>v{APP_VERSION} · Build {BUILD}</p>
            </div>
          </div>
          {[
            { label: 'Versiya',   val: `v${APP_VERSION}` },
            { label: 'Build',     val: BUILD },
            { label: 'API',       val: 'v1' },
            { label: 'Muhit',     val: 'Production' },
          ].map((row, i, arr) => (
            <div key={row.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--t2, #475569)' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1, #0f172a)' }}>{row.val}</span>
              </div>
              {i < arr.length - 1 && <div className="divider" style={{ height: 1, background: 'var(--bd, #e2e8f0)' }} />}
            </div>
          ))}
        </div>

        {/* ── LOGOUT BUTTON ── */}
        <div style={{ margin: '24px 16px' }}>
          <Btn
            variant="danger" size="lg" full
            icon={LogOut}
            onClick={() => setModal('logout')}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', height: 'auto', borderRadius: 10, fontWeight: 600 }}
          >
            Tizimdan chiqish
          </Btn>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--t4, #94a3b8)', padding: '8px 0 24px 0', margin: 0 }}>
          © 2026 JoraApps · sjorabek42@gmail.com
        </p>
      </div>

      {/* Modals */}
      <PasswordModal open={modal === 'password'} onClose={() => setModal(null)} />
      <LangModal     open={modal === 'lang'}     onClose={() => setModal(null)} current={lang} onChange={setLang} />
      <LogoutModal   open={modal === 'logout'}   onClose={() => setModal(null)} onLogout={handleLogout} />
      <ProfileModal  open={modal === 'profile'}  onClose={() => setModal(null)} dev={dev} />
    </div>
  )
}