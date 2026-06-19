import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Edit3, Trash2, Key, RefreshCw, Search,
  ExternalLink, Copy, CheckCheck, AlertTriangle,
  Globe, CheckCircle, MoreHorizontal, ChevronDown, X,Package
} from 'lucide-react'
import { devAppsAPI, devKeysAPI } from '../api'
import { useLang, toast } from '../store'
import {
  Btn, Input, Textarea, Modal, AppIcon, StatusBadge,
  CopyField, Spinner, Skel, Empty, InfoBox, PageHd, TableWrap
} from '../components/ui'

/* ══════════════════════════════
   APP FORM MODAL
══════════════════════════════ */
function AppFormModal({ open, onClose, onSaved, editApp }) {
  const { t } = useLang()
  const isEdit = !!editApp
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', username:'', description:'', appUrl:'', iconUrl:'' })
  const [errors, setErrors] = useState({})
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  useEffect(() => {
    if (editApp) setForm({ name:editApp.name||'', username:editApp.username||'', description:editApp.description||'', appUrl:editApp.appUrl||'', iconUrl:editApp.iconUrl||'' })
    else setForm({ name:'', username:'', description:'', appUrl:'', iconUrl:'' })
    setErrors({})
  }, [editApp, open])

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name = 'Ilova nomi shart'
    if (!isEdit && !form.username.trim()) e.username = 'Username shart'
    if (!form.description.trim()) e.description = 'Tavsif shart'
    if (!form.appUrl.trim())      e.appUrl = 'URL shart'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (isEdit) {
        await devAppsAPI.update(editApp._id, { name:form.name, description:form.description, appUrl:form.appUrl, iconUrl:form.iconUrl })
        toast.ok(t('com_saved'))
        onSaved?.()
      } else {
        const { data } = await devAppsAPI.create(form)
        onSaved?.(data.data, true)
      }
      onClose()
    } catch (err) {
      toast.err(err.response?.data?.message || t('com_error'))
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t('apps_edit') : t('apps_create')} maxW={520}>
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns: isEdit ? '1fr' : '1fr 1fr', gap:12 }}>
          <Input label={t('apps_name')} placeholder="My Awesome App" value={form.name} onChange={f('name')} error={errors.name} required />
          {!isEdit && (
            <Input
              label={t('apps_username')}
              placeholder="my-app"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'') }))}
              error={errors.username}
              hint="faqat kichik harf, raqam, chiziqcha"
              required
            />
          )}
        </div>
        <Textarea label={t('apps_desc')} placeholder="Ilovangiz haqida..." value={form.description} onChange={f('description')} error={errors.description} required />
        <Input label={t('apps_url')} icon={Globe} type="url" placeholder="https://myapp.com" value={form.appUrl} onChange={f('appUrl')} error={errors.appUrl} required />
        <Input label={t('apps_icon')} icon={ExternalLink} type="url" placeholder="https://myapp.com/icon.png" value={form.iconUrl} onChange={f('iconUrl')} />

        {!isEdit && <InfoBox type="warn">{t('secret_warn')}</InfoBox>}

        <div style={{ display:'flex', gap:10, paddingTop:4 }}>
          <Btn v="secondary" sz="md" onClick={onClose}>{t('apps_cancel')}</Btn>
          <Btn type="submit" v="primary" sz="md" w loading={loading} icon={isEdit ? CheckCircle : Plus}>
            {isEdit ? t('apps_save') : t('apps_create')}
          </Btn>
        </div>
      </form>
    </Modal>
  )
}

