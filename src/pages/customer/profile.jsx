import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../supabase'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    const u = JSON.parse(data)
    setUser(u)
    ambilRiwayat(u.id_pengguna)
    ambilFotoProfil(u.id_pengguna)
  }, [])

  async function ambilFotoProfil(id) {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(`${id}/avatar`)
    // Tambahkan cache-busting agar gambar terbaru selalu dimuat
    if (data?.publicUrl) {
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`)
    }
  }

  async function handleUploadFoto(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.')
      return
    }

    // Validasi ukuran file (maks 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    setUploadingPhoto(true)
    try {
      const { error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id_pengguna}/avatar`, file, {
          upsert: true,
          contentType: file.type,
        })

      if (error) throw error

      // Refresh URL foto dengan cache-busting
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.id_pengguna}/avatar`)
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`)
    } catch (err) {
      console.error('Gagal upload foto:', err)
      alert('Gagal mengupload foto. Coba lagi.')
    } finally {
      setUploadingPhoto(false)
      // Reset input agar file yang sama bisa diupload ulang
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function ambilRiwayat(id) {
    const { data: orderData } = await supabase
      .from('order')
      .select(`
        *,
        detail_order (
          *,
          tiket (*)
        )
      `)
      .eq('id_pengguna', id)
      .order('created_at', { ascending: false })

    setOrders(orderData || [])
    setLoading(false)
  }

  function logout() {
    localStorage.removeItem('user')
    navigate('/signin')
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
          <span onClick={() => navigate('/home')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Dashboard
          </span>
          <span onClick={() => navigate('/reservasi')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Reservasi
          </span>
          <button onClick={() => navigate('/profile')}
            style={{
              padding: '8px 20px', background: '#262626', color: 'white',
              border: 'none', borderRadius: 50, fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6
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

            {/* AVATAR + TOMBOL UPLOAD */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: '#DFDACF', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="foto profil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setAvatarUrl(null)}
                  />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                )}
              </div>

              {/* Tombol kamera kecil di pojok avatar */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Ganti foto profil"
                style={{
                  position: 'absolute', bottom: 0, right: -2,
                  width: 22, height: 22, borderRadius: '50%',
                  background: uploadingPhoto ? '#A39680' : '#262626',
                  border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  padding: 0, transition: 'background 0.2s'
                }}
              >
                {uploadingPhoto ? (
                  /* Spinner */
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                    style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                )}
              </button>

              {/* Input file tersembunyi */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleUploadFoto}
              />
            </div>

            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                {user.nama_pengguna}
              </p>
              <p style={{ fontSize: 13, color: '#A39680' }}>{user.email_pengguna}</p>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 50,
                background: '#FAEEDA', color: '#633806',
                fontWeight: 600, marginTop: 4, display: 'inline-block'
              }}>
                {user.role_pengguna === 'buyer' ? 'customer' : user.role_pengguna}
              </span>
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

        {/* RIWAYAT PEMBELIAN */}
        <p style={{ fontSize: 16, fontWeight: 700, color: '#262626', marginBottom: 16 }}>
          My Ticket
        </p>

        {loading ? (
          <p style={{ color: '#A39680', fontSize: 13 }}>Loading...</p>
        ) : orders.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 10,
            border: '1px solid #e8e4dc', padding: 32,
            textAlign: 'center'
          }}>
            <p style={{ fontSize: 13, color: '#A39680' }}>No ticket yet.</p>
            <button onClick={() => navigate('/reservasi')} style={{
              marginTop: 12, padding: '8px 20px',
              background: '#262626', color: 'white',
              border: 'none', borderRadius: 8,
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
              Secure Your Ticket
            </button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id_order} style={{
              background: 'white', borderRadius: 10,
              border: '1px solid #e8e4dc', padding: 20,
              marginBottom: 14
            }}>
              {/* HEADER ORDER */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 14,
                paddingBottom: 12, borderBottom: '1px solid #f0ece4'
              }}>
                <div>
                  <p style={{ fontSize: 11, color: '#A39680', marginBottom: 2 }}>
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4D403A', fontWeight: 600 }}>
                    #{order.id_order.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#262626' }}>
                    Rp {parseInt(order.total_pembayaran).toLocaleString('id-ID')}
                  </p>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 50,
                    fontWeight: 600,
                    background: order.status_pembayaran ? '#EAF3DE' : '#FAEEDA',
                    color: order.status_pembayaran ? '#27500A' : '#633806'
                  }}>
                    {order.status_pembayaran ? 'Lunas' : 'Menunggu Pembayaran'}
                  </span>
                </div>
              </div>

              {/* DETAIL ORDER & TIKET */}
              {order.detail_order?.map(detail => (
                <div key={detail.id_detail_order}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 8
                  }}>
                    <span style={{ fontSize: 12, color: '#555' }}>
                      {detail.jumlah} tiket × Rp {(detail.subtotal / detail.jumlah).toLocaleString('id-ID')}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>
                      Rp {parseInt(detail.subtotal).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* LIST ID TIKET */}
                  {detail.tiket?.map(t => (
                    <div key={t.id_tiket} style={{
                      background: '#F5F2ED', borderRadius: 8,
                      padding: '10px 14px', marginBottom: 8,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#A39680', marginBottom: 2 }}>ID Tiket</p>
                        <p style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#4D403A', letterSpacing: 1 }}>
                          {t.id_tiket.slice(0, 8).toUpperCase()}-{t.id_tiket.slice(9, 13).toUpperCase()}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 50,
                        fontWeight: 600,
                        background: t.status_tiket === 'used' ? '#F1EFE8' : '#EAF3DE',
                        color: t.status_tiket === 'used' ? '#5F5E5A' : '#27500A'
                      }}>
                        {t.status_tiket === 'used' ? 'Sudah dipakai' : 'Valid'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
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

      {/* CSS untuk spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}

export default Profile