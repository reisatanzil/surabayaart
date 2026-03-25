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

    console.log('org:', org)
    setPenyelenggara(org)
    if (org) {
      setProfilForm({
        no_telpon: org.no_telpon || '',
        instansi_penyelenggara: org.instansi_penyelenggara || '',
      })
    }
    if (!org) { setLoading(false); return }

    const { data: ev, error: evError } = await supabase
      .from('pergelaran')
      .select('*')
      .eq('id_penyelenggara', org.id_penyelenggara)
    
    console.log('events:', ev)
    console.log('error:', evError)

    setEvents(ev || [])
    setLoading(false)
  }

  async function ambilSales(event) {
    setSelectedEvent(event)
    const { data: jadwalData } = await supabase
      .from('jadwal_event').select('id_jadwal')
      .eq('id_pergelaran', event.id_pergelaran).single()
    if (jadwalData) {
      const { data: tiketData } = await supabase
        .from('tiket').select('*').eq('id_jadwal', jadwalData.id_jadwal)
      setTikets(tiketData || [])
    }
    const { data: merchData } = await supabase
      .from('merchandise').select('*')
      .eq('id_penyelenggara', penyelenggara.id_penyelenggara)
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
  if (!penyelenggara) return (
    <div style={{ padding: 40, fontFamily: 'Albert Sans, sans-serif', color: '#A39680', textAlign: 'center' }}>
      Loading...
    </div>
  )

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: 8, border: '1px solid #e8e4dc',
    fontSize: 13, outline: 'none', color: '#262626',
    fontFamily: 'inherit', background: 'white'
  }

  const labelStyle = {
    fontSize: 12, fontWeight: 600,
    color: '#4D403A', marginBottom: 5, display: 'block'
  }

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
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Dashboard
          </span>
          <span onClick={() => navigate('/organizer/upload')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Upload Event
          </span>
          <button onClick={() => navigate('/organizer/profile')}
            style={{
              padding: '8px 20px', background: '#262626', color: 'white',
              border: 'none', borderRadius: 50, fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>
            My Profile
          </button>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>

        {/* INFO PROFIL */}
        <div style={{
          background: 'white', borderRadius: 10,
          border: '1px solid #e8e4dc', padding: 24,
          marginBottom: 24, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: '#DFDACF', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#262626', marginBottom: 2 }}>
                {penyelenggara.instansi_penyelenggara}
              </p>
              <p style={{ fontSize: 13, color: '#A39680', marginBottom: 4 }}>
                {penyelenggara.pengguna?.email_pengguna}
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 50,
                  background: '#EEEDFE', color: '#3C3489', fontWeight: 600
                }}>
                  organizer
                </span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 50,
                  background: penyelenggara.status === 'active' ? '#EAF3DE' : '#FAEEDA',
                  color: penyelenggara.status === 'active' ? '#27500A' : '#633806',
                  fontWeight: 600
                }}>
                  {penyelenggara.status === 'active' ? 'Aktif' : 'Menunggu Persetujuan'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', background: 'transparent',
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

        {/* TAB MENU */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'profil', label: 'Profil' },
            { key: 'my-events', label: 'My Events' },
            { key: 'sales', label: 'Sales' },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setMenu(tab.key); setEditMode(false); setEditProfil(false); setSelectedEvent(null) }}
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

        {/* PROFIL */}
        {menu === 'profil' && !editProfil && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Detail Profil</p>
              <button onClick={() => setEditProfil(true)} style={{
                padding: '6px 14px', background: '#FAFBF5',
                border: '1px solid #e8e4dc', borderRadius: 6,
                fontSize: 12, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit'
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
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#FAFBF5',
                  borderRadius: 8, border: '1px solid #e8e4dc'
                }}>
                  <span style={{ fontSize: 12, color: '#A39680' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDIT PROFIL */}
        {menu === 'profil' && editProfil && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setEditProfil(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#A39680', fontSize: 13, fontFamily: 'inherit'
              }}>← Kembali</button>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Edit Profil</p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nama Instansi</label>
              <input value={profilForm.instansi_penyelenggara}
                onChange={e => setProfilForm({ ...profilForm, instansi_penyelenggara: e.target.value })}
                style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>No. Telpon / WhatsApp</label>
              <input value={profilForm.no_telpon}
                onChange={e => setProfilForm({ ...profilForm, no_telpon: e.target.value })}
                placeholder="cth: 08123456789" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditProfil(false)} style={{
                padding: '10px 24px', background: 'transparent',
                color: '#4D403A', border: '1px solid #4D403A',
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>Batal</button>
              <button onClick={simpanProfil} disabled={savingProfil} style={{
                padding: '10px 24px', background: savingProfil ? '#A39680' : '#4D403A',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                cursor: savingProfil ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
              }}>
                {savingProfil ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        )}

        {/* MY EVENTS */}
        {menu === 'my-events' && !editMode && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 }}>My Events</p>
            {loading ? (
              <p style={{ color: '#A39680', fontSize: 13 }}>Loading...</p>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <p style={{ color: '#A39680', fontSize: 13, marginBottom: 12 }}>No events yet.</p>
                <button onClick={() => navigate('/organizer/upload')} style={{
                  padding: '8px 20px', background: '#4D403A', color: 'white',
                  border: 'none', borderRadius: 8, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>Upload Event</button>
              </div>
            ) : (
              events.map(e => (
                <div key={e.id_pergelaran} style={{
                  border: '1px solid #e8e4dc', borderRadius: 8,
                  padding: 14, marginBottom: 10,
                  display: 'flex', gap: 14, alignItems: 'center'
                }}>
                  <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>
                      {e.nama_pergelaran}
                    </p>
                    <p style={{ fontSize: 12, color: '#A39680', marginBottom: 4 }}>{e.lokasi_pergelaran}</p>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 50, fontWeight: 600,
                      background: e.status_validasi ? '#EAF3DE' : '#FAEEDA',
                      color: e.status_validasi ? '#27500A' : '#633806'
                    }}>
                      {e.status_validasi ? 'Disetujui' : 'Menunggu Persetujuan'}
                    </span>
                  </div>
                  <button onClick={() => { setEditForm(e); setEditMode(true) }} style={{
                    padding: '6px 14px', background: '#FAFBF5',
                    border: '1px solid #e8e4dc', borderRadius: 6,
                    fontSize: 12, cursor: 'pointer', color: '#4D403A', fontFamily: 'inherit'
                  }}>Edit</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* EDIT EVENT */}
        {menu === 'my-events' && editMode && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setEditMode(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#A39680', fontSize: 13, fontFamily: 'inherit'
              }}>← Kembali</button>
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
                  <option value="Pameran">Pameran</option>
                  <option value="Pagelaran">Pagelaran</option>
                  <option value="Konser">Konser</option>
                  <option value="Festival">Festival</option>
                  <option value="Pertunjukan">Pertunjukan</option>
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
              <button onClick={() => setEditMode(false)} style={{
                padding: '10px 24px', background: 'transparent',
                color: '#4D403A', border: '1px solid #4D403A',
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>Batal</button>
              <button onClick={simpanEdit} style={{
                padding: '10px 24px', background: '#4D403A',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>Simpan Perubahan</button>
            </div>
          </div>
        )}

        {/* SALES */}
        {menu === 'sales' && !selectedEvent && (
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 16 }}>Sales</p>
            {events.filter(e => e.status_validasi).length === 0 ? (
              <p style={{ color: '#A39680', fontSize: 13 }}>No events yet.</p>
            ) : (
              events.filter(e => e.status_validasi === true).map(e => (
                <div key={e.id_pergelaran} style={{
                  border: '1px solid #e8e4dc', borderRadius: 8,
                  padding: 14, marginBottom: 10,
                  display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer'
                }} onClick={() => ambilSales(e)}>
                  <img src={e.poster_pergelaran || '/placeholder.jpg'} alt={e.nama_pergelaran}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 3 }}>
                      {e.nama_pergelaran}
                    </p>
                    <p style={{ fontSize: 12, color: '#A39680' }}>{e.lokasi_pergelaran}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ))
            )}
          </div>
        )}

        {/* SALES DETAIL */}
        {menu === 'sales' && selectedEvent && (
          <div>
            <button onClick={() => setSelectedEvent(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#A39680', fontSize: 13, fontFamily: 'inherit',
              marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6
            }}>← Kembali</button>

            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '16px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 1, marginBottom: 8 }}>TIKET TERJUAL</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#262626' }}>{tikets.length}</p>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: '16px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 1, marginBottom: 8 }}>TOTAL PENDAPATAN</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#3B6D11' }}>
                  Rp {(tikets.length * (selectedEvent.harga_tiket || 0)).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20, marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 14 }}>List ID Tiket</p>
              {tikets.length === 0 ? (
                <p style={{ fontSize: 13, color: '#A39680' }}>No tickets sold yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {tikets.map(t => (
                    <div key={t.id_tiket} style={{
                      background: '#F5F2ED', borderRadius: 8,
                      padding: '10px 14px', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <p style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#4D403A', letterSpacing: 1 }}>
                        {t.id_tiket.slice(0, 8).toUpperCase()}-{t.id_tiket.slice(9, 13).toUpperCase()}
                      </p>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 50, fontWeight: 600,
                        background: t.status_tiket === 'used' ? '#F1EFE8' : '#EAF3DE',
                        color: t.status_tiket === 'used' ? '#5F5E5A' : '#27500A'
                      }}>
                        {t.status_tiket === 'used' ? 'Dipakai' : 'Valid'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e8e4dc', padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#262626', marginBottom: 14 }}>Merchandise</p>
              {merchSales.length === 0 ? (
                <p style={{ fontSize: 13, color: '#A39680' }}>No merchandise yet.</p>
              ) : (
                merchSales.map(m => (
                  <div key={m.id_merchandise} style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid #f0ece4'
                  }}>
                    {m.foto_merchandise && (
                      <img src={m.foto_merchandise} alt={m.nama_merchandise}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 2 }}>{m.nama_merchandise}</p>
                      <p style={{ fontSize: 12, color: '#A39680' }}>Stok tersisa: {m.stok_merchandise}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#4D403A' }}>
                      Rp {parseInt(m.harga_merchandise).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: '1px solid #e8e4dc', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', marginTop: 20
      }}>
        <span style={{ fontSize: 12, color: '#4D403A', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
          Terms & Condition
        </span>
        <span style={{ fontSize: 11, color: '#A39680' }}>
          © 2026 SurabayArt. All rights reserved.
        </span>
      </div>

    </div>
  )
}

export default OrganizerProfile