import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'

function SignUp() {
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // ✅ State Mata Customer

  const [namaOrg, setNamaOrg] = useState('')
  const [nik, setNik] = useState('')
  const [instansi, setInstansi] = useState('')
  const [emailOrg, setEmailOrg] = useState('')
  const [passwordOrg, setPasswordOrg] = useState('')
  const [showPasswordOrg, setShowPasswordOrg] = useState(false) // ✅ State Mata Organizer

  async function cekForm(e) {
    e.preventDefault()

    if (role === 'customer') {
      if (!nama || !email || !password) {
        setError('semua field wajib diisi!')
        return
      }
      if (password.length < 8) {
        setError('password minimal 8 karakter!')
        return
      }

      const { error: dbError } = await supabase
        .from('pengguna')
        .insert({
          nama_pengguna: nama,
          email_pengguna: email,
          password: password,
          role_pengguna: 'buyer'
        })

      if (dbError) {
        setError('gagal daftar: ' + dbError.message)
        return
      }

    } else {
      if (!namaOrg || !nik || !instansi || !emailOrg || !passwordOrg) {
        setError('semua field wajib diisi!')
        return
      }
      if (passwordOrg.length < 8) {
        setError('password minimal 8 karakter!')
        return
      }

      const { data: penggunaData, error: penggunaError } = await supabase
        .from('pengguna')
        .insert({
          nama_pengguna: namaOrg,
          email_pengguna: emailOrg,
          password: passwordOrg,
          role_pengguna: 'organizer'
        })
        .select()
        .single()

      if (penggunaError) {
        setError('gagal daftar: ' + penggunaError.message)
        return
      }

      const { error: orgError } = await supabase
        .from('penyelenggara')
        .insert({
          id_pengguna: penggunaData.id_pengguna,
          nik_penyelenggara: nik,
          instansi_penyelenggara: instansi,
          status: 'pending'
        })

      if (orgError) {
        setError('gagal daftar: ' + orgError.message)
        return
      }
    }

    setError('')
    alert('daftar berhasil! silakan login')
    navigate('/signin')
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px 13px 44px',
    borderRadius: 10, border: 'none',
    background: 'rgba(77,64,58,0.45)',
    backdropFilter: 'blur(8px)',
    color: 'white', fontSize: 14, outline: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    WebkitTextFillColor: 'white',
    WebkitBoxShadow: '0 0 0px 1000px rgba(77,64,58,0.45) inset',
  }

  // Khusus untuk input password agar teks tidak menabrak ikon mata di kanan
  const inputPasswordStyle = {
    ...inputStyle,
    padding: '13px 48px 13px 44px',
  }

  const iconStyle = {
    position: 'absolute', left: 16,
    top: '50%', transform: 'translateY(-50%)',
    width: 15, height: 15,
    opacity: 1, pointerEvents: 'none', zIndex: 2
  }

  const toggleEyeStyle = {
    position: 'absolute', right: 16,
    top: '50%', transform: 'translateY(-50%)',
    cursor: 'pointer', zIndex: 3,
    display: 'flex', alignItems: 'center'
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/balaipemuda.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 40
    }}>

      {/* NAVBAR */}
      <div style={{
        background: 'white',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'relative',
        zIndex: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <img src="/logo.jpg" alt="logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
          SURABAYA <span style={{ fontWeight: 400, color: '#555' }}>ART</span>
        </div>
      </div>

      {/* OVERLAY */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(38,38,38,0.5)',
        zIndex: 0, top: 56
      }} />

      {/* FORM */}
      <div style={{
        flex: 1, display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', zIndex: 1,
        padding: '40px 20px'
      }}>
        <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>

          <h2 style={{
            color: 'white', fontSize: 36,
            fontWeight: 800, letterSpacing: 8,
            marginBottom: 16,
            textShadow: '0 4px 24px rgba(0,0,0,0.4)'
          }}>SIGN UP</h2>

          {/* TOGGLE */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <button type="button" onClick={() => setRole('customer')} style={{
              padding: '6px 18px', borderRadius: 50,
              border: role === 'customer' ? '1.5px solid white' : '1.5px solid rgba(255,255,255,0.3)',
              background: role === 'customer' ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: role === 'customer' ? 'white' : 'rgba(255,255,255,0.5)',
              fontSize: 11, fontWeight: 600, letterSpacing: 1,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>AS CUSTOMER</button>
            <button type="button" onClick={() => setRole('organizer')} style={{
              padding: '6px 18px', borderRadius: 50,
              border: role === 'organizer' ? '1.5px solid white' : '1.5px solid rgba(255,255,255,0.3)',
              background: role === 'organizer' ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: role === 'organizer' ? 'white' : 'rgba(255,255,255,0.5)',
              fontSize: 11, fontWeight: 600, letterSpacing: 1,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>AS ORGANIZER</button>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, background: 'rgba(231, 76, 60, 0.18)',
              border: '1.5px solid #e74c3c', borderRadius: 10,
              padding: '10px 14px', marginBottom: 10,
              boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.12)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color: '#ff6b6b', fontSize: 14, fontWeight: 700 }}>{error}</span>
            </div>
          )}

          <form onSubmit={cekForm}>
            {role === 'customer' && (
              <div>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  <input type="text" placeholder="name" value={nama}
                    onChange={e => setNama(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                  <input type="email" placeholder="email" value={email}
                    onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                
                {/* PASSWORD CUSTOMER */}
                <div style={{ position: 'relative', marginBottom: 28 }}>
                  <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                  </svg>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                    style={inputPasswordStyle} 
                  />
                  {/* TOMBOL ANIMASI MATA */}
                  <div onClick={() => setShowPassword(!showPassword)} style={toggleEyeStyle}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )}

            {role === 'organizer' && (
              <div>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  <input type="text" placeholder="name" value={namaOrg}
                    onChange={e => setNamaOrg(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="16" rx="2"/>
                      <line x1="7" y1="9" x2="17" y2="9"/>
                      <line x1="7" y1="13" x2="13" y2="13"/>
                    </svg>
                    <input type="text" placeholder="NIK" value={nik}
                      onChange={e => setNik(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    </svg>
                    <input type="text" placeholder="instansi" value={instansi}
                      onChange={e => setInstansi(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                  <input type="email" placeholder="email" value={emailOrg}
                    onChange={e => setEmailOrg(e.target.value)} style={inputStyle} />
                </div>

                {/* PASSWORD ORGANIZER */}
                <div style={{ position: 'relative', marginBottom: 28 }}>
                  <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                  </svg>
                  <input 
                    type={showPasswordOrg ? 'text' : 'password'} 
                    placeholder="password" 
                    value={passwordOrg}
                    onChange={e => setPasswordOrg(e.target.value)} 
                    style={inputPasswordStyle} 
                  />
                  {/* TOMBOL ANIMASI MATA */}
                  <div onClick={() => setShowPasswordOrg(!showPasswordOrg)} style={toggleEyeStyle}>
                    {showPasswordOrg ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" style={{
              padding: '13px 48px',
              background: 'rgba(77,64,58,0.7)',
              backdropFilter: 'blur(8px)',
              color: 'white', border: 'none',
              borderRadius: 50, fontSize: 12,
              fontWeight: 700, letterSpacing: 3,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              SIGN UP
            </button>
          </form>

          <a href="/signin" style={{
            display: 'block', color: 'rgba(250,247,242,0.5)',
            fontSize: 12, textDecoration: 'none',
            marginTop: 22, letterSpacing: 0.5
          }}>
            Sudah punya akun? Masuk di sini
          </a>

        </div>
      </div>
    </div>
  )
}

export default SignUp