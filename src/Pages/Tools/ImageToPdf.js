import React, { useState, useEffect, useRef } from 'react';

export default function ImageToPdf(){
  const [files, setFiles] = useState([]);
  const [pageSize, setPageSize] = useState('auto');
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState(0);
  const [quality, setQuality] = useState(80);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileProgress, setFileProgress] = useState({}); // key -> percent
  const [conversionProgress, setConversionProgress] = useState(0); // 0-100
  const convTimer = useRef(null);

  useEffect(()=>{
    const appRoot = document.getElementById('app-root');
    if(appRoot) appRoot.classList.add('hide-profile');
    return ()=>{ if(appRoot) appRoot.classList.remove('hide-profile'); };
  },[]);

  const handleFiles = (e) => {
  const chosen = Array.from(e.target.files || []);
  const MAX_FILES = 100; // must match server limit
  const MAX_TOTAL_BYTES = 1024 * 1024 * 1024; // 1 GB total (example)
  if (chosen.length > MAX_FILES) { setError(`Too many files selected (max ${MAX_FILES})`); return; }
  const total = chosen.reduce((s,f)=>s+ (f.size || 0), 0);
  if (total > MAX_TOTAL_BYTES) { setError('Selected files exceed total size limit (1 GB)'); return; }
  // do not create image previews (can hang browsers for many/large images)
  setFiles(chosen);
  };

  useEffect(()=>{
    return ()=>{
      if(convTimer.current) clearInterval(convTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const submit = async (e) => {
    e.preventDefault();
    if(files.length === 0){ setError('Please select one or more images'); return; }
    setError('');
    setLoading(true);
    try{
      // build API url base
      let base = process.env.REACT_APP_API_BASE || '';
      if(base && !/^https?:\/\//i.test(base) && !base.startsWith('/')){
        const proto = (window.location && window.location.protocol && window.location.protocol.startsWith('http')) ? window.location.protocol + '//' : 'http://';
        base = proto + base;
      }
      const apiBase = base ? (base.endsWith('/') ? base.slice(0, -1) : base) : 'http://localhost:5000';

      // decide per-file whether to use chunked uploads (threshold)
      const CHUNK_THRESHOLD = 10 * 1024 * 1024; // 10 MB
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

  const tempKeys = [];
  const directFiles = [];

      for(const file of files){
        if (file.size > CHUNK_THRESHOLD) {
          // chunk-upload this file
          const uploadId = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
          const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
          // initialize file progress
          setFileProgress(prev => ({ ...prev, [file.name]: 0 }));
          for(let i=0;i<totalChunks;i++){
            const start = i * CHUNK_SIZE;
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const blob = file.slice(start, end);
            const form = new FormData();
            form.append('chunk', blob, file.name);
            form.append('uploadId', uploadId);
            form.append('chunkIndex', String(i));
            // upload chunk
            const upUrl = apiBase + '/tools/pdf-converter/upload-chunk';
            const resp = await fetch(upUrl, { method: 'POST', body: form });
            if(!resp.ok) throw new Error('Chunk upload failed');
            // update progress (roughly by chunks)
            setFileProgress(prev => {
              const done = (prev[file.name] || 0);
              const newPercent = Math.min(100, Math.round(((i+1) / totalChunks) * 100));
              return { ...prev, [file.name]: newPercent };
            });
          }
          // assemble
          const assembleUrl = apiBase + '/tools/pdf-converter/assemble-upload';
          const r2 = await fetch(assembleUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uploadId, filename: file.name }) });
          if(!r2.ok) throw new Error('Assemble failed');
          const j = await r2.json();
          if(!j.tempKey) throw new Error('No tempKey');
          tempKeys.push(j.tempKey);
        } else {
          directFiles.push(file);
        }
      }

      // If we have direct files, upload them along with tempKeys; otherwise use only tempKeys
      if (directFiles.length > 0) {
        const form = new FormData();
        directFiles.forEach(f => form.append('images', f));
        if (tempKeys.length) form.append('tempKeys', tempKeys.join(','));
        form.append('pageSize', pageSize);
        form.append('orientation', orientation);
        form.append('margin', String(margin));
        form.append('quality', String(quality));
        form.append('outputName', 'images.pdf');
        // upload direct files with progress using XMLHttpRequest
        const apiUrl = apiBase + '/tools/pdf-converter/image-to-pdf';
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', apiUrl);
          xhr.responseType = 'blob';
          xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status < 300){
              const blob = xhr.response;
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'images.pdf'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
              resolve();
            } else {
              try{ const json = JSON.parse(xhr.responseText); reject(new Error(json.error || 'Conversion failed')); }catch(e){ reject(new Error('Conversion failed')); }
            }
          };
          xhr.onerror = ()=> reject(new Error('Network error'));
          xhr.upload.onprogress = (ev)=>{
            if(ev.lengthComputable){
              const percent = Math.round((ev.loaded/ev.total)*100);
              setFileProgress(prev => ({ ...prev, __overall_upload: percent }));
            }
          };
          // conversion progress simulation
          setConversionProgress(5);
          if(convTimer.current) clearInterval(convTimer.current);
          convTimer.current = setInterval(()=>{
            setConversionProgress(p => Math.min(90, p + Math.floor(Math.random()*6) + 1));
          }, 700);
          xhr.send(form);
        });
        setConversionProgress(100);
        if(convTimer.current) { clearInterval(convTimer.current); convTimer.current = null; }
      } else {
        // only tempKeys -> call API with tempKeys
        const body = new URLSearchParams();
        body.append('tempKeys', tempKeys.join(','));
        body.append('pageSize', pageSize);
        body.append('orientation', orientation);
        body.append('margin', String(margin));
        body.append('quality', String(quality));
        body.append('outputName', 'images.pdf');
        const apiUrl = apiBase + '/tools/pdf-converter/image-to-pdf';
  // tempKeys path: use fetch but simulate conversion progress
  setConversionProgress(5);
  if(convTimer.current) clearInterval(convTimer.current);
  convTimer.current = setInterval(()=>{ setConversionProgress(p => Math.min(90, p + Math.floor(Math.random()*6) + 1)); }, 700);
  const res = await fetch(apiUrl, { method: 'POST', body });
  if(!res.ok){ if(convTimer.current){ clearInterval(convTimer.current); convTimer.current=null; } const json = await res.json().catch(()=>({})); throw new Error(json.error || 'Conversion failed'); }
  const blob = await res.blob();
  if(convTimer.current){ clearInterval(convTimer.current); convTimer.current=null; }
  setConversionProgress(100);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'images.pdf'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      }

      
    }catch(err){
      console.error(err);
      setError(err.message || 'Conversion failed');
  if(convTimer.current){ clearInterval(convTimer.current); convTimer.current=null; }
    }finally{ setLoading(false); }
  };

  return (
    <div className="card-inner">
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="card-wrap">
        <div className="content private">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="title"><span className="first-word">Image </span>→ PDF</div>
              <div style={{ marginTop: 10, color: '#555' }}>Convert one or more images into a single PDF. Large files use chunked uploads.</div>
            </div>
            <div>
              <button type="button" onClick={(e)=>{ e.preventDefault(); window.location.href = '/tools/file-secure/image-compression'; }} style={{ padding: '8px 12px', background: '#0b76ef', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600 }}>Other Image Tools</button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label>Select images</label>
            <div style={{ marginTop: 8 }}>
              <input type="file" accept="image/*" multiple onChange={handleFiles} />
              <div style={{ marginTop: 8, color: '#666' }}>{files.length ? `${files.length} file(s) selected` : 'No images selected'}</div>

              {/* Upload/convert state */}
              {loading && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#0b76ef' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #e3f2fd', borderTop: '2px solid #0b76ef', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>{conversionProgress < 100 ? 'Processing...' : 'Finishing...'}</span>
                </div>
              )}

              {/* File list (no image previews to avoid browser hangs) */}
              {files.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Selected Images</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {files.map((f, idx) => (
                      <div key={idx} style={{ minWidth: 200, maxWidth: 320, borderRadius: 8, border: '1px solid #e6e9ee', padding: 8, background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 13, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{(f.size/1024/1024).toFixed(2)} MB</div>
                        <div style={{ height: 6, background: '#f1f3f5', borderRadius: 6, marginTop: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${fileProgress[f.name] || 0}%`, height: '100%', background: '#6a2bff' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Options</label>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ fontSize: 13, marginRight: 6 }}>Page size</div>
                <select value={pageSize} onChange={e=>setPageSize(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
                  <option value="auto">Auto</option>
                  <option value="A4">A4</option>
                  <option value="letter">Letter</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ fontSize: 13, marginRight: 6 }}>Orientation</div>
                <select value={orientation} onChange={e=>setOrientation(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ fontSize: 13, marginRight: 6 }}>Margin (pts)</div>
                <input type="number" value={margin} min={0} onChange={e=>setMargin(Number(e.target.value))} style={{ width: 100, padding: 8, borderRadius: 8 }} />
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ fontSize: 13, marginRight: 6 }}>Quality</div>
                <input type="number" value={quality} min={5} max={100} onChange={e=>setQuality(Number(e.target.value))} style={{ width: 100, padding: 8, borderRadius: 8 }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button type="button" onClick={submit} disabled={loading} style={{ padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 8 }}>{loading ? 'Converting...' : 'Convert to PDF'}</button>
            <button type="button" onClick={()=>{ setFiles([]); setError(''); setFileProgress({}); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}>Clear</button>
          </div>

          {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}

          {conversionProgress > 0 && conversionProgress < 100 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Conversion progress</div>
              <div style={{ height: 10, background: '#f1f3f5', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${conversionProgress}%`, height: '100%', background: '#6a2bff' }} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
