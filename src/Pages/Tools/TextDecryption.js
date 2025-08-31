import React, { useEffect, useState } from 'react';

export default function TextDecryption() {
    const [payload, setPayload] = useState('');
    const [pass, setPass] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        const appRoot = document.getElementById('app-root');
        if (appRoot) appRoot.classList.add('hide-profile');
        const last = sessionStorage.getItem('lastEncrypted');
        const lastPass = sessionStorage.getItem('lastPass');
        if (last) setPayload(last);
        if (lastPass) setPass(lastPass);
        return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
    }, []);

    function handleDecrypt() {
        setError('');
        if (!payload || !pass) return setError('Provide encrypted string and passphrase');
        if (!window.CryptoJS || !window.CryptoJS.AES) return setError('CryptoJS not loaded. Make sure crypt.js is present in public and the app is served.');
        try {
            const bytes = window.CryptoJS.AES.decrypt(payload, pass);
            const original = bytes.toString(window.CryptoJS.enc.Utf8);
            if (!original) throw new Error('Failed');
            setResult(original);
        } catch (e) {
            console.error(e);
            setError('Decryption failed — incorrect passphrase or corrupted data');
        }
    }

    return (
        <div className="card-inner">
            <div className="card-wrap">
                <div className="content private">
                    <div className="title"><span className="first-word">Text </span>Decryption</div>
                    <div style={{ marginTop: 10, color: '#555' }}>Paste the encrypted string and the passphrase you used to decrypt back to plain text.</div>

                    <div style={{ marginTop: 14 }}>
                        <label>Encrypted String</label>
                        <textarea value={payload} onChange={e => setPayload(e.target.value)} style={{ width: '100%', minHeight: 140, padding: 12, marginTop: 8, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <label>Passphrase</label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                            <input value={pass} type={showPass ? 'text' : 'password'} onChange={e => setPass(e.target.value)} style={{ flex: 1, padding: 12, fontSize: 16, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff', boxSizing: 'border-box' }} />
                            <button type="button" onClick={() => setShowPass(s => !s)} aria-pressed={showPass} aria-label={showPass ? 'Hide passphrase' : 'Show passphrase'} style={{ width: 36, height: 32, padding: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                                {showPass ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.08-2.13 2.63-3.92 4.5-5.27" /><path d="M1 1l22 22" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <button onClick={handleDecrypt} style={{ padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 8 }}>Decrypt</button>
                        <button onClick={() => { setPayload(''); setPass(''); setResult(''); setError(''); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}>Clear</button>
                    </div>

                    {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}

                    {result && (
                        <div style={{ marginTop: 12 }}>
                            <label>Decrypted Text</label>
                            <textarea readOnly value={result} style={{ width: '100%', minHeight: 120, padding: 12, marginTop: 8, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff', boxSizing: 'border-box' }} />
                            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                <button onClick={() => navigator.clipboard?.writeText(result)} style={{ padding: '8px 12px', borderRadius: 6, background: '#0b76ef', color: '#fff', border: 'none' }}>Copy</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
