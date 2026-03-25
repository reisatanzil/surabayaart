import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [menu, setMenu] = useState('validate-organizer')
  const [pending, setPending] = useState([])
  const [pendingEvents, setPendingEvents] = useState([])
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [alasan, setAlasan] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    const u = JSON.parse(data)
    if (u.role_pengguna !== 'admin') { navigate('/signin'); return }
    setUser(u)
    ambilSemua()
  }, [])

  async function ambilSemua() {
    const [p, pe, e, u] = await Promise.all([
      supabase.from('penyelenggara').select('*, pengguna(*)').eq('status', 'pending'),
      supabase.from('pergelaran').select('*, penyelenggara(instansi_penyelenggara)').eq('status_validasi', false),
      supabase.from('pergelaran').select('*, penyelenggara(instansi_penyelenggara)'),
      supabase.from('pengguna').select('*').neq('role_pengguna', 'admin'),
    ])
    setPending(p.data || [])
    setPendingEvents(pe.data || [])
    setEvents(e.data || [])
    setUsers(u.data || [])
    setLoading(false)
  }

  async function approveOrg(id) {
    await supabase.from('penyelenggara').update({ status: 'active' }).eq('id_penyelenggara', id)
    setSelected(null)
    ambilSemua()
  }

  async function rejectOrg(id) {
    if (!alasan) { alert('isi alasan penolakan dulu!'); return }
    await supabase.from('penyelenggara').update({ status: 'rejected' }).eq('id_penyelenggara', id)
    setSelected(null)
    setAlasan('')
    ambilSemua()
  }

  async function approveEvent(id) {
    await supabase.from('pergelaran').update({ status_validasi: true }).eq('id_pergelaran', id)
    ambilSemua()
  }

  async function rejectEvent(id) {
    if (!alasan) { alert('isi alasan penolakan dulu!'); return }
    await supabase.from('pergelaran').update({ status_validasi: false }).eq('id_pergelaran', id)
    setSelected(null)
    setAlasan('')
    ambilSemua()
  }

  async function takeDown(id) {
    await supabase.from('pergelaran').update({ status_validasi: false }).eq('id_pergelaran', id)
    ambilSemua()
  }

  async function blokirUser(id) {
    await supabase.from('pengguna').update({ status: 'blocked' }).eq('id_pengguna', id)
    ambilSemua()
  }

  if (!user) return null

  const menuItems = [
    {
      key: 'validate-organizer', label: 'Validate Organizer',
      badge: pending.length,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M16 11l2 2 4-4"/></svg>
    },
    {
      key: 'validate-event', label: 'Validate Event',
      badge: pendingEvents.length,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
    },
    {
      key: 'monitoring-user', label: 'Monitoring User',
      badge: 0,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    {
      key: 'monitoring-event', label: 'Monitoring Event',
      badge: 0,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
    },
    {
      key: 'ticket-sales', label: 'Ticket Sales',
      badge: 0,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
    },
    {
      key: 'merch-sales', label: 'Merchandise Sales',
      badge: 0,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    },
  ]

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: 8, border: '1px solid #e8e4dc',
    fontSize: 13, outline: 'none', color: '#262626',
    fontFamily: 'inherit', background: 'white',
    resize: 'vertical', minHeight: 80
  }

  return (
    <div style={{ fontFamily: 'Albert Sans, sans-serif', minHeight: '100vh', background: '#e8e4dc' }}>

      {/* NAVBAR */}
      <div style={{
        background: 'white', padding: '0 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 56,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.jpg" alt="logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#262626' }}>
            SURABAYA <span style={{ fontWeight: 400, color: '#555' }}>ART</span>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('user'); navigate('/signin') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', background: 'transparent',
            border: '1px solid #4D403A', borderRadius: 50,
            fontSize: 12, fontWeight: 600, color: '#4D403A',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>
      </div>

      {/* HERO */}
      <div style={{
        height: 120,
        backgroundImage: 'url(/balaipemuda.png)',
        backgroundSize: 'cover', backgroundPosition: 'center'
      }} />

      {/* BODY */}
      <div style={{ display: 'flex', padding: '16px', gap: 14, minHeight: 'calc(100vh - 176px)' }}>

        {/* SIDEBAR */}
        <div style={{
          width: 210, flexShrink: 0,
          background: 'white', borderRadius: 10,
          overflow: 'hidden', height: 'fit-content'
        }}>
          <div style={{
            padding: '10px 16px', fontSize: 11,
            fontWeight: 700, color: '#4D403A', letterSpacing: 1.5,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #e8e4dc'
          }}>
            HOME
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          <div style={{
            textAlign: 'center', padding: '20px 16px 16px',
            borderBottom: '1px solid #e8e4dc'
          }}>
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              background: '#DFDACF', margin: '0 auto 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 2 }}>
              {user.nama_pengguna}
            </p>
            <p style={{ fontSize: 11, color: '#A39680' }}>Admin</p>
          </div>

          {menuItems.map(item => (
            <div key={item.key} onClick={() => setMenu(item.key)} style={{
              padding: '11px 16px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer', fontSize: 12,
              fontWeight: menu === item.key ? 700 : 400,
              color: menu === item.key ? '#4D403A' : '#555',
              background: menu === item.key ? '#FAF7F2' : 'transparent',
              borderLeft: menu === item.key ? '3px solid #4D403A' : '3px solid transparent',
              borderBottom: '1px solid #f0ece4'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.icon}
                {item.label}
                {item.badge > 0 && (
                  <span style={{
                    background: '#E24B4A', color: 'white',
                    borderRadius: 50, padding: '0 5px',
                    fontSize: 10, fontWeight: 700
                  }}>{item.badge}</span>
                )}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>

        {/* KONTEN KANAN */}
        <div style={{ flex: 1 }}>

          {/* VALIDATE ORGANIZER */}
          {menu === 'validate-organizer' && (
            <div style={{ background: 'white', borderRadius: 10, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 }}>
                Penyelenggara Menunggu Verifikasi
              </h2>
              {loading ? (
                <p style={{ color: '#A39680', fontSize: 13 }}>Loading...</p>
              ) : pending.length === 0 ? (
                <p style={{ color: '#A39680', fontSize: 13 }}>Tidak ada yang menunggu verifikasi.</p>
              ) : (
                pending.map(p => (
                  <div key={p.id_penyelenggara} style={{
                    border: '1px solid #e8e4dc', borderRadius: 8, padding: 14, marginBottom: 10
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>
                          {p.pengguna?.nama_pengguna}
                        </p>
                        <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>{p.pengguna?.email_pengguna}</p>
                        <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>NIK: {p.nik_penyelenggara}</p>
                        <p style={{ fontSize: 12, color: '#A39680' }}>Instansi: {p.instansi_penyelenggara}</p>
                      </div>
                      <button onClick={() => setSelected(selected?.id_penyelenggara === p.id_penyelenggara ? null : p)}
                        style={{
                          padding: '6px 14px', background: '#FAFBF5',
                          border: '1px solid #e8e4dc', borderRadius: 6,
                          fontSize: 12, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit'
                        }}>
                        {selected?.id_penyelenggara === p.id_penyelenggara ? 'Tutup' : 'Review'}
                      </button>
                    </div>
                    {selected?.id_penyelenggara === p.id_penyelenggara && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8e4dc' }}>
                        <textarea placeholder="Alasan penolakan (wajib diisi jika reject)..."
                          value={alasan} onChange={e => setAlasan(e.target.value)}
                          style={inputStyle} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button onClick={() => approveOrg(p.id_penyelenggara)} style={{
                            padding: '8px 20px', background: '#3B6D11', color: 'white',
                            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit'
                          }}>Approve</button>
                          <button onClick={() => rejectOrg(p.id_penyelenggara)} style={{
                            padding: '8px 20px', background: '#A32D2D', color: 'white',
                            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit'
                          }}>Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* VALIDATE EVENT */}
          {menu === 'validate-event' && (
            <div style={{ background: 'white', borderRadius: 10, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 }}>
                Event Menunggu Validasi
              </h2>
              {pendingEvents.length === 0 ? (
                <p style={{ color: '#A39680', fontSize: 13 }}>Tidak ada event yang menunggu validasi.</p>
              ) : (
                pendingEvents.map(e => (
                  <div key={e.id_pergelaran} style={{
                    border: '1px solid #e8e4dc', borderRadius: 8, padding: 14, marginBottom: 10
                  }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran}
                        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>
                          {e.nama_pergelaran}
                        </p>
                        <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>
                          {e.penyelenggara?.instansi_penyelenggara}
                        </p>
                        <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>{e.lokasi_pergelaran}</p>
                        <p style={{ fontSize: 12, color: '#A39680' }}>
                          Rp {parseInt(e.harga_tiket || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button onClick={() => setSelected(selected?.id_pergelaran === e.id_pergelaran ? null : e)}
                        style={{
                          padding: '6px 14px', background: '#FAFBF5',
                          border: '1px solid #e8e4dc', borderRadius: 6,
                          fontSize: 12, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit'
                        }}>
                        {selected?.id_pergelaran === e.id_pergelaran ? 'Tutup' : 'Review'}
                      </button>
                    </div>
                    {selected?.id_pergelaran === e.id_pergelaran && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8e4dc' }}>
                        <textarea placeholder="Alasan penolakan (wajib diisi jika reject)..."
                          value={alasan} onChange={ev => setAlasan(ev.target.value)}
                          style={inputStyle} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button onClick={() => approveEvent(e.id_pergelaran)} style={{
                            padding: '8px 20px', background: '#3B6D11', color: 'white',
                            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit'
                          }}>Approve</button>
                          <button onClick={() => rejectEvent(e.id_pergelaran)} style={{
                            padding: '8px 20px', background: '#A32D2D', color: 'white',
                            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit'
                          }}>Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* MONITORING USER */}
          {menu === 'monitoring-user' && (
            <div style={{ background: 'white', borderRadius: 10, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 }}>
                Semua User
              </h2>
              {users.length === 0 ? (
                <p style={{ color: '#A39680', fontSize: 13 }}>Belum ada user.</p>
              ) : (
                users.map(u => (
                  <div key={u.id_pengguna} style={{
                    border: '1px solid #e8e4dc', borderRadius: 8, padding: 14,
                    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>
                        {u.nama_pengguna}
                      </p>
                      <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>{u.email_pengguna}</p>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 50, fontWeight: 600,
                        background: u.role_pengguna === 'organizer' ? '#EEEDFE' : '#FAEEDA',
                        color: u.role_pengguna === 'organizer' ? '#3C3489' : '#633806'
                      }}>
                        {u.role_pengguna}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 50, fontWeight: 600,
                        background: u.status === 'blocked' ? '#FCEBEB' : '#EAF3DE',
                        color: u.status === 'blocked' ? '#A32D2D' : '#27500A'
                      }}>
                        {u.status === 'blocked' ? 'Diblokir' : 'Aktif'}
                      </span>
                      {u.status !== 'blocked' && (
                        <button onClick={() => blokirUser(u.id_pengguna)} style={{
                          padding: '6px 12px', background: '#A32D2D', color: 'white',
                          border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit'
                        }}>Blokir</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MONITORING EVENT */}
          {menu === 'monitoring-event' && (
            <div style={{ background: 'white', borderRadius: 10, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 }}>
                Semua Event
              </h2>
              {events.length === 0 ? (
                <p style={{ color: '#A39680', fontSize: 13 }}>Belum ada event.</p>
              ) : (
                events.map(e => (
                  <div key={e.id_pergelaran} style={{
                    border: '1px solid #e8e4dc', borderRadius: 8, padding: 14,
                    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14
                  }}>
                    <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran}
                      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>
                        {e.nama_pergelaran}
                      </p>
                      <p style={{ fontSize: 12, color: '#A39680' }}>{e.penyelenggara?.instansi_penyelenggara}</p>
                      <p style={{ fontSize: 12, color: '#A39680' }}>{e.lokasi_pergelaran}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 50, fontWeight: 600,
                        background: e.status_validasi ? '#EAF3DE' : '#FCEBEB',
                        color: e.status_validasi ? '#27500A' : '#A32D2D'
                      }}>
                        {e.status_validasi ? 'Tayang' : 'Tidak Tayang'}
                      </span>
                      {e.status_validasi && (
                        <button onClick={() => takeDown(e.id_pergelaran)} style={{
                          padding: '6px 12px', background: '#A32D2D', color: 'white',
                          border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit'
                        }}>Take Down</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TICKET SALES */}
          {menu === 'ticket-sales' && (
            <div style={{ background: 'white', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 14, color: '#A39680' }}>Fitur Ticket Sales coming soon...</p>
            </div>
          )}

          {/* MERCH SALES */}
          {menu === 'merch-sales' && (
            <div style={{ background: 'white', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 14, color: '#A39680' }}>Fitur Merchandise Sales coming soon...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard