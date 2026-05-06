import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 16, padding: '40px 36px', width: 400, maxWidth: '95vw' }}>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Task<span style={{ color: '#6c63ff' }}>Flow</span></h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 28 }}>Team Task Management</p>

        <div style={{ display: 'flex', background: '#1a1a24', borderRadius: 8, padding: 4, marginBottom: 24 }}>
          {['login', 'signup'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14, background: tab === t ? '#6c63ff' : 'transparent', color: tab === t ? '#fff' : '#888' }}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {tab === 'signup' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>FULL NAME</label>
            <input value={form.name} onChange={set('name')} placeholder="Arjun Sharma" style={{ width: '100%', padding: '11px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>EMAIL</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" style={{ width: '100%', padding: '11px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>PASSWORD</label>
          <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" style={{ width: '100%', padding: '11px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '12px', background: '#6c63ff', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {loading ? 'Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>
      </div>
    </div>
  );
}