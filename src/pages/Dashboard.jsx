import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Users, Download, Star, TrendingUp,
  Activity, Plus, RefreshCw, ArrowRight,
  Zap, Globe, Clock
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { devAnalyticsAPI, devAppsAPI } from '../api'
import { useAuth, useLang, toast } from '../store'
import { StatCard, AppIcon, StatusBadge, Spinner, Skel, Empty, PageHd } from '../components/ui'

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  color:'var(--blue)',
};

const IconLink = () => (
  <svg {...base}>
    <path d="M9.5 14.5l5-5" />
    <path d="M11 7l1-1a3.5 3.5 0 1 1 5 5l-1 1" />
    <path d="M13 17l-1 1a3.5 3.5 0 1 1-5-5l1-1" />
  </svg>
);

/* ── Chart Tooltip ──────────────────────── */
function CT({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-2)', border:'1px solid var(--bd-2)', borderRadius:'var(--r)', padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'var(--t3)', marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {(p.value||0).toLocaleString()}</p>
      ))}
    </div>
  )
}

function greeting(name, t) {
  const h = new Date().getHours()
  const greet = h < 12 ? 'Xayrli tong' : h < 17 ? 'Xayrli kun' : 'Yaxshi kech'
  return `${greet}, ${name || 'Developer'}!`
}

/* ── Sparkline for stat cards ───────────── */
function makeSparkData(base, n = 8) {
  return Array.from({ length: n }, (_, i) => ({
    i, v: Math.max(0, Math.round(base * (0.5 + (i / n) * 0.7) * (0.8 + Math.random() * 0.5)))
  }))
}

