import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const subtools = {
  'pdf-converter': ['Image to PDF','PDF to Images','Merge PDFs','Split PDF','Image Compressor'],
  'image-compress': ['Image Compressor','Image Cropper','HEIC Converter'],
  'video-tools': ['Video Converter','Video to Audio','Audio to Video'],
  'text-secure': ['Text Encryption','Text Decryption'],
  'file-secure': ['File Encryption','Image Encryption','Audio Encryption','Video Encryption','PDF Encryption'],
  'gif': ['GIF Converter'],
  'nepali-unicode': ['Nepali Unicode'],
  'image-tools': ['Image to PDF','Image Compressor','Image Cropper','SVG Converter','HEIC Converter'],
  'audio-tools': ['Audio Converter','Audio to Video','Video to Audio','Text to Speech'],
  'qr-&-barcode': ['QR Code Generator','Barcode Generator','Website Analysis'],
  'converters': ['Unit Converter','Crypto Converter','HEIC Converter'],
  'unit-converter': ['Unit Converter'],
  'crypto-tools': ['Crypto Converter','Currency Converter'],
  'website-analysis': ['Website Analysis','SEO Audit','Performance Test'],
  'password-tools': ['Password Generator','Password Strength Checker'],
  'timezone-tools': ['Timezone Converter']
}

const ToolDetail = () => {
  const { id } = useParams();
  const list = subtools[id] || [];
  useEffect(() => {
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.classList.add('hide-profile');
    return () => { if (appRoot) appRoot.classList.remove('hide-profile'); }
  }, []);
  return (
    <div className="content private">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="tools-header">{(id||'').replace(/-/g,' ').toUpperCase()}</div>
          <div className="tools-subtitle">Select a tool below to open the tool UI.</div>
        </div>
        {id === 'text-secure' && (
          <Link to="/tools/text-secure/text-decryption" style={{ padding: '8px 12px', background: '#0b76ef', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Decrypt</Link>
        )}
      </div>
      <div className="subtool-grid" style={{ marginTop: 12 }}>
        {list.map(s => {
          const subSlug = s.toLowerCase().replace(/\s+/g, '-');
          return (
            <Link key={s} to={`/tools/${id}/${encodeURIComponent(subSlug)}`} className="tool-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 600 }}>{s}</div>
              <div style={{ marginTop: 8, color: '#666' }}>
                Browse the tools that can help with {s.toLowerCase()}.
              </div>
            </Link>
          );
        })}
        {list.length === 0 && (
          <div className="tool-card" style={{ padding: 14 }}>Browse the tools that can help — no subtools configured for this category yet.</div>
        )}
      </div>
    </div>
  );
}

export default ToolDetail;
