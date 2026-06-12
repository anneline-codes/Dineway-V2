import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { EyeOff, Eye } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

/* ── Food photo & logo from public folder ── */
const FOOD_URL = '/food.png';
const LOGO_URL = '/logo.png';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const { login }  = useAuthStore();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      const user = data.data.user;
      if (!['restaurant_admin', 'restaurant_manager', 'admin'].includes(user.role)) {
        toast.error('Access denied. Restaurant admin only.');
        return;
      }
      login(user, data.data.accessToken);
      navigate('/overview');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
      margin: 0, padding: 0,
    }}>

      {/* ── LEFT: full dark food photo with logo overlay ── */}
      <div style={{
        flex: '0 0 48%',
        position: 'relative',
        overflow: 'hidden',
        background: '#0a0a0a',
      }}>
        {/* Food photo */}
        <img
          src={FOOD_URL}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.82,
          }}
        />

        {/* Logo image centered on top of photo */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start',
          paddingTop: 36,
        }}>
          <img
            src={LOGO_URL}
            alt="Dineway"
            style={{
              width: 200,
              objectFit: 'contain',
              display: 'block',
              mixBlendMode: 'lighten',
            }}
          />
        </div>
      </div>

      {/* ── RIGHT: light gray panel ── */}
      <div style={{
        flex: 1,
        background: '#e8e5e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
      }}>

        {/* Card — same bg as panel, gold border, subtle drop-shadow on right+bottom */}
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: '#e8e5e0',
          border: '1.5px solid #C9A84C',
          borderRadius: 2,
          padding: '52px 44px 40px',
          boxShadow: '6px 8px 0px 0px rgba(0,0,0,0.12)',
          position: 'relative',
        }}>

          {/* WELCOME BACK */}
          <h1 style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 20,
            color: '#1a1a1a',
            letterSpacing: '0.22em',
            margin: '0 0 14px',
            textTransform: 'uppercase',
          }}>
            Welcome back
          </h1>

          {/* Login to DINEWAY */}
          <p style={{
            textAlign: 'center',
            margin: '0 0 6px',
            fontSize: 14,
            color: '#444',
            fontWeight: 400,
          }}>
            Login to{' '}
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1a1a1a', fontSize: 15 }}>
              DINEWAY
            </span>
          </p>

          {/* subtitle */}
          <p style={{
            textAlign: 'center',
            margin: '0 0 36px',
            fontSize: 13,
            color: '#888',
            fontWeight: 400,
          }}>
            Enter your email and password
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* EMAIL */}
            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>EMAIL</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inp}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e  => e.target.style.borderColor = '#1a1a1a'}
              />
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: 28 }}>
              <label style={lbl}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ ...inp, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e  => e.target.style.borderColor = '#1a1a1a'}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 13,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center',
                    color: '#777',
                  }}
                >
                  {showPass
                    ? <Eye size={17} />
                    : <EyeOff size={17} />}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#a8883a' : '#b5973a',
                border: 'none',
                borderRadius: 3,
                padding: '14px 0',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '0.06em',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#c9a84c'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#b5973a'; }}
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          {/* Forgot password */}
          <p style={{
            textAlign: 'center',
            marginTop: 28,
            fontSize: 12,
            color: '#888',
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}>
            Forgot &nbsp; password?
          </p>

        </div>
      </div>
    </div>
  );
}

/* ── shared styles ── */
const lbl = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#555',
  letterSpacing: '0.1em',
  marginBottom: 8,
};

const inp = {
  width: '100%',
  background: '#fff',
  border: '1.5px solid #ccc',
  borderRadius: 3,
  padding: '12px 14px',
  color: '#1a1a1a',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};
