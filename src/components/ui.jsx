import { useEffect, useRef, useState } from 'react'
import { useToast } from '../store'
import { X, Check, AlertCircle, Info, AlertTriangle, Copy, CheckCheck, Eye, EyeOff } from 'lucide-react'

/* ── BTN ───────────────────────────────── */
export function Btn({ children, v='primary', sz='md', w, loading, icon:Icon, type='button', onClick, disabled, cls='', style }) {
  return (
    <button
      type={type} onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${v} btn-${sz} ${w ? 'btn-w' : ''} ${cls}`}
      style={style}
    >
      {loading ? <span className="spin" style={{width:14,height:14}} /> : Icon && <Icon size={14} />}
      {children}
    </button>
  )
}

/* ── FIELD / INPUT ─────────────────────── */
export function Field({ label, error, hint, children }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      {children}
      {hint   && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function Input({ label, error, hint, icon:Icon, suffix, type='text', cls='', ...props }) {
  return (
    <Field label={label} error={error} hint={hint}>
      <div className="inp-wrap">
        {Icon && <span className="inp-l-icon"><Icon size={14} /></span>}
        <input type={type} className={`inp ${Icon?'has-l':''} ${suffix?'has-r':''} ${cls}`} {...props} />
        {suffix && <span className="inp-r-icon">{suffix}</span>}
      </div>
    </Field>
  )
}

export function PasswordInput({ label, error, hint, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <Input
      label={label} error={error} hint={hint}
      type={show ? 'text' : 'password'}
      suffix={
        <button type="button" onClick={() => setShow(s => !s)} style={{display:'flex'}}>
          {show ? <EyeOff size={14}/> : <Eye size={14}/>}
        </button>
      }
      {...props}
    />
  )
}

export function Textarea({ label, error, hint, cls='', ...props }) {
  return (
    <Field label={label} error={error} hint={hint}>
      <textarea className={`inp ${cls}`} {...props} />
    </Field>
  )
}

export function Select({ label, error, hint, options=[], cls='', ...props }) {
  return (
    <Field label={label} error={error} hint={hint}>
      <div className="inp-wrap">
        <select className={`inp ${cls}`} {...props}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </Field>
  )
}

/* ── MODAL ─────────────────────────────── */
export function Modal({ open, onClose, title, children, maxW=480, noPad }) {
  useEffect(() => {
    if (!open) return
    const h = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: maxW }}>
        {title && (
          <div className="modal-hd">
            <h3 className="modal-title">{title}</h3>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              style={{color:'var(--t3)'}}
            ><X size={16}/></button>
          </div>
        )}
        {!noPad ? <div className="modal-body">{children}</div> : children}
      </div>
    </div>
  )
}

/* ── SPINNER ───────────────────────────── */
export function Spinner({ size=20, color }) {
  return <span className="spin" style={{width:size,height:size,borderTopColor:color||'var(--brand)'}} />
}

/* ── SKELETON ──────────────────────────── */
export function Skel({ h='14px', w='100%', r='6px', style }) {
  return <div className="skel" style={{height:h,width:w,borderRadius:r,...style}} />
}

/* ── BADGE ─────────────────────────────── */
export function Badge({ children, type='brand', dot }) {
  return <span className={`badge badge-dot-${dot?'show':'hide'} badge-${type}`} style={{...(dot?{'--dot-show':'inline'}:{})}}>{children}</span>
}

export function StatusBadge({ status, t }) {
  const map = {
    live:         { cls:'badge-live',     label: t?.('apps_status_live')     || 'Live' },
    under_review: { cls:'badge-review',   label: t?.('apps_status_review')   || 'Under Review' },
    suspended:    { cls:'badge-suspended',label: t?.('apps_status_suspended')|| 'Suspended' },
  }
  const s = map[status] || { cls:'badge-blue', label: status }
  return <span className={`badge badge-dot ${s.cls}`}>{s.label}</span>
}

/* ── APP ICON & AVATAR PALETTES ────────── */
const PALETTES = [
  ['#f97316','#ea580c'], ['#6366f1','#4f46e5'], ['#22c55e','#16a34a'],
  ['#f59e0b','#d97706'], ['#a855f7','#9333ea'], ['#3b82f6','#2563eb'],
  ['#ef4444','#dc2626'], ['#06b6d4','#0891b2'],
]

export function AppIcon({ src, name, size=40 }) {
  const idx = (name?.charCodeAt(0)||0) % PALETTES.length
  const [c1, c2] = PALETTES[idx]
  const r = Math.round(size * 0.22)
  return (
    <div style={{
      width:size, height:size, borderRadius:r, flexShrink:0,
      background: src ? 'var(--bg-3)' : `linear-gradient(135deg,${c1},${c2})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.38, fontWeight:800, color:'#fff', overflow:'hidden',
    }}>
      {src
        ? <img src={src} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'} />
        : name?.[0]?.toUpperCase()
      }
    </div>
  )
}

