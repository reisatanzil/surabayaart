import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

const S = {
  page: { fontFamily: 'Albert Sans, sans-serif', minHeight: '100vh', background: '#e8e4dc' },
  navbar: {
    background: 'white', padding: '0 24px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', height: 56, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    position: 'sticky', top: 0, zIndex: 10,
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  navLogoText: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#262626' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
    background: 'transparent', border: '1px solid #4D403A', borderRadius: 50,
    fontSize: 12, fontWeight: 600, color: '#4D403A', cursor: 'pointer', fontFamily: 'inherit',
  },
  hero: { height: 120, backgroundImage: 'url(/balaipemuda.png)', backgroundSize: 'cover', backgroundPosition: 'center' },
  body: { display: 'flex', padding: '16px', gap: 14, minHeight: 'calc(100vh - 176px)' },
  sidebar: { width: 210, flexShrink: 0, background: 'white', borderRadius: 10, overflow: 'hidden', height: 'fit-content' },
  sidebarTopLabel: {
    padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#4D403A', letterSpacing: 1.5,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e4dc',
  },
  sidebarProfile: { textAlign: 'center', padding: '20px 16px 16px', borderBottom: '1px solid #e8e4dc' },
  avatarCircle: {
    width: 76, height: 76, borderRadius: '50%', background: '#DFDACF',
    margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  menuItem: (active) => ({
    padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 400, color: active ? '#4D403A' : '#555',
    background: active ? '#FAF7F2' : 'transparent', borderLeft: active ? '3px solid #4D403A' : '3px solid transparent',
    borderBottom: '1px solid #f0ece4',
  }),
  content: { flex: 1 },
  card: { background: 'white', borderRadius: 10, padding: 20, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0ece4' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 10, marginBottom: 14 },
  statCard: (accent, urgent, clickable, hovered) => ({
    background: 'white', borderRadius: 10, padding: '14px 16px',
    borderTop: '4px solid ' + accent,
    boxShadow: hovered && clickable ? '0 6px 20px ' + accent + '33' : urgent ? '0 0 0 2px ' + accent + '22' : '0 1px 4px rgba(0,0,0,0.06)',
    position: 'relative', cursor: clickable ? 'pointer' : 'default',
    transform: hovered && clickable ? 'translateY(-2px)' : 'none',
    transition: 'transform 0.15s, box-shadow 0.15s',
  }),
  statNumber: (accent, isText) => ({ fontSize: isText ? 17 : 28, fontWeight: 800, color: accent, lineHeight: 1, marginBottom: 4 }),
  statLabel: { fontSize: 12, color: '#666', fontWeight: 600 },
  statSub: { fontSize: 11, color: '#aaa', marginTop: 3 },
  urgentDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: '50%', background: '#E24B4A' },
  statArrow: (accent) => ({ position: 'absolute', bottom: 10, right: 12, fontSize: 13, color: accent, opacity: 0.5 }),
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  chartCard: { background: 'white', borderRadius: 10, padding: '18px 18px 14px' },
  chartTitle: { fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 14 },
  overviewPanel: { background: 'white', borderRadius: 10, padding: 18 },
  pendingItem: { padding: '10px 12px', background: '#fff8e1', borderRadius: 8, marginBottom: 8, borderLeft: '3px solid #f57f17' },
  rowItem: { border: '1px solid #e8e4dc', borderRadius: 8, padding: 14, marginBottom: 10 },
  badge: (color, bg) => ({ fontSize: 11, padding: '2px 8px', borderRadius: 50, fontWeight: 600, background: bg, color: color }),
  btnApprove: { padding: '8px 20px', background: '#3B6D11', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnReject: { padding: '8px 20px', background: '#A32D2D', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnReview: { padding: '6px 14px', background: '#FAFBF5', border: '1px solid #e8e4dc', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit' },
  btnBlock: { padding: '6px 12px', background: '#A32D2D', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e8e4dc', fontSize: 13, outline: 'none', color: '#262626', fontFamily: 'inherit', background: 'white', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' },
  empty: { color: '#A39680', fontSize: 13, textAlign: 'center', padding: '24px 0' },
  loading: { textAlign: 'center', padding: 60, color: '#888', fontSize: 15 },
  groupHeader: {
    fontSize: 11, fontWeight: 700, color: '#4D403A', letterSpacing: 1.2,
    padding: '10px 0 8px', marginBottom: 8, borderBottom: '2px solid #e8e4dc',
    display: 'flex', alignItems: 'center', gap: 8,
  },
}

// ─── CHART COMPONENTS ────────────────────────────────────────────────────────

function DonutChart({ data }) {
  const size = 110, r = 38, cx = size / 2, cy = size / 2
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div style={{ textAlign: 'center', color: '#bbb', fontSize: 12, padding: '24px 0' }}>Belum ada data</div>
  let offset = 0
  const circumference = 2 * Math.PI * r
  const slices = data.map(d => {
    const dash = (d.value / total) * circumference
    const s = { ...d, dash, gap: circumference - dash, offset }
    offset += dash
    return s
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={'0 0 ' + size + ' ' + size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ece4" strokeWidth={15} />
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={15}
            strokeDasharray={s.dash + ' ' + s.gap} strokeDashoffset={-s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 17, fontWeight: 800, fill: '#262626', fontFamily: 'inherit' }}>{total}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" style={{ fontSize: 8, fill: '#aaa', fontFamily: 'inherit', letterSpacing: 1 }}>TOTAL</text>
      </svg>
      <div style={{ flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#555', flex: 1 }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#262626' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data, accent, barH }) {
  accent = accent || '#4D403A'
  barH = barH || 90
  if (!data || data.length === 0) return <div style={{ color: '#bbb', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>Belum ada data</div>
  const max = Math.max(...data.map(d => d.value), 1)
  const W = 260, total = data.length, gap = 5
  const barW = Math.floor((W - gap * (total - 1)) / total)
  return (
    <svg width="100%" viewBox={'0 0 ' + W + ' ' + (barH + 32)} style={{ overflow: 'visible', display: 'block' }}>
      {data.map((d, i) => {
        const bh = Math.max((d.value / max) * barH, d.value > 0 ? 4 : 0)
        const x = i * (barW + gap), y = barH - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={3} fill={accent} opacity={d.highlight ? 1 : 0.5} />
            {d.value > 0 && <text x={x + barW / 2} y={y - 3} textAnchor="middle" style={{ fontSize: 9, fill: accent, fontWeight: 700, fontFamily: 'inherit' }}>{d.value}</text>}
            <text x={x + barW / 2} y={barH + 15} textAnchor="middle" style={{ fontSize: 9, fill: '#888', fontFamily: 'inherit' }}>{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── FIX: pakai waktu_order bukan created_at ───────────────────────────────
function GrowthChart({ orders }) {
  const now = new Date()
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return {
      label: d.toLocaleDateString('id-ID', { month: 'short' }),
      year: d.getFullYear(), month: d.getMonth(),
      tiket: 0, highlight: i === 11
    }
  })
  orders.forEach(o => {
    if (!o.waktu_order) return
    const d = new Date(o.waktu_order)
    const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth())
    if (m) m.tiket += o.jumlah_item || 0
  })
  const W = 460, barH = 90, gap = 4
  const total = months.length
  const barW = Math.floor((W - gap * (total - 1)) / total)
  const max = Math.max(...months.map(m => m.tiket), 1)
  return (
    <svg width="100%" viewBox={'0 0 ' + W + ' ' + (barH + 38)} style={{ overflow: 'visible', display: 'block' }}>
      {months.map((m, i) => {
        const bh = Math.max((m.tiket / max) * barH, m.tiket > 0 ? 4 : 0)
        const x = i * (barW + gap), y = barH - bh
        return (
          <g key={i}>
            <rect x={x} y={barH} width={barW} height={3} rx={1} fill="#DFDACF" />
            <rect x={x} y={y} width={barW} height={bh} rx={3}
              fill={m.highlight ? '#4D403A' : '#A39680'} opacity={m.highlight ? 1 : 0.6} />
            {m.tiket > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                style={{ fontSize: 8, fill: '#4D403A', fontWeight: 700, fontFamily: 'inherit' }}>
                {m.tiket}
              </text>
            )}
            <text x={x + barW / 2} y={barH + 16} textAnchor="middle"
              style={{ fontSize: 8, fill: '#888', fontFamily: 'inherit' }}>
              {m.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── FIX: pakai waktu_order bukan created_at ───────────────────────────────
function MonthlyChart({ orders, accent }) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { label: d.toLocaleDateString('id-ID', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), value: 0, highlight: i === 5 }
  })
  orders.forEach(o => {
    if (!o.waktu_order) return
    const d = new Date(o.waktu_order)
    const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth())
    if (m) m.value += 1
  })
  return <BarChart data={months} accent={accent} />
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [menu, setMenu] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [hoveredStat, setHoveredStat] = useState(null)

  const [pending, setPending] = useState([])
  const [pendingEvents, setPendingEvents] = useState([])
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])

  const [orders, setOrders] = useState([])
  const [merch, setMerch] = useState([])
  const [detailOrders, setDetailOrders] = useState([])

  const [stats, setStats] = useState({
    totalUsers: 0, totalOrganizers: 0, totalEvents: 0,
    pendingOrganizers: 0, pendingEvents: 0, activeEvents: 0,
    totalOrders: 0, totalRevenue: 0, blockedUsers: 0,
  })

  const [selected, setSelected] = useState(null)
  const [alasan, setAlasan] = useState('')

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    const u = JSON.parse(data)
    if (u.role_pengguna !== 'admin') { navigate('/signin'); return }
    setUser(u)
    ambilSemua()
  }, [])

  async function ambilSemua() {
    setLoading(true)

    const [p, pe, e, u, org] = await Promise.all([
      supabase.from('penyelenggara').select('*, pengguna(*)').eq('status', 'pending'),
      supabase.from('pergelaran').select('*, penyelenggara(instansi_penyelenggara)').eq('status_validasi', false),
      supabase.from('pergelaran').select('*, penyelenggara(instansi_penyelenggara)'),
      supabase.from('pengguna').select('*').neq('role_pengguna', 'admin'),
      supabase.from('penyelenggara').select('*'),
    ])

    const pData   = p.data   || []
    const peData  = pe.data  || []
    const eData   = e.data   || []
    const uData   = u.data   || []
    const orgData = org.data || []

    setPending(pData)
    setPendingEvents(peData)
    setEvents(eData)
    setUsers(uData)

    // ─── FIX: query terpisah biar error satu tidak ganggu yang lain ───────
    const o   = await supabase
      .from('order')
      .select('*, pengguna(nama_pengguna, email_pengguna)')
      .eq('status_validasi_bayar', 'approved')
      .order('waktu_order', { ascending: false })

    const m   = await supabase
      .from('merchandise')
      .select('*')

    // ─── FIX: filter detail_order yang punya id_merchandise (pembelian merch) ─
    const do_ = await supabase
      .from('detail_order')
      .select('*, merchandise(nama_merchandise, foto_merchandise, harga_merchandise)')
      .not('id_merchandise', 'is', null)

    const oData  = o.data   || []
    const mData  = m.data   || []
    const doData = do_.data || []

    // Ambil detail_order yg approved — filter berdasarkan id_order yang ada di oData
    const approvedOrderIds = new Set(oData.map(ord => ord.id_order))
    const doDataFiltered = doData.filter(d => approvedOrderIds.has(d.id_order))

    setOrders(oData)
    setMerch(mData)
    setDetailOrders(doDataFiltered)

    setStats({
      totalUsers:        uData.length,
      totalOrganizers:   orgData.length,
      totalEvents:       eData.length,
      pendingOrganizers: pData.length,
      pendingEvents:     peData.length,
      activeEvents:      eData.filter(x => x.status_validasi).length,
      totalOrders:       oData.length,
      totalRevenue:      oData.reduce((s, r) => s + (r.total_pembayaran || 0), 0),
      blockedUsers:      uData.filter(x => x.status === 'blocked').length,
    })

    setLoading(false)
  }

  async function approveOrg(id) {
    await supabase.from('penyelenggara').update({ status: 'active' }).eq('id_penyelenggara', id)
    setSelected(null); ambilSemua()
  }
  async function rejectOrg(id) {
    if (!alasan) { alert('isi alasan penolakan dulu!'); return }
    await supabase.from('penyelenggara').update({ status: 'rejected' }).eq('id_penyelenggara', id)
    setSelected(null); setAlasan(''); ambilSemua()
  }
  async function approveEvent(id) {
    await supabase.from('pergelaran').update({ status_validasi: true }).eq('id_pergelaran', id)
    setSelected(null); ambilSemua()
  }
  async function rejectEvent(id) {
    if (!alasan) { alert('isi alasan penolakan dulu!'); return }
    await supabase.from('pergelaran').update({ status_validasi: false }).eq('id_pergelaran', id)
    setSelected(null); setAlasan(''); ambilSemua()
  }
  async function takeDown(id) {
    await supabase.from('pergelaran').update({ status_validasi: false }).eq('id_pergelaran', id)
    ambilSemua()
  }
  async function blokirUser(id) {
    await supabase.from('pengguna').update({ status: 'blocked' }).eq('id_pengguna', id)
    ambilSemua()
  }

  const formatRp   = val => 'Rp ' + Number(val || 0).toLocaleString('id-ID')
  const formatDate = str => !str ? '-' : new Date(str).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

  const statCards = [
    { label: 'Total Pengguna',    value: stats.totalUsers,             accent: '#1565c0', sub: stats.blockedUsers + ' diblokir',                                              to: 'monitoring-user' },
    { label: 'Total Organizer',   value: stats.totalOrganizers,        accent: '#2e7d32', sub: stats.pendingOrganizers + ' menunggu validasi',                                 to: 'validate-organizer' },
    { label: 'Total Event',       value: stats.totalEvents,            accent: '#6a1b9a', sub: stats.pendingEvents + ' pending · ' + stats.activeEvents + ' tayang',          to: 'monitoring-event' },
    { label: 'Event Aktif',       value: stats.activeEvents,           accent: '#00897b', sub: 'Sedang tayang',                                                                to: 'monitoring-event' },
    { label: 'Total Transaksi',   value: stats.totalOrders,            accent: '#e65100', sub: 'Order disetujui',                                                              to: null },
    { label: 'Total Pendapatan',  value: formatRp(stats.totalRevenue), accent: '#4D403A', sub: 'Dari transaksi approved', isText: true,                                        to: null },
    { label: 'Organizer Pending', value: stats.pendingOrganizers,      accent: '#c62828', sub: 'Perlu divalidasi', urgent: stats.pendingOrganizers > 0,                        to: 'validate-organizer' },
    { label: 'Event Pending',     value: stats.pendingEvents,          accent: '#f57f17', sub: 'Perlu tindakan',  urgent: stats.pendingEvents > 0,                             to: 'validate-event' },
  ]

  const menuItems = [
    { key: 'overview',           label: 'Overview',           badge: 0 },
    { key: 'validate-organizer', label: 'Validate Organizer', badge: pending.length },
    { key: 'validate-event',     label: 'Validate Event',     badge: pendingEvents.length },
    { key: 'monitoring-user',    label: 'Monitoring User',    badge: 0 },
    { key: 'monitoring-event',   label: 'Monitoring Event',   badge: 0 },
    { key: 'ticket-sales',       label: 'Ticket Sales',       badge: 0 },
    { key: 'merch-sales',        label: 'Merchandise Sales',  badge: 0 },
  ]

  const icons = {
    'overview':           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    'validate-organizer': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M16 11l2 2 4-4"/></svg>,
    'validate-event':     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    'monitoring-user':    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    'monitoring-event':   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    'ticket-sales':       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    'merch-sales':        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  }

  const regularUsers   = users.filter(u => u.role_pengguna !== 'organizer')
  const organizerUsers = users.filter(u => u.role_pengguna === 'organizer')

  if (!user) return null

  return (
    <div style={S.page}>

      {/* NAVBAR */}
      <div style={S.navbar}>
        <div style={S.navLogo}>
          <img src="/logo.jpg" alt="logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div style={S.navLogoText}>SURABAYA <span style={{ fontWeight: 400, color: '#555' }}>ART</span></div>
        </div>
        <button style={S.logoutBtn} onClick={() => { localStorage.removeItem('user'); navigate('/signin') }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>
      </div>

      {/* HERO */}
      <div style={S.hero} />

      {/* BODY */}
      <div style={S.body}>

        {/* SIDEBAR */}
        <div style={S.sidebar}>
          <div style={S.sidebarTopLabel}>
            HOME
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div style={S.sidebarProfile}>
            <div style={S.avatarCircle}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 2 }}>{user.nama_pengguna}</p>
            <p style={{ fontSize: 11, color: '#A39680' }}>Admin</p>
          </div>
          {menuItems.map(item => (
            <div key={item.key} style={S.menuItem(menu === item.key)}
              onClick={() => { setMenu(item.key); setSelected(null); setAlasan('') }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                {icons[item.key]}
                {item.label}
                {item.badge > 0 && (
                  <span style={{ background: '#E24B4A', color: 'white', borderRadius: 50, padding: '0 5px', fontSize: 10, fontWeight: 700 }}>
                    {item.badge}
                  </span>
                )}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>

        {/* KONTEN KANAN */}
        <div style={S.content}>
          {loading ? (
            <div style={S.loading}>Memuat data dashboard...</div>
          ) : (
            <>

              {/* ── OVERVIEW ── */}
              {menu === 'overview' && (
                <>
                  <div style={S.statsGrid}>
                    {statCards.map((sc, i) => (
                      <div key={i}
                        style={S.statCard(sc.accent, sc.urgent, !!sc.to, hoveredStat === i)}
                        onClick={() => sc.to && setMenu(sc.to)}
                        onMouseEnter={() => setHoveredStat(i)}
                        onMouseLeave={() => setHoveredStat(null)}>
                        {sc.urgent && <div style={S.urgentDot} />}
                        <div style={S.statNumber(sc.accent, sc.isText)}>{sc.value}</div>
                        <div style={S.statLabel}>{sc.label}</div>
                        {sc.sub && <div style={S.statSub}>{sc.sub}</div>}
                        {sc.to && <div style={S.statArrow(sc.accent)}>{'→'}</div>}
                      </div>
                    ))}
                  </div>

                  <div style={S.chartsGrid}>
                    <div style={S.chartCard}>
                      <div style={S.chartTitle}>Komposisi User</div>
                      <DonutChart data={[
                        { label: 'Buyer',     value: users.filter(u => u.role_pengguna === 'buyer').length,     color: '#1565c0' },
                        { label: 'Organizer', value: users.filter(u => u.role_pengguna === 'organizer').length, color: '#2e7d32' },
                        { label: 'Diblokir',  value: stats.blockedUsers,                                        color: '#E24B4A' },
                      ]} />
                    </div>
                    <div style={S.chartCard}>
                      <div style={S.chartTitle}>Status Event</div>
                      <DonutChart data={[
                        { label: 'Tayang',       value: stats.activeEvents,                                                        color: '#00897b' },
                        { label: 'Pending',      value: stats.pendingEvents,                                                       color: '#f57f17' },
                        { label: 'Tidak Tayang', value: Math.max(0, stats.totalEvents - stats.activeEvents - stats.pendingEvents), color: '#bbb' },
                      ]} />
                    </div>
                  </div>

                  <div style={{ background: 'white', borderRadius: 10, padding: '18px 18px 14px', marginBottom: 14 }}>
                    <div style={S.chartTitle}>Pertumbuhan Transaksi (12 Bulan Terakhir)</div>
                    <GrowthChart orders={orders} />
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#4D403A' }} />
                        <span style={{ fontSize: 11, color: '#555' }}>Total item terjual (approved)</span>
                      </div>
                    </div>
                  </div>

                  <div style={S.overviewPanel}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 12 }}>Event Menunggu Validasi</div>
                    {pendingEvents.length === 0
                      ? <div style={S.empty}>Tidak ada event pending</div>
                      : pendingEvents.slice(0, 5).map(e => (
                        <div key={e.id_pergelaran} style={S.pendingItem}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>{e.nama_pergelaran}</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{e.penyelenggara?.instansi_penyelenggara}</div>
                        </div>
                      ))
                    }
                    {pendingEvents.length > 0 && (
                      <button onClick={() => setMenu('validate-event')}
                        style={{ marginTop: 8, fontSize: 12, color: '#f57f17', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: 0 }}>
                        Lihat semua →
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── VALIDATE ORGANIZER ── */}
              {menu === 'validate-organizer' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>Penyelenggara Menunggu Verifikasi</div>
                  {pending.length === 0
                    ? <div style={S.empty}>Tidak ada yang menunggu verifikasi.</div>
                    : pending.map(p => (
                      <div key={p.id_penyelenggara} style={S.rowItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{p.pengguna?.nama_pengguna}</p>
                            <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>{p.pengguna?.email_pengguna}</p>
                            <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>NIK: {p.nik_penyelenggara}</p>
                            <p style={{ fontSize: 12, color: '#A39680' }}>Instansi: {p.instansi_penyelenggara}</p>
                          </div>
                          <button style={S.btnReview}
                            onClick={() => setSelected(selected?.id_penyelenggara === p.id_penyelenggara ? null : p)}>
                            {selected?.id_penyelenggara === p.id_penyelenggara ? 'Tutup' : 'Review'}
                          </button>
                        </div>
                        {selected?.id_penyelenggara === p.id_penyelenggara && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8e4dc' }}>
                            <textarea placeholder="Alasan penolakan (wajib diisi jika reject)..."
                              value={alasan} onChange={e => setAlasan(e.target.value)} style={S.textarea} />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <button style={S.btnApprove} onClick={() => approveOrg(p.id_penyelenggara)}>Approve</button>
                              <button style={S.btnReject}  onClick={() => rejectOrg(p.id_penyelenggara)}>Reject</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}

              {/* ── VALIDATE EVENT ── */}
              {menu === 'validate-event' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>Event Menunggu Validasi</div>
                  {pendingEvents.length === 0
                    ? <div style={S.empty}>Tidak ada event yang menunggu validasi.</div>
                    : pendingEvents.map(e => (
                      <div key={e.id_pergelaran} style={S.rowItem}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran}
                            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{e.nama_pergelaran}</p>
                            <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>{e.penyelenggara?.instansi_penyelenggara}</p>
                            <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>{e.lokasi_pergelaran}</p>
                            <p style={{ fontSize: 12, color: '#A39680' }}>Rp {parseInt(e.harga_tiket || 0).toLocaleString('id-ID')}</p>
                          </div>
                          <button style={S.btnReview}
                            onClick={() => setSelected(selected?.id_pergelaran === e.id_pergelaran ? null : e)}>
                            {selected?.id_pergelaran === e.id_pergelaran ? 'Tutup' : 'Review'}
                          </button>
                        </div>
                        {selected?.id_pergelaran === e.id_pergelaran && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8e4dc' }}>
                            <textarea placeholder="Alasan penolakan (wajib diisi jika reject)..."
                              value={alasan} onChange={ev => setAlasan(ev.target.value)} style={S.textarea} />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <button style={S.btnApprove} onClick={() => approveEvent(e.id_pergelaran)}>Approve</button>
                              <button style={S.btnReject}  onClick={() => rejectEvent(e.id_pergelaran)}>Reject</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}

              {/* ── MONITORING USER ── */}
              {menu === 'monitoring-user' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>Monitoring User</div>

                  <div style={S.groupHeader}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    ORGANIZER
                    <span style={{ background: '#EEEDFE', color: '#3C3489', borderRadius: 50, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
                      {organizerUsers.length}
                    </span>
                  </div>
                  {organizerUsers.length === 0
                    ? <div style={{ ...S.empty, padding: '12px 0' }}>Belum ada organizer.</div>
                    : organizerUsers.map(u => (
                      <div key={u.id_pengguna} style={{ ...S.rowItem, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{u.nama_pengguna}</p>
                          <p style={{ fontSize: 12, color: '#A39680', marginBottom: 4 }}>{u.email_pengguna}</p>
                          <span style={S.badge('#3C3489', '#EEEDFE')}>organizer</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={S.badge(u.status === 'blocked' ? '#A32D2D' : '#27500A', u.status === 'blocked' ? '#FCEBEB' : '#EAF3DE')}>
                            {u.status === 'blocked' ? 'Diblokir' : 'Aktif'}
                          </span>
                          {u.status !== 'blocked' && (
                            <button style={S.btnBlock} onClick={() => blokirUser(u.id_pengguna)}>Blokir</button>
                          )}
                        </div>
                      </div>
                    ))
                  }

                  <div style={{ ...S.groupHeader, marginTop: 20 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="2">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    USER
                    <span style={{ background: '#FAEEDA', color: '#633806', borderRadius: 50, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
                      {regularUsers.length}
                    </span>
                  </div>
                  {regularUsers.length === 0
                    ? <div style={{ ...S.empty, padding: '12px 0' }}>Belum ada user.</div>
                    : regularUsers.map(u => (
                      <div key={u.id_pengguna} style={{ ...S.rowItem, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{u.nama_pengguna}</p>
                          <p style={{ fontSize: 12, color: '#A39680', marginBottom: 4 }}>{u.email_pengguna}</p>
                          <span style={S.badge('#633806', '#FAEEDA')}>{u.role_pengguna}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={S.badge(u.status === 'blocked' ? '#A32D2D' : '#27500A', u.status === 'blocked' ? '#FCEBEB' : '#EAF3DE')}>
                            {u.status === 'blocked' ? 'Diblokir' : 'Aktif'}
                          </span>
                          {u.status !== 'blocked' && (
                            <button style={S.btnBlock} onClick={() => blokirUser(u.id_pengguna)}>Blokir</button>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* ── MONITORING EVENT ── */}
              {menu === 'monitoring-event' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>Semua Event</div>
                  {events.length === 0
                    ? <div style={S.empty}>Belum ada event.</div>
                    : events.map(e => (
                      <div key={e.id_pergelaran} style={{ ...S.rowItem, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran}
                          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{e.nama_pergelaran}</p>
                          <p style={{ fontSize: 12, color: '#A39680' }}>{e.penyelenggara?.instansi_penyelenggara}</p>
                          <p style={{ fontSize: 12, color: '#A39680' }}>{e.lokasi_pergelaran}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={S.badge(e.status_validasi ? '#27500A' : '#A32D2D', e.status_validasi ? '#EAF3DE' : '#FCEBEB')}>
                            {e.status_validasi ? 'Tayang' : 'Tidak Tayang'}
                          </span>
                          {e.status_validasi && (
                            <button style={S.btnBlock} onClick={() => takeDown(e.id_pergelaran)}>Take Down</button>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* ── TICKET SALES ── */}
              {menu === 'ticket-sales' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>Penjualan Tiket (Pembayaran Disetujui)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#F5F2ED', borderRadius: 8, padding: '14px 16px' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', marginBottom: 6 }}>TOTAL TIKET TERJUAL</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: '#4D403A' }}>
                        {orders.reduce((s, o) => s + (o.jumlah_item || 0), 0)}
                      </p>
                    </div>
                    <div style={{ background: '#F5F2ED', borderRadius: 8, padding: '14px 16px' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', marginBottom: 6 }}>TOTAL PENDAPATAN</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#3B6D11' }}>
                        {formatRp(orders.reduce((s, o) => s + (o.total_pembayaran || 0), 0))}
                      </p>
                    </div>
                  </div>
                  <div style={S.chartTitle}>Transaksi per Bulan</div>
                  <MonthlyChart orders={orders} accent="#4D403A" />
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 12 }}>Semua Transaksi Disetujui</p>
                    {orders.length === 0
                      ? <div style={S.empty}>Belum ada transaksi yang disetujui.</div>
                      : orders.map(o => (
                        <div key={o.id_order} style={{ ...S.rowItem, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#4D403A' }}>
                              #{o.id_order?.slice(0, 8).toUpperCase()}
                            </p>
                            <p style={{ fontSize: 11, color: '#A39680', marginTop: 2 }}>
                              {o.pengguna?.nama_pengguna || '-'}
                            </p>
                            <p style={{ fontSize: 11, color: '#A39680' }}>{formatDate(o.waktu_order)}</p>
                            <p style={{ fontSize: 11, color: '#A39680' }}>{o.jumlah_item} item</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>{formatRp(o.total_pembayaran)}</p>
                            <span style={S.badge('#27500A', '#EAF3DE')}>Approved</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* ── MERCH SALES ── */}
              {menu === 'merch-sales' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>Penjualan Merchandise</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#F5F2ED', borderRadius: 8, padding: '14px 16px' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', marginBottom: 6 }}>TOTAL MERCHANDISE</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: '#4D403A' }}>{merch.length}</p>
                    </div>
                    <div style={{ background: '#F5F2ED', borderRadius: 8, padding: '14px 16px' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', marginBottom: 6 }}>TOTAL TERJUAL (APPROVED)</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: '#3B6D11' }}>
                        {detailOrders.reduce((s, d) => s + (d.jumlah || 0), 0)}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 12 }}>Semua Merchandise</p>
                  {merch.length === 0
                    ? <div style={S.empty}>Belum ada merchandise.</div>
                    : merch.map(m => {
                        const relatedTx = detailOrders.filter(d => d.id_merchandise === m.id_merchandise)
                        const totalTerjual = relatedTx.reduce((s, d) => s + (d.jumlah || 0), 0)
                        return (
                          <div key={m.id_merchandise} style={{ ...S.rowItem, marginBottom: 14 }}>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                              {m.foto_merchandise && (
                                <img src={m.foto_merchandise} alt={m.nama_merchandise}
                                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                              )}
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{m.nama_merchandise}</p>
                                <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>{m.deskripsi_merchandise}</p>
                                <p style={{ fontSize: 12, color: '#A39680' }}>Stok tersisa: {m.stok_merchandise}</p>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#4D403A' }}>{formatRp(m.harga_merchandise)}</p>
                                <p style={{ fontSize: 11, color: '#A39680', marginTop: 3 }}>
                                  Terjual: {totalTerjual} pcs
                                </p>
                                <p style={{ fontSize: 11, color: '#3B6D11', fontWeight: 600, marginTop: 2 }}>
                                  {formatRp(totalTerjual * (m.harga_merchandise || 0))}
                                </p>
                              </div>
                            </div>

                            {relatedTx.length > 0 && (
                              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #e8e4dc' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 8, letterSpacing: 0.5 }}>
                                  RIWAYAT TRANSAKSI (APPROVED)
                                </p>
                                {relatedTx.map((d, idx) => (
                                  <div key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '7px 10px', background: '#FAF7F2', borderRadius: 6, marginBottom: 5
                                  }}>
                                    <div>
                                      <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4D403A', fontWeight: 600 }}>
                                        #{d.id_order?.slice(0, 8).toUpperCase()}
                                      </p>
                                      <p style={{ fontSize: 11, color: '#A39680', marginTop: 2 }}>
                                        Qty: {d.jumlah || 1}
                                      </p>
                                    </div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#4D403A' }}>
                                      {formatRp((d.jumlah || 1) * (m.harga_merchandise || 0))}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })
                  }
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard