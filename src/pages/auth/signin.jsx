import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false) // ✅ State Mata
  const navigate = useNavigate()

  async function cekForm(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('semua field wajib diisi!')
      return
    }

    const { data, error: dbError } = await supabase
      .from('pengguna')
      .select('*')
      .eq('email_pengguna', email)
      .eq('password', password)
      .single()

    if (dbError || !data) {
      setError('email atau password salah!')
      return
    }

    localStorage.setItem('user', JSON.stringify(data))

    if (data.role_pengguna === 'buyer') {
      navigate('/home')
    } else if (data.role_pengguna === 'organizer') {
      navigate('/organizer/dashboard')
    } else if (data.role_pengguna === 'admin') {
      navigate('/admin/dashboard')
    }
  }

  const inputStyle = {
    width: '100%', 
    padding: '14px 16px 14px 44px', 
    borderRadius: 10, border: 'none',
    background: 'rgba(77,64,58,0.45)',
    backdropFilter: 'blur(8px)',
    color: 'white', fontSize: 14, outline: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    WebkitTextFillColor: 'white',
    WebkitBoxShadow: '0 0 0px 1000px rgba(77,64,58,0.45) inset',
  }

  // ✅ Khusus input password agar teks tidak menabrak ikon mata di kanan
  const inputPasswordStyle = {
    ...inputStyle,
    padding: '14px 48px 14px 44px',
  }

  const iconStyle = {
    position: 'absolute', left: 16,
    top: '50%', transform: 'translateY(-50%)',
    width: 16, height: 16,
    opacity: 1, pointerEvents: 'none',
    zIndex: 2
  }

  // ✅ Style pemosisian tombol mata interaktif
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

      {/* NAVBAR PUTIH */}
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
        <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>

          <h2 style={{
            color: 'white', fontSize: 36,
            fontWeight: 800, letterSpacing: 8,
            marginBottom: 32,
            textShadow: '0 4px 24px rgba(0,0,0,0.4)'
          }}>SIGN IN</h2>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, background: 'rgba(231, 76, 60, 0.18)',
              border: '1.5px solid #e74c3c', borderRadius: 10,
              padding: '10px 14px', marginBottom: 10,
              boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.12)',
            }}>
              <span style={{ color: '#ff6b6b', fontSize: 14, fontWeight: 700 }}>{error}</span>
            </div>
          )}

          <form onSubmit={cekForm}>
            {/* EMAIL */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <polyline points="2,4 12,13 22,4"/>
              </svg>
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* PASSWORD */}
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

              {/* ✅ TOMBOL ANIMASI MATA (SAMA SEPERTI SIGNUP) */}
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
              SIGN IN
            </button>
          </form>

          <a href="/signup" style={{
            display: 'block', color: 'rgba(250,247,242,0.5)',
            fontSize: 12, textDecoration: 'none',
            marginTop: 22, letterSpacing: 0.5
          }}>
            Belum punya akun? Daftar di sini
          </a>

        </div>
      </div>
    </div>
  )
}

export default SignIn