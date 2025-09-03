import React from 'react';
import { useParams } from 'react-router-dom';
import TextEncrypt from './Tools/TextEncryption';
import TextDecrypt from './Tools/TextDecryption';
import FileEncrypt from './Tools/FileEncryption';
import FileDecrypt from './Tools/FileDecryption';
import ImageEncrypt from './Tools/ImageEncryption';
import ImageDecrypt from './Tools/ImageDecryption';
import ImageCompression from './Tools/ImageCompression';
import ImageToPdf from './Tools/ImageToPdf';
import PdfToImages from './Tools/PdfToImages';
import AudioEncrypt from './Tools/AudioEncryption';
import AudioDecrypt from './Tools/AudioDecryption';
import VideoEncrypt from './Tools/VideoEncryption';
import VideoDecrypt from './Tools/VideoDecryption';
import PdfEncrypt from './Tools/PdfEncryption';
import PdfDecrypt from './Tools/PdfDecryption';
import TranslationPage from './TranslationPage';

export default function ToolRunner(){
  const { category, subtool } = useParams();
  const slug = decodeURIComponent(subtool || '').toLowerCase();

  // legacy/alternate single-tool routes
  if (category === 'image-compress') {
    if (slug === 'image-compressor' || slug === 'image-compress') return <ImageCompression />;
  }

  // map a few known slugs to components
  if (category === 'text-secure') {
    if (slug === 'text-encryption' || slug === 'text-encrypt' || slug === 'text-encryption') return <TextEncrypt />;
    if (slug === 'text-decryption' || slug === 'text-decrypt') return <TextDecrypt />;
  }

  if (category === 'translate') {
    if (slug === 'unicode' || slug === 'translate-unicode' || slug === 'translate') return <TranslationPage />;
  }
  // legacy or alternate route for Nepali Unicode tool
  if (category === 'nepali-unicode') {
    if (slug === 'nepali-unicode' || slug === 'unicode' || slug === 'nepali') return <TranslationPage />;
  }

  if (category === 'pdf-converter') {
    if (slug === 'image-to-pdf' || slug === 'image-pdf') return <ImageToPdf />;
  if (slug === 'pdf-to-images' || slug === 'pdf-images') return <PdfToImages />;
  }

  if (category === 'file-secure') {
    if (slug === 'file-encryption' || slug === 'file-encrypt') return <FileEncrypt />;
    if (slug === 'file-decryption' || slug === 'file-decrypt') return <FileDecrypt />;
  if (slug === 'audio-encryption' || slug === 'audio-encrypt') return <AudioEncrypt />;
  if (slug === 'audio-decryption' || slug === 'audio-decrypt') return <AudioDecrypt />;
  if (slug === 'image-encryption' || slug === 'image-encrypt') return <ImageEncrypt />;
  if (slug === 'image-decryption' || slug === 'image-decrypt') return <ImageDecrypt />;
  if (slug === 'image-compression' || slug === 'image-compress') return <ImageCompression />;
  if (slug === 'image-to-pdf' || slug === 'image-pdf') return <ImageToPdf />;
  if (slug === 'video-encryption' || slug === 'video-encrypt') return <VideoEncrypt />;
  if (slug === 'video-decryption' || slug === 'video-decrypt') return <VideoDecrypt />;
  if (slug === 'pdf-encryption' || slug === 'pdf-encrypt') return <PdfEncrypt />;
  if (slug === 'pdf-decryption' || slug === 'pdf-decrypt') return <PdfDecrypt />;
  }

  // fallback: simple message
  return (
    <div className="content private">
      <div className="title"><span className="first-word">Tool </span>Not Found</div>
      <div style={{ marginTop: 12, color: '#666' }}>No tool UI implemented yet for <strong>{slug || 'this'}</strong>. You can add a custom page under <code>src/Pages</code> and map it in <code>ToolRunner.js</code>.</div>
    </div>
  );
}
