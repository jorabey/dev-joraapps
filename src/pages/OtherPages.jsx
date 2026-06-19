// ════════════════════════════════════════
//   API KEYS PAGE
// ════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { Key, RefreshCw, Eye, EyeOff, Package, Globe, Lock, User, Building2, Info, Code2, ChevronRight, Bell, CheckCircle, LogOut } from 'lucide-react'
import { devAppsAPI, devKeysAPI, devAuthAPI } from '../api'
import { useLang, useAuth, toast } from '../store'
import { LANGS } from '../i18n'
import { AppIcon, StatusBadge, CopyField, Spinner, Skel, Empty, InfoBox, PageHd, Input, PasswordInput, Modal, Btn } from '../components/ui'

export function ApiKeysPage() {
  const { t } = useLang()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [keys, setKeys] = useState(null)
  const [keysLoading, setKeysLoading] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)

  useEffect(() => {
    devAppsAPI.getAll({ limit:50 })
      .then(({ data }) => {
        const list = data.data || []
        setApps(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => toast.err(t('com_error')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) { setKeys(null); return }
    setKeysLoading(true)
    setConfirmRegen(false)
    devKeysAPI.get(selected._id)
      .then(({ data }) => setKeys(data.data))
      .catch(() => setKeys(null))
      .finally(() => setKeysLoading(false))
  }, [selected?._id])

  const regen = async () => {
    setRegenLoading(true)
    try {
      const { data } = await devKeysAPI.regen(selected._id)
      setKeys(data.data)
      setConfirmRegen(false)
      toast.ok(t('com_saved'))
    } catch (e) { toast.err(e.response?.data?.message || t('com_error')) }
    finally { setRegenLoading(false) }
  }

  return (
    <div>
      <PageHd title={t('keys_title')} sub="Ilovalaringizning API kalitlarini boshqaring" />

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[0,1].map(i => <div key={i} className="card card-body"><Skel h="60px"/></div>)}
        </div>
      ) : apps.length === 0 ? (
        <Empty icon={Key} title="Ilova yo'q" desc="Avval ilova yarating" />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
          {/* App list sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--t4)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4 }}>Ilovalar</p>
            {apps.map(app => (
              <button
                key={app._id}
                onClick={() => setSelected(app)}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'10px 12px', borderRadius:'var(--r)',
                  background: selected?._id === app._id ? 'var(--brand-soft)' : 'var(--bg-1)',
                  border: `1px solid ${selected?._id === app._id ? 'rgba(249,115,22,0.25)' : 'var(--bd)'}`,
                  cursor:'pointer', transition:'all 0.12s', textAlign:'left',
                }}
              >
                <AppIcon src={app.iconUrl} name={app.name} size={32} />
                <div style={{ flex:1, overflow:'hidden' }}>
                  <p style={{ fontSize:13, fontWeight:600 }} className="truncate">{app.name}</p>
                  <StatusBadge status={app.status} t={t} />
                </div>
              </button>
            ))}
          </div>

          {/* Keys panel */}
          <div>
            {!selected ? (
              <div className="card card-body" style={{ textAlign:'center', color:'var(--t3)', padding:40 }}>
                Ilova tanlang
              </div>
            ) : keysLoading ? (
              <div className="card card-body"><Skel h="200px"/></div>
            ) : (
              <div className="card card-body" style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {/* App header */}
                <div style={{ display:'flex', alignItems:'center', gap:14, paddingBottom:16, borderBottom:'1px solid var(--bd)' }}>
                  <AppIcon src={selected.iconUrl} name={selected.name} size={48} />
                  <div>
                    <p style={{ fontWeight:800, fontSize:16 }}>{selected.name}</p>
                    <p style={{ fontSize:12, color:'var(--t4)' }}>@{selected.username}</p>
                  </div>
                </div>

                <CopyField label={t('keys_token')} value={keys?.appToken || ''} t={t} />
                <CopyField label={t('keys_secret')} value={keys?.appSecret || "(Faqat yaratilganda bir marta ko'rsatiladi)"} secret t={t} />

                {/* Usage example */}
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'var(--t4)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Foydalanish misoli</p>
                  <div className="code-block">
                    <p><span style={{ color:'#7eb8f7' }}>Authorization</span>: <span style={{ color:'#a8d8a0' }}>Bearer</span> <span style={{ color:'#e3a060' }}>{keys?.appToken?.slice(0,20) || 'pk_...'}...</span></p>
                    <p style={{ marginTop:4 }}><span style={{ color:'#7eb8f7' }}>X-App-Secret</span>: <span style={{ color:'#a8d8a0' }}>sk_...</span></p>
                  </div>
                </div>

                <div className="div-h" />

                {!confirmRegen ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600 }}>{t('keys_regen')}</p>
                      <p style={{ fontSize:12, color:'var(--t4)' }}>Eski kalitlar darhol bekor qilinadi</p>
                    </div>
                    <Btn v="danger" sz="sm" icon={RefreshCw} onClick={() => setConfirmRegen(true)}>
                      {t('keys_regen')}
                    </Btn>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <InfoBox type="danger">{t('keys_regen_warn')} Barcha mavjud API integratsiyalaringiz to'xtaydi!</InfoBox>
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn v="secondary" sz="md" w onClick={() => setConfirmRegen(false)}>{t('apps_cancel')}</Btn>
                      <Btn v="danger" sz="md" w loading={regenLoading} icon={RefreshCw} onClick={regen}>{t('keys_confirm')}</Btn>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
//   DOCS PAGE
// ════════════════════════════════════════
export function DocsPage() {
  const { t } = useLang()
  const [active, setActive] = useState('intro')

  const sections = [
    { id:'intro',   label:t('docs_intro') },
    { id:'auth',    label:t('docs_auth') },
    { id:'webhook', label:t('docs_webhook') },
    { id:'errors',  label:'Xato kodlari' },
  ]

  const Content = () => {
    switch(active) {
      case 'intro': return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>JoraApps API ga xush kelibsiz</h2>
            <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.8 }}>
              JoraApps Bridge API orqali ilovangizni foydalanuvchi ma'lumotlariga ulashingiz mumkin.
              Foydalanuvchi ruxsat berganidan so'ng, siz uning profil, email va boshqa ma'lumotlariga xavfsiz kirishingiz mumkin.
            </p>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Base URL</p>
            <div className="code-block">
              <span style={{ color:'#a8d8a0' }}>https://api-joraapps.vercel.app/v1/bridge</span>
            </div>
          </div>
          <InfoBox type="info">Barcha so'rovlar HTTPS orqali amalga oshirilishi shart. HTTP so'rovlari rad etiladi.</InfoBox>
        </div>
      )
      case 'auth': return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <h2 style={{ fontSize:20, fontWeight:800 }}>{t('docs_auth')}</h2>
          <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.8 }}>
            Har bir so'rovda App Token va App Secret yuborish shart. Tokenlar header orqali yuboriladi.
          </p>
          <div>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:8, color:'var(--t3)' }}>Request headers</p>
            <div className="code-block">
              {`GET /v1/bridge/user-data HTTP/1.1\nHost: api-joraapps.vercel.app\nAuthorization: Bearer pk_your_app_token\nX-App-Secret: sk_your_app_secret\nContent-Type: application/json`}
            </div>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:8, color:'var(--t3)' }}>Muvaffaqiyatli javob</p>
            <div className="code-block">
              <span style={{ color:'#7eb8f7' }}>{`{\n  `}</span>
              <span style={{ color:'#7eb8f7' }}>"status"</span>: <span style={{ color:'#a8d8a0' }}>"success"</span>,{`\n  `}
              <span style={{ color:'#7eb8f7' }}>"data"</span>: {'{'}{`\n    `}
              <span style={{ color:'#7eb8f7' }}>"userId"</span>: <span style={{ color:'#a8d8a0' }}>"..."</span>,{`\n    `}
              <span style={{ color:'#7eb8f7' }}>"profile"</span>: {'{'} <span style={{ color:'#a8d8a0' }}>"firstName"</span>, <span style={{ color:'#a8d8a0' }}>"lastName"</span> {'}'}{`\n  }\n}`}
            </div>
          </div>
        </div>
      )
      case 'webhook': return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <h2 style={{ fontSize:20, fontWeight:800 }}>{t('docs_webhook')}</h2>
          <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.8 }}>
            Webhook orqali foydalanuvchi harakatlari haqida real-time xabarnomalar olishingiz mumkin.
          </p>
          <div>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:8, color:'var(--t3)' }}>Hodisalar (Events)</p>
            {['user.connected','user.disconnected','user.data_updated','app.rated'].map(e => (
              <div key={e} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', borderBottom:'1px solid var(--bd)' }}>
                <span className="code-inline">{e}</span>
              </div>
            ))}
          </div>
        </div>
      )
      case 'errors': return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <h2 style={{ fontSize:20, fontWeight:800 }}>HTTP Xato kodlari</h2>
          {[
            { code:'400', label:'Bad Request', desc:'So\'rov noto\'g\'ri formatda' },
            { code:'401', label:'Unauthorized', desc:'Token noto\'g\'ri yoki muddati o\'tgan' },
            { code:'403', label:'Forbidden', desc:'Ruxsat yo\'q' },
            { code:'404', label:'Not Found', desc:'Resurs topilmadi' },
            { code:'429', label:'Rate Limited', desc:'So\'rovlar chegarasi oshib ketdi' },
            { code:'500', label:'Server Error', desc:'Server xatosi' },
          ].map(e => (
            <div key={e.code} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px', background:'var(--bg-2)', borderRadius:'var(--r)', border:'1px solid var(--bd)' }}>
              <span style={{ fontSize:15, fontWeight:800, color: parseInt(e.code)>=500 ? 'var(--red)' : parseInt(e.code)>=400 ? 'var(--amber)' : 'var(--green)', minWidth:40 }}>{e.code}</span>
              <div>
                <p style={{ fontWeight:600, fontSize:14 }}>{e.label}</p>
                <p style={{ fontSize:12, color:'var(--t4)' }}>{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )
      default: return null
    }
  }

  return (
    <div>
      <PageHd title={t('docs_title')} sub="JoraApps Bridge API bo'yicha to'liq qo'llanma" />
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:24 }}>
        <nav style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} className={`nav-item ${active===s.id?'active':''}`} style={{ justifyContent:'flex-start' }}>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="card card-body" style={{ minHeight:400 }}>
          <Content />
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════
//   SETTINGS PAGE
// ════════════════════════════════════════
function MenuRow({ icon:Icon, label, sub, color='var(--brand)', onClick, right, danger }) {
  return (
    <div
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:13,
        padding:'13px 16px', cursor:onClick?'pointer':'default',
        transition:'background 0.1s', borderRadius:'var(--r)',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = 'var(--bg-2)')}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width:36, height:36, borderRadius:10, background:danger?'var(--red-s)':`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={17} color={danger?'var(--red)':color} />
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:14, fontWeight:500, color:danger?'var(--red)':'var(--t1)' }}>{label}</p>
        {sub && <p style={{ fontSize:12, color:'var(--t4)', marginTop:1 }}>{sub}</p>}
      </div>
      {right !== undefined ? right : <ChevronRight size={15} color="var(--t4)" />}
    </div>
  )
}

export function SettingsPage() {
  const { dev, logout, setDev } = useAuth()
  const { t, lang, setLang } = useLang()
  const [modal, setModal] = useState(null)
  const [logoutLoading, setLogoutLoading] = useState(false)

  // Profile form
  const [profileForm, setPF] = useState({ companyName: dev?.companyName||'', website: dev?.website||'' })
  const [profileLoading, setPL] = useState(false)

  // Password form
  const [passForm, setPassF] = useState({ oldPassword:'', newPassword:'' })
  const [passLoading, setPassL] = useState(false)

  const handleLogout = async () => {
    setLogoutLoading(true)
    await logout()
    window.location.replace('/login')
  }

  const saveProfile = async e => {
    e.preventDefault()
    setPL(true)
    await new Promise(r => setTimeout(r, 800))
    setDev({ ...dev, ...profileForm })
    toast.ok(t('com_saved'))
    setPL(false)
    setModal(null)
  }

  const savePass = async e => {
    e.preventDefault()
    if (passForm.newPassword.length < 8) { toast.err('Parol kamida 8 belgi'); return }
    setPassL(true)
    await new Promise(r => setTimeout(r, 800))
    toast.ok(t('com_saved'))
    setPassL(false)
    setPassF({ oldPassword:'', newPassword:'' })
    setModal(null)
  }

  const initials = (dev?.companyName || dev?.fullName || 'D').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div>
      <PageHd title={t('set_title')} sub="Akkaunt va interfeys sozlamalari" />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Profile card */}
          <div className="card" style={{ padding:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16, paddingBottom:16, borderBottom:'1px solid var(--bd)' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#e11d48)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:'#fff' }}>
                {initials}
              </div>
              <div style={{ flex:1, overflow:'hidden' }}>
                <p style={{ fontWeight:800, fontSize:16 }} className="truncate">{dev?.companyName || dev?.fullName}</p>
                <p style={{ fontSize:12, color:'var(--t4)' }} className="truncate">{dev?.email}</p>
                <div style={{ marginTop:4 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'var(--green)', background:'var(--green-s)', padding:'2px 8px', borderRadius:99 }}>✓ Active</span>
                </div>
              </div>
            </div>
            <MenuRow icon={User} label={t('set_profile')} sub={`${dev?.companyName || '—'} · ${dev?.website || 'Vebsayt yo\'q'}`} onClick={() => setModal('profile')} />
            <MenuRow icon={Lock} label={t('set_security')} sub={t('set_change_pass')} color="var(--blue)" onClick={() => setModal('password')} />
          </div>

          {/* Language */}
          <div className="card">
            <div style={{ padding:'16px 16px 8px' }}>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{t('set_language')}</p>
            </div>
            {LANGS.map((l, i, arr) => (
              <div key={l.code}>
                <div
                  onClick={() => { setLang(l.code); toast.info(`${l.label} tanlandi`) }}
                  style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                    cursor:'pointer', background: lang===l.code ? 'var(--brand-soft)' : 'transparent',
                    transition:'background 0.12s',
                  }}
                >
                  <span style={{ fontSize:22 }}>{l.flag}</span>
                  <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{l.label}</span>
                  {lang===l.code && <CheckCircle size={16} color="var(--brand)" />}
                </div>
                {i < arr.length-1 && <div className="div-h" style={{ marginLeft:52 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* About */}
          <div className="card">
            <div style={{ padding:'20px', borderBottom:'1px solid var(--bd)', display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,var(--brand),#e11d48)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Code2 size={22} color="#fff" />
              </div>
              <div>
                <p style={{ fontWeight:800, fontSize:15 }}>JoraNet Dev Console</p>
                <p style={{ fontSize:12, color:'var(--t4)' }}>Developer Platform</p>
              </div>
            </div>
            {[
              { l:'Versiya',  v:'v1.0.0' },
              { l:'API',      v:'v1' },
              { l:'Build',    v:'2025.06' },
              { l:'Muhit',    v:'Production' },
            ].map((r,i,arr) => (
              <div key={r.l}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px' }}>
                  <span style={{ fontSize:13, color:'var(--t3)' }}>{r.l}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{r.v}</span>
                </div>
                {i < arr.length-1 && <div className="div-h" style={{ marginLeft:16 }} />}
              </div>
            ))}
            <div style={{ padding:'14px 16px', borderTop:'1px solid var(--bd)' }}>
              <p style={{ fontSize:12, color:'var(--t4)', textAlign:'center' }}>© 2025 JoraNet · support@joranet.uz</p>
            </div>
          </div>

          {/* Danger zone */}
          <div className="card">
            <div style={{ padding:'14px 16px 8px' }}>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Xavfli zona</p>
            </div>
            <div style={{ padding:'8px 16px 16px' }}>
              <Btn v="danger" sz="md" w icon={LogOut} onClick={() => setModal('logout')} loading={logoutLoading}>
                {t('set_logout')}
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal open={modal==='profile'} onClose={() => setModal(null)} title={t('set_profile')} maxW={440}>
        <form onSubmit={saveProfile} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label={t('set_company')} icon={Building2} placeholder="My Company" value={profileForm.companyName} onChange={e => setPF(p=>({...p,companyName:e.target.value}))} />
          <Input label={t('set_website')} icon={Globe} type="url" placeholder="https://company.com" value={profileForm.website} onChange={e => setPF(p=>({...p,website:e.target.value}))} />
          <Input label={t('set_email')} value={dev?.email||''} disabled style={{ opacity:0.5 }} hint="Email o'zgartirib bo'lmaydi" />
          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <Btn v="secondary" sz="md" onClick={() => setModal(null)}>{t('apps_cancel')}</Btn>
            <Btn type="submit" v="primary" sz="md" w loading={profileLoading} icon={CheckCircle}>{t('set_save')}</Btn>
          </div>
        </form>
      </Modal>

      {/* Password Modal */}
      <Modal open={modal==='password'} onClose={() => setModal(null)} title={t('set_change_pass')} maxW={400}>
        <form onSubmit={savePass} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <PasswordInput label={t('set_old_pass')} value={passForm.oldPassword} onChange={e => setPassF(p=>({...p,oldPassword:e.target.value}))} required />
          <PasswordInput label={t('set_new_pass')} value={passForm.newPassword} onChange={e => setPassF(p=>({...p,newPassword:e.target.value}))} required hint="Kamida 8 belgi, katta/kichik harf, raqam" />
          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <Btn v="secondary" sz="md" onClick={() => setModal(null)}>{t('apps_cancel')}</Btn>
            <Btn type="submit" v="primary" sz="md" w loading={passLoading} icon={CheckCircle}>{t('set_save')}</Btn>
          </div>
        </form>
      </Modal>

      {/* Logout Modal */}
      <Modal open={modal==='logout'} onClose={() => setModal(null)} title={t('set_logout')} maxW={380}>
        <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.8, marginBottom:18 }}>{t('set_logout_confirm')}</p>
        <div style={{ display:'flex', gap:10 }}>
          <Btn v="secondary" sz="md" w onClick={() => setModal(null)}>{t('apps_cancel')}</Btn>
          <Btn v="danger" sz="md" w icon={LogOut} onClick={handleLogout} loading={logoutLoading}>{t('set_logout')}</Btn>
        </div>
      </Modal>
    </div>
  )
}
