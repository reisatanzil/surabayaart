import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

function UpEvent() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [penyelenggara, setPenyelenggara] = useState(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState(false)

  const [event, setEvent] = useState({
    nama_pergelaran: '',
    lokasi_pergelaran: '',
    alamat_pergelaran: '',
    deskripsi_pergelaran: '',
    harga_tiket: '',
    kategori_pergelaran: '',
    poster_pergelaran: '',
    surat_izin_instansi: '',
  })
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [suratFile, setSuratFile] = useState(null)

  const [jadwal, setJadwal] = useState({
    tanggal_mulai: '',
    tanggal_selesai: '',
    jam_mulai: '',
    jam_selesai: '',
    kapasitas_sesi: '',
  })

  const [merch, setMerch] = useState([{
    nama_merchandise: '',
    deskripsi_merchandise: '',
    harga_merchandise: '',
    stok_merchandise: '',
    foto_merchandise: '',
    fotoFile: null,
    fotoPreview: null
  }])

  const [bayar, setBayar] = useState({
    nama_bank: '',
    nomor_rekening: '',
    nama_pemilik_rekening: '',
  })
  const [qrisFile, setQrisFile] = useState(null)
  const [qrisPreview, setQrisPreview] = useState(null)
  const [metodeBayar, setMetodeBayar] = useState('transfer') // 'transfer' | 'qris' | 'keduanya'

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (!data) { navigate('/signin'); return }
    const u = JSON.parse(data)
    if (u.role_pengguna !== 'organizer') { navigate('/signin'); return }
    setUser(u)
    ambilPenyelenggara(u.id_pengguna)
  }, [])

  async function ambilPenyelenggara(id) {
    const { data } = await supabase
      .from('penyelenggara')
      .select('*')
      .eq('id_pengguna', id)
      .single()
    if (data?.status !== 'active') {
      alert('Akun belum diapprove admin!')
      navigate('/organizer/dashboard')
      return
    }
    setPenyelenggara(data)
  }

  function handleEvent(e) {
    setEvent({ ...event, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  function handleJadwal(e) {
    setJadwal({ ...jadwal, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  function handlePosterFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
    if (errors.poster) setErrors({ ...errors, poster: '' })
  }

  function handleSuratFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setSuratFile(file)
    if (errors.surat) setErrors({ ...errors, surat: '' })
  }

  function handleQrisFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setQrisFile(file)
    setQrisPreview(URL.createObjectURL(file))
    if (errors.qris) setErrors({ ...errors, qris: '' })
  }

  function handleMerch(i, e) {
    const updated = [...merch]
    updated[i][e.target.name] = e.target.value
    setMerch(updated)
  }

  function handleMerchFoto(i, e) {
    const file = e.target.files[0]
    if (!file) return
    const updated = [...merch]
    updated[i].fotoFile = file
    updated[i].fotoPreview = URL.createObjectURL(file)
    setMerch(updated)
  }

  function tambahMerch() {
    setMerch([...merch, {
      nama_merchandise: '', deskripsi_merchandise: '',
      harga_merchandise: '', stok_merchandise: '',
      foto_merchandise: '', fotoFile: null, fotoPreview: null
    }])
  }

  function hapusMerch(i) {
    setMerch(merch.filter((_, idx) => idx !== i))
  }

  // Validasi step 1
  function validateStep1() {
    const e = {}
    if (!posterFile) e.poster = 'Poster wajib diupload'
    if (!event.nama_pergelaran.trim()) e.nama_pergelaran = 'Nama pergelaran wajib diisi'
    if (!event.kategori_pergelaran) e.kategori_pergelaran = 'Kategori wajib dipilih'
    if (!event.lokasi_pergelaran.trim()) e.lokasi_pergelaran = 'Lokasi wajib diisi'
    if (!event.alamat_pergelaran.trim()) e.alamat_pergelaran = 'Alamat lengkap wajib diisi'
    if (!jadwal.tanggal_mulai) e.tanggal_mulai = 'Tanggal mulai wajib diisi'
    if (!jadwal.tanggal_selesai) e.tanggal_selesai = 'Tanggal selesai wajib diisi'
    if (!jadwal.jam_mulai) e.jam_mulai = 'Jam mulai wajib diisi'
    if (!jadwal.jam_selesai) e.jam_selesai = 'Jam selesai wajib diisi'
    if (!jadwal.kapasitas_sesi) e.kapasitas_sesi = 'Kapasitas wajib diisi'
    if (!event.harga_tiket) e.harga_tiket = 'Harga tiket wajib diisi'
    if (!event.deskripsi_pergelaran.trim()) e.deskripsi_pergelaran = 'Deskripsi wajib diisi'
    if (!suratFile) e.surat = 'Surat izin wajib diupload'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Validasi step 3
  function validateStep3() {
    const e = {}
    const butuhTransfer = metodeBayar === 'transfer' || metodeBayar === 'keduanya'
    const butuhQris = metodeBayar === 'qris' || metodeBayar === 'keduanya'
    if (butuhTransfer) {
      if (!bayar.nama_bank.trim()) e.nama_bank = 'Nama bank wajib diisi'
      if (!bayar.nomor_rekening.trim()) e.nomor_rekening = 'Nomor rekening wajib diisi'
      if (!bayar.nama_pemilik_rekening.trim()) e.nama_pemilik_rekening = 'Nama pemilik rekening wajib diisi'
    }
    if (butuhQris) {
      if (!qrisFile) e.qris = 'Foto QRIS wajib diupload'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function uploadFile(file, bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    if (error) return null
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return urlData.publicUrl
  }

  async function handleSubmit() {
    if (!validateStep3()) return
    if (!penyelenggara) return
    setLoading(true)

    let posterUrl = event.poster_pergelaran
    if (posterFile) {
      posterUrl = await uploadFile(posterFile, 'images', `posters/${Date.now()}_${posterFile.name}`)
    }

    let suratUrl = event.surat_izin_instansi
    if (suratFile) {
      suratUrl = await uploadFile(suratFile, 'documents', `surat/${Date.now()}_${suratFile.name}`)
    }

    let qrisUrl = null
    if (qrisFile) {
      qrisUrl = await uploadFile(qrisFile, 'images', `qris/${Date.now()}_${qrisFile.name}`)
    }

    const { data: pergelaranData, error: pergelaranError } = await supabase
      .from('pergelaran')
      .insert({
        nama_pergelaran: event.nama_pergelaran,
        lokasi_pergelaran: event.lokasi_pergelaran,
        alamat_pergelaran: event.alamat_pergelaran,
        deskripsi_pergelaran: event.deskripsi_pergelaran,
        harga_tiket: parseFloat(event.harga_tiket) || 0,
        kategori_pergelaran: event.kategori_pergelaran,
        poster_pergelaran: posterUrl,
        surat_izin_instansi: suratUrl,
        nama_bank: bayar.nama_bank || null,
        nomor_rekening: bayar.nomor_rekening || null,
        nama_pemilik_rekening: bayar.nama_pemilik_rekening || null,
        qris_image: qrisUrl,
        id_penyelenggara: penyelenggara.id_penyelenggara,
        status_event: false,
        status_validasi: 'menunggu',
      })
      .select()
      .single()

    if (pergelaranError) {
      alert('Gagal upload event: ' + pergelaranError.message)
      setLoading(false)
      return
    }

    await supabase.from('jadwal_event').insert({
      id_pergelaran: pergelaranData.id_pergelaran,
      tanggal: jadwal.tanggal_mulai,
      tanggal_selesai: jadwal.tanggal_selesai,
      jam_mulai: jadwal.jam_mulai,
      jam_selesai: jadwal.jam_selesai,
      kapasitas_sesi: parseInt(jadwal.kapasitas_sesi) || 0,
      kursi_tersedia: parseInt(jadwal.kapasitas_sesi) || 0,
    })

    for (const m of merch) {
      if (!m.nama_merchandise) continue
      let fotoUrl = m.foto_merchandise
      if (m.fotoFile) {
        fotoUrl = await uploadFile(m.fotoFile, 'images', `merch/${Date.now()}_${m.fotoFile.name}`)
      }
      await supabase.from('merchandise').insert({
        nama_merchandise: m.nama_merchandise,
        deskripsi_merchandise: m.deskripsi_merchandise,
        harga_merchandise: parseFloat(m.harga_merchandise) || 0,
        stok_merchandise: parseInt(m.stok_merchandise) || 0,
        foto_merchandise: fotoUrl,
        id_penyelenggara: penyelenggara.id_penyelenggara,
      })
    }

    setLoading(false)
    setSukses(true)
  }

  if (!user) return null

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    borderRadius: 8, border: '1px solid #e8e4dc',
    fontSize: 13, outline: 'none', color: '#262626',
    fontFamily: 'inherit', background: 'white',
    boxSizing: 'border-box'
  }

  const inputErrorStyle = {
    ...inputStyle,
    border: '1px solid #E57373'
  }

  const labelStyle = {
    fontSize: 12, fontWeight: 600,
    color: '#4D403A', marginBottom: 5, display: 'block'
  }

  function ErrMsg({ field }) {
    if (!errors[field]) return null
    return <p style={{ fontSize: 11, color: '#C0392B', marginTop: 4 }}>{errors[field]}</p>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span onClick={() => navigate('/organizer/dashboard')}
            style={{ fontSize: 13, cursor: 'pointer', color: '#555', letterSpacing: 0.5 }}>
            Dashboard
          </span>
          <span onClick={() => navigate('/organizer/upload')}
            style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#262626', letterSpacing: 0.5 }}>
            Upload Event
          </span>
          <button onClick={() => navigate('/organizer/profile')}
            style={{
              padding: '8px 20px', background: '#262626',
              color: 'white', border: 'none', borderRadius: 50,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit'
            }}>
            My Profile
          </button>
        </div>
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
          width: 200, flexShrink: 0,
          background: 'white', borderRadius: 10,
          overflow: 'hidden', height: 'fit-content'
        }}>
          <div style={{
            padding: '10px 16px', fontSize: 11,
            fontWeight: 700, color: '#4D403A', letterSpacing: 1.5,
            display: 'flex', justifyContent: 'space-between',
            borderBottom: '1px solid #e8e4dc'
          }}>
            HOME <span>▾</span>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 16px 16px', borderBottom: '1px solid #e8e4dc' }}>
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
              {penyelenggara?.instansi_penyelenggara || user?.nama_pengguna}
            </p>
            <p style={{ fontSize: 11, color: '#A39680' }}>Penyelenggara</p>
          </div>
          <div style={{
            padding: '11px 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12, fontWeight: 700,
            color: '#4D403A', background: '#FAF7F2',
            borderLeft: '3px solid #4D403A'
          }}>
            Upload Event
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        {/* KONTEN */}
        <div style={{ flex: 1 }}>
          {sukses ? (
            <div style={{ background: 'white', borderRadius: 10, padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#27500A', marginBottom: 8 }}>
                Event berhasil diupload!
              </p>
              <p style={{ fontSize: 13, color: '#3B6D11', marginBottom: 20 }}>
                Tunggu persetujuan admin sebelum event tampil ke publik.
              </p>
              <button onClick={() => navigate('/organizer/dashboard')} style={{
                padding: '10px 24px', background: '#4D403A',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Kembali ke Dashboard
              </button>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 10, padding: 24 }}>

              {/* STEPPER */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
                {['Info Event', 'Merchandise', 'Pembayaran'].map((label, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: step > i + 1 ? '#3B6D11' : step === i + 1 ? '#4D403A' : '#DFDACF',
                        color: step >= i + 1 ? 'white' : '#A39680',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0
                      }}>
                        {step > i + 1 ? '✓' : i + 1}
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: step === i + 1 ? 700 : 400,
                        color: step === i + 1 ? '#4D403A' : '#A39680'
                      }}>{label}</span>
                    </div>
                    {i < 2 && (
                      <div style={{
                        flex: 1, height: 1,
                        background: step > i + 1 ? '#3B6D11' : '#e8e4dc',
                        margin: '0 12px'
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* STEP 1: INFO EVENT */}
              {step === 1 && (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                    Informasi Event
                  </p>
                  <p style={{ fontSize: 11, color: '#A39680', marginBottom: 20 }}>
                    Semua field wajib diisi.
                  </p>

                  {/* POSTER */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Poster Event <span style={{ color: '#C0392B' }}>*</span></label>
                    <div style={{
                      border: `2px dashed ${errors.poster ? '#E57373' : '#e8e4dc'}`,
                      borderRadius: 8, padding: 20, textAlign: 'center',
                      cursor: 'pointer', background: '#FAFBF5'
                    }} onClick={() => document.getElementById('poster-input').click()}>
                      {posterPreview ? (
                        <img src={posterPreview} alt="preview"
                          style={{ maxHeight: 160, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <p style={{ fontSize: 12, color: '#A39680' }}>Klik untuk upload poster</p>
                        </div>
                      )}
                    </div>
                    <input id="poster-input" type="file" accept="image/*"
                      onChange={handlePosterFile} style={{ display: 'none' }} />
                    <ErrMsg field="poster" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Nama Pergelaran <span style={{ color: '#C0392B' }}>*</span></label>
                      <input name="nama_pergelaran" value={event.nama_pergelaran}
                        onChange={handleEvent} placeholder="cth: Pameran Seni Lukis"
                        style={errors.nama_pergelaran ? inputErrorStyle : inputStyle} />
                      <ErrMsg field="nama_pergelaran" />
                    </div>
                    <div>
                      <label style={labelStyle}>Kategori <span style={{ color: '#C0392B' }}>*</span></label>
                      <select name="kategori_pergelaran" value={event.kategori_pergelaran}
                        onChange={handleEvent}
                        style={errors.kategori_pergelaran ? inputErrorStyle : inputStyle}>
                        <option value="">-- Pilih --</option>
                        <option value="Pameran">Pameran</option>
                        <option value="Pagelaran">Pagelaran</option>
                        <option value="Konser">Konser</option>
                        <option value="Festival">Festival</option>
                        <option value="Pertunjukan">Pertunjukan</option>
                      </select>
                      <ErrMsg field="kategori_pergelaran" />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Lokasi <span style={{ color: '#C0392B' }}>*</span></label>
                    <input name="lokasi_pergelaran" value={event.lokasi_pergelaran}
                      onChange={handleEvent} placeholder="cth: Balai Pemuda Surabaya"
                      style={errors.lokasi_pergelaran ? inputErrorStyle : inputStyle} />
                    <ErrMsg field="lokasi_pergelaran" />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Alamat Lengkap <span style={{ color: '#C0392B' }}>*</span></label>
                    <input name="alamat_pergelaran" value={event.alamat_pergelaran || ''}
                      onChange={handleEvent} placeholder="cth: Jl. Gubernur Suryo No.15, Surabaya"
                      style={errors.alamat_pergelaran ? inputErrorStyle : inputStyle} />
                    <ErrMsg field="alamat_pergelaran" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Tanggal Mulai <span style={{ color: '#C0392B' }}>*</span></label>
                      <input name="tanggal_mulai" type="date" value={jadwal.tanggal_mulai}
                        onChange={handleJadwal}
                        style={errors.tanggal_mulai ? inputErrorStyle : inputStyle} />
                      <ErrMsg field="tanggal_mulai" />
                    </div>
                    <div>
                      <label style={labelStyle}>Tanggal Selesai <span style={{ color: '#C0392B' }}>*</span></label>
                      <input name="tanggal_selesai" type="date" value={jadwal.tanggal_selesai}
                        onChange={handleJadwal}
                        style={errors.tanggal_selesai ? inputErrorStyle : inputStyle} />
                      <ErrMsg field="tanggal_selesai" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Jam Mulai <span style={{ color: '#C0392B' }}>*</span></label>
                      <input name="jam_mulai" type="time" value={jadwal.jam_mulai}
                        onChange={handleJadwal}
                        style={errors.jam_mulai ? inputErrorStyle : inputStyle} />
                      <ErrMsg field="jam_mulai" />
                    </div>
                    <div>
                      <label style={labelStyle}>Jam Selesai <span style={{ color: '#C0392B' }}>*</span></label>
                      <input name="jam_selesai" type="time" value={jadwal.jam_selesai}
                        onChange={handleJadwal}
                        style={errors.jam_selesai ? inputErrorStyle : inputStyle} />
                      <ErrMsg field="jam_selesai" />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Kapasitas (jumlah tiket tersedia) <span style={{ color: '#C0392B' }}>*</span></label>
                    <input name="kapasitas_sesi" type="number" value={jadwal.kapasitas_sesi}
                      onChange={handleJadwal} placeholder="cth: 500"
                      style={errors.kapasitas_sesi ? inputErrorStyle : inputStyle} />
                    <ErrMsg field="kapasitas_sesi" />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Harga Tiket (Rp) <span style={{ color: '#C0392B' }}>*</span></label>
                    <input name="harga_tiket" type="number" value={event.harga_tiket}
                      onChange={handleEvent} placeholder="cth: 50000"
                      style={errors.harga_tiket ? inputErrorStyle : inputStyle} />
                    <ErrMsg field="harga_tiket" />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Deskripsi <span style={{ color: '#C0392B' }}>*</span></label>
                    <textarea name="deskripsi_pergelaran" value={event.deskripsi_pergelaran}
                      onChange={handleEvent} placeholder="Ceritakan tentang event kamu..."
                      rows={4} style={{ ...(errors.deskripsi_pergelaran ? inputErrorStyle : inputStyle), resize: 'vertical' }} />
                    <ErrMsg field="deskripsi_pergelaran" />
                  </div>

                  {/* SURAT IZIN */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Surat Izin Penyelenggaraan (PDF) <span style={{ color: '#C0392B' }}>*</span></label>
                    <div style={{
                      border: `2px dashed ${errors.surat ? '#E57373' : '#e8e4dc'}`,
                      borderRadius: 8, padding: 16, cursor: 'pointer', background: '#FAFBF5',
                      display: 'flex', alignItems: 'center', gap: 12
                    }} onClick={() => document.getElementById('surat-input').click()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <p style={{ fontSize: 12, color: suratFile ? '#4D403A' : '#A39680', fontWeight: suratFile ? 600 : 400 }}>
                        {suratFile ? suratFile.name : 'Klik untuk upload surat izin (PDF)'}
                      </p>
                    </div>
                    <input id="surat-input" type="file" accept=".pdf"
                      onChange={handleSuratFile} style={{ display: 'none' }} />
                    <ErrMsg field="surat" />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => { if (validateStep1()) setStep(2) }} style={{
                      padding: '10px 28px', background: '#4D403A',
                      color: 'white', border: 'none', borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                      Selanjutnya →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: MERCHANDISE */}
              {step === 2 && (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 20 }}>
                    Merchandise <span style={{ fontWeight: 400, color: '#A39680', fontSize: 12 }}>(opsional)</span>
                  </p>

                  {merch.map((m, i) => (
                    <div key={i} style={{
                      border: '1px solid #e8e4dc', borderRadius: 8,
                      padding: 16, marginBottom: 14
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#4D403A' }}>
                          Merchandise {i + 1}
                        </p>
                        {merch.length > 1 && (
                          <button onClick={() => hapusMerch(i)} style={{
                            padding: '4px 10px', background: '#FCEBEB',
                            color: '#A32D2D', border: 'none', borderRadius: 6,
                            fontSize: 11, cursor: 'pointer', fontFamily: 'inherit'
                          }}>Hapus</button>
                        )}
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Foto Merchandise</label>
                        <div style={{
                          border: '2px dashed #e8e4dc', borderRadius: 8,
                          padding: 14, textAlign: 'center', cursor: 'pointer', background: '#FAFBF5'
                        }} onClick={() => document.getElementById(`merch-foto-${i}`).click()}>
                          {m.fotoPreview ? (
                            <img src={m.fotoPreview} alt="preview"
                              style={{ maxHeight: 100, borderRadius: 6, objectFit: 'cover' }} />
                          ) : (
                            <p style={{ fontSize: 12, color: '#A39680' }}>Klik untuk upload foto</p>
                          )}
                        </div>
                        <input id={`merch-foto-${i}`} type="file" accept="image/*"
                          onChange={e => handleMerchFoto(i, e)} style={{ display: 'none' }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div>
                          <label style={labelStyle}>Nama Merchandise</label>
                          <input name="nama_merchandise" value={m.nama_merchandise}
                            onChange={e => handleMerch(i, e)} placeholder="cth: Tote Bag"
                            style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Harga (Rp)</label>
                          <input name="harga_merchandise" type="number" value={m.harga_merchandise}
                            onChange={e => handleMerch(i, e)} placeholder="50000"
                            style={inputStyle} />
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Stok</label>
                        <input name="stok_merchandise" type="number" value={m.stok_merchandise}
                          onChange={e => handleMerch(i, e)} placeholder="cth: 100"
                          style={inputStyle} />
                      </div>

                      <div>
                        <label style={labelStyle}>Deskripsi</label>
                        <textarea name="deskripsi_merchandise" value={m.deskripsi_merchandise}
                          onChange={e => handleMerch(i, e)} placeholder="Deskripsi merchandise..."
                          rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                      </div>
                    </div>
                  ))}

                  <button onClick={tambahMerch} style={{
                    width: '100%', padding: '10px',
                    background: 'transparent', border: '1.5px dashed #A39680',
                    borderRadius: 8, fontSize: 13, color: '#A39680',
                    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20
                  }}>
                    + Tambah Merchandise
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setStep(1)} style={{
                      padding: '10px 28px', background: 'transparent',
                      color: '#4D403A', border: '1px solid #4D403A',
                      borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}>← Kembali</button>
                    <button onClick={() => setStep(3)} style={{
                      padding: '10px 28px', background: '#4D403A',
                      color: 'white', border: 'none', borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                    }}>Selanjutnya →</button>
                  </div>
                </div>
              )}

              {/* STEP 3: PEMBAYARAN */}
              {step === 3 && (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                    Informasi Pembayaran
                  </p>
                  <p style={{ fontSize: 12, color: '#A39680', marginBottom: 20, lineHeight: 1.6 }}>
                    Pilih metode pembayaran yang ingin kamu terima dari pembeli.
                  </p>

                  {/* PILIH METODE */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Metode Pembayaran <span style={{ color: '#C0392B' }}>*</span></label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[
                        { value: 'transfer', label: 'Transfer Bank' },
                        { value: 'qris', label: 'QRIS' },
                        { value: 'keduanya', label: 'Transfer + QRIS' },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => { setMetodeBayar(opt.value); setErrors({}) }}
                          style={{
                            flex: 1, padding: '10px',
                            borderRadius: 8, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                            background: metodeBayar === opt.value ? '#4D403A' : 'white',
                            color: metodeBayar === opt.value ? 'white' : '#4D403A',
                            border: metodeBayar === opt.value ? 'none' : '1px solid #e8e4dc',
                          }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FORM TRANSFER */}
                  {(metodeBayar === 'transfer' || metodeBayar === 'keduanya') && (
                    <div style={{
                      border: '1px solid #e8e4dc', borderRadius: 8,
                      padding: 16, marginBottom: 16
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#4D403A', marginBottom: 14 }}>
                        Rekening Transfer
                      </p>
                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Nama Bank <span style={{ color: '#C0392B' }}>*</span></label>
                        <input value={bayar.nama_bank}
                          onChange={e => { setBayar({ ...bayar, nama_bank: e.target.value }); if (errors.nama_bank) setErrors({ ...errors, nama_bank: '' }) }}
                          placeholder="cth: BCA"
                          style={errors.nama_bank ? inputErrorStyle : inputStyle} />
                        <ErrMsg field="nama_bank" />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Nomor Rekening <span style={{ color: '#C0392B' }}>*</span></label>
                        <input value={bayar.nomor_rekening}
                          onChange={e => { setBayar({ ...bayar, nomor_rekening: e.target.value }); if (errors.nomor_rekening) setErrors({ ...errors, nomor_rekening: '' }) }}
                          placeholder="cth: 1234567890"
                          style={errors.nomor_rekening ? inputErrorStyle : inputStyle} />
                        <ErrMsg field="nomor_rekening" />
                      </div>
                      <div>
                        <label style={labelStyle}>Nama Pemilik Rekening <span style={{ color: '#C0392B' }}>*</span></label>
                        <input value={bayar.nama_pemilik_rekening}
                          onChange={e => { setBayar({ ...bayar, nama_pemilik_rekening: e.target.value }); if (errors.nama_pemilik_rekening) setErrors({ ...errors, nama_pemilik_rekening: '' }) }}
                          placeholder="cth: Budi Santoso"
                          style={errors.nama_pemilik_rekening ? inputErrorStyle : inputStyle} />
                        <ErrMsg field="nama_pemilik_rekening" />
                      </div>
                    </div>
                  )}

                  {/* FORM QRIS */}
                  {(metodeBayar === 'qris' || metodeBayar === 'keduanya') && (
                    <div style={{
                      border: '1px solid #e8e4dc', borderRadius: 8,
                      padding: 16, marginBottom: 16
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#4D403A', marginBottom: 14 }}>
                        QRIS
                      </p>
                      <label style={labelStyle}>Upload Foto QRIS <span style={{ color: '#C0392B' }}>*</span></label>
                      <div style={{
                        border: `2px dashed ${errors.qris ? '#E57373' : '#e8e4dc'}`,
                        borderRadius: 8, padding: 20,
                        textAlign: 'center', cursor: 'pointer', background: '#FAFBF5'
                      }} onClick={() => document.getElementById('qris-input').click()}>
                        {qrisPreview ? (
                          <img src={qrisPreview} alt="qris preview"
                            style={{ maxHeight: 200, borderRadius: 8, objectFit: 'contain' }} />
                        ) : (
                          <div>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A39680" strokeWidth="1.5"
                              style={{ margin: '0 auto 8px', display: 'block' }}>
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <p style={{ fontSize: 12, color: '#A39680' }}>Klik untuk upload foto QRIS</p>
                            <p style={{ fontSize: 11, color: '#DFDACF', marginTop: 4 }}>JPG, PNG</p>
                          </div>
                        )}
                      </div>
                      <input id="qris-input" type="file" accept="image/*"
                        onChange={handleQrisFile} style={{ display: 'none' }} />
                      <ErrMsg field="qris" />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <button onClick={() => setStep(2)} style={{
                      padding: '10px 28px', background: 'transparent',
                      color: '#4D403A', border: '1px solid #4D403A',
                      borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}>← Kembali</button>
                    <button onClick={handleSubmit} disabled={loading} style={{
                      padding: '10px 28px',
                      background: loading ? '#A39680' : '#4D403A',
                      color: 'white', border: 'none', borderRadius: 8,
                      fontSize: 13, fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit'
                    }}>
                      {loading ? 'Mengupload...' : 'Upload Event'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpEvent