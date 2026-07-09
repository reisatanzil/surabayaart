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

  const [uploadTargetOrder, setUploadTargetOrder] = useState(null)
  const [buktiBayar, setBuktiBayar] = useState(null)
  const [buktiBayarPreview, setBuktiBayarPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Review states
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewPesan, setReviewPesan] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [submittedReviews, setSubmittedReviews] = useState({})

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { 
      navigate('/signin')
      return 
    }
    
    const u = JSON.parse(data)
    if (u.role_pengguna !== 'buyer') {
      navigate('/signin')
      return
    }
    
    setUser(u)
    ambilRiwayat(u.id_pengguna)
    ambilFotoProfil(u.id_pengguna)

    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'tiket') {
      setTimeout(() => {
        document.getElementById('section-tiket')?.scrollIntoView({ behavior: 'smooth' })
      }, 900)
    }
  }, [navigate])

  async function ambilFotoProfil(id) {
    try {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${id}/avatar`)
      if (data?.publicUrl) {
        setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`)
      }
    } catch (err) {
      console.error('Error ambil foto profil:', err)
    }
  }

  async function handleUploadFoto(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.')
      return
    }
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
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.id_pengguna}/avatar`)
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`)
    } catch (err) {
      console.error('Error upload foto:', err)
      alert('Gagal mengupload foto. Coba lagi.')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function ambilRiwayat(id) {
    try {
      setLoading(true)
      
      const { data: orderData, error } = await supabase
        .from('order')
        .select('*')
        .eq('id_pengguna', id)
        .order('waktu_order', { ascending: false })

      if (error) {
        console.error('Error ambil order:', error)
        setOrders([])
      } else {
        setOrders(orderData || [])
      }

      if (orderData && orderData.length > 0) {
        const orderIds = orderData.map(o => o.id_order)
        const { data: reviewData, error: reviewError } = await supabase
          .from('review')
          .select('id_order')
          .in('id_order', orderIds)

        if (!reviewError && reviewData) {
          const submitted = {}
          reviewData.forEach(r => { submitted[r.id_order] = true })
          setSubmittedReviews(submitted)
        }
      }
    } catch (err) {
      console.error('Error ambil riwayat:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function bukaModalReview(order) {
    try {
      let pergelaranInfo = null
      
      if (order.id_pergelaran) {
        const { data: pergelaran } = await supabase
          .from('pergelaran')
          .select('*')
          .eq('id_pergelaran', order.id_pergelaran)
          .single()
        
        pergelaranInfo = pergelaran
      }

      setReviewTarget({ 
        order, 
        pergelaran: pergelaranInfo,
        tanggal_event: order.tanggal_event
      })
      setReviewRating(0)
      setReviewHover(0)
      setReviewPesan('')
    } catch (err) {
      console.error('Error buka modal review:', err)
      alert('Gagal membuka form review')
    }
  }

  async function kirimReview() {
    if (!reviewRating || !reviewTarget) return
    setSubmittingReview(true)

    try {
      const { error } = await supabase.from('review').insert({
        id_order: reviewTarget.order.id_order,
        id_pengguna: user.id_pengguna,
        id_pergelaran: reviewTarget.pergelaran?.id_pergelaran || null,
        rating: reviewRating,
        pesan: reviewPesan.trim() || null,
      })

      if (error) throw error

      setSubmittedReviews(prev => ({ ...prev, [reviewTarget.order.id_order]: true }))
      setReviewTarget(null)
      alert('Review berhasil dikirim!')
    } catch (err) {
      console.error('Error kirim review:', err)
      alert('Gagal mengirim review: ' + err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  function bukaModalUpload(order) {
    setUploadTargetOrder(order)
    setBuktiBayar(null)
    setBuktiBayarPreview(null)
  }

  function handlePilihBukti(e) {
    const file = e.target.files[0]
    if (!file) return
    setBuktiBayar(file)
    setBuktiBayarPreview(URL.createObjectURL(file))
  }

  async function kirimBukti() {
    if (!buktiBayar || !uploadTargetOrder) return
    setUploading(true)
    
    try {
      const path = `bukti/${uploadTargetOrder.id_order}_${buktiBayar.name}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, buktiBayar, { upsert: true })
      
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      
      const { error: updateError } = await supabase.from('order').update({
        bukti_bayar: urlData.publicUrl,
        status_validasi_bayar: 'menunggu_validasi'
      }).eq('id_order', uploadTargetOrder.id_order)

      if (updateError) throw updateError

      setOrders(prev => prev.map(o =>
        o.id_order === uploadTargetOrder.id_order
          ? { ...o, bukti_bayar: urlData.publicUrl, status_validasi_bayar: 'menunggu_validasi' }
          : o
      ))
      
      alert('Bukti pembayaran berhasil dikirim!')
      setUploadTargetOrder(null)
    } catch (err) {
      console.error('Error kirim bukti:', err)
      alert('Gagal upload bukti: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  function logout() {
    localStorage.removeItem('user')
    navigate('/signin')
  }

  if (!user) {
    return (
      <div style={{ fontFamily: 'Albert Sans, sans-serif', minHeight: '100vh', background: '#FAFBF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: '#4D403A' }}>Memuat...</p>
      </div>
    )
  }

  const ordersApproved = orders.filter(o => o.status_validasi_bayar === 'approved')
  const ordersPending  = orders.filter(o =>
    !o.status_validasi_bayar ||
    o.status_validasi_bayar === 'menunggu' ||
    o.status_validasi_bayar === 'menunggu_validasi' ||
    o.status_validasi_bayar === 'pending'
  )
  const ordersRejected = orders.filter(o => o.status_validasi_bayar === 'rejected')

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
          <span onClick={() => navigate('/')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Beranda
          </span>
          <span onClick={() => navigate('/reservasi')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Reservasi
          </span>
          <button onClick={() => navigate('/customer/profile')}
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
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: '#DFDACF', display: 'flex',
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="foto profil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setAvatarUrl(null)} />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4D403A" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                style={{
                  position: 'absolute', bottom: 0, right: -2,
                  width: 22, height: 22, borderRadius: '50%',
                  background: uploadingPhoto ? '#A39680' : '#262626',
                  border: '2px solid white', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer', padding: 0
                }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }} onChange={handleUploadFoto} />
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
                Customer
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

        {loading ? (
          <p style={{ color: '#A39680', fontSize: 13 }}>Loading...</p>
        ) : orders.length === 0 ? (
          <>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#262626', marginBottom: 16 }}>My Ticket</p>
            <div style={{
              background: 'white', borderRadius: 10,
              border: '1px solid #e8e4dc', padding: 32, textAlign: 'center'
            }}>
              <p style={{ fontSize: 13, color: '#A39680' }}>Belum ada tiket.</p>
              <button onClick={() => navigate('/reservasi')} style={{
                marginTop: 12, padding: '8px 20px',
                background: '#262626', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 12,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>Pesan Tiket Sekarang</button>
            </div>
          </>
        ) : (
          <>
            {/* ── SECTION: MENUNGGU VALIDASI ── */}
            {ordersPending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Menunggu Validasi</p>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 50,
                    background: '#FAEEDA', color: '#633806', fontWeight: 700
                  }}>{ordersPending.length}</span>
                </div>

                {ordersPending.map(order => (
                  <div key={order.id_order} style={{
                    background: 'white', borderRadius: 10,
                    border: '1px solid #F5D99A', padding: 20, marginBottom: 12
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 14,
                      paddingBottom: 12, borderBottom: '1px solid #f0ece4'
                    }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#A39680', marginBottom: 2 }}>
                          {new Date(order.waktu_order).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                        <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4D403A', fontWeight: 600 }}>
                          #{order.id_order.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                          Rp {parseInt(order.total_pembayaran || 0).toLocaleString('id-ID')}
                        </p>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 50,
                          fontWeight: 600, background: '#FAEEDA', color: '#633806'
                        }}>
                          {order.status_validasi_bayar === 'menunggu_validasi'
                            ? 'Bukti Terkirim — Menunggu Konfirmasi'
                            : 'Belum Upload Bukti'}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      marginBottom: 10, padding: '10px 14px',
                      background: '#FAFBF5', borderRadius: 8,
                      border: '1px solid #e8e4dc'
                    }}>
                      <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                        <strong>Jumlah Tiket:</strong> {order.jumlah_tiket || order.jumlah_item || 0}
                      </p>
                      {order.tanggal_event && (
                        <p style={{ fontSize: 12, color: '#555' }}>
                          <strong>Tanggal Event:</strong> {order.tanggal_event}
                        </p>
                      )}
                    </div>

                    {order.bukti_bayar && (
                      <div style={{
                        marginTop: 10, marginBottom: 10,
                        background: '#FAFBF5', borderRadius: 8,
                        border: '1px solid #e8e4dc', padding: 10,
                        display: 'flex', alignItems: 'center', gap: 10
                      }}>
                        <img src={order.bukti_bayar} alt="bukti"
                          style={{
                            width: 52, height: 52, objectFit: 'cover',
                            borderRadius: 6, border: '1px solid #e8e4dc', flexShrink: 0
                          }} />
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#4D403A', marginBottom: 2 }}>
                            Bukti pembayaran sudah dikirim
                          </p>
                          <p style={{ fontSize: 11, color: '#A39680' }}>
                            Menunggu konfirmasi dari penyelenggara
                          </p>
                        </div>
                      </div>
                    )}

                    <button onClick={() => bukaModalUpload(order)} style={{
                      marginTop: 8, width: '100%', padding: '10px',
                      background: order.bukti_bayar ? 'transparent' : '#262626',
                      color: order.bukti_bayar ? '#4D403A' : 'white',
                      border: order.bukti_bayar ? '1px solid #4D403A' : 'none',
                      borderRadius: 8, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {order.bukti_bayar ? 'Ganti Bukti Pembayaran' : 'Upload Bukti Pembayaran'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── SECTION: DITOLAK ── */}
            {ordersRejected.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Pembayaran Ditolak</p>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 50,
                    background: '#FDECEA', color: '#7B1A1A', fontWeight: 700
                  }}>{ordersRejected.length}</span>
                </div>

                {ordersRejected.map(order => (
                  <div key={order.id_order} style={{
                    background: 'white', borderRadius: 10,
                    border: '1px solid #F5C6C6', padding: 20, marginBottom: 12
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 14,
                      paddingBottom: 12, borderBottom: '1px solid #f0ece4'
                    }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#A39680', marginBottom: 2 }}>
                          {new Date(order.waktu_order).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                        <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4D403A', fontWeight: 600 }}>
                          #{order.id_order.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                          Rp {parseInt(order.total_pembayaran || 0).toLocaleString('id-ID')}
                        </p>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 50,
                          fontWeight: 600, background: '#FDECEA', color: '#7B1A1A'
                        }}>Ditolak</span>
                      </div>
                    </div>

                    <div style={{
                      marginTop: 10, background: '#FDECEA', borderRadius: 8,
                      padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B1A1A" strokeWidth="2.5"
                        style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#7B1A1A', marginBottom: 2 }}>
                          Bukti pembayaran ditolak
                        </p>
                        <p style={{ fontSize: 11, color: '#7B1A1A', lineHeight: 1.5 }}>
                          Upload ulang bukti pembayaran yang benar agar tiket bisa divalidasi.
                        </p>
                      </div>
                    </div>

                    <button onClick={() => bukaModalUpload(order)} style={{
                      marginTop: 10, width: '100%', padding: '10px',
                      background: '#7B1A1A', color: 'white',
                      border: 'none', borderRadius: 8, fontSize: 12,
                      fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Upload Ulang Bukti Pembayaran
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── SECTION: MY TICKET (approved) ── */}
            <div id="section-tiket">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>My Ticket</p>
                {ordersApproved.length > 0 && (
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 50,
                    background: '#EAF3DE', color: '#27500A', fontWeight: 700
                  }}>{ordersApproved.length}</span>
                )}
              </div>

              {ordersApproved.length === 0 ? (
                <div style={{
                  background: 'white', borderRadius: 10,
                  border: '1px solid #e8e4dc', padding: 32, textAlign: 'center'
                }}>
                  <p style={{ fontSize: 13, color: '#A39680', marginBottom: 4 }}>
                    Tiket akan muncul setelah pembayaran divalidasi penyelenggara.
                  </p>
                  {ordersPending.length === 0 && ordersRejected.length === 0 && (
                    <button onClick={() => navigate('/reservasi')} style={{
                      marginTop: 12, padding: '8px 20px',
                      background: '#262626', color: 'white',
                      border: 'none', borderRadius: 8, fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                    }}>Pesan Tiket</button>
                  )}
                </div>
              ) : (
                ordersApproved.map(order => {
                  const sudahReview = submittedReviews[order.id_order]
                  return (
                    <div key={order.id_order} style={{
                      background: 'white', borderRadius: 10,
                      border: '1px solid #e8e4dc', padding: 20, marginBottom: 14
                    }}>
                      {/* Header order */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 14,
                        paddingBottom: 12, borderBottom: '1px solid #f0ece4'
                      }}>
                        <div>
                          <p style={{ fontSize: 11, color: '#A39680', marginBottom: 2 }}>
                            {new Date(order.waktu_order).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </p>
                          <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4D403A', fontWeight: 600 }}>
                            #{order.id_order.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                            Rp {parseInt(order.total_pembayaran || 0).toLocaleString('id-ID')}
                          </p>
                          <span style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 50,
                            fontWeight: 600, background: '#EAF3DE', color: '#27500A'
                          }}>Tervalidasi ✓</span>
                        </div>
                      </div>

                      <div style={{
                        padding: '10px 14px',
                        background: '#FAFBF5', borderRadius: 8,
                        border: '1px solid #e8e4dc', marginBottom: 10
                      }}>
                        <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                          <strong>Jumlah Tiket:</strong> {order.jumlah_tiket || order.jumlah_item || 0}
                        </p>
                        {order.tanggal_event && (
                          <p style={{ fontSize: 12, color: '#555' }}>
                            <strong>Tanggal Event:</strong> {order.tanggal_event}
                          </p>
                        )}
                      </div>

                      {/* Tombol aksi */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button
                          onClick={() => navigate(`/my-ticket/${order.id_order}`)}
                          style={{
                            flex: 1, padding: '9px',
                            background: 'transparent', color: '#27500A',
                            border: '1px solid #C6E0A4', borderRadius: 7,
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'inherit'
                          }}>
                          Lihat E-Ticket →
                        </button>

                        {/* Tombol Review */}
                        {sudahReview ? (
                          <div style={{
                            flex: 1, padding: '9px',
                            background: '#FAFBF5', border: '1px solid #e8e4dc',
                            borderRadius: 7, fontSize: 12, color: '#A39680',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                          }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F5A623" stroke="#F5A623" strokeWidth="1">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Review Terkirim
                          </div>
                        ) : (
                          <button
                            onClick={() => bukaModalReview(order)}
                            style={{
                              flex: 1, padding: '9px',
                              background: '#262626', color: 'white',
                              border: 'none', borderRadius: 7,
                              fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              fontFamily: 'inherit',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                            }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Tulis Review
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* ── MODAL UPLOAD BUKTI BAYAR ── */}
      {uploadTargetOrder && (
        <div
          onClick={() => setUploadTargetOrder(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(38,38,38,0.6)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100, padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 16,
              padding: 28, maxWidth: 380, width: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#262626' }}>Upload Bukti Pembayaran</p>
              <button onClick={() => setUploadTargetOrder(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#A39680', fontSize: 18, lineHeight: 1
              }}>✕</button>
            </div>

            <p style={{ fontSize: 12, color: '#A39680', marginBottom: 16, lineHeight: 1.6 }}>
              Order <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4D403A' }}>
                #{uploadTargetOrder.id_order.slice(0, 8).toUpperCase()}
              </span> · Rp {parseInt(uploadTargetOrder.total_pembayaran || 0).toLocaleString('id-ID')}
            </p>

            <div
              onClick={() => document.getElementById('bukti-input-profile').click()}
              style={{
                border: '2px dashed #e8e4dc', borderRadius: 10,
                padding: 24, textAlign: 'center', cursor: 'pointer',
                background: '#FAFBF5', marginBottom: 16
              }}>
              {buktiBayarPreview ? (
                <img src={buktiBayarPreview} alt="bukti"
                  style={{ maxHeight: 200, borderRadius: 8, objectFit: 'contain' }} />
              ) : uploadTargetOrder.bukti_bayar ? (
                <div>
                  <img src={uploadTargetOrder.bukti_bayar} alt="bukti lama"
                    style={{ maxHeight: 140, borderRadius: 8, objectFit: 'contain', opacity: 0.6, marginBottom: 8 }} />
                  <p style={{ fontSize: 11, color: '#A39680' }}>Klik untuk ganti foto bukti</p>
                </div>
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
            <input id="bukti-input-profile" type="file" accept="image/*"
              onChange={handlePilihBukti} style={{ display: 'none' }} />

            <button onClick={kirimBukti} disabled={!buktiBayar || uploading} style={{
              width: '100%', padding: '12px',
              background: !buktiBayar || uploading ? '#A39680' : '#262626',
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 700,
              cursor: !buktiBayar || uploading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', marginBottom: 8
            }}>
              {uploading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
            </button>
            <button onClick={() => setUploadTargetOrder(null)} style={{
              width: '100%', padding: '10px',
              background: 'transparent', color: '#A39680',
              border: 'none', fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL REVIEW ── */}
      {reviewTarget && (
        <div
          onClick={() => setReviewTarget(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(38,38,38,0.65)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100, padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 16,
              padding: 28, maxWidth: 400, width: '100%',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginBottom: 3 }}>Tulis Review</p>
                {reviewTarget.pergelaran?.nama_pergelaran && (
                  <p style={{ fontSize: 12, color: '#A39680' }}>
                    {reviewTarget.pergelaran.nama_pergelaran}
                  </p>
                )}
              </div>
              <button onClick={() => setReviewTarget(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#A39680', fontSize: 18, lineHeight: 1, marginTop: -2
              }}>✕</button>
            </div>

            <div style={{
              height: 1, background: '#f0ece4', margin: '14px 0'
            }} />

            {/* Cek tanggal event */}
            {reviewTarget.tanggal_event && new Date(reviewTarget.tanggal_event) > new Date() ? (
              <div style={{
                background: '#FAEEDA', borderRadius: 10, padding: '16px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>📅</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#633806', marginBottom: 4 }}>
                  Event Belum Selesai
                </p>
                <p style={{ fontSize: 12, color: '#633806', lineHeight: 1.6 }}>
                  Review bisa ditulis setelah event selesai pada{' '}
                  <strong>
                    {new Date(reviewTarget.tanggal_event).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </strong>
                </p>
              </div>
            ) : (
              <>
                {/* Rating bintang */}
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#4D403A', marginBottom: 10 }}>
                    Rating Keseluruhan
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        style={{
                          background: 'none', border: 'none',
                          cursor: 'pointer', padding: 2,
                          transition: 'transform 0.1s',
                          transform: reviewHover >= star || reviewRating >= star ? 'scale(1.15)' : 'scale(1)'
                        }}>
                        <svg width="30" height="30" viewBox="0 0 24 24"
                          fill={(reviewHover || reviewRating) >= star ? '#F5A623' : 'none'}
                          stroke={(reviewHover || reviewRating) >= star ? '#F5A623' : '#DFD8CE'}
                          strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                  {reviewRating > 0 && (
                    <p style={{ fontSize: 11, color: '#A39680', marginTop: 6 }}>
                      {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][reviewRating]}
                    </p>
                  )}
                </div>

                {/* Komentar */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#4D403A', marginBottom: 8 }}>
                    Komentar <span style={{ fontWeight: 400, color: '#A39680' }}>(opsional)</span>
                  </p>
                  <textarea
                    value={reviewPesan}
                    onChange={e => setReviewPesan(e.target.value)}
                    placeholder="Ceritakan pengalamanmu di event ini..."
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 14px',
                      borderRadius: 8, border: '1px solid #e8e4dc',
                      fontSize: 13, outline: 'none', color: '#262626',
                      fontFamily: 'inherit', background: '#FAFBF5',
                      resize: 'none', boxSizing: 'border-box',
                      lineHeight: 1.6
                    }}
                  />
                </div>

                <button
                  onClick={kirimReview}
                  disabled={!reviewRating || submittingReview}
                  style={{
                    width: '100%', padding: '12px',
                    background: !reviewRating || submittingReview ? '#A39680' : '#262626',
                    color: 'white', border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 700,
                    cursor: !reviewRating || submittingReview ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit'
                  }}>
                  {submittingReview ? 'Mengirim...' : 'Kirim Review'}
                </button>
                <p style={{ fontSize: 11, color: '#A39680', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
                  Review tidak dapat diubah setelah dikirim.
                </p>
              </>
            )}
          </div>
        </div>
      )}

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