import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function Private() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const styles = {
    // keep a few inline helpers for form controls only;
    formRow: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 },
    input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ee', fontSize: 14, outline: 'none' },
    btn: { padding: '10px 14px', borderRadius: 8, border: 'none', background: '#0b76ef', color: '#fff', cursor: 'pointer' },
    btnDisabled: { background: '#9cc9ff', cursor: 'default' },
    errorBox: { background: '#fff3f3', color: '#8a0f0f', padding: 12, borderRadius: 8, marginBottom: 12, border: '1px solid #f5c6cb' },
    infoBox: { background: '#f0fbff', color: '#053a57', padding: 12, borderRadius: 8, marginBottom: 12, border: '1px solid #d7f0ff' },
    list: { marginTop: 14, paddingLeft: 18 },
    logout: { marginLeft: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }
  };

  async function fetchItems(currentToken) {
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/private`, { headers: { Authorization: `Bearer ${currentToken}` } });
      if (!res.ok) {
        if (res.status === 401) {
          // clear invalid token and show login
          localStorage.removeItem('token');
          setToken(null);
          setItems(null);
          setErr('Session expired or invalid token — please log in again.');
          setLoading(false);
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error((data && data.message) || 'Failed to fetch private items');
      }
      const data = await res.json();
      setItems(data.items);
    } catch (e) {
      setErr(e.message || 'Unexpected error');
    }
    setLoading(false);
  }

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) fetchItems(stored);
  }, []);

  async function submitLogin(e) {
    e.preventDefault();
    setLoginError('');
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUsername(''); setPassword('');
      await fetchItems(data.token);
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    }
    setLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setItems(null);
    setErr('');
  }

  // CRUD helpers
  async function createItem(body) {
    const res = await fetch(`${API_BASE}/api/auth/private`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Create failed');
    return res.json().then(r => r.item);
  }

  async function updateItem(id, body) {
    const res = await fetch(`${API_BASE}/api/auth/private/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Update failed');
    return res.json().then(r => r.item);
  }

  async function deleteItem(id) {
    const res = await fetch(`${API_BASE}/api/auth/private/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  }

  // UI state for CRUD
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ type: 'password', title: '', content: '', url: '' });
  const [editingId, setEditingId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  // when authenticated, hide left profile to give full content area
  useEffect(() => {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;
    if (token) {
      appRoot.classList.add('hide-profile');
    } else {
      appRoot.classList.remove('hide-profile');
    }
    return () => appRoot.classList.remove('hide-profile');
  }, [token]);

  // category filter
  const categories = ['all','password','base64','note','photo','doc','file','imp-photo'];
  const [selectedCategory, setSelectedCategory] = useState('all');
  const gridRef = React.useRef(null);

  return (
    <div className="card-inner">
      <div className="card-wrap">
        <div className="content private">
          <div className="title"><span className="first-word">Private </span>Area</div>

          {err && <div role="alert" style={styles.errorBox}>{err}</div>}
          {loginError && <div role="alert" style={styles.errorBox}>{loginError}</div>}

          {!token && (
            <div>
              <div style={styles.infoBox}>This section is private. Enter your credentials to continue.</div>
              <form onSubmit={submitLogin}>
                <div style={styles.formRow}>
                  <label>Username</label>
                  <input style={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
                </div>
                <div style={styles.formRow}>
                  <label>Password</label>
                  <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
                </div>
              </form>
            </div>
          )}

          {token && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ fontSize: 14, color: '#444' }}>You are authenticated.</div>
                <div>
                  <button onClick={handleLogout} style={styles.logout}>Logout</button>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => { setShowNew(s => !s); setEditingId(null); setForm({ type: 'password', title: '', content: '', url: '' }); }} style={{ ...styles.btn }}>{showNew ? 'Close' : 'New Item'}</button>
              </div>

              {showNew && (
                <div style={{ marginTop: 12, padding: 12, background: '#f4ecff', borderRadius: 8 }}>
                  <div style={{ marginBottom: 8 }}>
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%', padding: 8, marginTop: 4 }}>{['password','base64','note','photo','doc','file','imp-photo'].map(t => <option key={t} value={t}>{t}</option>)}</select>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label>Title</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: 8, marginTop: 4 }} />
                  </div>
                  {['password','base64','note'].includes(form.type) ? (
                    <div style={{ marginBottom: 8 }}>
                      <label>Content</label>
                      <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ width: '100%', padding: 8, marginTop: 4 }} />
                    </div>
                  ) : (
                    <div style={{ marginBottom: 8 }}>
                      <label>URL</label>
                      <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={{ width: '100%', padding: 8, marginTop: 4 }} placeholder="/assets/your-file.jpg or https://..." />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={async () => {
                      try {
                        setLoading(true);
                        if (editingId) {
                          const updated = await updateItem(editingId, form);
                          setItems(it => it.map(i => i._id === updated._id ? updated : i));
                          setEditingId(null);
                        } else {
                          const created = await createItem(form);
                          setItems(it => [created, ...(it||[])]);
                        }
                        setShowNew(false);
                      } catch (e) { setErr(e.message); }
                      setLoading(false);
                    }} style={{ ...styles.btn }}>{editingId ? 'Save' : 'Create'}</button>
                    <button onClick={() => { setShowNew(false); setEditingId(null); }} style={{ ...styles.logout }}>Cancel</button>
                  </div>
                </div>
              )}

              {loading && <div style={{ marginTop: 12 }}>Loading private items...</div>}
              {/* category buttons */}
              <div className="category-row">
                {categories.map(c => (
                  <button key={c} onClick={() => setSelectedCategory(c)} style={{ padding: '10px 12px', borderRadius: 6, border: selectedCategory === c ? '1px solid #0b76ef' : '1px solid #ddd', background: selectedCategory === c ? '#eaf3ff' : '#fff' }}>{c === 'all' ? 'All' : c}</button>
                ))}
              </div>

              {items && (
                <div ref={gridRef} className="private-grid">
                  {items.filter(it => selectedCategory === 'all' ? true : it.type === selectedCategory).map((it, i) => (
                    <div key={it._id || i} onClick={() => setDetailItem(it)} style={{ borderRadius: 8, padding: 12, background: '#f4ecff', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', right: 8, top: 8, display: 'flex', gap: 6 }}>
                        <button onClick={(e) => { e.stopPropagation();
                          setEditingId(it._id);
                          setShowNew(true);
                          setForm({ type: it.type, title: it.title, content: it.content || '', url: it.url || '' });
                        }} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff' }}>Edit</button>
                        <button onClick={async (e) => { e.stopPropagation();
                          if (!window.confirm('Delete this item?')) return;
                          try {
                            setLoading(true);
                            await deleteItem(it._id);
                            setItems(prev => prev.filter(p => p._id !== it._id));
                          } catch (e) { setErr(e.message); }
                          setLoading(false);
                        }} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #f5c6cb', background: '#fff', color: '#8a0f0f' }}>Delete</button>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{it.title}</div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>{it.type.toUpperCase()}</div>
                      {it.url ? (
                        <a href={it.url} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ color: '#0b76ef' }}>Open</a>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fafafa', padding: 8, borderRadius: 6 }}>
                          {it.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* detail modal */}
              {detailItem && (
                <div role="dialog" onClick={() => setDetailItem(null)} style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div onClick={e => e.stopPropagation()} style={{ background: '#f9f5ff', padding: 20, borderRadius: 8, maxWidth: 720, width: '90%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>{detailItem.title}</h3>
                      <button onClick={() => setDetailItem(null)} style={{ ...styles.logout }}>Close</button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, color: '#666' }}>{detailItem.type}</div>
                      {detailItem.url ? (
                        <div style={{ marginTop: 12 }}><a href={detailItem.url} target="_blank" rel="noreferrer">Open link</a></div>
                      ) : (
                        <pre style={{ background: '#f7f7f7', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{detailItem.content}</pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
