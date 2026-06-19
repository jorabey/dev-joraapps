import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft, Building2, Globe, CheckCircle, Clock, ShieldOff, Code2 } from 'lucide-react'
import { useAuth, useLang } from '../store'
import { Btn, Input, PasswordInput, InfoBox } from '../components/ui'

/* ── Shell ─────────────────────────────── */
function AuthShell({ children, title, sub, wide }) {
  const { t } = useLang()
  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.06), transparent)',
    }}>
      {/* Left panel - desktop only */}
      <div style={{
        flex:1,
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        padding:'60px 48px',
        borderRight:'1px solid var(--bd)',
        background:'var(--bg-1)',
      }} className="auth-left">
        <div style={{maxWidth:420}}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:40}}>
            <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,var(--brand),#e11d48)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Code2 size={20} color="#fff" strokeWidth={2.5}/>
            </div>
            <div>
              <p style={{fontWeight:800,fontSize:16,letterSpacing:'-0.02em'}}>JoraApps</p>
              <p style={{fontSize:11,color:'var(--t4)'}}>Developer Console</p>
            </div>
          </div>

          <h1 style={{fontSize:32,fontWeight:800,letterSpacing:'-0.04em',lineHeight:1.2,marginBottom:16}}>
            Build amazing<br/>
            <span style={{color:'var(--brand)'}}>integrations</span>
          </h1>
          <p style={{fontSize:14,color:'var(--t3)',lineHeight:1.8,marginBottom:32}}>
            JoraApps Developer Platform — ilovangizni millionlab foydalanuvchilarga ulang.
            Real-time analytics, secure API keys, va developer tools barchasi bir joyda.
          </p>

          {/* Feature list */}
          {[
            '🔐 AES-256 shifrlangan API kalitlar',
            '📊 Real-time foydalanuvchi tahlili',
            '⚡ Tezkor Bridge API integratsiyasi',
            '🌍 Ko\'p tilli interfeys (UZ · RU · EN)',
          ].map(f => (
            <div key={f} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:13,color:'var(--t2)'}}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        width: wide ? '520px' : '440px',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        padding:'40px 40px',
        flexShrink:0,
      }} className="auth-right">
        <div style={{maxWidth:360, margin:'0 auto', width:'100%'}}>
          {/* Mobile logo */}
          <div style={{display:'none',alignItems:'center',gap:10,marginBottom:28}} className="auth-mob-logo">
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,var(--brand),#e11d48)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Code2 size={16} color="#fff"/>
            </div>
            <span style={{fontWeight:800,fontSize:15}}>JoraApps Dev Console</span>
          </div>

          <h2 style={{fontSize:22,fontWeight:800,marginBottom:6,letterSpacing:'-0.03em'}}>{title}</h2>
          {sub && <p style={{fontSize:13,color:'var(--t3)',marginBottom:24}}>{sub}</p>}
          {children}
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .auth-left { display:none !important; }
          .auth-right { width:100% !important; padding:32px 24px !important; justify-content:flex-start !important; padding-top:48px !important; }
          .auth-mob-logo { display:flex !important; }
        }
      `}</style>
    </div>
  )
}

/* ══ LOGIN ══════════════════════════════ */
export function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const { t } = useLang()
  const [form, set] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // null | 'pending' | 'suspended'
  const [err, setErr] = useState('')
  const f = k => e => set(p => ({...p,[k]:e.target.value}))

  const submit = async e => {
    e.preventDefault()
    setErr(''); setStatus(null)
    setLoading(true)
    const res = await login(form.email, form.password)
    setLoading(false)
    if (res.ok) { nav('/dashboard'); return }
    if (res.status === 'pending')   { setStatus('pending');   return }
    if (res.status === 'suspended') { setStatus('suspended'); return }
    setErr(res.msg || t('com_error'))
  }

  if (status === 'pending') return (
    <AuthShell title={t('auth_pending_title')} sub="">
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'16px 0'}}>
        <div style={{width:64,height:64,borderRadius:18,background:'var(--amber-s)',border:'1px solid rgba(245,158,11,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Clock size={32} color="var(--amber)"/>
        </div>
        <InfoBox type="warn">{t('auth_pending_msg')}</InfoBox>
        <Btn v="secondary" sz="md" w onClick={() => setStatus(null)} icon={ArrowLeft}>Orqaga</Btn>
      </div>
    </AuthShell>
  )

  if (status === 'suspended') return (
    <AuthShell title={t('auth_suspended_title')} sub="">
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'16px 0'}}>
        <div style={{width:64,height:64,borderRadius:18,background:'var(--red-s)',border:'1px solid rgba(239,68,68,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <ShieldOff size={32} color="var(--red)"/>
        </div>
        <InfoBox type="danger">{t('auth_suspended_msg')}</InfoBox>
        <Btn v="secondary" sz="md" w onClick={() => setStatus(null)} icon={ArrowLeft}>Orqaga</Btn>
      </div>
    </AuthShell>
  )

  return (
    <AuthShell title={t('auth_login')} sub="Developer konsoliga kiring">
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
        <Input label={t('auth_email')} icon={Mail} type="email" placeholder="dev@company.com" value={form.email} onChange={f('email')} required autoComplete="email" />
        <PasswordInput label={t('auth_password')} placeholder="••••••••" value={form.password} onChange={f('password')} required autoComplete="current-password" />

        <div style={{textAlign:'right',marginTop:-4}}>
          <Link to="/forgot-pass" style={{fontSize:12,color:'var(--brand)',fontWeight:600}}>{t('auth_forgot')}</Link>
        </div>

        {err && <InfoBox type="danger">{err}</InfoBox>}

        <Btn type="submit" v="primary" sz="lg" w loading={loading} icon={ArrowRight} cls="mt-2">
          {t('auth_login')}
        </Btn>
      </form>

      <div style={{marginTop:20,textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div className="div-h" style={{flex:1}} />
          <span style={{fontSize:12,color:'var(--t4)'}}>yoki</span>
          <div className="div-h" style={{flex:1}} />
        </div>
        <p style={{fontSize:13,color:'var(--t3)'}}>
          {t('auth_no_acc')}{' '}
          <Link to="/register" style={{color:'var(--brand)',fontWeight:700}}>{t('auth_register')}</Link>
        </p>
      </div>
    </AuthShell>
  )
}

/* ══ REGISTER ════════════════════════════ */
export function RegisterPage() {
  const nav = useNavigate()
  const { register } = useAuth()
  const { t } = useLang()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [err, setErr] = useState('')
  const [form, set] = useState({ companyName:'', website:'', email:'', password:'', confirmPass:'' })
  const f = k => e => set(p => ({...p,[k]:e.target.value}))

  const steps = [
    { title:'Kompaniya', sub:'Kompaniya ma\'lumotlarini kiriting' },
    { title:'Kirish ma\'lumotlari', sub:'Email va xavfsiz parol yarating' },
  ]

  const nextStep = e => {
    e.preventDefault()
    setErr('')
    if (step === 0) { setStep(1); return }
    handleSubmit()
  }

  const handleSubmit = async () => {
    if (form.password !== form.confirmPass) { setErr('Parollar mos kelmaydi'); return }
    setLoading(true)
    const res = await register({ companyName: form.companyName, website: form.website, email: form.email, password: form.password })
    setLoading(false)
    if (res.ok) setSuccess(true)
    else setErr(res.msg || t('com_error'))
  }

  if (success) return (
    <AuthShell title="Ariza yuborildi!" sub="">
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
        <div style={{width:64,height:64,borderRadius:18,background:'var(--green-s)',border:'1px solid rgba(34,197,94,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <CheckCircle size={32} color="var(--green)"/>
        </div>
        <p style={{fontSize:14,color:'var(--t2)',textAlign:'center',lineHeight:1.8}}>
          <strong style={{color:'var(--t1)'}}>{form.companyName}</strong> nomli akkaunt yaratildi.<br/>
          Admin tasdiqlashini kuting. Tasdiqlangach, <strong style={{color:'var(--t1)'}}>{form.email}</strong> ga xabar yuboriladi.
        </p>
        <Btn v="primary" sz="lg" w onClick={() => nav('/login')} icon={ArrowRight}>Kirish sahifasiga</Btn>
      </div>
    </AuthShell>
  )

  return (
    <AuthShell title={steps[step].title} sub={steps[step].sub}>
      {/* Step indicators */}
      <div style={{display:'flex',gap:6,marginBottom:22}}>
        {steps.map((_,i) => (
          <div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=step?'var(--brand)':'var(--bg-3)',transition:'background 0.3s'}} />
        ))}
      </div>

      <form onSubmit={nextStep} style={{display:'flex',flexDirection:'column',gap:14}}>
        {step === 0 && (
          <>
            <Input label={t('auth_company')} icon={Building2} placeholder="My Company LLC" value={form.companyName} onChange={f('companyName')} required />
            <Input label={t('auth_website')} icon={Globe} type="url" placeholder="https://company.com" value={form.website} onChange={f('website')} />
          </>
        )}
        {step === 1 && (
          <>
            <Input label={t('auth_email')} icon={Mail} type="email" placeholder="dev@company.com" value={form.email} onChange={f('email')} required autoComplete="email"/>
            <PasswordInput label={t('auth_password')} placeholder="Kamida 8 belgi..." value={form.password} onChange={f('password')} required autoComplete="new-password"
              hint="Katta/kichik harf, raqam va maxsus belgi (@$!%*?&)"
            />
            <PasswordInput label={t('auth_confirm_pass')} placeholder="Parolni tasdiqlang" value={form.confirmPass} onChange={f('confirmPass')} required autoComplete="new-password"/>
          </>
        )}

        {err && <InfoBox type="danger">{err}</InfoBox>}

        <div style={{display:'flex',gap:10,marginTop:4}}>
          {step > 0 && <Btn type="button" v="secondary" sz="lg" onClick={() => setStep(0)} icon={ArrowLeft}>{t('com_back')}</Btn>}
          <Btn type="submit" v="primary" sz="lg" w loading={loading} icon={step<1?ArrowRight:CheckCircle}>
            {step < 1 ? t('com_continue') : t('auth_register')}
          </Btn>
        </div>
      </form>

      {step === 0 && (
        <p style={{textAlign:'center',fontSize:13,color:'var(--t3)',marginTop:20}}>
          {t('auth_has_acc')}{' '}
          <Link to="/login" style={{color:'var(--brand)',fontWeight:700}}>{t('auth_login')}</Link>
        </p>
      )}
    </AuthShell>
  )
}

/* ══ FORGOT PASSWORD ════════════════════ */
export function ForgotPassPage() {
  const nav = useNavigate()
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    // Simulate - server doesn't have this endpoint for dev
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <AuthShell title="Parolni tiklash" sub="Email manzilingizni kiriting">
      {sent ? (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
          <div style={{width:56,height:56,borderRadius:16,background:'var(--blue-s)',border:'1px solid rgba(59,130,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Mail size={26} color="var(--blue)"/>
          </div>
          <p style={{fontSize:14,color:'var(--t2)',textAlign:'center',lineHeight:1.8}}>
            <strong style={{color:'var(--t1)'}}>{email}</strong> ga parolni tiklash ko'rsatmalari yuborildi.
          </p>
          <Btn v="secondary" sz="lg" w onClick={() => nav('/login')} icon={ArrowLeft}>Kirishga qaytish</Btn>
        </div>
      ) : (
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label={t('auth_email')} icon={Mail} type="email" placeholder="dev@company.com" value={email} onChange={e=>setEmail(e.target.value)} required />
          <Btn type="submit" v="primary" sz="lg" w loading={loading} icon={ArrowRight}>OTP yuborish</Btn>
          <Btn type="button" v="ghost" sz="md" w onClick={() => nav('/login')} icon={ArrowLeft}>Orqaga</Btn>
        </form>
      )}
    </AuthShell>
  )
}
