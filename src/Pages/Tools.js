import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// list of tool categories (display order). We keep names for UI and derive slugs when needed.
const tools = [
  'News Aggregator','PDF Converter','File Secure','Text Secure','Image Compress','Nepali Unicode'
];
// 'Audio Tools','QR & Barcode','Converters','Unit Converter','Crypto Tools','Website Analysis','Timezone Tools''Image Tools','Video Tools',
// Featured category slugs will be shown at the top. Change this array to promote categories.
const featuredSlugs = ['news-aggregator','nepali-unicode','file-secure'];

const subtools = {
  'news-aggregator': ['Global News','Nepali News'],
  'pdf-converter': ['Image to PDF','PDF to Images','Merge PDFs','Split PDF','Image Compressor'],
  'image-compress': ['Image Compressor','Image Cropper','HEIC Converter'],
  // 'video-tools': ['Video Converter','Video to Audio','Audio to Video'],
  'text-secure': ['Text Encryption','Text Decryption'],
  'file-secure': ['File Encryption','Image Encryption','Audio Encryption','Video Encryption','PDF Encryption'],
  // 'gif': ['GIF Converter'],
  'nepali-unicode': ['Nepali Unicode'],
  'image-tools': ['Image to PDF','Image Compressor','Image Cropper','SVG Converter','HEIC Converter'],
  // 'audio-tools': ['Audio Converter','Audio to Video','Video to Audio','Text to Speech'],
  // 'qr-&-barcode': ['QR Code Generator','Barcode Generator','Website Analysis'],
  // 'converters': ['Unit Converter','Crypto Converter','HEIC Converter'],
  // 'unit-converter': ['Unit Converter'],
  // 'crypto-tools': ['Crypto Converter','Currency Converter'],
  // 'website-analysis': ['Website Analysis','SEO Audit','Performance Test'],
  // 'password-tools': ['Password Generator','Password Strength Checker'],
  // 'timezone-tools': ['Timezone Converter']
}

const Tools = () => {
  useEffect(() => {
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.classList.add('hide-profile');
    return () => { if (appRoot) appRoot.classList.remove('hide-profile'); }
  }, []);

  return (
    <div className="content private">
      <div className="tools-header text-black">Tools</div>
      <div className="tools-subtitle text-gray-800">A small collection of useful utilities , pick a category to see specific tools.</div>
      <div className="category-row" style={{ marginTop: 12 }}>
        {/* Featured first */}
        {tools.filter(t => featuredSlugs.includes(t.toLowerCase().replace(/\s+/g,'-'))).map(t => {
          const slug = t.toLowerCase().replace(/\s+/g,'-');
          const list = subtools[slug] || [];
          const preview = list.slice(0,3);
          const isFeatured = featuredSlugs.includes(slug);
          return (
            <Link key={t} to={`/tools/${encodeURIComponent(slug)}`} className="tool-card text-left">
              {isFeatured && <span className="featured-badge" title="Featured">★</span>}
              <div style={{ fontWeight: 600 }}>{t}</div>
              <div className="tool-card-sub ">
                {preview.map((s, i) => (
                  <span key={s}>{s}{i < preview.length - 1 ? ' · ' : ''}</span>
                ))}
                {list.length > 3 && <span style={{ marginLeft: 8, color: '#0b76ef', fontWeight: 600 }}>More</span>}
              </div>
            </Link>
          );
        })}

        {/* Other categories */}
        {tools.filter(t => !featuredSlugs.includes(t.toLowerCase().replace(/\s+/g,'-'))).map(t => {
          const slug = t.toLowerCase().replace(/\s+/g,'-');
          const list = subtools[slug] || [];
          const preview = list.slice(0,3);
          return (
            <Link key={t} to={`/tools/${encodeURIComponent(slug)}`} className="tool-card">
              <div style={{ fontWeight: 600 }}>{t}</div>
              <div className="tool-card-sub">
                {preview.map((s, i) => (
                  <span key={s}>{s}{i < preview.length - 1 ? ' · ' : ''}</span>
                ))}
                {list.length > 3 && <span style={{ marginLeft: 8, color: '#0b76ef', fontWeight: 600 }}>More</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Tools;
