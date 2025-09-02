import React, { useEffect, useState } from 'react';

function fileToImage(file){
  return new Promise((resolve, reject)=>{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = ()=>{ URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e)=>{ URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

function canvasToBlob(canvas, mime, quality){
  return new Promise((resolve)=> canvas.toBlob(resolve, mime, quality));
}

async function compressImageFile(file, { maxWidth, maxHeight, quality, outputType }){
  const img = await fileToImage(file);
  let { width, height } = img;
  // maintain aspect ratio and constrain to maxWidth/maxHeight if provided
  let scale = 1;
  if(maxWidth && width > maxWidth) scale = Math.min(scale, maxWidth / width);
  if(maxHeight && height > maxHeight) scale = Math.min(scale, maxHeight / height);
  if(scale < 1){ width = Math.round(width * scale); height = Math.round(height * scale); }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const mime = outputType === 'original' ? file.type || 'image/jpeg' : outputType;
  const blob = await canvasToBlob(canvas, mime, quality);
  return blob;
}

export default function ImageCompression(){
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [outputType, setOutputType] = useState('image/jpeg');
  const [useServer, setUseServer] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [loadingState, setLoadingState] = useState(''); // 'uploading', 'preparing', 'complete'

  useEffect(()=>{
    const appRoot = document.getElementById('app-root');
    if(appRoot) appRoot.classList.add('hide-profile');
    return ()=>{ if(appRoot) appRoot.classList.remove('hide-profile'); };
  },[]);

  function handleFileChange(e){
    const f = e.target.files?.[0] || null;
    setFile(f); setError(''); setLoadingState('');
    if(f){ 
      setLoadingState('uploading');
      const url = URL.createObjectURL(f); 
      setPreview(url);
      // Simulate upload completion after a brief moment
      setTimeout(() => setLoadingState(''), 800);
    }
    else { 
      if(preview){ URL.revokeObjectURL(preview); setPreview(''); } 
      setLoadingState('');
    }
    if(resultUrl){ URL.revokeObjectURL(resultUrl); setResultUrl(''); }
  }

  async function handleCompress(){
    setError('');
    if(!file) return setError('Choose an image to compress');
    const opts = {
      maxWidth: maxWidth ? parseInt(maxWidth,10) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight,10) : undefined,
      quality: typeof quality === 'number' ? quality : parseFloat(quality),
      outputType: outputType === 'original' ? 'original' : outputType,
    };
    setBusy(true);
    setLoadingState('preparing');
    try{
      if(useServer){
        const form = new FormData();
        form.append('file', file, file.name);
        form.append('quality', Math.round(opts.quality * 100));
        if(opts.maxWidth) form.append('width', opts.maxWidth);
        if(opts.maxHeight) form.append('height', opts.maxHeight);
        const fmt = opts.outputType === 'original' ? 'original' : (opts.outputType === 'image/png' ? 'png' : opts.outputType === 'image/webp' ? 'webp' : 'jpeg');
        form.append('format', fmt);

        // build API url, allow REACT_APP_API_BASE to be host or full URL
        let base = process.env.REACT_APP_API_BASE || '';
        if(base && !/^https?:\/\//i.test(base) && !base.startsWith('/')){
          const proto = (window.location && window.location.protocol && window.location.protocol.startsWith('http')) ? window.location.protocol + '//' : 'http://';
          base = proto + base;
        }
        const apiUrl = base
          ? (base.endsWith('/') ? base.slice(0, -1) : base) + '/api/image/compress'
          : 'http://localhost:5000/api/image/compress';

        const resp = await fetch(apiUrl, { method: 'POST', body: form });
        if(!resp.ok){
          const txt = await resp.text().catch(()=>null);
          throw new Error('Server compression failed' + (txt ? ': ' + txt : ''));
        }
        const out = await resp.blob();
        const downloadUrl = URL.createObjectURL(out);
        setResultUrl(downloadUrl);
        const ext = fmt === 'png' ? '.png' : fmt === 'webp' ? '.webp' : '.jpg';
        const name = file.name.replace(/\.[^.]+$/, '') + `-compressed${ext}`;
        const a = document.createElement('a'); a.href = downloadUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      } else {
        const blob = await compressImageFile(file, opts);
        if(!blob) throw new Error('Compression failed');
        const downloadUrl = URL.createObjectURL(blob);
        setResultUrl(downloadUrl);
        const ext = outputType === 'image/png' ? '.png' : outputType === 'image/webp' ? '.webp' : '.jpg';
        const name = file.name.replace(/\.[^.]+$/, '') + `-compressed${ext}`;
        const a = document.createElement('a'); a.href = downloadUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      }
      
      // Show completion animation
      setLoadingState('complete');
      setTimeout(() => setLoadingState(''), 2000);
      
    }catch(e){ 
      console.error(e); 
      setError(e.message || 'Compression failed');
      setLoadingState('');
    }
    finally{ setBusy(false); }
  }

  function handleClear(){
    setFile(null); setError(''); setQuality(0.8); setMaxWidth(''); setMaxHeight(''); setOutputType('image/jpeg'); setLoadingState('');
    if(preview){ URL.revokeObjectURL(preview); setPreview(''); }
    if(resultUrl){ URL.revokeObjectURL(resultUrl); setResultUrl(''); }
  }

  return (
    <div className="card-inner">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="card-wrap">
        <div className="content private">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="title"><span className="first-word">Image </span>Compression</div>
              <div style={{ marginTop: 10, color: '#555' }}>Compress and resize images client-side. No server required.</div>
            </div>
            <div>
              <button type="button" onClick={(e)=>{ e.preventDefault(); window.location.href = '/tools/file-secure/image-encryption'; }} style={{ padding: '8px 12px', background: '#0b76ef', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600 }}>Other Image Tools</button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label>Image</label>
            <div style={{ marginTop: 8 }}>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div style={{ marginTop: 8, color: '#666' }}>{file ? file.name : 'No image selected'}</div>
              
              {/* Loading animations */}
              {loadingState === 'uploading' && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#0b76ef' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #e3f2fd', borderTop: '2px solid #0b76ef', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>Uploading...</span>
                </div>
              )}
              
              {loadingState === 'preparing' && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#6a2bff' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #f3e5f5', borderTop: '2px solid #6a2bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>Preparing compression...</span>
                </div>
              )}
              
              {loadingState === 'complete' && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#166534', animation: 'fadeIn 0.5s ease-in' }}>
                  <div style={{ width: 16, height: 16, backgroundColor: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10 }}>✓</div>
                  <span>Compression completed!</span>
                </div>
              )}
              
              {preview && !loadingState && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Original Preview</div>
                  <img src={preview} alt="preview" style={{ 
                    maxWidth: 300, 
                    maxHeight: 200, 
                    width: 'auto', 
                    height: 'auto', 
                    borderRadius: 8, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e6e9ee'
                  }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Output Format</label>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <select value={outputType} onChange={e=>setOutputType(e.target.value)} style={{ padding: 10, borderRadius: 8 }}>
                <option value="image/jpeg">JPEG (good compression)</option>
                <option value="image/webp">WebP (better)</option>
                <option value="image/png">PNG (lossless)</option>
                <option value="original">Keep original MIME</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Processing Mode</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={useServer} onChange={e=>setUseServer(e.target.checked)} /> Use server-side compression (recommended for HEIC/large files)
            </label>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Quality ({Math.round(quality*100)}%)</label>
              <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e=>setQuality(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ width: 140 }}>
              <label>Max Width</label>
              <input value={maxWidth} onChange={e=>setMaxWidth(e.target.value)} placeholder="px" style={{ width: '100%', padding: 8, borderRadius: 8 }} />
            </div>
            <div style={{ width: 140 }}>
              <label>Max Height</label>
              <input value={maxHeight} onChange={e=>setMaxHeight(e.target.value)} placeholder="px" style={{ width: '100%', padding: 8, borderRadius: 8 }} />
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={handleCompress} disabled={busy} style={{ padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 8 }}>Compress & Download</button>
            <button onClick={handleClear} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}>Clear</button>
          </div>

          {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}
          {resultUrl && <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Compressed Preview</div>
            <img src={resultUrl} alt="compressed" style={{ 
              maxWidth: 300, 
              maxHeight: 200, 
              width: 'auto', 
              height: 'auto', 
              borderRadius: 8, 
              border: '1px solid #e6e9ee',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} />
          </div>}

        </div>
      </div>
    </div>
  );
}
