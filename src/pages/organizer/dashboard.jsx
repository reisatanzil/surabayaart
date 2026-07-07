import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

// ─── CHART COMPONENTS ────────────────────────────────────────────────────────
function BarChart({ data, accent, barH }) {
  accent = accent || '#4D403A'
  barH   = barH   || 90
  if (!data || data.length === 0)
    return <div style={{ color: '#bbb', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>Belum ada data</div>
  const max  = Math.max(...data.map(d => d.value), 1)
  const W    = 320, total = data.length, gap = 6
  const barW = Math.floor((W - gap * (total - 1)) / total)
  return (
    <svg width="100%" viewBox={'0 0 ' + W + ' ' + (barH + 32)} style={{ overflow: 'visible', display: 'block' }}>
      {data.map((d, i) => {
        const bh = Math.max((d.value / max) * barH, d.value > 0 ? 4 : 0)
        const x  = i * (barW + gap), y = barH - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={3} fill={accent} opacity={d.highlight ? 1 : 0.55} />
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle"
                style={{ fontSize: 9, fill: accent, fontWeight: 700, fontFamily: 'inherit' }}>
                {d.value}
              </text>
            )}
            <text x={x + barW / 2} y={barH + 15} textAnchor="middle"
              style={{ fontSize: 9, fill: '#888', fontFamily: 'inherit' }}>
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function MonthlyTicketChart({ tikets }) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      label: d.toLocaleDateString('id-ID', { month: 'short' }),
      year: d.getFullYear(), month: d.getMonth(),
      value: 0, highlight: i === 5
    }
  })
  tikets.forEach(t => {
    if (!t.created_at) return
    const d = new Date(t.created_at)
    const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth())
    if (m) m.value += 1
  })
  return <BarChart data={months} accent="#3B6D11" />
}

