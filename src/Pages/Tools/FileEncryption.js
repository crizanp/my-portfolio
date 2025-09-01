import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Binary format for encrypted file:
// ["ENCFILE1" (8 bytes)] [salt (16 bytes)] [iv (12 bytes)] [filenameLength (4 bytes BE)] [filename (utf-8)] [ciphertext (rest)]

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

function concatBuffers(buffers) {
  const total = buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    out.set(new Uint8Array(b), offset);
    offset += b.byteLength;
  }
  return out.buffer;
}

export default function FileEncryption(){
  const [file, setFile] = useState(null);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const appRoot = document.getElementById('app-root');
    if(appRoot) appRoot.classList.add('hide-profile');
    return ()=>{ if(appRoot) appRoot.classList.remove('hide-profile'); };
  },[]);

  function handleFileChange(e){
    const f = e.target.files?.[0] || null;
    setFile(f);
    setError('');
  }

  async function handleEncrypt(){
    setError('');
    if(!file) return setError('Choose a file to encrypt');
    if(!pass) return setError('Enter a passphrase');
    setBusy(true);
    try{
      const fileBuf = await file.arrayBuffer();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(pass, salt);
      const cipher = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, fileBuf);

      const header = new TextEncoder().encode('ENCFILE1');
      const filenameBytes = new TextEncoder().encode(file.name);
      const nameLenBuf = new ArrayBuffer(4);
      new DataView(nameLenBuf).setUint32(0, filenameBytes.length, false);

      const combined = concatBuffers([header.buffer, salt.buffer, iv.buffer, nameLenBuf, filenameBytes.buffer, cipher]);

      const blob = new Blob([combined], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.enc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      // save passphrase so decrypt page can prefill it and redirect
      try{
        sessionStorage.setItem('lastFilePass', pass);
        // mark last action so the decrypt page can show a success message
        sessionStorage.setItem('lastAction', 'encrypted');
        navigate('/tools/file-secure/file-decryption');
      }catch(e){ console.error('Redirect failed', e); }
    }catch(e){
      console.error(e);
      setError('Encryption failed');
    }finally{ setBusy(false); }
  }

  function handleDecryptNavigate(){
    console.debug('handleDecryptNavigate called');
    try{
      navigate('/tools/file-secure/file-decryption');
    }catch(e){ console.error(e); setError('Unable to open decryption page'); }
  }

  return (
    <div className="card-inner">
      <div className="card-wrap">
        <div className="content private">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="title"><span className="first-word">File </span>Encryption</div>
              <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ color: '#555' }}>Select a file and a passphrase.</div>
              </div>
            </div>
            <div>
              <button type="button" onClick={(e)=>{ e.preventDefault(); handleDecryptNavigate(); }} style={{ padding: '8px 12px', background: '#0b76ef', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600 }}>Decrypt</button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label>File</label>
            <div style={{ marginTop: 8 }}>
              <input type="file" onChange={handleFileChange} />
              <div style={{ marginTop: 8, color: '#666' }}>{file ? file.name : 'No file selected'}</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Passphrase</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <input value={pass} type={'password'} onChange={e=>setPass(e.target.value)} style={{ flex: 1, padding: 12, fontSize: 16, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={handleEncrypt} disabled={busy} style={{ padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 8 }}>Encrypt & Download</button>
            <button onClick={()=>{ setFile(null); setPass(''); setError(''); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}>Clear</button>
          </div>

          {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}

        </div>
      </div>
    </div>
  );
}
