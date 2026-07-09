import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function Cart() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [cartData, setCartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [metodePembayaran, setMetodePembayaran] = useState('transfer')

  useEffect(() => {
    // 1. Cek apakah user sudah login dan berstatus buyer
    const userData = localStorage.getItem('user')
    if (!userData) { 
      navigate('/signin')
      return 
    }
    
    const u = JSON.parse(userData)
    // PERBAIKAN: Ganti 'customer' jadi 'buyer'
    if (u.role_pengguna !== 'buyer') { 
      navigate('/signin')
      return 
    } 
    setUser(u)

    // 2. Ambil data keranjang dari localStorage
    const cartString = localStorage.getItem('cart')
    if (!cartString) {
      alert('Keranjang kamu kosong!')
      navigate('/')
      return
    }
    
    setCartData(JSON.parse(cartString))
  }, [navigate])

  // Fungsi untuk memproses Checkout
  async function handleCheckout() {
    if (!cartData || !user) return
    
    setLoading(true)

    try {
      // Insert ke tabel order
      const { data, error } = await supabase
        .from('order')
        .insert([{
          id_pengguna: user.id_pengguna,
          id_pergelaran: cartData.event.id_pergelaran,
          tanggal_event: cartData.tanggalDipilih,
          jumlah_item: cartData.jumlah,
          jumlah_tiket: cartData.jumlah,
          total_pembayaran: cartData.totalHarga,
          metode_pembayaran: metodePembayaran,
          metode_bayar: metodePembayaran,
          status_pembayaran: false,
          status_validasi_bayar: 'menunggu',
          waktu_order: new Date().toISOString()
        }])

      if (error) throw error

      // Jika berhasil
      alert('Checkout berhasil! Silakan lakukan pembayaran.')
      localStorage.removeItem('cart')
      
      // PERBAIKAN: Redirect ke /profile (bukan /customer/profile)
      navigate('/profile')
      
    } catch (err) {
      console.error('Error checkout:', err)
      alert('Gagal melakukan checkout: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!cartData || !user) {
    return (
      <div style={{ fontFamily: 'Albert Sans, sans-serif', minHeight: '100vh', background: '#e8e4dc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: '#4D403A' }}>Memuat keranjang...</p>
      </div>
    )
  }

  // Format harga ke Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
  }

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
          
          {/* KOLOM KIRI: DETAIL EVENT */}
          <div style={{ flex: 2, background: 'white', borderRadius: 10, padding: 24, overflow: 'hidden' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#4D403A', marginBottom: 16, borderBottom: '1px solid #e8e4dc', paddingBottom: 10 }}>
              Detail Event
            </p>
            
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Poster */}
              <div style={{ width: 120, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0' }}>
                <img 
                  src={cartData.event.poster_pergelaran || '/placeholder.jpg'} 
                  alt="poster" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              {/* Info Event */}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#555' }}>Total Pembayaran</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#3B6D11' }}>
                {formatRupiah(cartData.totalHarga)}
              </span>
            </div>

            {/* Pilihan Metode Pembayaran */}
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
    </div>
  )
}

export default Cart