import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', status: 'todo', assigneeId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?projectId=${id}`),
      api.get('/users'),
    ]).then(([p, t, u]) => {
      setProject(p.data);
      setTasks(t.data);
      setUsers(u.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const isAdmin = project?.admin?._id === user?._id;
  const statusColor = { todo: '#888', inprogress: '#f7971e', done: '#43e97b' };
  const statusLabel = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
  const priorityColor = { high: '#ff6b6b', medium: '#f7971e', low: '#43e97b' };

  const createTask = async () => {
    if (!taskForm.title || !taskForm.dueDate) return alert('Title and due date required');
    try {
      const res = await api.post('/tasks', { ...taskForm, projectId: id });
      setTasks([...tasks, res.data]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', status: 'todo', assigneeId: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting task');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, { status });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const addMember = async (userId) => {
    try {
      const res = await api.post(`/projects/${id}/members`, { userId });
      setProject(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  if (loading) return <Layout><p style={{ padding: 28, color: '#888' }}>Loading...</p></Layout>;
  if (!project) return <Layout><p style={{ padding: 28, color: '#888' }}>Project not found</p></Layout>;

  const cols = ['todo', 'inprogress', 'done'];

  return (
    <Layout>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid #2a2a38', background: '#111118', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/projects')} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #2a2a38', borderRadius: 8, color: '#888', cursor: 'pointer' }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, flex: 1 }}>{project.name}</h1>
        {isAdmin && <button onClick={() => setShowTaskModal(true)} style={{ padding: '9px 18px', background: '#6c63ff', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>+ Add Task</button>}
      </div>

      <div style={{ padding: '0 28px', borderBottom: '1px solid #2a2a38', background: '#111118', display: 'flex', gap: 4, paddingTop: 12 }}>
        {['tasks', 'kanban', 'members'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 16px', border: 'none', borderBottom: tab === t ? '2px solid #6c63ff' : '2px solid transparent', background: 'transparent', color: tab === t ? '#6c63ff' : '#888', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: -1 }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.length === 0 ? <p style={{ color: '#555' }}>No tasks yet. {isAdmin && 'Click "+ Add Task" to create one.'}</p> :
              tasks.map((task) => (
                <div key={task._id} style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>{task.description}</div>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${statusColor[task.status]}22`, color: statusColor[task.status], fontWeight: 600 }}>{statusLabel[task.status]}</span>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${priorityColor[task.priority]}22`, color: priorityColor[task.priority], fontWeight: 600 }}>{task.priority}</span>
                      {task.assignee && <span style={{ fontSize: 11, color: '#888' }}>👤 {task.assignee.name}</span>}
                      <span style={{ fontSize: 11, color: '#555' }}>{new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select value={task.status} onChange={(e) => updateStatus(task._id, e.target.value)}
                      style={{ padding: '6px 10px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                      <option value="todo">To Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {isAdmin && <button onClick={() => deleteTask(task._id)} style={{ padding: '6px 12px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, color: '#ff6b6b', cursor: 'pointer', fontSize: 13 }}>🗑</button>}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* KANBAN TAB */}
        {tab === 'kanban' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {cols.map((status) => (
              <div key={status} style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: statusColor[status] }}>{statusLabel[status]}</span>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: '#1a1a24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888' }}>{tasks.filter((t) => t.status === status).length}</span>
                </div>
                {tasks.filter((t) => t.status === status).map((task) => (
                  <div key={task._id} style={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${priorityColor[task.priority]}22`, color: priorityColor[task.priority], fontWeight: 600 }}>{task.priority}</span>
                      {task.assignee && <span style={{ fontSize: 11, color: '#555' }}>👤 {task.assignee.name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* MEMBERS TAB */}
        {tab === 'members' && (
          <div>
            {isAdmin && (
              <div style={{ marginBottom: 16 }}>
                <select onChange={(e) => { if (e.target.value) addMember(e.target.value); e.target.value = ''; }}
                  style={{ padding: '9px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                  <option value="">+ Add Member...</option>
                  {users.filter((u) => !project.members.find((m) => m._id === u._id)).map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {project.members.map((member) => (
                <div key={member._id} style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6c63ff33', color: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {member.name?.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{member.name} {member._id === project.admin._id && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(108,99,255,0.2)', color: '#6c63ff', marginLeft: 6 }}>Admin</span>}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{member.email}</div>
                  </div>
                  {isAdmin && member._id !== project.admin._id && (
                    <button onClick={() => removeMember(member._id)} style={{ padding: '6px 12px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, color: '#ff6b6b', cursor: 'pointer', fontSize: 13 }}>Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 16, padding: 32, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>New Task</h2>
            {[
              { label: 'TITLE', key: 'title', placeholder: 'Task title', type: 'text' },
              { label: 'DESCRIPTION', key: 'description', placeholder: 'What needs to be done?', type: 'text' },
              { label: 'DUE DATE', key: 'dueDate', placeholder: '', type: 'date' },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>{field.label}</label>
                <input type={field.type} value={taskForm[field.key]} onChange={(e) => setTaskForm({ ...taskForm, [field.key]: e.target.value })}
                  placeholder={field.placeholder} style={{ width: '100%', padding: '11px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>PRIORITY</label>
                <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14 }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>ASSIGNEE</label>
                <select value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, color: '#fff', fontSize: 14 }}>
                  <option value="">Unassigned</option>
                  {project.members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowTaskModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #2a2a38', borderRadius: 8, color: '#888', cursor: 'pointer' }}>Cancel</button>
              <button onClick={createTask} style={{ padding: '10px 20px', background: '#6c63ff', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Task</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}