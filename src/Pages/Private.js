import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function Private() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');

  useEffect(()=>{
    async function load(){
      const token = localStorage.getItem('token');
      if (!token) { setErr('Not authenticated'); return; }
      try {
        const res = await fetch(`${API_BASE}/api/auth/private`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed');
        setItems(data.items);
      } catch (e) { setErr(e.message); }
    }
    load();
  },[]);

  return (
    <div style={{padding:20}}>
      <h2>Private Area</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      {!err && !items && <div>Loading...</div>}
      {items && (
        <ul>
          {items.map((it, i)=>(
            <li key={i}>{it.type}: {it.title} {it.content ? `- ${it.content}` : ''}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
