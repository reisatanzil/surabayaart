import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function Reservasi() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) {
      navigate('/signin')
      return
    }
    setUser(JSON.parse(data))
    ambilEvents()
  }, [])

  async function ambilEvents() {
    const { data, error } = await supabase
      .from('pergelaran')
      .select(`
        *,
        penyelenggara (
          instansi_penyelenggara
        )
      `)
      .eq('status_validasi', true)

    if (!error) setEvents(data)
    setLoading(false)
  }

  const filtered = events.filter(e =>
    e.nama_pergelaran.toLowerCase().includes(search.toLowerCase())
  )

  if (!user) return null

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', background: '#FAFBF5', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <div style={{
        background: 'white',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
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
          <span onClick={() => navigate('/home')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Dashboard
          </span>
          <span onClick={() => navigate('/reservasi')}
            style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#262626', letterSpacing: 0.5 }}>
            Reservasi
          </span>
          <button onClick={() => navigate('/profile')}
            style={{
              padding: '8px 20px',
              background: '#262626', color: 'white',
              border: 'none', borderRadius: 50,
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', letterSpacing: 0.5,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
            My Profile
          </button>
        </div>
      </div>

      {/* KONTEN */}
      <div style={{ padding: '32px 32px' }}>

        {/* SEARCH BAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button style={{
            padding: '9px 20px',
            background: '#4D403A', color: 'white',
            border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer', letterSpacing: 0.5
          }}>
            Reservasi
          </button>
          <input
            type="text"
            placeholder="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '9px 16px',
              borderRadius: 8, border: '1px solid #e0dbd4',
              background: 'white', fontSize: 13,
              outline: 'none', color: '#262626'
            }}
          />
        </div>

        {/* JUDUL */}
        <h2 style={{
          fontSize: 22, fontWeight: 800,
          color: '#262626', marginBottom: 20,
          letterSpacing: 1
        }}>NOW SHOWING</h2>

        {/* LIST EVENT */}
        {loading ? (
          <p style={{ color: '#A39680', fontSize: 13 }}>loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#A39680', fontSize: 13 }}>belum ada event tersedia.</p>
        ) : (
          filtered.map(event => (
            <div key={event.id_pergelaran} style={{
              background: 'white',
              borderRadius: 10,
              border: '1px solid #e8e4dc',
              padding: 16,
              marginBottom: 14,
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start'
            }}>
              {/* POSTER */}
              <img
                src={event.poster_pergelaran || '/placeholder.jpg'}
                alt={event.nama_pergelaran}
                style={{
                  width: 88, height: 88,
                  objectFit: 'cover',
                  borderRadius: 8, flexShrink: 0
                }}
              />

              {/* INFO */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                  {event.nama_pergelaran}
                </h3>
                <p style={{ fontSize: 12, color: '#A39680', marginBottom: 8 }}>
                  {event.lokasi_pergelaran}
                </p>
                <p style={{ fontSize: 12, color: '#777', lineHeight: 1.6 }}>
                  {event.deskripsi_pergelaran?.slice(0, 120)}...
                </p>
              </div>

              {/* TOMBOL */}
              <button
                onClick={() => navigate(`/detail/${event.id_pergelaran}`)}
                style={{
                  padding: '8px 16px',
                  background: '#4D403A', color: 'white',
                  border: 'none', borderRadius: 6,
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  alignSelf: 'center'
                }}>
                Beli Sekarang →
              </button>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: '1px solid #e8e4dc',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20
      }}>
        <span
          onClick={() => navigate('/terms')}
          style={{
            fontSize: 12, color: '#4D403A',
            cursor: 'pointer', fontWeight: 600,
            textDecoration: 'underline', letterSpacing: 0.3
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

export default Reservasi