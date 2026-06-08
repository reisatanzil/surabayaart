import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../supabase'

function MyTicket() {
  const navigate = useNavigate()
  const { orderId: id_order } = useParams()
  const [user, setUser] = useState(null)
  const [order, setOrder] = useState(null)
  const [tikets, setTikets] = useState([])
  const [pergelaran, setPergelaran] = useState(null)
  const [jadwal, setJadwal] = useState(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef(null)

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    const u = JSON.parse(data)
    setUser(u)
    ambilData(u, id_order)
  }, [id_order])

  async function ambilData(u, orderId) {
    // Ambil order
    const { data: orderData } = await supabase
      .from('order')
      .select('*, detail_order(*)')
      .eq('id_order', orderId)
      .eq('id_pengguna', u.id_pengguna)
      .single()

    if (!orderData) { navigate('/profile'); return }
    setOrder(orderData)

    // Ambil tiket
    const { data: tiketData } = await supabase
      .from('tiket')
      .select('*')
      .eq('id_order', orderId)

    setTikets(tiketData || [])

    // Ambil info jadwal + pergelaran dari tiket pertama
    if (tiketData && tiketData.length > 0 && tiketData[0].id_jadwal) {
      const { data: jadwalData } = await supabase
        .from('jadwal_event')
        .select('*, pergelaran(*)')
        .eq('id_jadwal', tiketData[0].id_jadwal)
        .single()

      if (jadwalData) {
        setJadwal(jadwalData)
        setPergelaran(jadwalData.pergelaran)
      }
    }

    setLoading(false)
  }

  function handlePrint() {
    window.print()
  }

  if (loading) return (
    <div style={{ fontFamily: 'Albert Sans, sans-serif', background: '#FAFBF5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#A39680', fontSize: 13 }}>Memuat tiket...</p>
    </div>
  )

  if (!order) return null

  const isApproved = order.status_validasi_bayar === 'approved'

  return (
    <div style={{ fontFamily: 'Albert Sans, sans-serif', background: '#FAFBF5', minHeight: '100vh' }}>

      {/* Inject font barcode + print style */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128+Text&family=Libre+Barcode+128&display=swap');

        .barcode-text {
          font-family: 'Libre Barcode 128', cursive;
          font-size: 64px;
          line-height: 1;
          color: #262626;
          letter-spacing: 0;
          display: block;
          text-align: center;
          user-select: none;
        }

        .barcode-id {
          font-size: 11px;
          font-family: 'Albert Sans', sans-serif;
          color: #A39680;
          text-align: center;
          margin-top: 4px;
          letter-spacing: 2px;
        }

        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: fixed !important;
            top: 0; left: 0;
            width: 100% !important;
            background: white !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <div className="no-print" style={{
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
          <span onClick={() => navigate('/home')} style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>Dashboard</span>
          <span onClick={() => navigate('/reservasi')} style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>Reservasi</span>
          <button onClick={() => navigate('/profile')} style={{ padding: '8px 20px', background: '#262626', color: 'white', border: 'none', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            My Profile
          </button>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: 600, margin: '0 auto' }}>

        {/* Back button */}
        <button className="no-print" onClick={() => navigate('/profile')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#A39680', fontSize: 13, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: 0
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Kembali ke Profil
        </button>

        {/* Area yang bisa diprint */}
        <div id="print-area" ref={printRef}>

          {/* Header event */}
          {pergelaran && (
            <div style={{
              background: 'white', borderRadius: 10,
              border: '1px solid #e8e4dc', overflow: 'hidden', marginBottom: 16
            }}>
              <div style={{ position: 'relative', height: 120, background: '#DFDACF', overflow: 'hidden' }}>
                {pergelaran.poster_pergelaran && (
                  <img src={pergelaran.poster_pergelaran} alt={pergelaran.nama_pergelaran}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                )}
                <div style={{
                  position: 'absolute', inset: 0, padding: '16px 20px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 2 }}>
                    {pergelaran.nama_pergelaran}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                    {pergelaran.lokasi_pergelaran}
                  </p>
                </div>
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {jadwal?.tanggal_jadwal && (
                  <div>
                    <p style={{ fontSize: 10, color: '#A39680', fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>TANGGAL</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>
                      {new Date(jadwal.tanggal_jadwal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {jadwal?.waktu_mulai && (
                  <div>
                    <p style={{ fontSize: 10, color: '#A39680', fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>WAKTU</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>{jadwal.waktu_mulai}</p>
                  </div>
                )}
                {pergelaran.kategori_pergelaran && (
                  <div>
                    <p style={{ fontSize: 10, color: '#A39680', fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>KATEGORI</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>{pergelaran.kategori_pergelaran}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order info */}
          <div style={{
            background: 'white', borderRadius: 10,
            border: '1px solid #e8e4dc', padding: '14px 20px',
            marginBottom: 16, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: 10, color: '#A39680', fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>ORDER ID</p>
              <p style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#4D403A' }}>
                #{order.id_order.slice(0, 8).toUpperCase()}
              </p>
              <p style={{ fontSize: 11, color: '#A39680', marginTop: 2 }}>
                {new Date(order.waktu_order).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, color: '#A39680', fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>STATUS</p>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 50, fontWeight: 700,
                background: isApproved ? '#EAF3DE' : '#FAEEDA',
                color: isApproved ? '#27500A' : '#633806'
              }}>
                {isApproved ? 'Tervalidasi ✓' : 'Menunggu Validasi'}
              </span>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginTop: 4 }}>
                Rp {parseInt(order.total_pembayaran).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Tiket-tiket dengan barcode */}
          <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 12 }}>
            E-Ticket ({tikets.length} tiket)
          </p>

          {tikets.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#A39680' }}>Tiket belum tersedia.</p>
            </div>
          ) : (
            tikets.map((t, i) => (
              <div key={t.id_tiket} style={{
                background: 'white', borderRadius: 10,
                border: `1px solid ${t.status_tiket === 'used' ? '#e8e4dc' : '#C6E0A4'}`,
                marginBottom: 14, overflow: 'hidden',
                opacity: t.status_tiket === 'used' ? 0.65 : 1
              }}>
                {/* Header tiket */}
                <div style={{
                  background: t.status_tiket === 'used' ? '#F5F2ED' : '#EAF3DE',
                  padding: '10px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: t.status_tiket === 'used' ? '#5F5E5A' : '#27500A' }}>
                    TIKET #{i + 1}
                    {!isApproved && (
                      <span style={{ marginLeft: 8, fontSize: 10, color: '#633806', background: '#FAEEDA', borderRadius: 50, padding: '1px 7px' }}>
                        Belum aktif
                      </span>
                    )}
                  </p>
                  <span style={{
                    fontSize: 11, padding: '2px 10px', borderRadius: 50, fontWeight: 700,
                    background: t.status_tiket === 'used' ? '#E8E6E1' : '#fff',
                    color: t.status_tiket === 'used' ? '#5F5E5A' : '#27500A',
                    border: `1px solid ${t.status_tiket === 'used' ? '#DDD8CE' : '#C6E0A4'}`
                  }}>
                    {t.status_tiket === 'used' ? 'Sudah Dipakai' : 'Valid'}
                  </span>
                </div>

                {/* Body tiket */}
                <div style={{ padding: '20px 20px 16px' }}>

                  {/* ID tiket */}
                  <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#A39680', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>ID TIKET</p>
                    <p style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 800, color: '#4D403A', letterSpacing: 2 }}>
                      {t.id_tiket.slice(0, 8).toUpperCase()}-{t.id_tiket.slice(9, 13).toUpperCase()}
                    </p>
                  </div>

                  {/* Barcode */}
                  <div style={{
                    background: '#FAFBF5', borderRadius: 8,
                    border: '1px solid #e8e4dc',
                    padding: '16px 12px 8px',
                    textAlign: 'center'
                  }}>
                    <span className="barcode-text">
                      {t.id_tiket.replace(/-/g, '')}
                    </span>
                    <p className="barcode-id">
                      {t.id_tiket.toUpperCase()}
                    </p>
                  </div>

                  {/* Info tambahan */}
                  {pergelaran && (
                    <div style={{
                      marginTop: 14, display: 'flex', gap: 12,
                      flexWrap: 'wrap', justifyContent: 'center'
                    }}>
                      {[
                        { label: 'EVENT', value: pergelaran.nama_pergelaran },
                        { label: 'LOKASI', value: pergelaran.lokasi_pergelaran },
                        jadwal?.tanggal_jadwal && { label: 'TANGGAL', value: new Date(jadwal.tanggal_jadwal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
                      ].filter(Boolean).map((info, idx) => (
                        <div key={idx} style={{ textAlign: 'center', minWidth: 80 }}>
                          <p style={{ fontSize: 9, color: '#A39680', fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>{info.label}</p>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#4D403A' }}>{info.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isApproved && (
                    <div style={{
                      marginTop: 12, background: '#FAEEDA', borderRadius: 6,
                      padding: '8px 12px', textAlign: 'center'
                    }}>
                      <p style={{ fontSize: 11, color: '#633806' }}>
                        ⏳ Tiket aktif setelah pembayaran divalidasi penyelenggara
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

        </div>

        {/* Tombol print */}
        {tikets.length > 0 && (
          <button className="no-print" onClick={handlePrint} style={{
            width: '100%', padding: '12px',
            background: '#262626', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 13,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 4
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Simpan sebagai PDF
          </button>
        )}

      </div>

      {/* FOOTER */}
      <div className="no-print" style={{
        borderTop: '1px solid #e8e4dc', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', marginTop: 20
      }}>
        <span style={{ fontSize: 12, color: '#4D403A', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Terms & Condition</span>
        <span style={{ fontSize: 11, color: '#A39680' }}>© 2026 SurabayArt. All rights reserved.</span>
      </div>

    </div>
  )
}

export default MyTicket