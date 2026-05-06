import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Tasks', value: stats.total, color: '#6c63ff' },
    { label: 'In Progress', value: stats.inprogress, color: '#f7971e' },
    { label: 'Completed', value: stats.done, color: '#43e97b' },
    { label: 'Overdue', value: stats.overdue, color: '#ff6b6b' },
  ] : [];

  return (
    <Layout>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid #2a2a38', background: '#111118' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Dashboard</h1>
      </div>

      <div style={{ padding: 28, overflowY: 'auto' }}>
        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              {cards.map((card) => (
                <div key={card.label} style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: 22, borderTop: `3px solid ${card.color}` }}>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{card.label}</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Task Summary</h2>
              <div style={{ display: 'flex', gap: 24 }}>
                {[
                  { label: 'To Do', value: stats?.todo, color: '#888' },
                  { label: 'In Progress', value: stats?.inprogress, color: '#f7971e' },
                  { label: 'Done', value: stats?.done, color: '#43e97b' },
                  { label: 'Overdue', value: stats?.overdue, color: '#ff6b6b' },
                ].map((s) => (
                  <div key={s.label} style={{ flex: 1, background: '#1a1a24', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}