/* ══════════════════════════════
   SECRET ONE-TIME MODAL
══════════════════════════════ */
function SecretModal({ open, onClose, data, t }) {
  if (!data) return null
  return (
    <Modal open={open} onClose={onClose} title="🎉 " maxW={480}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <InfoBox type="danger">
          <strong>{t('secret_warn')}</strong>
        </InfoBox>
        <CopyField label={t('secret_token')} value={data.app?.appToken || ''} t={t} />
        <CopyField label={t('secret_secret')} value={data.rawSecret || ''} secret t={t} />
        <Btn v="primary" sz="lg" w onClick={onClose} icon={CheckCircle}>{t('secret_copied')}</Btn>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════
   API KEYS MODAL
══════════════════════════════ */
function ApiKeysModal({ open, onClose, app, t }) {
  const [keys, setKeys] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regenLoading, setRegenLoading] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [newSecret, setNewSecret] = useState(null)

  useEffect(() => {
    if (!open || !app) return
    setLoading(true); setConfirmRegen(false); setNewSecret(null)
    devKeysAPI.get(app._id)
      .then(({ data }) => setKeys(data.data))
      .catch(e => toast.err(e.response?.data?.message || t('com_error')))
      .finally(() => setLoading(false))
  }, [open, app?._id])

  const regen = async () => {
    setRegenLoading(true)
    try {
      const { data } = await devKeysAPI.regen(app._id)
      setNewSecret(data.data)
      setKeys(data.data)
      setConfirmRegen(false)
      toast.ok(t('com_saved'))
    } catch (e) { toast.err(e.response?.data?.message || t('com_error')) }
    finally { setRegenLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={`${t('keys_title')} — ${app?.name}`} maxW={500}>
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:32 }}><Spinner /></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <CopyField label={t('keys_token')} value={keys?.appToken || ''} t={t} />
          <CopyField label={t('keys_secret')} value={keys?.appSecret || '(Faqat yaratilganda ko\'rsatiladi)'} secret t={t} />

          {newSecret && (
            <InfoBox type="success">Yangi kalitlar muvaffaqiyatli yaratildi!</InfoBox>
          )}

          <div className="div-h" />

          {!confirmRegen ? (
            <Btn v="danger" sz="md" icon={RefreshCw} onClick={() => setConfirmRegen(true)}>
              {t('keys_regen')}
            </Btn>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <InfoBox type="danger">{t('keys_regen_warn')} Barcha mavjud integratsiyalar uziladi.</InfoBox>
              <div style={{ display:'flex', gap:8 }}>
                <Btn v="secondary" sz="md" w onClick={() => setConfirmRegen(false)}>{t('apps_cancel')}</Btn>
                <Btn v="danger" sz="md" w loading={regenLoading} icon={RefreshCw} onClick={regen}>{t('keys_confirm')}</Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

/* ══════════════════════════════
   DELETE MODAL
══════════════════════════════ */
function DeleteModal({ open, onClose, app, onDeleted, t }) {
  const [typed, setTyped] = useState('')
  const [loading, setLoading] = useState(false)
  const match = typed === app?.username

  useEffect(() => { if (open) setTyped('') }, [open])

  const del = async () => {
    setLoading(true)
    try {
      await devAppsAPI.delete(app._id)
      toast.ok(t('com_deleted'))
      onDeleted?.()
      onClose()
    } catch (e) { toast.err(e.response?.data?.message || t('com_error')) }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('apps_confirm_delete')} maxW={440}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:'var(--bg-2)', borderRadius:'var(--r)' }}>
          <AppIcon name={app?.name} size={40} />
          <div>
            <p style={{ fontWeight:700 }}>{app?.name}</p>
            <p style={{ fontSize:12, color:'var(--t4)' }}>@{app?.username}</p>
          </div>
        </div>
        <InfoBox type="danger">{t('apps_delete_warn')}</InfoBox>
        <Input
          label={t('apps_type_username')}
          placeholder={app?.username}
          value={typed}
          onChange={e => setTyped(e.target.value)}
        />
        <div style={{ display:'flex', gap:8 }}>
          <Btn v="secondary" sz="md" w onClick={onClose}>{t('apps_cancel')}</Btn>
          <Btn v="danger" sz="md" w disabled={!match} loading={loading} icon={Trash2} onClick={del}>
            {t('apps_delete')}
          </Btn>
        </div>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════
   APPS PAGE
══════════════════════════════ */
export function AppsPage() {
  const { t } = useLang()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [secretData, setSecretData] = useState(null)
  const [editApp, setEditApp] = useState(null)
  const [keysApp, setKeysApp] = useState(null)
  const [deleteApp, setDeleteApp] = useState(null)
  const [menuApp, setMenuApp] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await devAppsAPI.getAll({ limit: 50 })
      setApps(data.data || [])
    } catch { toast.err(t('com_error')) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreated = (data, isNew) => {
    if (isNew) setSecretData(data)
    load()
  }

  // Filter + search
  const visible = apps.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.username.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || a.status === filter
    return matchSearch && matchFilter
  })

  const FILTERS = [
    { key:'all',          label:'Barchasi' },
    { key:'live',         label:t('apps_status_live') },
    { key:'under_review', label:t('apps_status_review') },
    { key:'suspended',    label:t('apps_status_suspended') },
  ]

  const formatDate = d => d ? new Date(d).toLocaleDateString('uz-UZ', { day:'2-digit', month:'short', year:'numeric' }) : '—'
  const fmtNum = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : (n || 0)

  return (
    <div>
      <PageHd
        title={t('apps_title')}
        sub={`${apps.length} ta ilova`}
        actions={
          <Btn v="primary" sz="md" icon={Plus} onClick={() => setShowCreate(true)}>
            {t('apps_new')}
          </Btn>
        }
      />

      {/* Toolbar */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        {/* Search */}
        <div className="search-box" style={{ flex:'1 1 200px', minWidth:180 }}>
          <Search size={14} color="var(--t4)" />
          <input
            placeholder={t('com_search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} style={{ display:'flex', color:'var(--t4)' }}><X size={13}/></button>}
        </div>

        {/* Filter tabs */}
        <div className="tab-list">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`tab-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >{f.label}</button>
          ))}
        </div>

        <button onClick={load} className="btn btn-secondary btn-md btn-icon btn-icon-lg" title="Yangilash">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="card card-body" style={{ display:'flex', gap:12, alignItems:'center' }}>
              <Skel h="40px" w="40px" r="10px" style={{ flexShrink:0 }} />
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                <Skel h="14px" w="40%" />
                <Skel h="11px" w="25%" />
              </div>
              <Skel h="22px" w="70px" r="99px" />
              <Skel h="28px" w="80px" r="6px" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Empty
          icon={Package}
          title={apps.length === 0 ? t('apps_empty') : `"${search}" bo'yicha natija yo'q`}
          desc={apps.length === 0 ? t('apps_empty_sub') : undefined}
          action={apps.length === 0 && (
            <Btn v="primary" sz="md" icon={Plus} onClick={() => setShowCreate(true)}>{t('apps_create')}</Btn>
          )}
        />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {visible.map(app => (
            <div key={app._id} className="card" style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                {/* Icon + info */}
                <AppIcon src={app.iconUrl} name={app.name} size={44} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <p style={{ fontWeight:700, fontSize:14 }} className="truncate">{app.name}</p>
                    <StatusBadge status={app.status} t={t} />
                  </div>
                  <p style={{ fontSize:12, color:'var(--t4)' }}>@{app.username}</p>
                </div>

                {/* Stats — hidden on small screens */}
                <div style={{ display:'flex', gap:24 }} className="app-stats">
                  {[
                    { label:'MAU', val: fmtNum(app.stats?.mau) },
                    { label:'Ulanish', val: fmtNum(app.stats?.totalConnections) },
                    { label:'Reyting', val: app.rating?.average ? `★ ${app.rating.average.toFixed(1)}` : '—' },
                    { label:'Yaratilgan', val: formatDate(app.createdAt) },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign:'center', minWidth:60 }}>
                      <p style={{ fontSize:14, fontWeight:700 }}>{s.val}</p>
                      <p style={{ fontSize:10, color:'var(--t4)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button
                    onClick={() => setKeysApp(app)}
                    className="btn btn-secondary btn-sm"
                    title={t('keys_title')}
                  >
                    <Key size={13}/> API
                  </button>
                  <button
                    onClick={() => setEditApp(app)}
                    className="btn btn-secondary btn-sm btn-icon"
                    title={t('apps_edit')}
                  >
                    <Edit3 size={13}/>
                  </button>
                  <button
                    onClick={() => setDeleteApp(app)}
                    className="btn btn-danger btn-sm btn-icon"
                    title={t('apps_delete')}
                  >
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>

              {/* Description preview */}
              {app.description && (
                <p style={{ fontSize:12, color:'var(--t3)', marginTop:10, paddingTop:10, borderTop:'1px solid var(--bd)', lineHeight:1.6 }} className="truncate">
                  {app.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AppFormModal open={showCreate} onClose={() => setShowCreate(false)} onSaved={handleCreated} />
      <AppFormModal open={!!editApp} onClose={() => setEditApp(null)} onSaved={() => { setEditApp(null); load() }} editApp={editApp} />
      <SecretModal open={!!secretData} onClose={() => { setSecretData(null); load() }} data={secretData} t={t} />
      {keysApp && <ApiKeysModal open={!!keysApp} onClose={() => setKeysApp(null)} app={keysApp} t={t} />}
      {deleteApp && <DeleteModal open={!!deleteApp} onClose={() => setDeleteApp(null)} app={deleteApp} onDeleted={load} t={t} />}

      <style>{`
        @media(max-width:900px){ .app-stats { display:none !important; } }
      `}</style>
    </div>
  )
}
