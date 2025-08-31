import React, { useEffect, useState } from 'react';

const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(password, salt) {
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toB64(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}

function fromB64(b64) {
  const str = atob(b64);
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
  return buf.buffer;
}

export default function TextEncrypt() {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.classList.add('hide-profile');
    return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
  }, []);

  async function handleEncrypt() {
    setError('');
    if (!input || !password) return setError('Enter text and a passphrase');
    setBusy(true);
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt.buffer);
      const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(input));
      const payload = {
        salt: toB64(salt.buffer),
        iv: toB64(iv.buffer),
        ct: toB64(ct),
      };
      setOutput(JSON.stringify(payload));
    } catch (e) {
      setError('Encryption failed');
    }
    setBusy(false);
  }

  return (
    <div className="content private">
      <div className="title"><span className="first-word">Text </span>Encryption</div>
      <div style={{ marginTop: 12, color: '#555' }}>Encrypt short text client-side with a passphrase (AES‑GCM). Keep the JSON payload and your passphrase to decrypt later.</div>

      <div style={{ marginTop: 14 }}>
        <label style={{ fontSize: 13 }}>Plain text</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} style={{ width: '100%', minHeight: 120, padding: 10, marginTop: 8 }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 13 }}>Passphrase</label>
        <div style={{ marginTop: 8 }}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #e6e9ee', borderRadius: 8 }} />
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={handleEncrypt} disabled={busy} style={{ padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 8 }}>{busy ? 'Encrypting...' : 'Encrypt'}</button>
        <button onClick={() => { setInput(''); setPassword(''); setOutput(''); setError(''); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff' }}>Clear</button>
      </div>

      {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}

      {output && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13 }}>Encrypted payload (save this + passphrase)</label>
          <textarea readOnly value={output} style={{ width: '100%', minHeight: 140, padding: 10, marginTop: 8 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={() => { navigator.clipboard?.writeText(output); }} style={{ padding: '8px 12px', borderRadius: 6, background: '#0b76ef', color: '#fff', border: 'none' }}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
}