export function Avatar({ src, name, size=40, style }) {
  const idx = (name?.charCodeAt(0)||0) % PALETTES.length
  const [c1, c2] = PALETTES[idx]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: src ? 'var(--bg-3)' : `linear-gradient(135deg,${c1},${c2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: '#fff', overflow: 'hidden',
      userSelect: 'none',
      ...style
    }}>
      {src 
        ? <img src={src} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'} />
        : name
      }
    </div>
  )
}

/* ── COPY FIELD ────────────────────────── */
export function CopyField({ label, value, secret, t }) {
  const [copied, setCopied] = useState(false)
  const [show, setShow]     = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const display = secret && !show
    ? value.slice(0, 10) + '•'.repeat(Math.min(30, value.length - 10))
    : value

  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <div className="copy-row">
        <span className="copy-val">{display}</span>
        {secret && (
          <button
            onClick={() => setShow(s=>!s)}
            className="btn btn-ghost btn-xs"
            style={{flexShrink:0}}
          >
            {show ? <EyeOff size={12}/> : <Eye size={12}/>}
            {show ? (t?.('keys_hide')||'Hide') : (t?.('keys_show')||'Show')}
          </button>
        )}
        <button
          onClick={copy}
          className="btn btn-ghost btn-icon btn-icon-sm"
          style={{flexShrink:0, color: copied ? 'var(--green)' : 'var(--t3)'}}
          title={t?.('keys_copy')||'Copy'}
        >
          {copied ? <CheckCheck size={14}/> : <Copy size={14}/>}
        </button>
      </div>
    </div>
  )
}

/* ── TOGGLE ────────────────────────────── */
export function Toggle({ on, onChange }) {
  return <div className={`toggle ${on?'on':''}`} onClick={() => onChange?.(!on)} role="switch" />
}

/* ── INFO BOX ──────────────────────────── */
export function InfoBox({ type='info', children }) {
  const cfg = {
    info:    { Icon: Info,          color:'var(--blue)',  bg:'var(--blue-s)' },
    warn:    { Icon: AlertTriangle, color:'var(--amber)', bg:'var(--amber-s)' },
    danger:  { Icon: AlertCircle,   color:'var(--red)',   bg:'var(--red-s)' },
    success: { Icon: Check,         color:'var(--green)', bg:'var(--green-s)' },
  }[type] || {}
  return (
    <div style={{display:'flex',gap:10,padding:'10px 12px',background:cfg.bg,border:`1px solid ${cfg.color}25`,borderRadius:'var(--r)',}}>
      <cfg.Icon size={15} color={cfg.color} style={{flexShrink:0,marginTop:1}} />
      <p style={{fontSize:12,color:'var(--t2)',lineHeight:1.7}}>{children}</p>
    </div>
  )
}

/* ── EMPTY ─────────────────────────────── */
export function Empty({ icon:Icon, title, desc, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{Icon && <Icon size={24}/>}</div>
      {title && <p style={{fontWeight:700,fontSize:15}}>{title}</p>}
      {desc  && <p style={{fontSize:13,color:'var(--t3)',maxWidth:280,lineHeight:1.7}}>{desc}</p>}
      {action}
    </div>
  )
}

/* ── INFO CARD (YANGI QO'SHILDI) ───────── */
export function InfoCard({ title, subtitle, icon: Icon, color = 'var(--brand)', actions, children, style, cls = '' }) {
  return (
    <div className={`card info-card ${cls}`} style={{ background: 'var(--bg-2)', border: '1px solid var(--bd)', borderRadius: 'var(--r-lg)', padding: 16, ...style }}>
      {(title || Icon || actions) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: children ? 14 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            {Icon && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: `${color}15` }}>
                <Icon size={16} color={color} />
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              {title && <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{title}</h4>}
              {subtitle && <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--t3)' }} className="truncate">{subtitle}</p>}
            </div>
          </div>
          {actions && <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{actions}</div>}
        </div>
      )}
      {children && <div className="card-body" style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6 }}>{children}</div>}
    </div>
  )
}

/* ── STAT CARD ─────────────────────────── */
export function StatCard({ label, value, icon:Icon, color='var(--brand)', sub, delta, loading }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-lbl">{label}</span>
        {Icon && (
          <div className="stat-card-icon" style={{background:`${color}15`}}>
            <Icon size={16} color={color} />
          </div>
        )}
      </div>
      {loading
        ? <Skel h="32px" w="60%" />
        : <div className="stat-val" style={{color}}>{value}</div>
      }
      {sub && <span style={{fontSize:11,color:'var(--t4)'}}>{sub}</span>}
      {delta !== undefined && (
        <span className={`stat-delta ${delta >= 0 ? 'delta-up' : 'delta-down'}`}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          <span style={{fontWeight:400,color:'var(--t4)',marginLeft:4,fontSize:11}}>vs last month</span>
        </span>
      )}
    </div>
  )
}

/* ── PROGRESS ROW ──────────────────────── */
export function ProgRow({ label, value, max, color='var(--brand)' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value/max)*100)) : 0
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,color:'var(--t2)'}}>{label}</span>
        <span style={{fontSize:12,fontWeight:700}}>{value.toLocaleString()} <span style={{color:'var(--t4)',fontWeight:400}}>({pct}%)</span></span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{width:`${pct}%`,background:color}} />
      </div>
    </div>
  )
}

/* ── TOAST RENDERER ────────────────────── */
export function Toasts() {
  const { items, remove } = useToast()
  const icons = { success:<Check size={15} color="var(--green)"/>, error:<AlertCircle size={15} color="var(--red)"/>, info:<Info size={15} color="var(--blue)"/>, warning:<AlertTriangle size={15} color="var(--amber)"/> }
  return (
    <div className="toast-wrap">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
          {icons[t.type]}
          <span style={{flex:1}}>{t.msg}</span>
          <X size={13} color="var(--t3)" />
        </div>
      ))}
    </div>
  )
}

/* ── PAGE HEADER ───────────────────────── */
export function PageHd({ title, sub, actions }) {
  return (
    <div className="page-hd">
      <div className="page-hd-left">
        <h1 className="page-hd-title">{title}</h1>
        {sub && <p className="page-hd-sub">{sub}</p>}
      </div>
      {actions && <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>{actions}</div>}
    </div>
  )
}

/* ── TABLE WRAP ────────────────────────── */
export function TableWrap({ children }) {
  return <div className="table-wrap card"><table className="table">{children}</table></div>
}

/* ── FULL PAGE LOADER ──────────────────── */
export function FullLoader() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:16}}>
      <div style={{width:44,height:44,borderRadius:13,background:'linear-gradient(135deg,var(--brand),#e11d48)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'#fff'}}>D</div>
      <Spinner size={22}/>
    </div>
  )
}