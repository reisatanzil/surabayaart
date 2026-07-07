import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function OrganizerProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [penyelenggara, setPenyelenggara] = useState(null)
  const [menu, setMenu] = useState('profil')
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [tikets, setTikets] = useState([])
  const [merchSales, setMerchSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editProfil, setEditProfil] = useState(false)
  const [profilForm, setProfilForm] = useState({})
  const [savingProfil, setSavingProfil] = useState(false)

  // Approve pembayaran
  const [eventBayar, setEventBayar] = useState(null)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  // Reviews
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [filterEventId, setFilterEventId] = useState('semua')

  // Merchandise modal
  const [merchModal, setMerchModal] = useState(null)
  const [merchModalForm, setMerchModalForm] = useState({})
  const [savingMerchModal, setSavingMerchModal] = useState(false)
  const [deletingMerchModalId, setDeletingMerchModalId] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    const u = JSON.parse(data)
    if (u.role_pengguna !== 'organizer') { navigate('/signin'); return }
    setUser(u)
    ambilData(u.id_pengguna)
  }, [])

  async function ambilData(id) {
    const { data: org } = await supabase
      .from('penyelenggara')
      .select('*, pengguna(*)')
      .eq('id_pengguna', id)
      .single()

    setPenyelenggara(org)
    if (org) {
      setProfilForm({
        no_telpon: org.no_telpon || '',
        instansi_penyelenggara: org.instansi_penyelenggara || '',
      })
    }
    if (!org) { setLoading(false); return }

    const { data: ev } = await supabase
      .from('pergelaran')
      .select('*')
      .eq('id_penyelenggara', org.id_penyelenggara)

    setEvents(ev || [])
    setLoading(false)
  }

  // ── MERCHANDISE MODAL ─────────────────────────────────────────

  async function ambilMerchSales() {
    const { data } = await supabase
      .from('merchandise')
      .select('*, pergelaran(nama_pergelaran)')
      .eq('id_penyelenggara', penyelenggara.id_penyelenggara)
    setMerchSales(data || [])
  }

  function bukaAddMerchModal() {
    setMerchModalForm({
      nama_merchandise: '',
      harga_merchandise: '',
      stok_merchandise: '',
      foto_merchandise: '',
      deskripsi_merchandise: '',
      id_pergelaran: '',
    })
    setMerchModal('add')
  }

  function bukaEditMerchModal(m) {
    setMerchModalForm({
      id_merchandise: m.id_merchandise,
      nama_merchandise: m.nama_merchandise || '',
      harga_merchandise: m.harga_merchandise || '',
      stok_merchandise: m.stok_merchandise || '',
      foto_merchandise: m.foto_merchandise || '',
      deskripsi_merchandise: m.deskripsi_merchandise || '',
      id_pergelaran: m.id_pergelaran || '',
    })
    setMerchModal('edit')
  }

  async function simpanMerchModal() {
    if (!merchModalForm.id_pergelaran) { alert('Pilih event dulu buat merchandise ini!'); return }
    setSavingMerchModal(true)
    const payload = {
      nama_merchandise: merchModalForm.nama_merchandise,
      harga_merchandise: parseFloat(merchModalForm.harga_merchandise) || 0,
      stok_merchandise: parseInt(merchModalForm.stok_merchandise) || 0,
      foto_merchandise: merchModalForm.foto_merchandise || null,
      deskripsi_merchandise: merchModalForm.deskripsi_merchandise || null,
      id_penyelenggara: penyelenggara.id_penyelenggara,
      id_pergelaran: merchModalForm.id_pergelaran,
    }

    if (merchModal === 'add') {
      await supabase.from('merchandise').insert(payload)
    } else {
      await supabase.from('merchandise').update(payload).eq('id_merchandise', merchModalForm.id_merchandise)
    }

    setSavingMerchModal(false)
    setMerchModal(null)
    await ambilMerchSales()
  }

  async function hapusMerchModal(id) {
    if (!window.confirm('Hapus merchandise ini?')) return
    setDeletingMerchModalId(id)
    await supabase.from('merchandise').delete().eq('id_merchandise', id)
    setDeletingMerchModalId(null)
    await ambilMerchSales()
  }

  // ── REVIEWS ──────────────────────────────────────────────────

  async function ambilReviews(org) {
    setLoadingReviews(true)
    setReviews([])
    const { data: evList } = await supabase
      .from('pergelaran')
      .select('id_pergelaran')
      .eq('id_penyelenggara', org.id_penyelenggara)
    if (!evList || evList.length === 0) { setLoadingReviews(false); return }
    const pergelaranIds = evList.map(e => e.id_pergelaran)
    const { data: reviewData } = await supabase
      .from('review')
      .select('*, pengguna(nama_pengguna, email_pengguna), pergelaran(nama_pergelaran, poster_pergelaran)')
      .in('id_pergelaran', pergelaranIds)
      .order('created_at', { ascending: false })
    setReviews(reviewData || [])
    setLoadingReviews(false)
  }

  useEffect(() => {
    if (menu === 'reviews' && penyelenggara) ambilReviews(penyelenggara)
  }, [menu, penyelenggara])

  // ── ORDERS & SALES ────────────────────────────────────────────

  async function ambilOrders(event) {
    setEventBayar(event)
    setLoadingOrders(true)
    setOrders([])
    const { data: jadwals } = await supabase.from('jadwal_event').select('id_jadwal').eq('id_pergelaran', event.id_pergelaran)
    if (!jadwals || jadwals.length === 0) { setLoadingOrders(false); return }
    const jadwalIds = jadwals.map(j => j.id_jadwal)
    const { data: tiketList } = await supabase.from('tiket').select('id_order').in('id_jadwal', jadwalIds).not('id_order', 'is', null)
    if (!tiketList || tiketList.length === 0) { setLoadingOrders(false); return }
    const orderIds = [...new Set(tiketList.map(t => t.id_order))]
    const { data: orderData } = await supabase.from('order').select('*, pengguna(nama_pengguna, email_pengguna)').in('id_order', orderIds).order('waktu_order', { ascending: false })
    setOrders(orderData || [])
    setLoadingOrders(false)
  }

  async function approveOrder(orderId) {
    setProcessingId(orderId)
    await supabase.from('order').update({ status_validasi_bayar: 'approved' }).eq('id_order', orderId)
    setOrders(prev => prev.map(o => o.id_order === orderId ? { ...o, status_validasi_bayar: 'approved' } : o))
    setSelectedOrder(prev => prev ? { ...prev, status_validasi_bayar: 'approved' } : null)
    setProcessingId(null)
  }

  async function rejectOrder(orderId) {
    setProcessingId(orderId)
    await supabase.from('order').update({ status_validasi_bayar: 'rejected' }).eq('id_order', orderId)
    setOrders(prev => prev.map(o => o.id_order === orderId ? { ...o, status_validasi_bayar: 'rejected' } : o))
    setSelectedOrder(prev => prev ? { ...prev, status_validasi_bayar: 'rejected' } : null)
    setProcessingId(null)
  }

  async function ambilSales(event) {
    setSelectedEvent(event)
    const { data: jadwalData } = await supabase.from('jadwal_event').select('id_jadwal').eq('id_pergelaran', event.id_pergelaran).single()
    if (jadwalData) {
      const { data: tiketData } = await supabase.from('tiket').select('*').eq('id_jadwal', jadwalData.id_jadwal)
      setTikets(tiketData || [])
    }
    const { data: merchData } = await supabase.from('merchandise').select('*').eq('id_penyelenggara', penyelenggara.id_penyelenggara)
    setMerchSales(merchData || [])
  }

  async function simpanEdit() {
    await supabase.from('pergelaran').update({
      nama_pergelaran: editForm.nama_pergelaran,
      lokasi_pergelaran: editForm.lokasi_pergelaran,
      alamat_pergelaran: editForm.alamat_pergelaran,
      deskripsi_pergelaran: editForm.deskripsi_pergelaran,
      harga_tiket: parseFloat(editForm.harga_tiket) || 0,
      kategori_pergelaran: editForm.kategori_pergelaran,
    }).eq('id_pergelaran', editForm.id_pergelaran)
    setEditMode(false)
    ambilData(user.id_pengguna)
    alert('Event berhasil diupdate!')
  }

  async function simpanProfil() {
    setSavingProfil(true)
    await supabase.from('penyelenggara').update({
      no_telpon: profilForm.no_telpon,
      instansi_penyelenggara: profilForm.instansi_penyelenggara,
    }).eq('id_penyelenggara', penyelenggara.id_penyelenggara)
    setSavingProfil(false)
    setEditProfil(false)
    ambilData(user.id_pengguna)
    alert('Profil berhasil diupdate!')
  }

  function logout() {
    localStorage.removeItem('user')
    navigate('/signin')
  }

  if (!user) return null
  if (loading) return (
    <div style={{ padding: 40, fontFamily: 'Albert Sans, sans-serif', color: '#A39680', textAlign: 'center' }}>Loading...</div>
  )
  if (!penyelenggara) return (
    <div style={{ padding: 40, fontFamily: 'Albert Sans, sans-serif', color: '#A39680', textAlign: 'center' }}>Data penyelenggara tidak ditemukan.</div>
  )

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: 8, border: '1px solid #e8e4dc',
    fontSize: 13, outline: 'none', color: '#262626',
    fontFamily: 'inherit', background: 'white', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#4D403A', marginBottom: 5, display: 'block' }

  function StatusBadge({ status }) {
    const map = {
      approved: { bg: '#EAF3DE', color: '#27500A', label: 'Disetujui' },
      rejected: { bg: '#FDECEA', color: '#7B1A1A', label: 'Ditolak' },
      pending:  { bg: '#FAEEDA', color: '#633806', label: 'Menunggu' },
      // status event (pergelaran)
      disetujui:  { bg: '#EAF3DE', color: '#27500A', label: 'Disetujui' },
      menunggu:   { bg: '#FAEEDA', color: '#633806', label: 'Menunggu Persetujuan' },
      ditolak:    { bg: '#FDECEA', color: '#7B1A1A', label: 'Ditolak' },
      dibatalkan: { bg: '#EDEAE4', color: '#4D403A', label: 'Dibatalkan' },
    }
    const s = map[status] || map['pending']
    return (
      <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 50, fontWeight: 700, background: s.bg, color: s.color, letterSpacing: 0.3 }}>
        {s.label}
      </span>
    )
  }

  function StarRating({ rating, size = 14 }) {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} width={size} height={size} viewBox="0 0 24 24"
            fill={s <= rating ? '#F5A623' : 'none'}
            stroke={s <= rating ? '#F5A623' : '#DFD8CE'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
    )
  }

  const reviewsFiltered = filterEventId === 'semua' ? reviews : reviews.filter(r => r.id_pergelaran === filterEventId)
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }))

  return (
    <div style={{ fontFamily: 'Albert Sans, sans-serif', background: '#FAFBF5', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <div style={{
        background: 'white', padding: '0 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.jpg" alt="logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
            SURABAYA <span style={{ fontWeight: 400, color: '#555' }}>ART</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span onClick={() => navigate('/organizer/dashboard')} style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>Dashboard</span>
          <span onClick={() => navigate('/organizer/upload')} style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>Upload Event</span>
          <button onClick={() => navigate('/organizer/profile')} style={{
            padding: '8px 20px', background: '#262626', color: 'white',
            border: 'none', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
          }}>My Profile</button>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>

        {/* INFO PROFIL */}
        <div style={{
          background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 24,
          marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', background: '#DFDACF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#262626', marginBottom: 2 }}>{penyelenggara.instansi_penyelenggara}</p>
              <p style={{ fontSize: 13, color: '#A39680', marginBottom: 4 }}>{penyelenggara.pengguna?.email_pengguna}</p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, background: '#EEEDFE', color: '#3C3489', fontWeight: 600 }}>organizer</span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 50, fontWeight: 600,
                  background: penyelenggara.status === 'active' ? '#EAF3DE' : '#FAEEDA',
                  color: penyelenggara.status === 'active' ? '#27500A' : '#633806'
                }}>{penyelenggara.status === 'active' ? 'Aktif' : 'Menunggu Persetujuan'}</span>
                {avgRating && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, background: '#FFF8ED', color: '#7A4800', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#F5A623" stroke="#F5A623" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    {avgRating}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
            background: 'transparent', border: '1px solid #4D403A', borderRadius: 50,
            fontSize: 12, fontWeight: 600, color: '#4D403A', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log Out
          </button>
        </div>

        {/* TAB MENU */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'profil', label: 'Profil' },
            { key: 'my-events', label: 'My Events' },
            { key: 'sales', label: 'Sales' },
            { key: 'reviews', label: `Reviews${reviews.length > 0 ? ` (${reviews.length})` : ''}` },
          ].map(tab => (
            <button key={tab.key} onClick={() => {
              setMenu(tab.key)
              setEditMode(false)
              setEditProfil(false)
              setSelectedEvent(null)
              setEventBayar(null)
            }}
              style={{
                padding: '8px 18px', borderRadius: 50,
                border: menu === tab.key ? 'none' : '1px solid #e8e4dc',
                background: menu === tab.key ? '#262626' : 'white',
                color: menu === tab.key ? 'white' : '#555',
                fontSize: 13, fontWeight: menu === tab.key ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ──────────── PROFIL ──────────── */}
        {menu === 'profil' && !editProfil && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Detail Profil</p>
              <button onClick={() => setEditProfil(true)} style={{
                padding: '6px 14px', background: '#FAFBF5', border: '1px solid #e8e4dc',
                borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit'
              }}>Edit</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Nama', value: penyelenggara.pengguna?.nama_pengguna },
                { label: 'Email', value: penyelenggara.pengguna?.email_pengguna },
                { label: 'Instansi', value: penyelenggara.instansi_penyelenggara },
                { label: 'NIK', value: penyelenggara.nik_penyelenggara },
                { label: 'No. Telpon', value: penyelenggara.no_telpon || '-' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#FAFBF5', borderRadius: 8, border: '1px solid #e8e4dc' }}>
                  <span style={{ fontSize: 12, color: '#A39680' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {menu === 'profil' && editProfil && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setEditProfil(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A39680', fontSize: 13, fontFamily: 'inherit' }}>← Kembali</button>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Edit Profil</p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nama Instansi</label>
              <input value={profilForm.instansi_penyelenggara} onChange={e => setProfilForm({ ...profilForm, instansi_penyelenggara: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>No. Telpon / WhatsApp</label>
              <input value={profilForm.no_telpon} onChange={e => setProfilForm({ ...profilForm, no_telpon: e.target.value })} placeholder="cth: 08123456789" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditProfil(false)} style={{ padding: '10px 24px', background: 'transparent', color: '#4D403A', border: '1px solid #4D403A', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
              <button onClick={simpanProfil} disabled={savingProfil} style={{ padding: '10px 24px', background: savingProfil ? '#A39680' : '#4D403A', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: savingProfil ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {savingProfil ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        )}

        {/* ──────────── MY EVENTS ──────────── */}
        {menu === 'my-events' && !editMode && !eventBayar && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 }}>My Events</p>
            {loading ? (
              <p style={{ color: '#A39680', fontSize: 13 }}>Loading...</p>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <p style={{ color: '#A39680', fontSize: 13, marginBottom: 12 }}>No events yet.</p>
                <button onClick={() => navigate('/organizer/upload')} style={{ padding: '8px 20px', background: '#4D403A', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Upload Event</button>
              </div>
            ) : (
              events.map(e => (
                <div key={e.id_pergelaran} style={{ border: '1px solid #e8e4dc', borderRadius: 8, padding: 14, marginBottom: 10, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{e.nama_pergelaran}</p>
                    <p style={{ fontSize: 12, color: '#A39680', marginBottom: 4 }}>{e.lokasi_pergelaran}</p>
                    <StatusBadge status={e.status_validasi || 'menunggu'} />
                    {e.status_validasi === 'ditolak' && e.alasan_ditolak && (
                      <p style={{ fontSize: 11, color: '#7B1A1A', marginTop: 5, lineHeight: 1.5 }}>
                        <strong>Alasan ditolak:</strong> {e.alasan_ditolak}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { setEditForm(e); setEditMode(true) }} style={{ padding: '6px 14px', background: '#FAFBF5', border: '1px solid #e8e4dc', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit' }}>Edit</button>
                    {e.status_validasi === 'disetujui' && (
                      <button onClick={() => ambilOrders(e)} style={{ padding: '6px 14px', background: '#4D403A', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'white', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
                        </svg>
                        Pembayaran
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {menu === 'my-events' && editMode && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setEditMode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A39680', fontSize: 13, fontFamily: 'inherit' }}>← Kembali</button>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Edit Event</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Nama Pergelaran</label>
                <input value={editForm.nama_pergelaran || ''} onChange={e => setEditForm({ ...editForm, nama_pergelaran: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Kategori</label>
                <select value={editForm.kategori_pergelaran || ''} onChange={e => setEditForm({ ...editForm, kategori_pergelaran: e.target.value })} style={inputStyle}>
                  <option value="">-- Pilih --</option>
                  {['Pameran','Pagelaran','Konser','Festival','Pertunjukan'].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nama Lokasi</label>
              <input value={editForm.lokasi_pergelaran || ''} onChange={e => setEditForm({ ...editForm, lokasi_pergelaran: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Alamat Lengkap</label>
              <input value={editForm.alamat_pergelaran || ''} onChange={e => setEditForm({ ...editForm, alamat_pergelaran: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Harga Tiket (Rp)</label>
              <input type="number" value={editForm.harga_tiket || ''} onChange={e => setEditForm({ ...editForm, harga_tiket: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Deskripsi</label>
              <textarea value={editForm.deskripsi_pergelaran || ''} onChange={e => setEditForm({ ...editForm, deskripsi_pergelaran: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditMode(false)} style={{ padding: '10px 24px', background: 'transparent', color: '#4D403A', border: '1px solid #4D403A', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
              <button onClick={simpanEdit} style={{ padding: '10px 24px', background: '#4D403A', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Simpan Perubahan</button>
            </div>
          </div>
        )}

        {menu === 'my-events' && !editMode && eventBayar && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setEventBayar(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A39680', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>← Kembali</button>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Bukti Pembayaran</p>
            </div>
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={eventBayar.poster_pergelaran || '/placeholder.jpg'} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>{eventBayar.nama_pergelaran}</p>
                <p style={{ fontSize: 12, color: '#A39680' }}>{eventBayar.lokasi_pergelaran}</p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: '#A39680', marginBottom: 2 }}>Total Order</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#262626' }}>{orders.length}</p>
              </div>
            </div>
            {orders.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['Semua','Menunggu','Disetujui','Ditolak'].map(f => {
                  const countMap = {
                    'Semua': orders.length,
                    'Menunggu': orders.filter(o => !o.status_validasi_bayar || o.status_validasi_bayar === 'pending' || o.status_validasi_bayar === 'menunggu' || o.status_validasi_bayar === 'menunggu_validasi').length,
                    'Disetujui': orders.filter(o => o.status_validasi_bayar === 'approved').length,
                    'Ditolak': orders.filter(o => o.status_validasi_bayar === 'rejected').length,
                  }
                  return <span key={f} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 50, background: '#F5F2ED', color: '#4D403A', fontWeight: 600, cursor: 'default' }}>{f} ({countMap[f]})</span>
                })}
              </div>
            )}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', overflow: 'hidden' }}>
              {loadingOrders ? (
                <p style={{ padding: 24, color: '#A39680', fontSize: 13 }}>Loading...</p>
              ) : orders.length === 0 ? (
                <p style={{ padding: 24, color: '#A39680', fontSize: 13, textAlign: 'center' }}>Belum ada order untuk event ini.</p>
              ) : (
                orders.map((o, i) => {
                  const statusVal = o.status_validasi_bayar || 'pending'
                  const isPending = statusVal === 'pending' || statusVal === 'menunggu' || statusVal === 'menunggu_validasi' || !o.status_validasi_bayar
                  return (
                    <div key={o.id_order} style={{ padding: '14px 16px', borderBottom: i < orders.length - 1 ? '1px solid #f0ece4' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DFDACF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 1 }}>{o.pengguna?.nama_pengguna || 'Pengguna'}</p>
                        <p style={{ fontSize: 11, color: '#A39680', marginBottom: 3 }}>{o.pengguna?.email_pengguna}</p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: '#4D403A', fontWeight: 600 }}>Rp {parseInt(o.total_pembayaran).toLocaleString('id-ID')}</span>
                          <span style={{ fontSize: 10, color: '#A39680' }}>·</span>
                          <span style={{ fontSize: 11, color: '#A39680' }}>{new Date(o.waktu_order).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <StatusBadge status={statusVal} />
                      {o.bukti_bayar && (
                        <button onClick={() => setSelectedOrder(o)} style={{ padding: '6px 12px', background: '#F5F2ED', border: '1px solid #e8e4dc', borderRadius: 6, fontSize: 11, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit', fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          Lihat Bukti
                        </button>
                      )}
                      {isPending && (
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button disabled={processingId === o.id_order} onClick={() => approveOrder(o.id_order)} style={{ padding: '6px 12px', background: processingId === o.id_order ? '#ccc' : '#3B6D11', border: 'none', borderRadius: 6, fontSize: 11, cursor: processingId === o.id_order ? 'not-allowed' : 'pointer', color: 'white', fontFamily: 'inherit', fontWeight: 700 }}>✓ Approve</button>
                          <button disabled={processingId === o.id_order} onClick={() => rejectOrder(o.id_order)} style={{ padding: '6px 12px', background: processingId === o.id_order ? '#ccc' : '#7B1A1A', border: 'none', borderRadius: 6, fontSize: 11, cursor: processingId === o.id_order ? 'not-allowed' : 'pointer', color: 'white', fontFamily: 'inherit', fontWeight: 700 }}>✕ Tolak</button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ──────────── SALES ──────────── */}
        {menu === 'sales' && !selectedEvent && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 }}>Sales</p>
            {events.filter(e => e.status_validasi === 'disetujui').length === 0 ? (
              <p style={{ color: '#A39680', fontSize: 13 }}>No events yet.</p>
            ) : (
              events.filter(e => e.status_validasi === 'disetujui').map(e => (
                <div key={e.id_pergelaran} style={{ border: '1px solid #e8e4dc', borderRadius: 8, padding: 14, marginBottom: 10, display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer' }} onClick={() => ambilSales(e)}>
                  <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>{e.nama_pergelaran}</p>
                    <p style={{ fontSize: 12, color: '#A39680' }}>{e.lokasi_pergelaran}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))
            )}
          </div>
        )}

        {menu === 'sales' && selectedEvent && (
          <div>
            <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A39680', fontSize: 13, fontFamily: 'inherit', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>← Kembali</button>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '16px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 1, marginBottom: 8 }}>TIKET TERJUAL</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#262626' }}>{tikets.length}</p>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '16px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 1, marginBottom: 8 }}>TOTAL PENDAPATAN</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#3B6D11' }}>Rp {(tikets.length * (selectedEvent.harga_tiket || 0)).toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20, marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 14 }}>List ID Tiket</p>
              {tikets.length === 0 ? <p style={{ fontSize: 13, color: '#A39680' }}>No tickets sold yet.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {tikets.map(t => (
                    <div key={t.id_tiket} style={{ background: '#F5F2ED', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#4D403A', letterSpacing: 1 }}>{t.id_tiket.slice(0, 8).toUpperCase()}-{t.id_tiket.slice(9, 13).toUpperCase()}</p>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 50, fontWeight: 600, background: t.status_tiket === 'used' ? '#F1EFE8' : '#EAF3DE', color: t.status_tiket === 'used' ? '#5F5E5A' : '#27500A' }}>{t.status_tiket === 'used' ? 'Dipakai' : 'Valid'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Merchandise CRUD */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>Merchandise</p>
                <button onClick={bukaAddMerchModal} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  background: '#4D403A', border: 'none', borderRadius: 6,
                  fontSize: 12, cursor: 'pointer', color: 'white', fontFamily: 'inherit', fontWeight: 600
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Tambah
                </button>
              </div>
              {merchSales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ fontSize: 13, color: '#A39680', marginBottom: 10 }}>Belum ada merchandise.</p>
                  <button onClick={bukaAddMerchModal} style={{ padding: '8px 18px', background: '#FAFBF5', border: '1px solid #e8e4dc', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit' }}>+ Tambah Merchandise</button>
                </div>
              ) : (
                merchSales.map((m, i) => (
                  <div key={m.id_merchandise} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < merchSales.length - 1 ? '1px solid #f0ece4' : 'none' }}>
                    {m.foto_merchandise ? (
                      <img src={m.foto_merchandise} alt={m.nama_merchandise} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #e8e4dc' }} />
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: 8, background: '#F5F2ED', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e8e4dc' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 2 }}>{m.nama_merchandise}</p>
                      <p style={{ fontSize: 11, color: '#4D403A', fontWeight: 600, marginBottom: 3 }}>
                        {m.pergelaran?.nama_pergelaran || '⚠️ Belum terhubung ke event'}
                      </p>
                      {m.deskripsi_merchandise && <p style={{ fontSize: 11, color: '#A39680', marginBottom: 3 }}>{m.deskripsi_merchandise}</p>}
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#4D403A' }}>Rp {parseInt(m.harga_merchandise).toLocaleString('id-ID')}</span>
                        <span style={{ fontSize: 11, color: '#A39680' }}>·</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, fontWeight: 600, background: m.stok_merchandise > 0 ? '#EAF3DE' : '#FDECEA', color: m.stok_merchandise > 0 ? '#27500A' : '#7B1A1A' }}>
                          Stok: {m.stok_merchandise}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => bukaEditMerchModal(m)} style={{ padding: '6px 12px', background: '#FAFBF5', border: '1px solid #e8e4dc', borderRadius: 6, fontSize: 11, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        disabled={deletingMerchModalId === m.id_merchandise}
                        onClick={() => hapusMerchModal(m.id_merchandise)}
                        style={{ padding: '6px 12px', background: deletingMerchModalId === m.id_merchandise ? '#ccc' : '#FDECEA', border: '1px solid #f5c6c6', borderRadius: 6, fontSize: 11, cursor: deletingMerchModalId === m.id_merchandise ? 'not-allowed' : 'pointer', color: '#7B1A1A', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                        {deletingMerchModalId === m.id_merchandise ? 'Menghapus...' : 'Hapus'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ──────────── REVIEWS ──────────── */}
        {menu === 'reviews' && (
          <div>
            {loadingReviews ? (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 40, textAlign: 'center' }}>
                <p style={{ color: '#A39680', fontSize: 13 }}>Memuat reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 48, textAlign: 'center' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>⭐</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 6 }}>Belum ada review</p>
                <p style={{ fontSize: 13, color: '#A39680' }}>Review dari customer akan muncul di sini setelah event selesai.</p>
              </div>
            ) : (
              <>
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20, marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <p style={{ fontSize: 40, fontWeight: 800, color: '#262626', lineHeight: 1, marginBottom: 4 }}>{avgRating}</p>
                    <StarRating rating={Math.round(parseFloat(avgRating))} size={16} />
                    <p style={{ fontSize: 11, color: '#A39680', marginTop: 4 }}>{reviews.length} review</p>
                  </div>
                  <div style={{ width: 1, background: '#e8e4dc', alignSelf: 'stretch' }} />
                  <div style={{ flex: 1 }}>
                    {ratingDist.map(({ star, count, pct }) => (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: '#4D403A', width: 12, textAlign: 'right', flexShrink: 0 }}>{star}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#F5A623" stroke="#F5A623" strokeWidth="1" style={{ flexShrink: 0 }}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <div style={{ flex: 1, height: 6, background: '#F5F2ED', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#F5A623', borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#A39680', width: 20, flexShrink: 0 }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {events.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                    <button onClick={() => setFilterEventId('semua')} style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, border: filterEventId === 'semua' ? 'none' : '1px solid #e8e4dc', background: filterEventId === 'semua' ? '#262626' : 'white', color: filterEventId === 'semua' ? 'white' : '#555', cursor: 'pointer', fontFamily: 'inherit', fontWeight: filterEventId === 'semua' ? 600 : 400 }}>Semua Event</button>
                    {events.filter(e => reviews.some(r => r.id_pergelaran === e.id_pergelaran)).map(e => (
                      <button key={e.id_pergelaran} onClick={() => setFilterEventId(e.id_pergelaran)} style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, border: filterEventId === e.id_pergelaran ? 'none' : '1px solid #e8e4dc', background: filterEventId === e.id_pergelaran ? '#262626' : 'white', color: filterEventId === e.id_pergelaran ? 'white' : '#555', cursor: 'pointer', fontFamily: 'inherit', fontWeight: filterEventId === e.id_pergelaran ? 600 : 400 }}>{e.nama_pergelaran}</button>
                    ))}
                  </div>
                )}
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', overflow: 'hidden' }}>
                  {reviewsFiltered.length === 0 ? (
                    <p style={{ padding: 24, color: '#A39680', fontSize: 13, textAlign: 'center' }}>Belum ada review untuk event ini.</p>
                  ) : (
                    reviewsFiltered.map((r, i) => (
                      <div key={r.id_review} style={{ padding: '16px 20px', borderBottom: i < reviewsFiltered.length - 1 ? '1px solid #f0ece4' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#DFDACF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 1 }}>{r.pengguna?.nama_pengguna || 'Pengguna'}</p>
                              <p style={{ fontSize: 11, color: '#A39680' }}>{r.pengguna?.email_pengguna}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <StarRating rating={r.rating} size={13} />
                            <p style={{ fontSize: 11, color: '#A39680', marginTop: 3 }}>{new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        {filterEventId === 'semua' && r.pergelaran?.nama_pergelaran && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F5F2ED', borderRadius: 50, padding: '3px 10px', marginBottom: 8 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            <span style={{ fontSize: 11, color: '#4D403A', fontWeight: 600 }}>{r.pergelaran.nama_pergelaran}</span>
                          </div>
                        )}
                        {r.pesan ? (
                          <p style={{ fontSize: 13, color: '#4D403A', lineHeight: 1.7, margin: 0 }}>{r.pesan}</p>
                        ) : (
                          <p style={{ fontSize: 12, color: '#A39680', fontStyle: 'italic', margin: 0 }}>Tidak ada komentar.</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* MODAL PREVIEW BUKTI BAYAR */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e4dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#262626' }}>Bukti Pembayaran</p>
                <p style={{ fontSize: 11, color: '#A39680', marginTop: 2 }}>{selectedOrder.pengguna?.nama_pengguna} · {selectedOrder.pengguna?.email_pengguna}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A39680', fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: 16 }}>
              {selectedOrder.bukti_bayar ? (
                <img src={selectedOrder.bukti_bayar} alt="Bukti Bayar" style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'contain', border: '1px solid #e8e4dc', background: '#FAFBF5' }} />
              ) : (
                <div style={{ height: 160, background: '#F5F2ED', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 13, color: '#A39680' }}>Tidak ada bukti foto</p>
                </div>
              )}
              <div style={{ marginTop: 14, background: '#FAFBF5', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Total Pembayaran', value: `Rp ${parseInt(selectedOrder.total_pembayaran).toLocaleString('id-ID')}` },
                  { label: 'Metode', value: selectedOrder.metode_bayar || selectedOrder.metode_pembayaran },
                  { label: 'Waktu Order', value: new Date(selectedOrder.waktu_order).toLocaleString('id-ID') },
                  { label: 'Status', value: <StatusBadge status={selectedOrder.status_validasi_bayar || 'pending'} /> },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#A39680' }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {(selectedOrder.status_validasi_bayar === 'pending' || selectedOrder.status_validasi_bayar === 'menunggu' || selectedOrder.status_validasi_bayar === 'menunggu_validasi' || !selectedOrder.status_validasi_bayar) && (
              <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                <button disabled={processingId === selectedOrder.id_order} onClick={() => approveOrder(selectedOrder.id_order)} style={{ flex: 1, padding: '11px 0', background: processingId === selectedOrder.id_order ? '#ccc' : '#3B6D11', border: 'none', borderRadius: 8, fontSize: 13, cursor: processingId === selectedOrder.id_order ? 'not-allowed' : 'pointer', color: 'white', fontFamily: 'inherit', fontWeight: 700 }}>
                  {processingId === selectedOrder.id_order ? 'Memproses...' : '✓ Approve Pembayaran'}
                </button>
                <button disabled={processingId === selectedOrder.id_order} onClick={() => rejectOrder(selectedOrder.id_order)} style={{ flex: 1, padding: '11px 0', background: processingId === selectedOrder.id_order ? '#ccc' : '#7B1A1A', border: 'none', borderRadius: 8, fontSize: 13, cursor: processingId === selectedOrder.id_order ? 'not-allowed' : 'pointer', color: 'white', fontFamily: 'inherit', fontWeight: 700 }}>
                  {processingId === selectedOrder.id_order ? 'Memproses...' : '✕ Tolak'}
                </button>
              </div>
            )}
            {selectedOrder.status_validasi_bayar === 'approved' && (
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ background: '#EAF3DE', borderRadius: 8, padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#27500A' }}>✓ Pembayaran sudah disetujui</div>
              </div>
            )}
            {selectedOrder.status_validasi_bayar === 'rejected' && (
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ background: '#FDECEA', borderRadius: 8, padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#7B1A1A' }}>✕ Pembayaran telah ditolak</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT MERCHANDISE */}
      {merchModal && (
        <div onClick={() => setMerchModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e4dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#262626' }}>{merchModal === 'add' ? 'Tambah Merchandise' : 'Edit Merchandise'}</p>
              <button onClick={() => setMerchModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A39680', fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {merchModalForm.foto_merchandise && (
                <div style={{ textAlign: 'center' }}>
                  <img src={merchModalForm.foto_merchandise} alt="preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, border: '1px solid #e8e4dc' }} onError={e => { e.target.style.display = 'none' }} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Untuk Event <span style={{ color: '#7B1A1A' }}>*</span></label>
                <select value={merchModalForm.id_pergelaran} onChange={e => setMerchModalForm({ ...merchModalForm, id_pergelaran: e.target.value })} style={inputStyle}>
                  <option value="">-- Pilih event --</option>
                  {events.map(e => (
                    <option key={e.id_pergelaran} value={e.id_pergelaran}>{e.nama_pergelaran}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nama Merchandise <span style={{ color: '#7B1A1A' }}>*</span></label>
                <input value={merchModalForm.nama_merchandise} onChange={e => setMerchModalForm({ ...merchModalForm, nama_merchandise: e.target.value })} placeholder="cth: Kaos Event, Tote Bag, Pin, dll" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Harga (Rp) <span style={{ color: '#7B1A1A' }}>*</span></label>
                  <input type="number" value={merchModalForm.harga_merchandise} onChange={e => setMerchModalForm({ ...merchModalForm, harga_merchandise: e.target.value })} placeholder="50000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stok <span style={{ color: '#7B1A1A' }}>*</span></label>
                  <input type="number" value={merchModalForm.stok_merchandise} onChange={e => setMerchModalForm({ ...merchModalForm, stok_merchandise: e.target.value })} placeholder="100" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>URL Foto</label>
                <input value={merchModalForm.foto_merchandise} onChange={e => setMerchModalForm({ ...merchModalForm, foto_merchandise: e.target.value })} placeholder="https://..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Deskripsi</label>
                <textarea value={merchModalForm.deskripsi_merchandise} onChange={e => setMerchModalForm({ ...merchModalForm, deskripsi_merchandise: e.target.value })} placeholder="Deskripsi singkat merchandise..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
              <button onClick={() => setMerchModal(null)} style={{ flex: 1, padding: '11px 0', background: 'transparent', color: '#4D403A', border: '1px solid #4D403A', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
              <button
                disabled={savingMerchModal || !merchModalForm.id_pergelaran || !merchModalForm.nama_merchandise || !merchModalForm.harga_merchandise || !merchModalForm.stok_merchandise}
                onClick={simpanMerchModal}
                style={{
                  flex: 2, padding: '11px 0',
                  background: (savingMerchModal || !merchModalForm.id_pergelaran || !merchModalForm.nama_merchandise || !merchModalForm.harga_merchandise || !merchModalForm.stok_merchandise) ? '#A39680' : '#4D403A',
                  color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: (savingMerchModal || !merchModalForm.id_pergelaran || !merchModalForm.nama_merchandise) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}>
                {savingMerchModal ? 'Menyimpan...' : (merchModal === 'add' ? 'Tambah Merchandise' : 'Simpan Perubahan')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #e8e4dc', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <span onClick={() => navigate('/terms')} style={{ fontSize: 12, color: '#4D403A', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Terms & Condition</span>
        <span style={{ fontSize: 11, color: '#A39680' }}>© 2026 SurabayArt. All rights reserved.</span>
      </div>

    </div>
  )
}

export default OrganizerProfile