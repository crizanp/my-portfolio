import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const aiTools = [
  // Easy → quick prototypes
  'Resume analyzer & score generator',
  'Handwritten digit recognition web app',
  'Movie recommendation system',
  'Sentiment analysis of product reviews',
  'Sentiment analysis of global news',
  'Personal finance tracker with AI suggestions',

  'Fake news detection system',
  'AI job recommendation platform',

  
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AIModals = () => {
  useEffect(() => {
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.classList.add('hide-profile');
    return () => { if (appRoot) appRoot.classList.remove('hide-profile'); }
  }, []);

  return (
    <div className="content private">
      <div className="tools-header text-black">AI Tools</div>
      <div className="tools-subtitle text-gray-800">A collection of AI-powered project pages / modals. Click any item to open its page.</div>
      <div className="category-row" style={{ marginTop: 12 }}>
        {aiTools.map(tool => {
          const slug = slugify(tool);
          return (
            <Link key={tool} to={`/ai/${encodeURIComponent(slug)}`} className="tool-card">
              <div style={{ fontWeight: 600 }}>{tool}</div>
              <div className="tool-card-sub">Open page</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default AIModals;