function EventSalesChart({ events }) {
  if (!events || events.length === 0)
    return <div style={{ color: '#bbb', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>Belum ada data</div>
  const data = events.map((e, i) => ({
    label: e.nama_pergelaran.length > 8
      ? e.nama_pergelaran.slice(0, 8) + '…'
      : e.nama_pergelaran,
    value: e.tiketTerjual,
    highlight: true,
    fullName: e.nama_pergelaran,
  }))
  return <BarChart data={data} accent="#4D403A" />
}

function DonutChart({ data }) {
  const size = 100, r = 34, cx = size / 2, cy = size / 2
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0)
    return <div style={{ textAlign: 'center', color: '#bbb', fontSize: 12, padding: '20px 0' }}>Belum ada data</div>
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ece4" strokeWidth={14} />
        {slices.map((s, i) => (          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={14}
            strokeDasharray={s.dash + ' ' + s.gap} strokeDashoffset={-s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
        ))}
        <text x={cx} y={cy - 3} textAnchor="middle"
          style={{ fontSize: 15, fontWeight: 800, fill: '#262626', fontFamily: 'inherit' }}>
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle"
          style={{ fontSize: 7, fill: '#aaa', fontFamily: 'inherit', letterSpacing: 1 }}>
          TOTAL
        </text>
      </svg>
      <div style={{ flex: 1 }}>
        {data.map((d, i) => (          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#555', flex: 1 }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#262626' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function OrganizerDashboard() {
  const navigate = useNavigate()
  const [user, setUser]               = useState(null)
  const [penyelenggara, setPenyelenggara] = useState(null)
  const [events, setEvents]           = useState([])   
  const [tikets, setTikets]           = useState([])   
  const [detailOrders, setDetailOrders] = useState([]) 
  const [loading, setLoading]         = useState(true)
  const [stats, setStats]             = useState({
    total: 0, approved: 0, pending: 0, rejected: 0, cancelled: 0,
    totalTiket: 0, totalPendapatan: 0,
    totalMerch: 0, pendapatanMerch: 0,
  })

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    const u = JSON.parse(data)
    if (u.role_pengguna !== 'organizer') { navigate('/signin'); return }
    setUser(u)
    ambilData(u.id_pengguna)
  }, [])

async function ambilData(idPengguna) {
    setLoading(true)
    try {
      // 1. Ambil data penyelenggara berdasarkan user login
      const { data: org, error: orgErr } = await supabase
        .from('penyelenggara')
        .select('*')
        .eq('id_pengguna', idPengguna)
        .single()
      
      if (orgErr || !org) { 
        setLoading(false)
        return 
      }
      setPenyelenggara(org)

      // 2. Ambil semua event milik penyelenggara ini
      const { data: eventsData, error: evErr } = await supabase
        .from('pergelaran')
        .select('*')
        .eq('id_penyelenggara', org.id_penyelenggara)
      
      const ev = eventsData || []
      const eventIds = ev.map(e => e.id_pergelaran)

      if (eventIds.length === 0) {
        setEvents([])
        setLoading(false)
        return
      }

      // 3. Ambil jadwal_event berdasarkan eventIds
      const { data: jd, error: jdErr } = await supabase
        .from('jadwal_event')
        .select('id_jadwal, id_pergelaran')
        .in('id_pergelaran', eventIds)
      
      const jadwals = jd || []
      const jadwalIds = jadwals.map(j => j.id_jadwal)

      // 4. Ambil semua tiket berdasarkan jadwalIds
      let tiketsData = []
      if (jadwalIds.length > 0) {
        const { data: tk, error: tkErr } = await supabase
          .from('tiket')
          .select('id_tiket, id_jadwal, status_tiket, id_order')
          .in('id_jadwal', jadwalIds)
        if (!tkErr) tiketsData = tk || []
      }

      // Kumpulkan semua id_order yang unik dan tidak null dari tabel tiket kamu
      const orderIdsFromTiket = [...new Set(tiketsData.map(t => t.id_order).filter(Boolean))]

      let validDetails = []
      let approvedOrderIds = new Set()
      let waktuOrderMap = new Map()

      if (orderIdsFromTiket.length > 0) {
        // 5. Ambil SEMUA order yang terkait tiket ini (bukan cuma approved), biar waktu_order & pendapatan tiket
        // ikut logic profile.jsx: tiket dianggap "terjual" apapun status order-nya
        const { data: allOrders } = await supabase
          .from('order')
          .select('id_order, status_validasi_bayar, waktu_order')
          .in('id_order', orderIdsFromTiket)

        const validOrders = allOrders || []
        // approvedOrderIds masih dipakai khusus untuk hitung pendapatan merchandise (belum diminta diubah)
        approvedOrderIds = new Set(validOrders.filter(o => o.status_validasi_bayar === 'approved').map(o => o.id_order))

        // Map id_order -> waktu_order, dipakai buat gantiin created_at di tabel tiket (kolom itu tidak ada di tabel tiket)
        waktuOrderMap = new Map(validOrders.map(o => [o.id_order, o.waktu_order]))

        // 6. Ambil detail_order berdasarkan id_order yang terhubung dengan tiket kita
        const { data: detailData } = await supabase
          .from('detail_order')
          .select('id_detail_order, id_order, jumlah, subtotal, id_merchandise')
          .in('id_order', orderIdsFromTiket)
        
        validDetails = detailData || []
      }

      // 7. PROSES HITUNG STATISTIK UTAMA DI FRONTEND (Aman & Anti Gagal)
      // Filter detail_order yang order-nya approved, khusus dipakai untuk hitung merchandise
      const approvedDetails = validDetails.filter(d => approvedOrderIds.has(d.id_order))

      // HITUNG PENDAPATAN & PCS MERCHANDISE: dari detail_order yang id_merchandise tidak null (tetap pakai order approved)
      const approvedMerch   = approvedDetails.filter(d => d.id_merchandise !== null)
      const totalMerch      = approvedMerch.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0)
      const pendapatanMerch = approvedMerch.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)

      // Hitung kuantitas fisik tiket terjual per event untuk tabel bawah
      // Ikut logic profile.jsx (ambilSales): SEMUA baris tiket dihitung "terjual", apapun status order-nya
      const eventsWithStats = ev.map(e => {
        const jadwalEvent = jadwals.filter(j => j.id_pergelaran === e.id_pergelaran).map(j => j.id_jadwal)
        const tiketEvent  = tiketsData.filter(t => jadwalEvent.includes(t.id_jadwal))
        return {
          ...e,
          tiketTerjual: tiketEvent.length,
          tiketTotal:   tiketEvent.length,
        }
      })

      const totalTiketTerjual = eventsWithStats.reduce((sum, e) => sum + e.tiketTerjual, 0)

      // HITUNG PENDAPATAN TIKET: ikut logic profile.jsx (jumlah tiket terjual x harga_tiket per event),
      // bukan dari subtotal detail_order
      const totalPendapatan = eventsWithStats.reduce(
        (sum, e) => sum + (e.tiketTerjual * (Number(e.harga_tiket) || 0)), 0
      )

      // 8. UPDATE STATE KE REACT UI DASHBOARD
      setEvents(eventsWithStats)
      // created_at diambil dari waktu_order (tabel order), karena tabel tiket tidak punya kolom created_at
      setTikets(tiketsData.map(t => ({ ...t, created_at: waktuOrderMap.get(t.id_order) || null })))
      setDetailOrders(validDetails)
      setStats({
        total:            ev.length,
        approved:         ev.filter(e => e.status_validasi === 'disetujui').length,
        pending:          ev.filter(e => e.status_validasi === 'menunggu').length,
        rejected:         ev.filter(e => e.status_validasi === 'ditolak').length,
        cancelled:        ev.filter(e => e.status_validasi === 'dibatalkan').length,
        totalTiket:       totalTiketTerjual,
        totalPendapatan,
        totalMerch,
        pendapatanMerch,
      })

    } catch (err) {
      console.error("Dashboard mendadak error:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatRp = val => 'Rp ' + Number(val || 0).toLocaleString('id-ID')

  if (!user) return null

  return (
    <div style={{ fontFamily: 'Albert Sans, sans-serif', background: '#FAFBF5', minHeight: '100vh' }}>
      {/* NAVBAR */}
      <div style={{
        background: 'white', padding: '0 32px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.jpg" alt="logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
            SURABAYA <span style={{ fontWeight: 400, color: '#555' }}>ART</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span onClick={() => navigate('/organizer/dashboard')}
            style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#262626', letterSpacing: 0.5 }}>
            Dashboard
          </span>
          <span onClick={() => navigate('/organizer/upload')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Upload Event
          </span>
          <button onClick={() => navigate('/organizer/profile')}
            style={{
              padding: '8px 20px', background: '#262626', color: 'white',
              border: 'none', borderRadius: 50, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
            My Profile
          </button>
        </div>
      </div>

      {/* HERO */}
      <div style={{
        position: 'relative', height: 280,
        backgroundImage: 'url(/balaipemuda.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'flex-end',
        padding: '0 32px 28px'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(38,38,38,0.35)' }} />
        <h1 style={{
          position: 'relative', zIndex: 1,
          color: 'white', fontSize: 32, fontWeight: 800,
          textShadow: '0 2px 12px rgba(0,0,0,0.3)'
        }}>
          Hi, {penyelenggara?.instansi_penyelenggara || user.nama_pengguna}!
        </h1>
      </div>

      <div style={{ padding: '32px 32px 0' }}>
        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'TOTAL EVENT',       value: stats.total,           color: '#262626' },
            { label: 'DISETUJUI',         value: stats.approved,        color: '#3B6D11' },
            { label: 'MENUNGGU',          value: stats.pending,         color: '#BA7517' },
            { label: 'DITOLAK',           value: stats.rejected,        color: '#A32D2D' },
            { label: 'DIBATALKAN',        value: stats.cancelled,       color: '#4D403A' },
            { label: 'TIKET TERJUAL',     value: stats.totalTiket,      color: '#1565c0' },
            { label: 'PENDAPATAN TIKET',  value: formatRp(stats.totalPendapatan), color: '#4D403A', small: true },
            { label: 'MERCH TERJUAL',     value: stats.totalMerch,      color: '#6a1b9a' },
            { label: 'PENDAPATAN MERCH',  value: formatRp(stats.pendapatanMerch), color: '#00897b', small: true },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 10,
              border: '1px solid #e8e4dc', padding: '18px 20px',
              borderTop: '3px solid ' + s.color,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#A39680', letterSpacing: 1.2, marginBottom: 8 }}>
                {s.label}
              </p>
              <p style={{ fontSize: s.small ? 18 : 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── GRAFIK SECTION ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Memuat data...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {/* Tiket terjual per bulan */}
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '20px 20px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                  Penjualan Tiket per Bulan
                </p>                <p style={{ fontSize: 11, color: '#A39680', marginBottom: 14 }}>6 bulan terakhir</p>
                <MonthlyTicketChart tikets={tikets} />
              </div>
              {/* Tiket terjual per event */}
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '20px 20px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                  Tiket Terjual per Event
                </p>
                <p style={{ fontSize: 11, color: '#A39680', marginBottom: 14 }}>Semua event kamu</p>
                <EventSalesChart events={events} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              {/* Status event donut */}
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '20px 20px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 14 }}>
                  Status Event
                </p>
                <DonutChart data={[
                  { label: 'Disetujui', value: stats.approved, color: '#3B6D11' },
                  { label: 'Menunggu', value: stats.pending,  color: '#BA7517' },
                  { label: 'Ditolak', value: stats.rejected,  color: '#A32D2D' },
                  { label: 'Dibatalkan', value: stats.cancelled, color: '#4D403A' },
                ]} />
              </div>
              {/* Komposisi pendapatan */}
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '20px 20px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 14 }}>
                  Komposisi Pendapatan
                </p>
                <DonutChart data={[
                  { label: 'Tiket',       value: Math.round(stats.totalPendapatan / 1000),  color: '#1565c0' },
                  { label: 'Merchandise', value: Math.round(stats.pendapatanMerch / 1000),  color: '#6a1b9a' },
                ]} />
                <p style={{ fontSize: 10, color: '#bbb', marginTop: 6, textAlign: 'center' }}>*dalam ribuan rupiah</p>
              </div>
            </div>

            {/* ── TABEL EVENT ── */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '20px', marginBottom: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 14 }}>Semua Event</p>
              {events.length === 0
                ? <p style={{ color: '#A39680', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Belum ada event.</p>
                : events.map(e => (
                  <div key={e.id_pergelaran} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    border: '1px solid #e8e4dc', borderRadius: 8,
                    padding: 14, marginBottom: 10
                  }}>
                    <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{e.nama_pergelaran}</p>
                      <p style={{ fontSize: 12, color: '#A39680' }}>{e.lokasi_pergelaran}</p>
                      <p style={{ fontSize: 12, color: '#A39680' }}>
                        Rp {parseInt(e.harga_tiket || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {(() => {
                        const badgeMap = {
                          disetujui:  { bg: '#EAF3DE', color: '#27500A', label: 'Tayang' },
                          menunggu:   { bg: '#FAEEDA', color: '#633806', label: 'Menunggu' },
                          ditolak:    { bg: '#FCEBEB', color: '#A32D2D', label: 'Ditolak' },
                          dibatalkan: { bg: '#EDEAE4', color: '#4D403A', label: 'Dibatalkan' },
                        }
                        const b = badgeMap[e.status_validasi] || badgeMap['menunggu']
                        return (
                          <span style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 50, fontWeight: 600,
                            background: b.bg, color: b.color,
                            display: 'inline-block', marginBottom: 6
                          }}>
                            {b.label}
                          </span>
                        )
                      })()}
                      {e.status_validasi === 'ditolak' && e.alasan_ditolak && (
                        <p style={{ fontSize: 10, color: '#A32D2D', marginBottom: 6, maxWidth: 140 }}>
                          {e.alasan_ditolak}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: '#4D403A', fontWeight: 700 }}>
                        {e.tiketTerjual} / {e.tiketTotal} tiket
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}

        {/* ── ABOUT ── */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#262626', marginBottom: 20 }}>
          About SurabayaART :
        </h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <img src="/about1.png" alt="about1" style={{ flex: 1, height: 180, objectFit: 'cover', borderRadius: 8 }} />
          <img src="/about2.png" alt="about2" style={{ flex: 1, height: 180, objectFit: 'cover', borderRadius: 8 }} />
          <img src="/about3.png" alt="about3" style={{ flex: 1, height: 180, objectFit: 'cover', borderRadius: 8 }} />
        </div>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, textAlign: 'justify' }}>
          SurabayaArt adalah sebuah platform digital berbasis website yang dikembangkan sebagai pusat informasi dan pemesanan tiket pergelaran seni di Kota Surabaya. Platform ini hadir untuk menjawab permasalahan tersebarnya informasi acara seni di berbagai media sosial serta belum terintegrasinya sistem pemesanan tiket. SurabayArt menghubungkan penyelenggara acara dengan masyarakat dalam satu sistem terpadu.
        </p>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, marginTop: 10, textAlign: 'justify' }}>
          Bagi masyarakat, SurabayaArt menyediakan informasi lengkap mengenai berbagai pergelaran seni di Surabaya, fitur pencarian berdasarkan kategori acara, serta sistem pemesanan dan pembayaran tiket secara online. Bagi penyelenggara, platform ini menyediakan fitur pendaftaran dan dashboard manajemen event mandiri untuk mengunggah informasi acara serta mengelola tiket.
        </p>
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: '1px solid #e8e4dc', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 40      }}>
        <span onClick={() => navigate('/terms')} style={{ fontSize: 12, color: '#4D403A', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
          Terms & Condition
        </span>
        <span style={{ fontSize: 11, color: '#A39680' }}>
          © 2026 SurabayaArt. All rights reserved.
        </span>
      </div>
    </div>
  )
}

export default OrganizerDashboard