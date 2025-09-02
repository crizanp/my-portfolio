"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';

// Small Trie implementation (lightweight, embedded)
class TrieNode {
  constructor(){
    this.children = {};
    this.isEndOfWord = false;
    this.word = null;
  }
}

class Trie {
  constructor(){ this.root = new TrieNode(); }
  insert(word, original){
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEndOfWord = true;
    node.word = original;
  }
  search(prefix){
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    return this.collect(node);
  }
  collect(node){
    const out = [];
    if (node.isEndOfWord && node.word) out.push(node.word);
    for (const k of Object.keys(node.children)) out.push(...this.collect(node.children[k]));
    return out;
  }
}

// A few example mappings (expand as needed)
const wordMappings = {
  'k': 'के',
  'kasto': 'कस्तो',
  'chha': 'छ',
  'halkhabar': 'हालखबर',
  'malaai': 'मलाई',
  'sanchai': 'सञ्चै',
  'khana': 'खाना',
  'paani': 'पानी'
};

export default function TranslationPage(){
  const [roman, setRoman] = useState('');
  const [unicode, setUnicode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [didYouMean, setDidYouMean] = useState([]);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [sanscript, setSanscript] = useState(null);
  const [loadingWords, setLoadingWords] = useState(false);
  const [wordsLoaded, setWordsLoaded] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [wordsArray, setWordsArray] = useState(null);
  const trie = useRef(new Trie());
  const inputRef = useRef(null);

  useEffect(()=>{
    // hide profile area to match other tool pages
    const appRoot = document.getElementById('app-root');
    if(appRoot) appRoot.classList.add('hide-profile');
    return ()=>{ if(appRoot) appRoot.classList.remove('hide-profile'); };
  },[]);

  // seed trie with mappings
  useEffect(()=>{
    Object.keys(wordMappings).forEach(k => trie.current.insert(k.toLowerCase(), wordMappings[k]));
  },[]);

  // Try to dynamically import Sanscript if available (optional dependency).
  useEffect(()=>{
    let cancelled = false;
    (async ()=>{
      try{
        const mod = await import('@sanskrit-coders/sanscript');
        if(cancelled) return;
        // module may export default or named
        setSanscript(mod.default ? mod.default : mod);
      }catch(e){
        // Not available - we'll continue with fallback mappings
        setSanscript(null);
        console.info('Sanscript not available; falling back to simple mappings.');
      }
    })();
    return ()=>{ cancelled = true; };
  },[]);

  // Fetch NepaliWords.json once and insert Devnagari words into trie in chunks.
  useEffect(()=>{
    let cancelled = false;
    (async ()=>{
      try{
        setLoadingWords(true);
        const res = await fetch('/NepaliWords.json');
        if(!res.ok) throw new Error('Words JSON not found');
        const payload = await res.json();
        const words = Array.isArray(payload) ? payload : (payload.nepaliWords || []);
        setWordsArray(words);
        setTotalWords(words.length || 0);
        const chunk = 1000;
        for(let i=0;i<words.length;i+=chunk){
          if(cancelled) break;
          const slice = words.slice(i, i+chunk);
          slice.forEach(w => {
            // always insert the Devnagari form as a key so suggestions work without Sanscript
            try{ trie.current.insert((w||'').toLowerCase(), w); }catch(e){ /* ignore malformed entries */ }
          });
          setWordsLoaded(prev => prev + slice.length);
          await new Promise(r => setTimeout(r, 0));
        }
      }catch(e){
        console.info('Could not load NepaliWords.json for suggestions:', e.message || e);
      }finally{
        setLoadingWords(false);
      }
    })();
    return ()=>{ cancelled = true; };
  },[]);

  // If Sanscript becomes available later, insert romanized keys for better matching.
  useEffect(()=>{
    if(!sanscript || !wordsArray || wordsArray.length === 0) return;
    let cancelled = false;
    (async ()=>{
      try{
        const chunk = 1000;
        for(let i=0;i<wordsArray.length;i+=chunk){
          if(cancelled) break;
          const slice = wordsArray.slice(i, i+chunk);
          slice.forEach(w => {
            try{
              const romanKey = sanscript.t(w, 'devanagari', 'itrans').toLowerCase();
              trie.current.insert(romanKey, w);
            }catch(e){
              // ignore romanization errors
            }
          });
          // small yield so UI stays responsive
          await new Promise(r => setTimeout(r, 0));
        }
      }catch(e){
        console.info('Error while romanizing dictionary:', e.message || e);
      }
    })();
    return ()=>{ cancelled = true; };
  },[sanscript, wordsArray]);

  // Transliterate: prefer Sanscript if available; otherwise use the small fallback mapping.
  const transliterate = useCallback((text)=>{
    try{
      const segments = text.split(/(\([^)]*\))/g);
      const out = segments.map(seg => {
        if (seg.startsWith('(') && seg.endsWith(')')) return seg.slice(1,-1);
        // If Sanscript is available, transliterate the whole segment (preserves complex combos)
        if(sanscript){
          try{ return sanscript.t(seg, 'itrans', 'devanagari'); }catch(e){ /* fall through to mapping */ }
        }
        // fallback: transliterate words using wordMappings; leave unknown words unchanged
        return seg.split(/(\s+)/).map(token => {
          const t = token.trim();
          if(!t) return token; // whitespace
          const lower = t.toLowerCase();
          if (wordMappings[lower]) return wordMappings[lower];
          return token; // unknown - return original
        }).join('');
      });
      return out.join('');
    }catch(e){ console.error(e); return text; }
  },[sanscript]);

  const handleChange = useCallback((e)=>{
    const v = e.target.value;
    setRoman(v);
    setUnicode(transliterate(v));

    // If the user just typed a space, close suggestions and show "Do you mean this?" matches
    const endedWithSpace = /\s$/.test(v);
    if (endedWithSpace) {
      // find the token before the trailing space
      const before = v.slice(0, -1).trim();
      const prev = before.split(/\s+/).pop()?.toLowerCase().replace(/[()]/g,'') || '';
      if (prev) {
        const matches = trie.current.search(prev).slice(0,2);
        setDidYouMean(matches);
      } else {
        setDidYouMean([]);
      }
      setSuggestions([]);
      return;
    }

    // normal behavior: show suggestions for last word
    setDidYouMean([]);
    const parts = v.trim().split(/\s+/);
    const last = parts[parts.length-1]?.toLowerCase().replace(/[()]/g,'') || '';
    if(last) setSuggestions(trie.current.search(last).slice(0,16));
    else setSuggestions([]);
  },[transliterate]);

  const applySuggestion = (sug)=>{
    const parts = roman.trim().split(/\s+/);
    parts[parts.length-1] = sug;
    const newRoman = parts.join(' ') + ' ';
    setRoman(newRoman);
    setUnicode(transliterate(newRoman));
  setSuggestions([]);
  setDidYouMean([]);
    inputRef.current?.focus();
  };

  const applyDidYouMean = (sug) => {
    // Replace the previous word (the one before the space) with the chosen suggestion
    const trimmed = roman.replace(/\s+$/,'');
    const parts = trimmed.split(/\s+/);
    if (parts.length === 0) return;
    parts[parts.length-1] = sug;
    const newRoman = parts.join(' ') + ' ';
    setRoman(newRoman);
    setUnicode(transliterate(newRoman));
    setDidYouMean([]);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleCopy = async ()=>{
    try{
      await navigator.clipboard.writeText(unicode);
      setCopied(true);
      setError('Copied to clipboard');
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(()=>{
        setCopied(false);
        setError('');
        copyTimeoutRef.current = null;
      }, 2000);
    }catch(e){ setError('Copy failed'); setTimeout(()=>setError(''),2000); }
  };

  useEffect(()=>{
    return ()=>{ if(copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current); };
  },[]);

  const handleClear = ()=>{ setRoman(''); setUnicode(''); setSuggestions([]); setError(''); };

  return (
    <div className="card-inner">
      <div className="card-wrap">
        <div className="content private">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="title"><span className="first-word">Nepali </span>Unicode</div>
              <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                <div style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>Convert Romanized Nepali to Unicode Devanagari.</div>
                <button onClick={()=>setShowModal(true)} style={{ background: 'transparent', border: 'none', color: '#0b76ef', fontSize: 13, cursor: 'pointer', padding: 0 }}>What is this?</button>
              </div>
            </div>
            <div>
              <button type="button" onClick={()=>{ inputRef.current?.focus(); }} style={{ padding: '8px 12px', background: '#0b76ef', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600 }}>Focus Input</button>
            </div>
          </div>

          {loadingWords && (
            <div style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
              Loading dictionary suggestions... {wordsLoaded}/{totalWords || '?'}
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <label>Romanized Input</label>
            <textarea ref={inputRef} value={roman} onChange={handleChange} placeholder="kasto chha malaai khana chha..." style={{ width: '100%', minHeight: 120, padding: 12, marginTop: 8, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff', boxSizing: 'border-box' }} />
            {didYouMean.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 6, color: '#555', fontSize: 13 }}>Do you mean this?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {didYouMean.map((s,i)=> (
                    <button key={i} onClick={()=>applyDidYouMean(s)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              suggestions.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {suggestions.map((s,i)=> (
                    <button
                      key={i}
                      onClick={()=>applySuggestion(s)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        background: '#fafafa',
                        cursor: 'pointer',
                        maxWidth: 'calc((100% - 56px) / 8)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: '0 1 auto'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Nepali Unicode Output</label>
            <textarea readOnly value={unicode} style={{ width: '100%', minHeight: 120, padding: 12, marginTop: 8, border: '1px solid #e6ddff', borderRadius: 8, background: '#f3f0ff', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={handleCopy} style={{ padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 8 }}>{copied ? 'Copied' : 'Copy'}</button>
            <button onClick={handleClear} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}>Clear</button>
          </div>

          {error && <div style={{ marginTop: 12, color: '#8a0f0f' }}>{error}</div>}

          {showModal && (
            <div role="dialog" aria-modal="true" style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={()=>setShowModal(false)}>
              <div onClick={e=>e.stopPropagation()} style={{ background: '#fff', padding: 20, borderRadius: 12, maxWidth: 720, width: '92%', boxShadow: '0 12px 36px rgba(0,0,0,0.18)', position: 'relative', textAlign: 'left', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 320px', minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#0b76ef', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>ने</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>What is Nepali Unicode?</h3>
                      <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>Quick guide to Roman → Devanagari conversion</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, color: '#333', lineHeight: 1.5, fontSize: 14 }}>
                    <p style={{ margin: '0 0 8px 0' }}>Type Romanized Nepali (itrans-style or simple phonetic) and this tool converts it to Unicode Devanagari on the fly. Text inside parentheses is preserved as-is.</p>
                    <p style={{ margin: '0 0 8px 0' }}>Suggestions appear while typing — click to accept. When you press space, the tool offers a small "Do you mean this?" hint with top matches.</p>
                  </div>

                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <button onClick={()=>setShowModal(false)} style={{ padding: '10px 14px', background: '#0b76ef', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Got it</button>
                  </div>
                </div>

                <div style={{ flex: '0 1 260px', minWidth: 220, background: '#fafafa', borderRadius: 8, padding: 12, alignSelf: 'stretch' }}>
                  <div style={{ fontSize: 13, color: '#444', marginBottom: 8, fontWeight: 600 }}>Examples</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 14 }}><strong>kasto</strong> → <span style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>कस्तो</span></div>
                    <div style={{ fontSize: 14 }}><strong>malaai khana</strong> → <span style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>मलाई खाना</span></div>
                    <div style={{ fontSize: 14 }}><strong>paani</strong> → <span style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>पानी</span></div>
                  </div>
                </div>

                <button onClick={()=>setShowModal(false)} aria-label="Close" style={{ position: 'absolute', right: 12, top: 12, width: 36, height: 36, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
