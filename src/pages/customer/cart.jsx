import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function Cart() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(null)
  const [merch, setMerch] = useState([])
  const [merchDipilih, setMerchDipilih] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [metodeBayar, setMetodeBayar] = useState('transfer')
  const [buktiBayar, setBuktiBayar] = useState(null)
  const [buktiBayarPreview, setBuktiBayarPreview] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const cartData = localStorage.getItem('cart')
    if (!userData) { navigate('/signin'); return }
    if (!cartData) { navigate('/reservasi'); return }
    setUser(JSON.parse(userData))
    const c = JSON.parse(cartData)
    setCart(c)
    ambilMerch(c.event.id_pergelaran)
  }, [])

  async function ambilMerch(id_pergelaran) {
    const { data: eventData } = await supabase
      .from('pergelaran').select('id_penyelenggara')
      .eq('id_pergelaran', id_pergelaran).single()
    if (!eventData) return
    const { data } = await supabase.from('merchandise').select('*')
      .eq('id_penyelenggara', eventData.id_penyelenggara)
    setMerch(data || [])
  }

  function toggleMerch(id, harga) {
    setMerchDipilih(prev => {
      if (prev[id]) { const u = { ...prev }; delete u[id]; return u }
      return { ...prev, [id]: { jumlah: 1, harga } }
    })
  }

  function updateJumlahMerch(id, jumlah) {
    if (jumlah < 1) return
    setMerchDipilih(prev => ({ ...prev, [id]: { ...prev[id], jumlah } }))
  }

  function totalMerch() {
    return Object.values(merchDipilih).reduce((acc, m) => acc + m.jumlah * m.harga, 0)
  }

  function totalSemua() {
    return (cart?.totalHarga || 0) + totalMerch()
  }

  function handleBuktiBayar(e) {
    const file = e.target.files[0]
    if (!file) return
    setBuktiBayar(file)
    setBuktiBayarPreview(URL.createObjectURL(file))
  }

  async function checkout() {
    if (!cart || !user) return
    setLoading(true)

    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .insert({
        id_pengguna: user.id_pengguna,
        jumlah_item: cart.jumlah + Object.values(merchDipilih).reduce((a, m) => a + m.jumlah, 0),
        total_pembayaran: totalSemua(),
        metode_pembayaran: metodeBayar,
        metode_bayar: metodeBayar,
        status_pembayaran: false,
        status_validasi_bayar: 'menunggu',
      })
      .select().single()

    if (orderError) {
      alert('Gagal checkout: ' + orderError.message)
      setLoading(false)
      return
    }

    await supabase.from('detail_order').insert({
      id_order: orderData.id_order,
      jumlah: cart.jumlah,
      subtotal: cart.totalHarga,
    })

    for (let i = 0; i < cart.jumlah; i++) {
      await supabase.from('tiket').insert({
        id_jadwal: cart.jadwal.id_jadwal,
        status_tiket: 'available',
        id_order: orderData.id_order,
      })
    }

    for (const [id, val] of Object.entries(merchDipilih)) {
      await supabase.from('detail_order').insert({
        id_order: orderData.id_order,
        jumlah: val.jumlah,
        subtotal: val.jumlah * val.harga,
      })
    }

    setOrderId(orderData.id_order)
    setLoading(false)
    setShowModal(true)
  }

  async function uploadBukti() {
    if (!buktiBayar || !orderId) return
    setUploading(true)

    const path = `bukti/${orderId}_${buktiBayar.name}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, buktiBayar, { upsert: true })

    if (uploadError) {
      alert('Gagal upload: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)

    await supabase.from('order').update({
      bukti_bayar: urlData.publicUrl,
      status_validasi_bayar: 'menunggu_validasi'
    }).eq('id_order', orderId)

    setUploading(false)
    setShowUpload(false)
    localStorage.removeItem('cart')
    navigate('/profile')
  }

  if (!cart || !user) return null

  const merchList = Object.entries(merchDipilih)
    .map(([id, val]) => {
      const item = merch.find(m => m.id_merchandise === id)
      return item ? { ...item, ...val } : null
    }).filter(Boolean)

  const inputStyle = (active) => ({
    flex: 1, padding: '14px 16px', borderRadius: 10,
    border: active ? '2px solid #4D403A' : '1px solid #e8e4dc',
    background: active ? '#FAF7F2' : 'white',
    cursor: 'pointer', textAlign: 'center',
    transition: 'all 0.15s'
  })

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
          <img src="/logo.png" alt="logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
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
              padding: '8px 20px', background: '#262626', color: 'white',
              border: 'none', borderRadius: 50, fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>
            My Profile
          </button>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>

        {/* MODAL INFO PEMBAYARAN */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(38,38,38,0.6)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100
          }}>
            <div style={{
              background: 'white', borderRadius: 16,
              padding: 32, maxWidth: 380, width: '90%',
              textAlign: 'center'
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#EAF3DE', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <p style={{ fontSize: 16, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                Pesanan Berhasil Dibuat!
              </p>
              <p style={{ fontSize: 12, color: '#A39680', marginBottom: 20, lineHeight: 1.6 }}>
                Selesaikan pembayaran dengan {metodeBayar === 'transfer' ? 'transfer bank' : 'QRIS'} ke:
              </p>

              {metodeBayar === 'transfer' ? (
                <div style={{
                  background: '#F5F2ED', borderRadius: 8,
                  padding: 16, marginBottom: 16, textAlign: 'left'
                }}>
                  <p style={{ fontSize: 11, color: '#A39680', marginBottom: 4 }}>Transfer ke</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 2 }}>
                    {cart.event.nama_bank}
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#4D403A', marginBottom: 2, letterSpacing: 1 }}>
                    {cart.event.nomor_rekening}
                  </p>
                  <p style={{ fontSize: 12, color: '#A39680', marginBottom: 12 }}>
                    a/n {cart.event.nama_pemilik_rekening}
                  </p>
                  <div style={{ borderTop: '1px solid #e8e4dc', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#A39680' }}>Total Transfer</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#262626' }}>
                      Rp {totalSemua().toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#F5F2ED', borderRadius: 8,
                  padding: 16, marginBottom: 16, textAlign: 'center'
                }}>
                  <p style={{ fontSize: 12, color: '#A39680', marginBottom: 8 }}>Scan QRIS berikut</p>
                  <div style={{
                    width: 140, height: 140, background: '#e8e4dc',
                    borderRadius: 8, margin: '0 auto 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <p style={{ fontSize: 11, color: '#A39680', textAlign: 'center', padding: 8 }}>
                      QRIS Penyelenggara<br/>(tambahkan di profil)
                    </p>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#4D403A' }}>
                    Rp {totalSemua().toLocaleString('id-ID')}
                  </p>
                </div>
              )}

              <div style={{
                background: '#FAEEDA', borderRadius: 8,
                padding: '10px 14px', marginBottom: 20,
                fontSize: 12, color: '#633806', lineHeight: 1.6, textAlign: 'left'
              }}>
                Setelah transfer, upload bukti pembayaran agar tiket bisa divalidasi oleh penyelenggara.
              </div>

              <button onClick={() => { setShowModal(false); setShowUpload(true) }} style={{
                width: '100%', padding: '12px',
                background: '#262626', color: 'white',
                border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                marginBottom: 8
              }}>
                Upload Bukti Pembayaran
              </button>
              <button onClick={() => { localStorage.removeItem('cart'); navigate('/profile') }} style={{
                width: '100%', padding: '10px',
                background: 'transparent', color: '#A39680',
                border: 'none', fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Upload nanti di My Profile
              </button>
            </div>
          </div>
        )}

        {/* MODAL UPLOAD BUKTI */}
        {showUpload && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(38,38,38,0.6)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100
          }}>
            <div style={{
              background: 'white', borderRadius: 16,
              padding: 32, maxWidth: 380, width: '90%',
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                Upload Bukti Pembayaran
              </p>
              <p style={{ fontSize: 12, color: '#A39680', marginBottom: 20, lineHeight: 1.6 }}>
                Upload screenshot atau foto bukti transfer/QRIS kamu
              </p>

              <div
                onClick={() => document.getElementById('bukti-input').click()}
                style={{
                  border: '2px dashed #e8e4dc', borderRadius: 10,
                  padding: 24, textAlign: 'center', cursor: 'pointer',
                  background: '#FAFBF5', marginBottom: 16
                }}>
                {buktiBayarPreview ? (
                  <img src={buktiBayarPreview} alt="bukti"
                    style={{ maxHeight: 200, borderRadius: 8, objectFit: 'contain' }} />
                ) : (
                  <div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="1.5"
                      style={{ margin: '0 auto 8px', display: 'block' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p style={{ fontSize: 12, color: '#A39680' }}>Klik untuk upload foto bukti bayar</p>
                    <p style={{ fontSize: 11, color: '#DFDACF', marginTop: 4 }}>JPG, PNG, max 5MB</p>
                  </div>
                )}
              </div>
              <input id="bukti-input" type="file" accept="image/*"
                onChange={handleBuktiBayar} style={{ display: 'none' }} />

              <button onClick={uploadBukti} disabled={!buktiBayar || uploading} style={{
                width: '100%', padding: '12px',
                background: !buktiBayar || uploading ? '#A39680' : '#262626',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 700,
                cursor: !buktiBayar || uploading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', marginBottom: 8
              }}>
                {uploading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
              </button>
              <button onClick={() => { localStorage.removeItem('cart'); navigate('/profile') }} style={{
                width: '100%', padding: '10px',
                background: 'transparent', color: '#A39680',
                border: 'none', fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Nanti aja
              </button>
            </div>
          </div>
        )}

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#262626', marginBottom: 24 }}>Cart</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* KIRI */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#A39680', letterSpacing: 1.5, marginBottom: 10 }}>
              TICKET
            </p>
            <div style={{
              background: 'white', borderRadius: 10,
              border: '1px solid #e8e4dc', padding: 16,
              display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20
            }}>
              {cart.event.poster_pergelaran && (
                <img src={cart.event.poster_pergelaran} alt={cart.event.nama_pergelaran}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                  {cart.event.nama_pergelaran}
                </p>
                <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>
                  {new Date(cart.tanggalDipilih + 'T00:00:00').toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
                <p style={{ fontSize: 12, color: '#A39680', marginBottom: 6 }}>
                  {cart.jadwal?.jam_mulai} – {cart.jadwal?.jam_selesai} • {cart.event.lokasi_pergelaran}
                </p>
                <p style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>{user.nama_pengguna}</p>
                <p style={{ fontSize: 12, color: '#555' }}>{user.email_pengguna}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 12, color: '#A39680', marginBottom: 4 }}>{cart.jumlah} tiket</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#262626' }}>
                  Rp {cart.totalHarga.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {merch.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#A39680', letterSpacing: 1.5, marginBottom: 10 }}>
                  MERCHANDISE
                </p>
                {merch.map(m => (
                  <div key={m.id_merchandise} style={{
                    background: '#FAF7F2', borderRadius: 10,
                    border: '1px solid #DFD8CE', padding: 16,
                    display: 'flex', gap: 14, alignItems: 'center',
                    marginBottom: 10, cursor: 'pointer'
                  }} onClick={() => toggleMerch(m.id_merchandise, m.harga_merchandise)}>
                    <input type="checkbox" checked={!!merchDipilih[m.id_merchandise]}
                      onChange={() => {}} style={{ width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }} />
                    {m.foto_merchandise && (
                      <img src={m.foto_merchandise} alt={m.nama_merchandise}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 4 }}>{m.nama_merchandise}</p>
                      <p style={{ fontSize: 12, color: '#A39680', marginBottom: 6 }}>{m.deskripsi_merchandise}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#4D403A' }}>
                        Rp {parseInt(m.harga_merchandise).toLocaleString('id-ID')}
                      </p>
                    </div>
                    {merchDipilih[m.id_merchandise] && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => updateJumlahMerch(m.id_merchandise, merchDipilih[m.id_merchandise].jumlah - 1)}
                          style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #DFD8CE', background: 'white', cursor: 'pointer', fontSize: 14, color: '#4D403A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>
                          {merchDipilih[m.id_merchandise].jumlah}
                        </span>
                        <button onClick={() => updateJumlahMerch(m.id_merchandise, merchDipilih[m.id_merchandise].jumlah + 1)}
                          style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #DFD8CE', background: 'white', cursor: 'pointer', fontSize: 14, color: '#4D403A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>+</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KANAN */}
          <div>
            <div style={{
              background: 'white', borderRadius: 10,
              border: '1px solid #e8e4dc', padding: 20,
              position: 'sticky', top: 80
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 16 }}>
                Cart Totals
              </p>

              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 0.5, marginBottom: 6 }}>Ticket</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{cart.event.nama_pergelaran}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>
                    Rp {cart.totalHarga.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {merchList.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 0.5, marginBottom: 6 }}>Merchandise</p>
                  {merchList.map(m => (
                    <div key={m.id_merchandise} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#555' }}>{m.nama_merchandise} ×{m.jumlah}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>
                        Rp {(m.jumlah * m.harga_merchandise).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* PILIH METODE BAYAR */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#A39680', letterSpacing: 0.5, marginBottom: 10 }}>
                  METODE PEMBAYARAN
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div onClick={() => setMetodeBayar('transfer')} style={inputStyle(metodeBayar === 'transfer')}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: metodeBayar === 'transfer' ? '#4D403A' : '#555', marginBottom: 2 }}>
                      Transfer
                    </p>
                    <p style={{ fontSize: 10, color: '#A39680' }}>Bank</p>
                  </div>
                  <div onClick={() => setMetodeBayar('qris')} style={inputStyle(metodeBayar === 'qris')}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: metodeBayar === 'qris' ? '#4D403A' : '#555', marginBottom: 2 }}>
                      QRIS
                    </p>
                    <p style={{ fontSize: 10, color: '#A39680' }}>Scan QR</p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e8e4dc', paddingTop: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#262626' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#262626' }}>
                  Rp {totalSemua().toLocaleString('id-ID')}
                </span>
              </div>

              <button onClick={checkout} disabled={loading} style={{
                width: '100%', padding: '12px',
                background: loading ? '#A39680' : '#262626',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: 0.5
              }}>
                {loading ? 'Memproses...' : 'Checkout'}
              </button>

              <button onClick={() => navigate(-1)} style={{
                width: '100%', padding: '10px',
                background: 'transparent', color: '#A39680',
                border: 'none', fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit', marginTop: 8
              }}>
                ← Kembali
              </button>
            </div>
          </div>
        </div>
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

export default Cart