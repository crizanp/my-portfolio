import React from 'react';
import { useParams } from 'react-router-dom';
import TextEncrypt from './Tools/TextEncryption';
import TextDecrypt from './Tools/TextDecryption';

export default function ToolRunner(){
  const { category, subtool } = useParams();
  const slug = decodeURIComponent(subtool || '').toLowerCase();

  // map a few known slugs to components
  if (category === 'text-secure') {
    if (slug === 'text-encryption' || slug === 'text-encrypt' || slug === 'text-encryption') return <TextEncrypt />;
    if (slug === 'text-decryption' || slug === 'text-decrypt') return <TextDecrypt />;
  }

  // fallback: simple message
  return (
    <div className="content private">
      <div className="title"><span className="first-word">Tool </span>Not Found</div>
      <div style={{ marginTop: 12, color: '#666' }}>No tool UI implemented yet for <strong>{slug || 'this'}</strong>. You can add a custom page under <code>src/Pages</code> and map it in <code>ToolRunner.js</code>.</div>
    </div>
  );
}
