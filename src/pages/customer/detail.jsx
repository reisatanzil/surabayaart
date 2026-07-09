import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [event, setEvent] = useState(null)
  const [jadwal, setJadwal] = useState(null)
  const [tanggalDipilih, setTanggalDipilih] = useState(null)
  const [jumlah, setJumlah] = useState(1)
  const [bulanDilihat, setBulanDilihat] = useState(new Date())
  const [merchandise, setMerchandise] = useState([])
  const [selectedMerchandise, setSelectedMerchandise] = useState([])

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    setUser(JSON.parse(data))
    ambilEvent()
  }, [])

  async function ambilEvent() {
    const { data: e } = await supabase
      .from('pergelaran')
      .select('*, penyelenggara(instansi_penyelenggara, no_telpon)')
      .eq('id_pergelaran', id)
      .single()
    setEvent(e)

    if (e) {
      const { data: j } = await supabase
        .from('jadwal_event')
        .select('*')
        .eq('id_pergelaran', id)
        .single()
      setJadwal(j)

      if (j) {
        setBulanDilihat(new Date(j.tanggal))
      }

      // Ambil merchandise
      const { data: m } = await supabase
        .from('merchandise')
        .select('*')
        .eq('id_pergelaran', id)
      setMerchandise(m || [])
    }
  }

  function renderKalender() {
    const tahun = bulanDilihat.getFullYear()
    const bulan = bulanDilihat.getMonth()
    const hariPertama = new Date(tahun, bulan, 1).getDay()
    const totalHari = new Date(tahun, bulan + 1, 0).getDate()
    const namaBulan = bulanDilihat.toLocaleString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()
    const hariLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    const cells = []
    for (let i = 0; i < hariPertama; i++) cells.push(null)
    for (let i = 1; i <= totalHari; i++) cells.push(i)

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <button onClick={() => setBulanDilihat(new Date(tahun, bulan - 1, 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#4D403A' }}>‹</button>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4D403A', letterSpacing: 1 }}>{namaBulan}</span>
          <button onClick={() => setBulanDilihat(new Date(tahun, bulan + 1, 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#4D403A' }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
          {hariLabel.map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: '#A39680', padding: '4px 0' }}>{h}</div>
          ))}
          {cells.map((hari, i) => {
            if (!hari) return <div key={i} />
            const dateStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(hari).padStart(2, '0')}`
            const today = new Date().toISOString().split('T')[0]
            const isValid = jadwal && dateStr >= jadwal.tanggal && dateStr <= (jadwal.tanggal_selesai || jadwal.tanggal) && dateStr >= today
            const isSelected = tanggalDipilih === dateStr
            const isToday = dateStr === new Date().toISOString().split('T')[0]

            return (
              <div key={i}
                onClick={() => isValid && setTanggalDipilih(dateStr)}
                style={{
                  padding: '6px 0', fontSize: 11, borderRadius: 6,
                  cursor: isValid ? 'pointer' : 'default',
                  background: isSelected ? '#4D403A' : isValid ? '#DFDACF' : 'transparent',
                  color: isSelected ? 'white' : isValid ? '#4D403A' : '#ccc',
                  fontWeight: isSelected || isToday ? 700 : 400,
                  outline: isToday && !isSelected ? '1px solid #A39680' : 'none',
                  transition: 'all 0.1s'
                }}>
                {hari}
              </div>
            )
          })}
        </div>

        {tanggalDipilih && (
          <p style={{
            fontSize: 12, color: '#4D403A', fontWeight: 600,
            marginTop: 10, textAlign: 'center',
            background: '#DFDACF', borderRadius: 6, padding: '6px 10px'
          }}>
            {new Date(tanggalDipilih + 'T00:00:00').toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        )}
      </div>
    )
  }

  function toggleMerchandise(item) {
    const existing = selectedMerchandise.find(m => m.id_merchandise === item.id_merchandise)
    if (existing) {
      setSelectedMerchandise(selectedMerchandise.filter(m => m.id_merchandise !== item.id_merchandise))
    } else {
      setSelectedMerchandise([...selectedMerchandise, { ...item, jumlah: 1 }])
    }
  }

  function updateMerchandiseQty(id, qty) {
    setSelectedMerchandise(selectedMerchandise.map(m => 
      m.id_merchandise === id ? { ...m, jumlah: Math.max(1, qty) } : m
    ))
  }

  function beliTiket() {
    if (!tanggalDipilih) { alert('Pilih tanggal dulu!'); return }
    if (jumlah < 1) { alert('Jumlah tiket minimal 1!'); return }
    
    // Hitung total merchandise
    const merchandiseTotal = selectedMerchandise.reduce((sum, item) => {
      return sum + (item.harga_merchandise || 0) * (item.jumlah || 1)
    }, 0)

    localStorage.setItem('cart', JSON.stringify({
      event, jadwal, tanggalDipilih, jumlah,
      totalHarga: jumlah * (event.harga_tiket || 0),
      merchandise: selectedMerchandise,
      merchandiseTotal: merchandiseTotal,
      grandTotal: (jumlah * (event.harga_tiket || 0)) + merchandiseTotal
    }))
    navigate('/cart')
  }

  if (!event) return (
    <div style={{ padding: 40, fontFamily: 'Albert Sans, sans-serif', color: '#A39680', textAlign: 'center' }}>
      Loading...
    </div>
  )

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
            style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#262626', letterSpacing: 0.5 }}>
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

      {/* KONTEN */}
      <div style={{
        padding: '32px', display: 'grid',
        gridTemplateColumns: '1fr 320px', gap: 32,
        maxWidth: 1100, margin: '0 auto'
      }}>

        {/* KIRI */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#262626', marginBottom: 6 }}>
            {event.nama_pergelaran}
          </h1>
          <p style={{ fontSize: 13, color: '#A39680', marginBottom: 20 }}>
            {jadwal ? `${new Date(jadwal.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}${jadwal.tanggal_selesai ? ` – ${new Date(jadwal.tanggal_selesai + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}` : ''}
          </p>

          {event.poster_pergelaran && (
            <img src={event.poster_pergelaran} alt={event.nama_pergelaran}
              style={{ width: '100%', maxWidth: 280, borderRadius: 10, objectFit: 'cover', marginBottom: 24 }} />
          )}

          {/* TENTANG */}
          <div style={{ background: '#F5F2ED', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#4D403A', marginBottom: 8, letterSpacing: 1 }}>
              TENTANG
            </p>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
              {event.deskripsi_pergelaran}
            </p>
          </div>

          {/* LOKASI */}
          <div style={{ background: '#F5F2ED', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#4D403A', marginBottom: 8, letterSpacing: 1 }}>
              LOKASI
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 4 }}>
              {event.lokasi_pergelaran}
            </p>
            {event.alamat_pergelaran && (
              <p style={{ fontSize: 12, color: '#A39680', marginBottom: 12 }}>
                {event.alamat_pergelaran}
              </p>
            )}
            {event.alamat_pergelaran && (
              <iframe
                title="maps"
                width="100%"
                height="200"
                style={{ borderRadius: 8, border: 'none' }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(event.alamat_pergelaran)}&output=embed`}
              />
            )}
          </div>

          {/* MERCHANDISE */}
          {merchandise.length > 0 && (
            <div style={{ background: '#F5F2ED', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#4D403A', marginBottom: 12, letterSpacing: 1 }}>
                MERCHANDISE
              </p>
              {merchandise.map(item => {
                const isSelected = selectedMerchandise.find(m => m.id_merchandise === item.id_merchandise)
                return (
                  <div key={item.id_merchandise} style={{
                    display: 'flex', gap: 12, padding: '12px 0',
                    borderBottom: '1px solid #e8e4dc',
                    alignItems: 'center'
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
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#3B6D11' }}>
                        Rp {parseInt(item.harga_merchandise || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isSelected && (
                        <>
                          <button 
                            onClick={() => updateMerchandiseQty(item.id_merchandise, isSelected.jumlah - 1)}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              border: '1px solid #e8e4dc', background: 'white',
                              cursor: 'pointer', fontSize: 14, color: '#4D403A',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>−</button>
                          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                            {isSelected.jumlah}
                          </span>
                          <button 
                            onClick={() => updateMerchandiseQty(item.id_merchandise, isSelected.jumlah + 1)}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              border: '1px solid #e8e4dc', background: 'white',
                              cursor: 'pointer', fontSize: 14, color: '#4D403A',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>+</button>
                        </>
                      )}
                      <button 
                        onClick={() => toggleMerchandise(item)}
                        style={{
                          padding: '6px 12px', borderRadius: 6,
                          background: isSelected ? '#4D403A' : 'white',
                          color: isSelected ? 'white' : '#4D403A',
                          border: isSelected ? 'none' : '1px solid #4D403A',
                          fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'inherit'
                        }}>
                        {isSelected ? '✓' : '+ Tambah'}
                      </button>
                    </div>
                  </div>
                )
              })}
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
              Dapatkan Tiket
            </p>

            {renderKalender()}

            {/* PESAN TIKET */}
            <div style={{ border: '1px solid #e8e4dc', borderRadius: 8, padding: 14, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#A39680', marginBottom: 2 }}>Harga Tiket</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#262626' }}>
                    Rp {parseInt(event.harga_tiket || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setJumlah(Math.max(1, jumlah - 1))}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '1px solid #e8e4dc', background: 'white',
                      cursor: 'pointer', fontSize: 16, color: '#4D403A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'inherit'
                    }}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{jumlah}</span>
                  <button onClick={() => setJumlah(Math.min(jumlah + 1, jadwal?.kursi_tersedia || 999))}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '1px solid #e8e4dc', background: 'white',
                      cursor: 'pointer', fontSize: 16, color: '#4D403A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'inherit'
                    }}>+</button>
                </div>
              </div>

              {jadwal?.kursi_tersedia && (
                <p style={{ fontSize: 11, color: '#A39680', marginBottom: 10 }}>
                  {jadwal.kursi_tersedia} kursi tersedia
                </p>
              )}

              <div style={{ borderTop: '1px solid #e8e4dc', paddingTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#A39680' }}>Total Tiket</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>
                    Rp {(jumlah * (event.harga_tiket || 0)).toLocaleString('id-ID')}
                  </span>
                </div>
                {selectedMerchandise.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#A39680' }}>Merchandise</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>
                      Rp {selectedMerchandise.reduce((sum, item) => sum + (item.harga_merchandise || 0) * (item.jumlah || 1), 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e8e4dc', paddingTop: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#A39680', fontWeight: 700 }}>Grand Total</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#3B6D11' }}>
                    Rp {((jumlah * (event.harga_tiket || 0)) + selectedMerchandise.reduce((sum, item) => sum + (item.harga_merchandise || 0) * (item.jumlah || 1), 0)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={beliTiket} style={{
              width: '100%', padding: '12px',
              background: '#262626', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 13,
              fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', marginTop: 12, letterSpacing: 0.5
            }}>
              Beli Tiket
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: '1px solid #e8e4dc', padding: '16px 32px',
        display: 'flex', justifyContent: 'center', marginTop: 20
      }}>
        <span style={{ fontSize: 11, color: '#A39680' }}>
          © 2025-2026 SurabayArt Art Space. All rights reserved.
        </span>
      </div>

    </div>
  )
}

export default Detail