export function DashboardPage() {
  const nav = useNavigate()
  const { dev } = useAuth()
  const { t, lang } = useLang()
  const [overview, setOverview] = useState(null)
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [ovRes, appsRes] = await Promise.all([
        devAnalyticsAPI.overview(),
        devAppsAPI.getAll({ limit: 5 }),
      ])
      setOverview(ovRes.data.data)
      setApps(appsRes.data.data || [])
    } catch (e) {
      if (!silent) toast.err(t('com_error'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const agg = overview?.aggregateMetrics || {}
  const topApps = overview?.topPerformingApps || []

  // Monthly chart data
  const MONTHS = t('months') || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep']
  const monthlyData = MONTHS.slice(0, 8).map((m, i) => ({
    m,
    mau: Math.max(0, Math.round((agg.totalPlatformMau || 500) * (0.3 + i * 0.1) * (0.8 + Math.random() * 0.4))),
    dl:  Math.max(0, Math.round((agg.totalDownloads || 200) * (0.3 + i * 0.1) * (0.7 + Math.random() * 0.5))),
  }))

  // Live apps count
  const liveCount = apps.filter(a => a.status === 'live').length
  const reviewCount = apps.filter(a => a.status === 'under_review').length

  return (
    <div>
      {/* Header */}
      <div className="page-hd">
        <div className="page-hd-left">
          <h1 className="page-hd-title">{t('dash_title')}</h1>
          <p className="page-hd-sub">{greeting(dev?.companyName || dev?.fullName, t)}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={() => load(true)}
            className={`btn btn-secondary btn-md`}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            {t('ana_refresh')}
          </button>
          <button onClick={() => nav('/apps')} className="btn btn-primary btn-md">
            <Plus size={14} /> {t('apps_new')}
          </button>
        </div>
      </div>

      {loading ? <DashSkel /> : (
        <>
          {/* ── STAT CARDS ── */}
          <div className="grid-4" style={{ marginBottom:24 }}>
            <StatCard
              label={t('dash_total_apps')}
              value={overview?.totalApps ?? 0}
              icon={Package}
              color="var(--brand)"
              sub={`${liveCount} faol · ${reviewCount} kutmoqda`}
            />
            <StatCard
              label={t('dash_total_conn')}
              value={(agg.totalConnections || 0) >= 1000
                ? `${((agg.totalConnections||0)/1000).toFixed(1)}K`
                : (agg.totalConnections || 0)}
              icon={IconLink}
              color="var(--blue)"
            />
            <StatCard
              label={t('dash_total_mau')}
              value={(agg.totalPlatformMau || 0) >= 1000
                ? `${((agg.totalPlatformMau||0)/1000).toFixed(1)}K`
                : (agg.totalPlatformMau || 0)}
              icon={Users}
              color="var(--green)"
              sub="MAU"
            />
            <StatCard
              label={t('dash_avg_rating')}
              value={topApps.length
                ? (topApps.reduce((s,a) => s + (a.rating||0), 0) / topApps.length).toFixed(1) + ' ★'
                : '—'
              }
              icon={Star}
              color="var(--amber)"
            />
          </div>

          {/* ── CHART + QUICK STATS ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, marginBottom:24 }}>
            {/* Chart */}
            <div className="card card-body">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:15 }}>Oylik o'sish</p>
                  <p style={{ fontSize:12, color:'var(--t3)' }}>MAU va yuklanishlar trendi</p>
                </div>
                <div style={{ display:'flex', gap:14 }}>
                  {[{c:'var(--green)',l:'MAU'},{c:'var(--brand)',l:'Yuklanish'}].map(x => (
                    <span key={x.l} style={{ fontSize:11, display:'flex', alignItems:'center', gap:5, color:'var(--t2)' }}>
                      <span style={{ width:10,height:3,borderRadius:99,background:x.c,display:'inline-block' }} />
                      {x.l}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ height:200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--green)" stopOpacity={0.25}/>
                        <stop offset="100%" stopColor="var(--green)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.25}/>
                        <stop offset="100%" stopColor="var(--brand)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--bd)" vertical={false} strokeDasharray="3 3"/>
                    <XAxis dataKey="m" tick={{ fontSize:11, fill:'var(--t4)' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:'var(--t4)' }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CT/>}/>
                    <Area type="monotone" dataKey="mau" name="MAU" stroke="var(--green)" strokeWidth={2} fill="url(#gM)" dot={false}/>
                    <Area type="monotone" dataKey="dl"  name="Yuklanish" stroke="var(--brand)" strokeWidth={2} fill="url(#gD)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {/* Status breakdown */}
              <div className="card card-body" style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Ilova holatlari</p>
                {[
                  { label:'Faol (Live)', val: liveCount, color:'var(--green)' },
                  { label:"Ko'rib chiqilmoqda", val: reviewCount, color:'var(--amber)' },
                  { label:'Bloklangan', val: apps.filter(a=>a.status==='suspended').length, color:'var(--red)' },
                  { label:'Jami', val: apps.length, color:'var(--t2)' },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--bd)' }}>
                    <span style={{ fontSize:12, color:'var(--t3)' }}>{row.label}</span>
                    <span style={{ fontSize:15, fontWeight:800, color:row.color }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="card card-body">
                <p style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Tezkor amallar</p>
                {[
                  { label:'Yangi ilova', icon:Plus, action: () => nav('/apps'), color:'var(--brand)' },
                  { label:'API kalitlari', icon:Zap, action: () => nav('/api-keys'), color:'var(--purple)' },
                  { label:'Tahlillar', icon:Activity, action: () => nav('/analytics'), color:'var(--green)' },
                  { label:'Hujjatlar', icon:Globe, action: () => nav('/docs'), color:'var(--blue)' },
                ].map(a => (
                  <button key={a.label} onClick={a.action} style={{
                    width:'100%', display:'flex', alignItems:'center', gap:10,
                    padding:'7px 0', background:'none', border:'none', cursor:'pointer',
                    borderBottom:'1px solid var(--bd)', color:'var(--t2)',
                    fontSize:12, fontWeight:500, transition:'color 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = a.color}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}
                  >
                    <a.icon size={14} />
                    {a.label}
                    <ArrowRight size={12} style={{ marginLeft:'auto' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── TOP APPS + MY APPS ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Top apps */}
            <div className="card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 12px' }}>
                <p style={{ fontWeight:700, fontSize:14 }}>{t('dash_top_apps')}</p>
                <button onClick={() => nav('/analytics')} style={{ fontSize:12, color:'var(--brand)', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                  Hammasi <ArrowRight size={12}/>
                </button>
              </div>
              {topApps.length === 0 ? (
                <Empty icon={TrendingUp} title="Ma'lumot yo'q" />
              ) : topApps.slice(0,4).map((app,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', borderTop:'1px solid var(--bd)' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--t4)', width:18, textAlign:'center' }}>#{i+1}</span>
                  <AppIcon name={app.name} size={34} />
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <p style={{ fontSize:13, fontWeight:600 }} className="truncate">{app.name}</p>
                    <p style={{ fontSize:11, color:'var(--t4)' }}>{(app.mau||0).toLocaleString()} MAU</p>
                  </div>
                  {app.rating > 0 && (
                    <span style={{ fontSize:12, color:'var(--amber)', fontWeight:700 }}>★ {app.rating.toFixed(1)}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Recent apps */}
            <div className="card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 12px' }}>
                <p style={{ fontWeight:700, fontSize:14 }}>So'nggi ilovalar</p>
                <button onClick={() => nav('/apps')} style={{ fontSize:12, color:'var(--brand)', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                  Barchasi <ArrowRight size={12}/>
                </button>
              </div>
              {apps.length === 0 ? (
                <Empty icon={Package} title="Ilova yo'q" action={
                  <button onClick={() => nav('/apps')} className="btn btn-primary btn-sm">
                    <Plus size={13}/> Yaratish
                  </button>
                }/>
              ) : apps.slice(0,4).map((app,i) => (
                <div key={app._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', borderTop:'1px solid var(--bd)', cursor:'pointer' }}
                  onClick={() => nav('/apps')}
                >
                  <AppIcon src={app.iconUrl} name={app.name} size={34} />
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <p style={{ fontSize:13, fontWeight:600 }} className="truncate">{app.name}</p>
                    <p style={{ fontSize:11, color:'var(--t4)' }}>@{app.username}</p>
                  </div>
                  <StatusBadge status={app.status} t={t} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`.spin-icon{animation:rotateSpin 0.7s linear infinite}`}</style>
    </div>
  )
}

function DashSkel() {
  return (
    <div>
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <Skel h="12px" w="60%" />
              <Skel h="34px" w="34px" r="10px" />
            </div>
            <Skel h="32px" w="50%" />
            <Skel h="10px" w="70%" />
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <div className="card card-body"><Skel h="240px" /></div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card card-body" style={{ flex:1 }}><Skel h="160px" /></div>
          <div className="card card-body"><Skel h="120px" /></div>
        </div>
      </div>
    </div>
  )
}
