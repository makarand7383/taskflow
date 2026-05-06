import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/tasks', label: 'My Tasks' },
  ];

  const initials = (name) => name?.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#111118', borderRight: '1px solid #2a2a38', display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, padding: '0 8px 24px', borderBottom: '1px solid #2a2a38', marginBottom: 16 }}>
          Task<span style={{ color: '#6c63ff' }}>Flow</span>
        </div>

        {navItems.map((item) => (
          <div key={item.path} onClick={() => navigate(item.path)}
            style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 2, background: location.pathname === item.path ? 'rgba(108,99,255,0.15)' : 'transparent', color: location.pathname === item.path ? '#6c63ff' : '#888' }}>
            {item.label}
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #2a2a38', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6c63ff33', color: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
            {initials(user?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}>⏻</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
