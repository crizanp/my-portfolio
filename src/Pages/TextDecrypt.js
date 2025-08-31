import React, { useEffect, useState } from 'react';

const enc = new TextEncoder();
const dec = new TextDecoder();

function fromB64(b64) {
  const str = atob(b64);
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
  return buf.buffer;
}

async function deriveKey(password, salt) {
  const baseKey = await window.crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
  return window.crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, baseKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
}

export default function TextDecrypt() {
  const [payload, setPayload] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.classList.add('hide-profile');
    return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
  }, []);

  async function handleDecrypt() {
    setError('');
    if (!payload || !password) return setError('Provide payload JSON and passphrase');
    setBusy(true);
    try {
      const obj = JSON.parse(payload);
      const salt = fromB64(obj.salt);
      const iv = fromB64(obj.iv);
      const ct = fromB64(obj.ct);
      const key = await deriveKey(password, salt);
      const pt = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      setOutput(new TextDecoder().decode(pt));
    } catch (e) {
      setError('Decryption failed — check passphrase and payload');
    }
    setBusy(false);
  }

  return (
    <div className="content private">
      <div className="title"><span className="first-word">Text </span>Decryption</div>
      <div style={{ marginTop: 12, color: '#555' }}>Paste the encrypted JSON payload and your passphrase to recover the original text.</div>

      <div style={{ marginTop: 14 }}>
        <label style={{ fontSize: 13 }}>Encrypted payload (JSON)</label>
        <textarea value={payload} onChange={e => setPayload(e.target.value)} style={{ width: '100%', minHeight: 140, padding: 10, marginTop: 8 }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 13 }}>Passphrase</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 8 }} />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={handleDecrypt} disabled={busy} style={{ padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 8 }}>{busy ? 'Decrypting...' : 'Decrypt'}</button>
        <button onClick={() => { setPayload(''); setPassword(''); setOutput(''); setError(''); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff' }}>Clear</button>
      </div>

      {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}

      {output && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13 }}>Decrypted text</label>
          <textarea readOnly value={output} style={{ width: '100%', minHeight: 120, padding: 10, marginTop: 8 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={() => { navigator.clipboard?.writeText(output); }} style={{ padding: '8px 12px', borderRadius: 6, background: '#0b76ef', color: '#fff', border: 'none' }}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
}
