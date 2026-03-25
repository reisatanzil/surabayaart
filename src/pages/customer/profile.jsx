import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    const u = JSON.parse(data)
    setUser(u)
    ambilRiwayat(u.id_pengguna)
  }, [])

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

    </div>
  )
}

export default Profile