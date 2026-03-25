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

  const [namaOrg, setNamaOrg] = useState('')
  const [nik, setNik] = useState('')
  const [instansi, setInstansi] = useState('')
  const [emailOrg, setEmailOrg] = useState('')
  const [passwordOrg, setPasswordOrg] = useState('')

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

  const iconStyle = {
    position: 'absolute', left: 16,
    top: '50%', transform: 'translateY(-50%)',
    width: 15, height: 15,
    opacity: 1, pointerEvents: 'none', zIndex: 2
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
            <p style={{ color: '#ff9a9a', fontSize: 12, marginBottom: 10, textAlign: 'left' }}>
              {error}
            </p>
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
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                  </svg>
                  <input type="password" placeholder="password" value={password}
                    onChange={e => setPassword(e.target.value)} style={inputStyle} />
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
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                  </svg>
                  <input type="password" placeholder="password" value={passwordOrg}
                    onChange={e => setPasswordOrg(e.target.value)} style={inputStyle} />
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
              marginTop: 4
            }}>
              SIGN UP
            </button>
          </form>

          <div style={{ color: 'rgba(250,247,242,0.4)', fontSize: 12, margin: '16px 0', letterSpacing: 1 }}>or</div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{
              padding: '11px 24px',
              background: 'rgba(250,247,242,0.85)',
              backdropFilter: 'blur(8px)',
              color: '#4D403A', border: 'none',
              borderRadius: 50, fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              gap: 10, fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              sign up with google
            </button>
          </div>

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