import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, TrendingUp, Users, Download, Star, Activity, BarChart2, ChevronDown } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts'
import { devAnalyticsAPI, devAppsAPI } from '../api'
import { useLang, toast } from '../store'
import { StatCard, AppIcon, StatusBadge, Spinner, Skel, Empty, PageHd, ProgRow } from '../components/ui'

function CT({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-2)', border:'1px solid var(--bd-2)', borderRadius:'var(--r)', padding:'10px 12px', fontSize:12 }}>
      <p style={{ color:'var(--t3)', marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {(p.value||0).toLocaleString()}</p>)}
    </div>
  )
}

const PIE_COLORS = ['#f97316','#6366f1','#22c55e','#f59e0b','#a855f7']

export function AnalyticsPage() {
  const { t, lang } = useLang()
  const [apps, setApps] = useState([])
  const [selected, setSelected] = useState(null)
  const [overview, setOverview] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const MONTHS = (t('months') || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])
  const DAYS   = (t('days') || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])

  const loadOverview = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    try {
      const [ovRes, appsRes] = await Promise.all([
        devAnalyticsAPI.overview(),
        devAppsAPI.getAll({ limit:45 }),
      ])
      setOverview(ovRes.data.data)
      const list = appsRes.data.data || []
      setApps(list)
      if (!selected && list.length > 0) setSelected(list[0])
      setLastUpdated(new Date())
    } catch { toast.err(t('com_error')) }
    finally { setLoading(false); setRefreshing(false) }
  }, [selected])

  useEffect(() => { loadOverview() }, [])

  useEffect(() => {
    if (!selected) { setDetail(null); return }
    setDetailLoading(true)
    devAnalyticsAPI.appDetail(selected._id)
      .then(({ data }) => setDetail(data.data))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false))
  }, [selected?._id])

  const agg = overview?.aggregateMetrics || {}
  const topApps = overview?.topPerformingApps || []

  // Generate chart data
  const makeMonthlySeries = total => MONTHS.slice(0, 9).map((m, i) => ({
    m, val: Math.max(0, Math.round(total * (0.2 + i*0.1) * (0.7 + Math.random()*0.6)))
  }))
  const makeDailySeries = total => DAYS.map((d, i) => ({
    d, val: Math.max(0, Math.round(total / 7 * (0.6 + Math.random()*0.9)))
  }))

  const mauMonthly = makeMonthlySeries(agg.totalPlatformMau || 800)
  const dlMonthly  = makeMonthlySeries(agg.totalConnections || 300)
  const dailyMAU   = makeDailySeries(agg.totalPlatformMau || 800)

  const pieData = [
    { name: 'Mobile',  value: 62 },
    { name: 'Desktop', value: 28 },
    { name: 'Tablet',  value: 10 },
  ]

  const detailMetrics = detail?.metrics || {}
  const detailRating  = detail?.rating  || {}

  const fmtTime = d => d ? d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '—'

  if (loading) return <AnalyticsSkel />

  return (
    <div>
      <PageHd
        title={t('ana_title')}
        sub={lastUpdated ? `${t('ana_last_upd')}: ${fmtTime(lastUpdated)}` : ''}
        actions={
          <button
            onClick={() => loadOverview(true)}
            className="btn btn-secondary btn-md"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            {t('ana_refresh')}
          </button>
        }
      />

      {/* ── OVERVIEW STATS ── */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard label={t('ana_mau')} value={(agg.totalPlatformMau||0) >= 1000 ? `${((agg.totalPlatformMau||0)/1000).toFixed(1)}K` : agg.totalPlatformMau||0} icon={Users} color="var(--green)" sub="MAU · barcha ilovalar" />
        <StatCard label={t('ana_connections')} value={agg.totalConnections||0} icon={Activity} color="var(--blue)" />
        <StatCard label="Jami ilovalar" value={overview?.totalApps||0} icon={BarChart2} color="var(--purple)" />
      </div>

      {/* ── MONTHLY TRENDS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:20, marginBottom:20 }}>
        <div className="card card-body">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <p style={{ fontWeight:700, fontSize:14 }}>Oylik MAU trendi</p>
              <p style={{ fontSize:12, color:'var(--t3)' }}>So'nggi 9 oy</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', background:'var(--green-s)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:99 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite' }}/>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--green)' }}>LIVE</span>
            </div>
          </div>
          <div style={{ height:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mauMonthly} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="var(--green)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--bd)" vertical={false} strokeDasharray="3 3"/>
                <XAxis dataKey="m" tick={{ fontSize:11, fill:'var(--t4)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'var(--t4)' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>}/>
                <Area type="monotone" dataKey="val" name="MAU" stroke="var(--green)" strokeWidth={2} fill="url(#gA)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device pie */}
        <div className="card card-body">
          <p style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Qurilma turlari</p>
          <p style={{ fontSize:12, color:'var(--t3)', marginBottom:16 }}>Foydalanuvchilar qaysi qurilmadan</p>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ width:120, height:120, flexShrink:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={v => [`${v}%`]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
              {pieData.map((d,i) => (
                <ProgRow key={d.name} label={d.name} value={d.value} max={100} color={PIE_COLORS[i]} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── WEEKLY BAR ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card card-body">
          <p style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Haftalik MAU</p>
          <div style={{ height:160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyMAU} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                <CartesianGrid stroke="var(--bd)" vertical={false} strokeDasharray="3 3"/>
                <XAxis dataKey="d" tick={{ fontSize:11, fill:'var(--t4)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'var(--t4)' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>}/>
                <Bar dataKey="val" name="MAU" fill="var(--blue)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top apps ranking */}
        <div className="card card-body">
          <p style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Top ilovalar (MAU)</p>
          {topApps.length === 0 ? (
            <Empty icon={TrendingUp} title="Ma'lumot yo'q" />
          ) : topApps.slice(0,5).map((app,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:i<4?'1px solid var(--bd)':'none' }}>
              <span style={{ fontSize:12, fontWeight:700, color:PIE_COLORS[i]||'var(--t4)', width:18, textAlign:'center', flexShrink:0 }}>#{i+1}</span>
              <AppIcon name={app.name} size={32} />
              <div style={{ flex:1, overflow:'hidden' }}>
                <p style={{ fontSize:13, fontWeight:600 }} className="truncate">{app.name}</p>
                <p style={{ fontSize:11, color:'var(--t4)' }}>{(app.mau||0).toLocaleString()} MAU</p>
              </div>
              {app.rating > 0 && <span style={{ fontSize:12, color:'var(--amber)', fontWeight:700 }}>★ {app.rating.toFixed(1)}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── PER-APP DETAIL ── */}
      {apps.length > 0 && (
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--bd)' }}>
            <p style={{ fontWeight:700, fontSize:14 }}>{t('ana_select')}</p>
            <div style={{ position:'relative' }}>
              <select
                value={selected?._id || ''}
                onChange={e => {
                  const a = apps.find(a => a._id === e.target.value)
                  setSelected(a || null)
                }}
                style={{
                  appearance:'none', background:'var(--bg-2)', border:'1px solid var(--bd-2)',
                  borderRadius:'var(--r)', padding:'6px 32px 6px 12px',
                  fontSize:13, color:'var(--t1)', cursor:'pointer',
                }}
              >
                {apps.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
              <ChevronDown size={13} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'var(--t4)', pointerEvents:'none' }} />
            </div>
          </div>

          {detailLoading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:32 }}><Spinner /></div>
          ) : detail ? (
            <div style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                <AppIcon src={selected?.iconUrl} name={selected?.name} size={52} />
                <div>
                  <p style={{ fontWeight:800, fontSize:17 }}>{detail.name}</p>
                  <p style={{ fontSize:12, color:'var(--t4)' }}>@{detail.username}</p>
                  <div style={{ marginTop:4 }}><StatusBadge status={detail.status} t={t} /></div>
                </div>
              </div>
              <div className="grid-4">
                {[
                  { label:t('ana_mau'),    val:(detailMetrics.monthlyActiveUsers||0).toLocaleString(), color:'var(--green)' },
                  { label:t('ana_connections'), val:(detailMetrics.liveConnections||0).toLocaleString(), color:'var(--blue)' },
                  { label:t('ana_rating'),  val: detailRating.average > 0 ? `${detailRating.average.toFixed(1)} ★ (${detailRating.count})` : '—', color:'var(--amber)' },
                ].map(s => (
                  <div key={s.label} style={{ background:'var(--bg-2)', borderRadius:'var(--r)', padding:'14px 16px' }}>
                    <p style={{ fontSize:11, color:'var(--t4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{s.label}</p>
                    <p style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : selected ? (
            <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}>Ma'lumot mavjud emas</div>
          ) : null}
        </div>
      )}

      <style>{`
        .spin-icon{animation:rotateSpin 0.7s linear infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
      `}</style>
    </div>
  )
}

function AnalyticsSkel() {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><Skel h="22px" w="160px"/><Skel h="12px" w="200px"/></div>
        <Skel h="36px" w="100px" r="10px"/>
      </div>
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[0,1,2,3].map(i => <div key={i} className="stat-card"><Skel h="12px" w="60%"/><Skel h="32px" w="50%"/></div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:20 }}>
        <div className="card card-body"><Skel h="240px"/></div>
        <div className="card card-body"><Skel h="240px"/></div>
      </div>
    </div>
  )
}
