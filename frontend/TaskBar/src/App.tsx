import { useState, useEffect } from 'react'
import './App.css'

// Empty string = relative URL, Vite proxy forwards /api/* → localhost:8080
const API = ''

type User = { userId: number; username: string; email: string; role: string }
type Task = {
  id?: number
  title: string
  description: string
  status: string
  priority: string
  assignedUserId: number | null
  assignedUsername: string
  dueDate: string
}

const emptyTask: Task = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assignedUserId: null,
  assignedUsername: '',
  dueDate: '',
}

export default function App() {
  const [page, setPage] = useState<'login' | 'register' | 'dashboard'>('login')
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form, setForm] = useState(emptyTask)
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    if (page === 'dashboard') fetchTasks()
  }, [page])

  async function fetchTasks() {
    try {
      const res = await fetch(`${API}/api/tasks`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setTasks(data)
    } catch (err: any) {
      console.error('Fetch tasks failed:', err)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authForm.username, password: authForm.password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data)
        setPage('dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err: any) {
      setError('Cannot connect to server. Make sure all services are running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data)
        setPage('dashboard')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err: any) {
      setError('Cannot connect to server. Make sure all services are running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveTask(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingTask?.id) {
        await fetch(`${API}/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        await fetch(`${API}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, assignedUserId: user?.userId, assignedUsername: user?.username }),
        })
      }
      setShowForm(false)
      setEditingTask(null)
      setForm(emptyTask)
      fetchTasks()
    } catch (err) {
      console.error('Save task failed:', err)
    }
  }

  async function handleDeleteTask(id: number) {
    try {
      await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE' })
      fetchTasks()
    } catch (err) {
      console.error('Delete task failed:', err)
    }
  }

  async function handleStatusChange(task: Task, newStatus: string) {
    try {
      await fetch(`${API}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus }),
      })
      fetchTasks()
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setForm({ ...task, dueDate: task.dueDate || '' })
    setShowForm(true)
  }

  function openNew() {
    setEditingTask(null)
    setForm(emptyTask)
    setShowForm(true)
  }

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)

  const statusColors: Record<string, string> = {
    TODO: '#6c757d',
    IN_PROGRESS: '#0d6efd',
    DONE: '#198754',
  }
  const priorityColors: Record<string, string> = {
    LOW: '#198754',
    MEDIUM: '#fd7e14',
    HIGH: '#dc3545',
  }

  // ── LOGIN PAGE ──
  if (page === 'login') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="brand">TaskBar</h1>
          <p className="brand-sub">Project Task Management</p>
          <form onSubmit={handleLogin}>
            <input
              placeholder="Username"
              autoComplete="username"
              value={authForm.username}
              onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={authForm.password}
              onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="switch-link">
            No account?{' '}
            <span onClick={() => { setPage('register'); setError('') }}>Register</span>
          </p>
        </div>
      </div>
    )
  }

  // ── REGISTER PAGE ──
  if (page === 'register') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="brand">TaskBar</h1>
          <p className="brand-sub">Create an Account</p>
          <form onSubmit={handleRegister}>
            <input
              placeholder="Username"
              autoComplete="username"
              value={authForm.username}
              onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={authForm.email}
              onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={authForm.password}
              onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="switch-link">
            Have an account?{' '}
            <span onClick={() => { setPage('login'); setError('') }}>Login</span>
          </p>
        </div>
      </div>
    )
  }

  // ── DASHBOARD ──
  return (
    <div className="dashboard">
      <header className="topbar">
        <span className="brand">TaskBar</span>
        <div className="topbar-right">
          <span className="user-badge">{user?.username} ({user?.role})</span>
          <button className="btn-logout" onClick={() => { setUser(null); setPage('login') }}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="toolbar">
          <div className="filters">
            {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(s => (
              <button
                key={s}
                className={`filter-btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={openNew}>+ New Task</button>
        </div>

        <div className="task-grid">
          {filtered.length === 0 && (
            <div className="empty-state">No tasks found. Click "+ New Task" to create one!</div>
          )}
          {filtered.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-card-header">
                <span className="task-title">{task.title}</span>
                <span className="priority-badge" style={{ background: priorityColors[task.priority] }}>
                  {task.priority}
                </span>
              </div>
              <p className="task-desc">{task.description}</p>
              <div className="task-meta">
                {task.assignedUsername && <span className="meta-item">👤 {task.assignedUsername}</span>}
                {task.dueDate && <span className="meta-item">📅 {task.dueDate}</span>}
              </div>
              <div className="task-footer">
                <select
                  className="status-select"
                  value={task.status}
                  style={{ borderColor: statusColors[task.status], color: statusColors[task.status] }}
                  onChange={e => handleStatusChange(task, e.target.value)}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
                <div className="task-actions">
                  <button className="btn-edit" onClick={() => openEdit(task)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDeleteTask(task.id!)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingTask?.id ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSaveTask}>
              <label>Title</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />

              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
              />

              <div className="form-row">
                <div>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
                <div>
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <label>Assigned To (Username)</label>
              <input
                value={form.assignedUsername}
                onChange={e => setForm({ ...form, assignedUsername: e.target.value })}
              />

              <label>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
