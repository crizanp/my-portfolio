import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// helpers mirrored from FileEncryption
async function deriveKey(pass, salt) {
  const enc = new TextEncoder();
  const passKey = await window.crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export default function FileDecryption() {
  const [file, setFile] = useState(null);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const lastPass = sessionStorage.getItem('lastFilePass') || '';
    if (lastPass) setPass(lastPass);
    const lastAction = sessionStorage.getItem('lastAction');
    if (lastAction === 'encrypted') {
      setSuccess('File encrypted and downloaded — upload it here to decrypt.');
      sessionStorage.removeItem('lastAction');
    }
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.classList.add('hide-profile');
    return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
  }, []);

  function handleFileChange(e) {
    setFile(e.target.files?.[0] || null);
    setError('');
  }

  async function handleDecrypt() {
    setError('');
    if (!file) return setError('Choose an encrypted .enc file');
    if (!pass) return setError('Enter the passphrase');
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const dv = new DataView(buf);
      // check header
      const header = new TextDecoder().decode(new Uint8Array(buf, 0, 8));
      if (header !== 'ENCFILE1') throw new Error('Invalid file format');
      let offset = 8;
      const salt = new Uint8Array(buf.slice(offset, offset + 16)); offset += 16;
      const iv = new Uint8Array(buf.slice(offset, offset + 12)); offset += 12;
      const nameLen = dv.getUint32(offset, false); offset += 4;
      const nameBytes = new Uint8Array(buf.slice(offset, offset + nameLen)); offset += nameLen;
      const filename = new TextDecoder().decode(nameBytes);
      const ciphertext = buf.slice(offset);

      const key = await deriveKey(pass, salt);
      const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

      const blob = new Blob([plain]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
  setSuccess('File decrypted and downloaded successfully.');
    } catch (e) {
      console.error(e);
      setError('Decryption failed: ' + (e.message || ''));
    } finally { setBusy(false); }
  }
  function handleDecryptNavigate() {
    try {
      navigate('/tools/file-secure/file-encryption');
    } catch (e) { console.error(e); setError('Unable to open encryption page'); }
  }

  return (
    <div className="card-inner">
      <div className="card-wrap">
        <div className="content private">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="title"><span className="first-word">File </span>Decryption</div>
              <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ color: '#555' }}>Select the encrypted file and enter a passphrase to restore your original file.</div>
              </div>
            </div>
            <div>
              <button onClick={handleDecryptNavigate} style={{ padding: '8px 12px', background: '#0b76ef', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600 }}>Encrypt</button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label>Encrypted File</label>
            <div style={{ marginTop: 8 }}>
              <input type="file" accept=".enc" onChange={handleFileChange} />
              <div style={{ marginTop: 8, color: '#666' }}>{file ? file.name : 'No file selected'}</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Passphrase</label>
            <div style={{ marginTop: 8 }}>
              <input value={pass} type="password" onChange={e => setPass(e.target.value)} style={{ width: '100%', padding: 12, fontSize: 16, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={handleDecrypt} disabled={busy} style={{ padding: '10px 14px', background: '#0b76ef', color: '#fff', border: 'none', borderRadius: 8 }}>Decrypt & Download</button>
            <button onClick={() => { setFile(null); setPass(''); setError(''); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}>Clear</button>
          </div>

          {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}

        </div>
      </div>
    </div>
  );
}
