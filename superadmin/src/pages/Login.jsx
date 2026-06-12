import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import DinewayLogo from '../components/DinewayLogo';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.data.user.role !== 'super_admin') {
        toast.error('Access denied. Super admin only.');
        return;
      }
      login(data.data.user, data.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#1a1a2e' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <DinewayLogo size={90} />
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#C9A84C', letterSpacing: 4 }}>DINEWAY</div>
          <div style={{ fontSize: 11, color: 'rgba(201,168,76,0.65)', letterSpacing: 3, marginTop: 4 }}>GLOBAL ADMIN</div>
        </div>
        <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', maxWidth: 260, lineHeight: 1.7 }}>
          The all-in-one platform to manage restaurants, hotels, and hospitality operations.
        </p>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#f5f5f5' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: '#718096', marginBottom: 28 }}>Sign in to your super admin account</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', background: loading ? '#d4a843' : '#C9A84C',
              color: '#fff', fontWeight: 700, fontSize: 14, border: 'none',
              borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', color: '#1a1a2e', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 };
