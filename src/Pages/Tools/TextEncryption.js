import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TextEncryption() {
    const [text, setText] = useState('');
    const [pass, setPass] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const appRoot = document.getElementById('app-root');
        if (appRoot) appRoot.classList.add('hide-profile');
        return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
    }, []);

    const navigate = useNavigate();

    function handleEncrypt() {
        setError('');
        if (!text || !pass) return setError('Enter text and a passphrase');
        if (!window.CryptoJS || !window.CryptoJS.AES) return setError('CryptoJS not loaded. Make sure crypt.js is present in public and the app is served.');
        try {
            const encrypted = window.CryptoJS.AES.encrypt(text, pass).toString();
            setResult(encrypted);
        } catch (e) {
            console.error(e);
            setError('Encryption failed — check console for details');
        }
    }

    function handleDecryptNavigate() {
        try {
            // store current values if present (empty string otherwise) and always navigate
            sessionStorage.setItem('lastEncrypted', result || '');
            sessionStorage.setItem('lastPass', pass || '');
            navigate('/tools/text-secure/text-decryption');
        } catch (e) {
            console.error(e);
            setError('Unable to open decryption page');
        }
    }

    return (
        <div className="card-inner">
            <div className="card-wrap">
                <div className="content private">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div className="title"><span className="first-word">Text </span>Encryption</div>
                            <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                                <div style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>Enter text and a passphrase.</div>
                                <button onClick={()=>setShowModal(true)} style={{ background: 'transparent', border: 'none', color: '#0b76ef', fontSize: 13, cursor: 'pointer', padding: 0 }}>What is this?</button>
                            </div>
                        </div>
                        <div>
                            <button onClick={handleDecryptNavigate} style={{ padding: '8px 12px', background: '#0b76ef', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600 }}>Decrypt</button>
                        </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <label>Text</label>
                        <textarea value={text} onChange={e => setText(e.target.value)} style={{ width: '100%', minHeight: 140, padding: 12, marginTop: 8, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff', boxSizing: 'border-box' }} />
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
                        <button onClick={handleEncrypt} style={{ padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 8 }}>Encrypt</button>
                        <button onClick={() => { setText(''); setPass(''); setResult(''); setError(''); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}>Clear</button>
                    </div>

                    {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}

                    {result && (
                        <div style={{ marginTop: 12 }}>
                            <label>Encrypted String</label>
                            <textarea readOnly value={result} style={{ width: '100%', minHeight: 120, padding: 12, marginTop: 8, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff', boxSizing: 'border-box' }} />
                            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                <button onClick={() => navigator.clipboard?.writeText(result)} style={{ padding: '8px 12px', borderRadius: 6, background: '#0b76ef', color: '#fff', border: 'none' }}>Copy</button>
                                <div style={{ alignSelf: 'center', color: '#666' }}>Keep the encrypted string and the passphrase to decrypt.</div>
                            </div>
                        </div>
                    )}


                    {/* modal */}
                    {showModal && (
                        <div role="dialog" aria-modal="true" style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={()=>setShowModal(false)}>
                            <div onClick={e=>e.stopPropagation()} style={{ background: '#fff', padding: 18, borderRadius: 8, maxWidth: 640, width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', position: 'relative', paddingTop: 36, textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: 0 }}>About this tool</h3>
                                    <button onClick={()=>setShowModal(false)} aria-label="Close" style={{ position: 'absolute', right: 12, top: 12, width: 36, height: 36, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                </div>
                                <div style={{ marginTop: 12, color: '#333', lineHeight: 1.5 }}>
                                    <p style={{ marginTop: 0 }}>This tool lets you encrypt small pieces of text in your browser using a passphrase. The text stays on your device and is not sent anywhere.</p>
                                    <ul style={{ marginTop: 8 }}>
                                        <li>Use a strong passphrase and keep it secret.</li>
                                        <li>Save both the encrypted text and the passphrase — you need both to decrypt.</li>
                                        <li>Best for short text only; not intended for large files.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
