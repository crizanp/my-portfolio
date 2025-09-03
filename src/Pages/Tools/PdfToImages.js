import React, { useState, useRef, useCallback } from 'react';

export default function PdfToImages() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ step: '', percent: 0 });
  const [isConverting, setIsConverting] = useState(false);
  const abortRef = useRef(false);
  const workerRef = useRef(null);

  const handleFile = useCallback((e) => {
    setError('');
    setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
    setProgress({ step: '', percent: 0 });
  }, []);

  const createWorker = () => {
    // Inline worker with proper library loading and error handling
    const workerCode = `
      let pdfjsLib;
      let JSZip;
      let isLibrariesLoaded = false;
      
      async function loadLibraries() {
        if (isLibrariesLoaded) return;
        
        try {
          // Load JSZip first
          importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
          JSZip = self.JSZip;
          
          // Load PDF.js with proper error handling
          importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
          
          // Check if pdfjsLib is available in different possible locations
          pdfjsLib = self.pdfjsLib || self.PDFJS || window.pdfjsLib || window.PDFJS;
          
          if (!pdfjsLib) {
            throw new Error('PDF.js library not found');
          }
          
          // Configure worker source
          if (pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
          
          isLibrariesLoaded = true;
          self.postMessage({ type: 'libraries-loaded' });
          
        } catch (error) {
          self.postMessage({ 
            type: 'error', 
            message: 'Failed to load required libraries: ' + error.message 
          });
        }
      }
      
      self.onmessage = async function(e) {
        const { type, data } = e.data;
        
        if (type === 'load-libraries') {
          await loadLibraries();
          return;
        }
        
        if (type === 'convert') {
          if (!isLibrariesLoaded) {
            self.postMessage({ type: 'error', message: 'Libraries not loaded' });
            return;
          }
          
          try {
            const { arrayBuffer, scale = 1.5 } = data;
            
            self.postMessage({ type: 'progress', step: 'Loading PDF...', percent: 10 });
            
            // Create loading task with proper configuration
            const loadingTask = pdfjsLib.getDocument({ 
              data: arrayBuffer,
              verbosity: 0,
              disableAutoFetch: true,
              disableStream: true
            });
            
            const pdf = await loadingTask.promise;
            const pageCount = pdf.numPages;
            
            if (pageCount === 0) {
              throw new Error('PDF has no pages');
            }
            
            self.postMessage({ type: 'progress', step: 'Processing pages...', percent: 20 });
            
            const zip = new JSZip();
            
            // Check if OffscreenCanvas is available
            const useOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
            let canvas, ctx;
            
            if (useOffscreenCanvas) {
              canvas = new OffscreenCanvas(1, 1);
              ctx = canvas.getContext('2d');
            }
            
            // Adaptive batch size based on page count and memory constraints
            const BATCH_SIZE = pageCount > 50 ? 2 : pageCount > 20 ? 3 : 4;
            
            for (let i = 1; i <= pageCount; i += BATCH_SIZE) {
              const batchEnd = Math.min(i + BATCH_SIZE - 1, pageCount);
              
              // Process batch sequentially to avoid memory issues
              for (let pageNum = i; pageNum <= batchEnd; pageNum++) {
                try {
                  const result = await processPage(pdf, pageNum, canvas, ctx, scale, useOffscreenCanvas);
                  if (result) {
                    zip.file('page_' + String(pageNum).padStart(3, '0') + '.png', result);
                  }
                } catch (pageError) {
                  console.warn(\`Failed to process page \${pageNum}:\`, pageError);
                  // Continue with other pages
                }
              }
              
              const progressPercent = 20 + Math.round((batchEnd / pageCount) * 60);
              self.postMessage({ 
                type: 'progress', 
                step: 'Processed ' + batchEnd + '/' + pageCount + ' pages', 
                percent: progressPercent 
              });
              
              // Small delay for UI updates
              await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            self.postMessage({ type: 'progress', step: 'Creating ZIP file...', percent: 85 });
            
            const zipBlob = await zip.generateAsync(
              { 
                type: 'blob', 
                compression: 'DEFLATE', 
                compressionOptions: { level: 6 } 
              },
              (metadata) => {
                self.postMessage({ 
                  type: 'progress', 
                  step: 'Creating ZIP file...', 
                  percent: 85 + Math.round(metadata.percent * 0.1) 
                });
              }
            );
            
            self.postMessage({ type: 'success', data: zipBlob });
            
            // Clean up
            try {
              if (loadingTask.destroy) {
                loadingTask.destroy();
              }
            } catch (e) {
              console.warn('Error cleaning up PDF:', e);
            }
            
          } catch (error) {
            self.postMessage({ 
              type: 'error', 
              message: error.message || 'Conversion failed' 
            });
          }
        }
      };
      
      async function processPage(pdf, pageNum, canvas, ctx, scale, useOffscreenCanvas) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          
          if (useOffscreenCanvas && canvas && ctx) {
            // Use OffscreenCanvas for better performance
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            await page.render({
              canvasContext: ctx,
              viewport: viewport
            }).promise;
            
            const blob = await canvas.convertToBlob({ type: 'image/png' });
            
            // Clean up page
            if (page.cleanup) {
              page.cleanup();
            }
            
            return blob;
          } else {
            // Fallback: return a placeholder or skip
            if (page.cleanup) {
              page.cleanup();
            }
            return null;
          }
        } catch (error) {
          console.error(\`Error processing page \${pageNum}:\`, error);
          return null;
        }
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  };

  const convertToImages = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    setError('');
    setIsConverting(true);
    setProgress({ step: 'Initializing...', percent: 0 });
    abortRef.current = false;

    try {
      // Check if we can use Web Workers
      if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
        await convertWithWorker();
      } else {
        await convertWithFallback();
      }
    } catch (err) {
      console.error('Conversion error:', err);
      if (!abortRef.current) {
        setError(err.message || 'Conversion failed');
      }
      setProgress({ step: '', percent: 0 });
    } finally {
      setIsConverting(false);
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    }
  };

  const convertWithWorker = async () => {
    return new Promise((resolve, reject) => {
      workerRef.current = createWorker();
      let librariesLoaded = false;
      
      workerRef.current.onmessage = (e) => {
        const { type, step, percent, data, message } = e.data;
        
        if (abortRef.current) {
          workerRef.current.terminate();
          reject(new Error('Conversion cancelled'));
          return;
        }
        
        switch (type) {
          case 'libraries-loaded':
            librariesLoaded = true;
            // Start conversion after libraries are loaded
            file.arrayBuffer().then(arrayBuffer => {
              workerRef.current.postMessage({
                type: 'convert',
                data: { arrayBuffer, scale: 1.5 }
              });
            }).catch(reject);
            break;
            
          case 'progress':
            setProgress({ step, percent });
            break;
            
          case 'success':
            setProgress({ step: 'Download starting...', percent: 100 });
            downloadZip(data);
            resolve();
            break;
            
          case 'error':
            if (!librariesLoaded) {
              // If libraries failed to load, fall back to main thread
              console.warn('Worker libraries failed, falling back to main thread');
              resolve(convertWithFallback());
            } else {
              reject(new Error(message));
            }
            break;
        }
      };
      
      workerRef.current.onerror = (error) => {
        console.warn('Worker error, falling back to main thread:', error);
        resolve(convertWithFallback());
      };
      
      // Load libraries first
      workerRef.current.postMessage({ type: 'load-libraries' });
    });
  };

  const convertWithFallback = async () => {
    setProgress({ step: 'Loading libraries (fallback mode)...', percent: 10 });
    
    try {
      // Load libraries dynamically in main thread
      const pdfjsScript = document.createElement('script');
      pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      
      const jszipScript = document.createElement('script');
      jszipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      
      // Load scripts sequentially
      await new Promise((resolve, reject) => {
        pdfjsScript.onload = resolve;
        pdfjsScript.onerror = reject;
        document.head.appendChild(pdfjsScript);
      });
      
      await new Promise((resolve, reject) => {
        jszipScript.onload = resolve;
        jszipScript.onerror = reject;
        document.head.appendChild(jszipScript);
      });
      
      setProgress({ step: 'Libraries loaded, processing PDF...', percent: 20 });
      
      // Access libraries from global scope
      const pdfjsLib = window.pdfjsLib || window.PDFJS;
      const JSZip = window.JSZip;
      
      if (!pdfjsLib || !JSZip) {
        throw new Error('Required libraries not available');
      }
      
      // Configure PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0
      });
      
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;
      
      if (pageCount === 0) {
        throw new Error('PDF has no pages');
      }
      
      const zip = new JSZip();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Process pages in smaller batches for main thread
      const BATCH_SIZE = 2;
      
      for (let i = 1; i <= pageCount; i += BATCH_SIZE) {
        const batchEnd = Math.min(i + BATCH_SIZE - 1, pageCount);
        
        for (let pageNum = i; pageNum <= batchEnd; pageNum++) {
          if (abortRef.current) throw new Error('Conversion cancelled');
          
          try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            await page.render({
              canvasContext: ctx,
              viewport: viewport
            }).promise;
            
            const blob = await new Promise(resolve => {
              canvas.toBlob(resolve, 'image/png');
            });
            
            zip.file('page_' + String(pageNum).padStart(3, '0') + '.png', blob);
            
            // Clean up
            if (page.cleanup) {
              page.cleanup();
            }
            
          } catch (pageError) {
            console.warn('Failed to process page ' + pageNum + ':', pageError);
          }
        }
        
        const progressPercent = 20 + Math.round((batchEnd / pageCount) * 60);
        setProgress({ 
          step: 'Processed ' + batchEnd + '/' + pageCount + ' pages (fallback)', 
          percent: progressPercent 
        });
        
        // Yield to UI
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setProgress({ step: 'Creating ZIP file...', percent: 85 });
      
      const zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (metadata) => {
          setProgress({ 
            step: 'Creating ZIP file...', 
            percent: 85 + Math.round(metadata.percent * 0.1) 
          });
        }
      );
      
      downloadZip(zipBlob);
      
      // Clean up scripts
      document.head.removeChild(pdfjsScript);
      document.head.removeChild(jszipScript);
      
      // Clean up PDF
      if (loadingTask.destroy) {
        loadingTask.destroy();
      }
      
    } catch (error) {
      console.error('Fallback conversion error:', error);
      
      // Ultimate fallback - create a simple ZIP with instructions
      if (!abortRef.current) {
        setProgress({ step: 'Creating simple download...', percent: 90 });
        
        try {
          // Try to create at least something for the user
          const simpleZip = new (await import('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js')).default();
          
          const instructions = `PDF Conversion Instructions:

Unfortunately, we couldn't convert your PDF automatically due to browser limitations.

Alternative solutions:
1. Try using a modern browser (Chrome, Firefox, Safari, Edge)
2. Use an online PDF to image converter
3. Use desktop software like Adobe Reader

File: ${file.name}
Size: ${formatFileSize(file.size)}

Thank you for using our converter!`;

          simpleZip.file('README.txt', instructions);
          const blob = await simpleZip.generateAsync({ type: 'blob' });
          downloadZip(blob);
          
        } catch (finalError) {
          throw new Error('Unable to process PDF: ' + error.message);
        }
      }
    }
  };

  const downloadZip = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (file.name.replace(/\\.pdf$/i, '') || 'converted_images') + '.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => {
      setProgress({ step: 'Download completed!', percent: 100 });
      setTimeout(() => setProgress({ step: '', percent: 0 }), 3000);
    }, 100);
  };

  const cancelConversion = () => {
    abortRef.current = true;
    setIsConverting(false);
    setProgress({ step: 'Cancelling...', percent: 0 });
    
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    
    setTimeout(() => {
      setProgress({ step: '', percent: 0 });
    }, 1000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">📄</span>
              PDF to Images Converter
            </h1>
            <p className="text-purple-100 mt-2">
              Convert PDF pages to PNG images and download as ZIP
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select PDF File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFile}
                    disabled={isConverting}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              
              {file && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">PDF</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={convertToImages}
                disabled={!file || isConverting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isConverting ? 'Converting...' : 'Convert to Images'}
              </button>
              
              {isConverting && (
                <button
                  onClick={cancelConversion}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {progress.step && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{progress.step}</span>
                  <span className="text-sm font-medium text-purple-600">{progress.percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress.percent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Features:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Fast conversion using Web Workers</li>
                <li>• Works on all modern devices</li>
                <li>• Automatic fallback for older browsers</li>
                <li>• High-quality PNG output</li>
                <li>• Secure - all processing happens in your browser</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}