import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function Cart() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [cartData, setCartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [metodePembayaran, setMetodePembayaran] = useState('transfer')
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [noPaymentInfo, setNoPaymentInfo] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { 
      navigate('/signin')
      return 
    }
    
    const u = JSON.parse(userData)
    if (u.role_pengguna !== 'buyer') { 
      navigate('/signin')
      return 
    } 
    setUser(u)

    const cartString = localStorage.getItem('cart')
    if (!cartString) {
      alert('Keranjang kamu kosong!')
      navigate('/')
      return
    }
    
    setCartData(JSON.parse(cartString))
  }, [navigate])

  async function handleCheckout() {
    if (!cartData || !user) return
    
    setLoading(true)

    try {
      const { data: pergelaranData, error: pergelaranError } = await supabase
        .from('pergelaran')
        .select('nama_bank, nomor_rekening, nama_pemilik_rekening, qris_image')
        .eq('id_pergelaran', cartData.event.id_pergelaran)
        .single()

      if (pergelaranError) {
        console.error('Error ambil info pembayaran:', pergelaranError)
      }

      console.log('Payment info from database:', pergelaranData)
      console.log('Selected payment method:', metodePembayaran)
      console.log('QRIS Image:', pergelaranData?.qris_image)
      console.log('Bank:', pergelaranData?.nama_bank)

      // Hitung total termasuk merchandise
      const merchandiseTotal = cartData.merchandise?.reduce((sum, item) => {
        return sum + (item.harga_merchandise || 0) * (item.jumlah || 1)
      }, 0) || 0

      const totalWithMerchandise = (cartData.totalHarga || 0) + merchandiseTotal

      const { data, error } = await supabase
        .from('order')
        .insert([{
          id_pengguna: user.id_pengguna,
          id_pergelaran: cartData.event.id_pergelaran,
          tanggal_event: cartData.tanggalDipilih,
          jumlah_item: cartData.jumlah,
          jumlah_tiket: cartData.jumlah,
          total_pembayaran: totalWithMerchandise,
          metode_pembayaran: metodePembayaran,
          metode_bayar: metodePembayaran,
          status_pembayaran: false,
          status_validasi_bayar: 'menunggu',
          waktu_order: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setOrderId(data.id_order)

      const hasTransferInfo = pergelaranData?.nama_bank && pergelaranData?.nomor_rekening
      const hasQrisInfo = pergelaranData?.qris_image
      
      if (metodePembayaran === 'transfer' && !hasTransferInfo) {
        setNoPaymentInfo(true)
      } else if (metodePembayaran === 'qris' && !hasQrisInfo) {
        setNoPaymentInfo(false)
      } else {
        setNoPaymentInfo(false)
      }

      setPaymentDetails({
        nama_bank: pergelaranData?.nama_bank,
        nomor_rekening: pergelaranData?.nomor_rekening,
        nama_pemilik_rekening: pergelaranData?.nama_pemilik_rekening,
        qris_image: pergelaranData?.qris_image,
        total_bayar: totalWithMerchandise,
        order_id: data.id_order,
        merchandiseTotal: merchandiseTotal
      })

      setShowPaymentInfo(true)
      
    } catch (err) {
      console.error('Error checkout:', err)
      alert('Gagal melakukan checkout: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function closePaymentInfo() {
    setShowPaymentInfo(false)
    setNoPaymentInfo(false)
    localStorage.removeItem('cart')
    navigate('/profile')
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text)
    alert(`${label} disalin!`)
  }

  if (!cartData || !user) {
    return (
      <div style={{ fontFamily: 'Albert Sans, sans-serif', minHeight: '100vh', background: '#e8e4dc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: '#4D403A' }}>Memuat keranjang...</p>
      </div>
    )
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
  }

  // Hitung total merchandise
  const merchandiseList = cartData.merchandise || []
  const merchandiseTotal = merchandiseList.reduce((sum, item) => {
    return sum + (item.harga_merchandise || 0) * (item.jumlah || 1)
  }, 0)

  return (
    <div style={{ fontFamily: 'Albert Sans, sans-serif', minHeight: '100vh', background: '#e8e4dc' }}>

      {/* NAVBAR CUSTOMER */}
      <div style={{
        background: 'white', padding: '0 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 56,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.jpg" alt="logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#262626' }}>
            SURABAYA <span style={{ fontWeight: 400, color: '#555' }}>ART</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span onClick={() => navigate('/')} style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Beranda
          </span>
          <span onClick={() => navigate('/reservasi')} style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Reservasi
          </span>
          <button onClick={() => navigate('/profile')} style={{
            padding: '8px 20px', background: '#262626', color: 'white',
            border: 'none', borderRadius: 50, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            My Profile
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div style={{
        height: 120,
        backgroundImage: 'url(/balaipemuda.png)',
        backgroundSize: 'cover', backgroundPosition: 'center'
      }} />

      {/* BODY CONTENT */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
          Konfirmasi Pesanan
        </h2>
        <p style={{ fontSize: 12, color: '#A39680', marginBottom: 20 }}>
          Pastikan data di bawah ini sudah benar sebelum melakukan pembayaran.
        </p>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          
          {/* KOLOM KIRI: DETAIL EVENT & MERCHANDISE */}
          <div style={{ flex: 2, background: 'white', borderRadius: 10, padding: 24, overflow: 'hidden' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#4D403A', marginBottom: 16, borderBottom: '1px solid #e8e4dc', paddingBottom: 10 }}>
              Detail Event
            </p>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 120, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0' }}>
                <img 
                  src={cartData.event.poster_pergelaran || '/placeholder.jpg'} 
                  alt="poster" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#262626', marginBottom: 8, marginTop: 0 }}>
                  {cartData.event.nama_pergelaran}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span style={{ fontSize: 12, color: '#4D403A' }}>
                    {cartData.tanggalDipilih}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span style={{ fontSize: 12, color: '#4D403A' }}>
                    {cartData.event.lokasi_pergelaran}
                  </span>
                </div>

                <div style={{ marginTop: 12, padding: '8px 12px', background: '#FAF7F2', borderRadius: 6, border: '1px solid #e8e4dc' }}>
                  <span style={{ fontSize: 11, color: '#A39680' }}>Harga per tiket:</span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#3B6D11', margin: 0 }}>
                    {formatRupiah(cartData.event.harga_tiket || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* MERCHANDISE SECTION */}
            {merchandiseList.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#4D403A', marginBottom: 16, borderBottom: '1px solid #e8e4dc', paddingBottom: 10 }}>
                  Merchandise
                </p>
                {merchandiseList.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex', gap: 12, padding: '12px 0',
                    borderBottom: '1px solid #f0ece4'
                  }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 6,
                      overflow: 'hidden', background: '#f0f0f0', flexShrink: 0
                    }}>
                      <img 
                        src={item.foto_merchandise || '/placeholder.jpg'} 
                        alt={item.nama_merchandise}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 4 }}>
                        {item.nama_merchandise}
                      </p>
                      <p style={{ fontSize: 11, color: '#A39680', marginBottom: 4 }}>
                        Jumlah: {item.jumlah || 1}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#4D403A' }}>
                        {formatRupiah((item.harga_merchandise || 0) * (item.jumlah || 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KOLOM KANAN: RINGKASAN & CHECKOUT */}
          <div style={{ flex: 1, background: 'white', borderRadius: 10, padding: 24, position: 'sticky', top: 80 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#4D403A', marginBottom: 16, borderBottom: '1px solid #e8e4dc', paddingBottom: 10 }}>
              Ringkasan Pesanan
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#555' }}>Jumlah Tiket</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{cartData.jumlah} Tiket</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#555' }}>Subtotal Tiket</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>
                {formatRupiah(cartData.totalHarga)}
              </span>
            </div>

            {merchandiseList.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed #e8e4dc' }}>
                <span style={{ fontSize: 13, color: '#555' }}>Merchandise</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>
                  {formatRupiah(merchandiseTotal)}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#555' }}>Total Pembayaran</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#3B6D11' }}>
                {formatRupiah((cartData.totalHarga || 0) + merchandiseTotal)}
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4D403A', marginBottom: 8, display: 'block' }}>
                Metode Pembayaran
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button 
                  onClick={() => setMetodePembayaran('transfer')}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: metodePembayaran === 'transfer' ? '#4D403A' : 'white',
                    color: metodePembayaran === 'transfer' ? 'white' : '#4D403A',
                    border: metodePembayaran === 'transfer' ? 'none' : '1px solid #e8e4dc',
                  }}
                >
                  Transfer Bank
                </button>
                <button 
                  onClick={() => setMetodePembayaran('qris')}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: metodePembayaran === 'qris' ? '#4D403A' : 'white',
                    color: metodePembayaran === 'qris' ? 'white' : '#4D403A',
                    border: metodePembayaran === 'qris' ? 'none' : '1px solid #e8e4dc',
                  }}
                >
                  QRIS
                </button>
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0',
                background: loading ? '#A39680' : '#4D403A',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: 0.5
              }}
            >
              {loading ? 'Memproses...' : 'Checkout & Bayar'}
            </button>

            <button 
              onClick={() => navigate(-1)}
              style={{
                width: '100%', padding: '10px 0', marginTop: 10,
                background: 'transparent', color: '#4D403A',
                border: '1px solid #e8e4dc', borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              ← Batalkan
            </button>
          </div>

        </div>
      </div>

      {/* MODAL INFORMASI PEMBAYARAN */}
      {showPaymentInfo && paymentDetails && (
        <div
          onClick={closePaymentInfo}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(38,38,38,0.7)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100, padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 16,
              padding: 32, maxWidth: 500, width: '100%',
              maxHeight: '90vh', overflow: 'auto'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: '#EAF3DE', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                Checkout Berhasil!
              </p>
              <p style={{ fontSize: 12, color: '#A39680' }}>
                Order #{orderId?.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Info Pembayaran */}
            <div style={{
              background: '#FAFBF5', borderRadius: 10,
              padding: 20, marginBottom: 20,
              border: '1px solid #e8e4dc'
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#4D403A', marginBottom: 16 }}>
                Informasi Pembayaran
              </p>

              {noPaymentInfo && (
                <div style={{
                  background: '#FDECEA', borderRadius: 8,
                  padding: 16, textAlign: 'center'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7B1A1A" strokeWidth="2" style={{ margin: '0 auto 8px' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#7B1A1A', marginBottom: 8 }}>
                    Informasi pembayaran belum tersedia
                  </p>
                  <p style={{ fontSize: 12, color: '#7B1A1A', lineHeight: 1.6 }}>
                    {metodePembayaran === 'qris' 
                      ? 'Organizer belum upload QRIS. Silakan hubungi organizer untuk informasi pembayaran.'
                      : 'Organizer belum upload informasi rekening. Silakan hubungi organizer untuk informasi pembayaran.'}
                  </p>
                </div>
              )}

              {!noPaymentInfo && metodePembayaran === 'transfer' && paymentDetails.nama_bank && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 12
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="2"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <line x1="12" y1="2" x2="12" y2="22"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>
                      Transfer Bank
                    </span>
                  </div>

                  <div style={{
                    background: 'white', borderRadius: 8,
                    padding: 12, marginBottom: 10
                  }}>
                    <p style={{ fontSize: 11, color: '#A39680', marginBottom: 4 }}>Bank</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>
                      {paymentDetails.nama_bank}
                    </p>
                  </div>

                  <div style={{
                    background: 'white', borderRadius: 8,
                    padding: 12, marginBottom: 10
                  }}>
                    <p style={{ fontSize: 11, color: '#A39680', marginBottom: 4 }}>Nomor Rekening</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#262626', fontFamily: 'monospace' }}>
                        {paymentDetails.nomor_rekening}
                      </p>
                      <button
                        onClick={() => copyToClipboard(paymentDetails.nomor_rekening, 'Nomor rekening')}
                        style={{
                          padding: '4px 10px', background: '#FAF7F2',
                          border: '1px solid #e8e4dc', borderRadius: 6,
                          fontSize: 11, fontWeight: 600, color: '#4D403A',
                          cursor: 'pointer', fontFamily: 'inherit'
                        }}
                      >
                        Salin
                      </button>
                    </div>
                  </div>

                  <div style={{
                    background: 'white', borderRadius: 8,
                    padding: 12
                  }}>
                    <p style={{ fontSize: 11, color: '#A39680', marginBottom: 4 }}>Atas Nama</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>
                      {paymentDetails.nama_pemilik_rekening}
                    </p>
                  </div>
                </div>
              )}

              {!noPaymentInfo && metodePembayaran === 'qris' && paymentDetails.qris_image && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 12
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>
                      QRIS
                    </span>
                  </div>

                  <div style={{
                    background: 'white', borderRadius: 8,
                    padding: 16, textAlign: 'center'
                  }}>
                    <img
                      src={paymentDetails.qris_image}
                      alt="QRIS"
                      style={{
                        maxWidth: '100%', maxHeight: 200,
                        borderRadius: 6, objectFit: 'contain'
                      }}
                    />
                    <p style={{ fontSize: 11, color: '#A39680', marginTop: 8 }}>
                      Scan QRIS untuk pembayaran
                    </p>
                  </div>
                </div>
              )}

              <div style={{
                marginTop: 20, paddingTop: 16,
                borderTop: '2px dashed #e8e4dc',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: 12, color: '#A39680', marginBottom: 4 }}>
                  Total Pembayaran
                </p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#3B6D11' }}>
                  {formatRupiah(paymentDetails.total_bayar)}
                </p>
              </div>
            </div>

            <div style={{
              background: '#FAEEDA', borderRadius: 8,
              padding: 12, marginBottom: 20
            }}>
              <p style={{ fontSize: 11, color: '#633806', lineHeight: 1.6, margin: 0 }}>
                <strong>Catatan:</strong> Upload bukti pembayaran di halaman Profile setelah melakukan transfer. Pesanan akan divalidasi setelah pembayaran dikonfirmasi.
              </p>
            </div>

            <button
              onClick={closePaymentInfo}
              style={{
                width: '100%', padding: '12px',
                background: '#262626', color: 'white',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Saya Sudah Bayar
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Cart