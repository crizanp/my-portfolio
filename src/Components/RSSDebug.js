import React, { useState, useEffect } from 'react';

const RSSDebug = () => {
  const [debugInfo, setDebugInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  const testSimpleRSS = async () => {
    setLoading(true);
    setDebugInfo([]);
    
    const addLog = (message) => {
      console.log(message);
      setDebugInfo(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
    };

    try {
      addLog('Starting RSS test...');
      
      // Test with a simple RSS feed
      const testUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(testUrl)}`;
      
      addLog(`Testing URL: ${testUrl}`);
      addLog(`Proxy URL: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl);
      addLog(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      addLog(`Response keys: ${Object.keys(data).join(', ')}`);
      
      if (data.contents) {
        addLog(`Content length: ${data.contents.length} characters`);
        
        // Try to parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          addLog('❌ XML parsing error');
        } else {
          const items = xmlDoc.querySelectorAll('item');
          addLog(`✅ Found ${items.length} news items`);
          
          if (items.length > 0) {
            const firstItem = items[0];
            const title = firstItem.querySelector('title')?.textContent || 'No title';
            addLog(`First article: ${title}`);
          }
        }
      } else {
        addLog('❌ No contents in response');
      }
      
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>RSS Debug Tool</h2>
      <button 
        onClick={testSimpleRSS} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test RSS Feed'}
      </button>
      
      <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
        {debugInfo.map((log, index) => (
          <div key={index} style={{ 
            padding: '4px 0', 
            borderBottom: '1px solid #eee',
            fontSize: '12px'
          }}>
            <span style={{ color: '#666' }}>[{log.time}]</span> {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RSSDebug;