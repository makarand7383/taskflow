import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();
  const { user: me } = useAuth();

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!form.name) return alert('Project name required');
    try {
      const res = await api.post('/projects', form);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  return (
    <Layout>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid #2a2a38', background: '#111118', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Projects</h1>
        <button onClick={() => setShowModal(true)} style={{ padding: '9px 18px', background: '#6c63ff', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>+ New Project</button>
      </div>

      <div style={{ padding: 28, overflowY: 'auto' }}>
        {loading ? <p style={{ color: '#888' }}>Loading...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {projects.map((p) => (
              <div key={p._id} onClick={() => navigate(`/projects/${p._id}`)}
                style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: 22, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6c63ff'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a38'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(108,99,255,0.2)', color: '#6c63ff', fontWeight: 600 }}>
                    {p.admin._id === me?._id ? 'Admin' : 'Member'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 1.5 }}>{p.description || 'No description'}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{p.members.length} members</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 16, padding: 32, width: 480, maxWidth: '95vw' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>New Project</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>PROJECT NAME</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Website Redesign" style={{ width: '100%', padding: '11px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>DESCRIPTION</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" rows={3} style={{ width: '100%', padding: '11px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #2a2a38', borderRadius: 8, color: '#888', cursor: 'pointer' }}>Cancel</button>
              <button onClick={createProject} style={{ padding: '10px 20px', background: '#6c63ff', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Project</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}