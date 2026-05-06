import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/tasks')
      .then((res) => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, { status });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const priorityColor = { high: '#ff6b6b', medium: '#f7971e', low: '#43e97b' };
  const statusColor = { todo: '#888', inprogress: '#f7971e', done: '#43e97b' };
  const statusLabel = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

  return (
    <Layout>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid #2a2a38', background: '#111118' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>My Tasks</h1>
      </div>

      <div style={{ padding: 28, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'todo', 'inprogress', 'done'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid', borderColor: filter === f ? '#6c63ff' : '#2a2a38', background: filter === f ? '#6c63ff' : 'transparent', color: filter === f ? '#fff' : '#888', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {f === 'all' ? 'All' : statusLabel[f]}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: '#888' }}>Loading...</p> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#888' }}>No tasks here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((task) => (
              <div key={task._id} style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#555' : '#fff' }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>{task.description}</div>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${statusColor[task.status]}22`, color: statusColor[task.status], fontWeight: 600 }}>{statusLabel[task.status]}</span>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${priorityColor[task.priority]}22`, color: priorityColor[task.priority], fontWeight: 600 }}>{task.priority}</span>
                      {task.project && <span style={{ fontSize: 11, color: '#555', background: '#1a1a24', padding: '3px 8px', borderRadius: 4 }}>{task.project.name}</span>}
                      <span style={{ fontSize: 11, color: '#555' }}>{new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <select value={task.status} onChange={(e) => updateStatus(task._id, e.target.value)}
                    style={{ padding: '6px 10px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', marginLeft: 12 }}>
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}