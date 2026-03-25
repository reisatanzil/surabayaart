import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function OrganizerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [penyelenggara, setPenyelenggara] = useState(null)
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0
  })

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
      .select('*')
      .eq('id_pengguna', id)
      .single()

    if (!org) return
    setPenyelenggara(org)

    const { data: events } = await supabase
      .from('pergelaran')
      .select('status_validasi')
      .eq('id_penyelenggara', org.id_penyelenggara)

    if (events) {
      setStats({
        total: events.length,
        approved: events.filter(e => e.status_validasi === true).length,
        pending: events.filter(e => e.status_validasi === false).length,
      })
    }
  }

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
          <span
            onClick={() => navigate('/organizer/dashboard')}
            style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#262626', letterSpacing: 0.5 }}>
            Dashboard
          </span>
          <span
            onClick={() => navigate('/organizer/upload')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Upload Event
          </span>
          <button
            onClick={() => navigate('/organizer/profile')}
            style={{
              padding: '8px 20px', background: '#262626',
              color: 'white', border: 'none', borderRadius: 50,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit'
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

      <div style={{ padding: '40px 32px' }}>

        {/* STATS */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 40 }}>
          <div style={{
            flex: 1, background: 'white', borderRadius: 10,
            border: '1px solid #e8e4dc', padding: '20px 24px'
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 1, marginBottom: 8 }}>
              TOTAL EVENT
            </p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#262626' }}>{stats.total}</p>
          </div>
          <div style={{
            flex: 1, background: 'white', borderRadius: 10,
            border: '1px solid #e8e4dc', padding: '20px 24px'
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 1, marginBottom: 8 }}>
              DISETUJUI
            </p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#3B6D11' }}>{stats.approved}</p>
          </div>
          <div style={{
            flex: 1, background: 'white', borderRadius: 10,
            border: '1px solid #e8e4dc', padding: '20px 24px'
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 1, marginBottom: 8 }}>
              MENUNGGU
            </p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#BA7517' }}>{stats.pending}</p>
          </div>
        </div>

        {/* ABOUT */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#262626', marginBottom: 20 }}>
          About SurabayaART :
        </h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <img src="/about1.png" alt="about1" style={{ flex: 1, height: 180, objectFit: 'cover', borderRadius: 8 }} />
          <img src="/about2.png" alt="about2" style={{ flex: 1, height: 180, objectFit: 'cover', borderRadius: 8 }} />
          <img src="/about3.png" alt="about3" style={{ flex: 1, height: 180, objectFit: 'cover', borderRadius: 8 }} />
        </div>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, textAlign: 'justify' }}>
          SurabayaArt adalah sebuah platform digital berbasis website yang dikembangkan sebagai pusat informasi dan pemesanan tiket pergelaran seni di Kota Surabaya.Platform ini hadir untuk menjawab permasalahan tersebarnya informasi
          acara seni di berbagai media sosial serta belum terintegrasinya sistem pemesanan tiket. SurabayArt menghubungkan penyelenggara acara dengan masyarakat dalam satu sistem terpadu.
        </p>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, marginTop: 10, textAlign: 'justify' }}>
          Bagi masyarakat, SurabayaArt menyediakan informasi lengkap mengenai
          berbagai pergelaran seni di Surabaya, fitur pencarian berdasarkan
          kategori acara, serta sistem pemesanan dan pembayaran tiket secara
          online. Bagi penyelenggara, platform ini menyediakan fitur pendaftaran
          dan dashboard manajemen event mandiri untuk mengunggah informasi acara
          serta mengelola tiket.
        </p>
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: '1px solid #e8e4dc', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 20
      }}>
        <span style={{
          fontSize: 12, color: '#4D403A', cursor: 'pointer',
          fontWeight: 600, textDecoration: 'underline'
        }}>
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