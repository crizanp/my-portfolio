import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToImages() {
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [isConverting, setIsConverting] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [convertedFile, setConvertedFile] = useState(null);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [imageFormat, setImageFormat] = useState('jpg');
    const [imageQuality, setImageQuality] = useState(0.95);
    const [scale, setScale] = useState(2.0);
    const [pageCount, setPageCount] = useState(0);
    
    const pdfInputRef = useRef(null);
    const fileDropRef = useRef(null);

    useEffect(() => {
        const appRoot = document.getElementById('app-root');
        if (appRoot) appRoot.classList.add('hide-profile');
        return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
    }, []);

    const handlePdfSelect = (event) => {
        const file = event.target.files[0];
        handleFileSelection(file);
    };

    const handleFileSelection = async (file) => {
        if (!file || file.type !== 'application/pdf') {
            setError('Please select a valid PDF file.');
            return;
        }

        if (file.size > 200 * 1024 * 1024) { 
            setError('PDF file is too large. Please use a file smaller than 200MB.');
            return;
        }

        setSelectedPdf(file);
        setError('');
        setStatus('PDF selected: ' + file.name);
        setConvertedFile(null);
        
        try {
            setStatus('Analyzing PDF structure...');
            const pageCount = await loadPdfPageCountOptimized(file);
            setPageCount(pageCount);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF. The file might be corrupted.');
        }
    };

    async function loadPdfPageCountOptimized(file) {
        try {
            if (file.size > 50 * 1024 * 1024) {
                const chunkSize = 2 * 1024 * 1024; // 2MB chunk
                const chunk = file.slice(0, Math.min(chunkSize, file.size));
                const arrayBuffer = await chunk.arrayBuffer();
                
                const pdf = await pdfjsLib.getDocument({ 
                    data: arrayBuffer,
                    verbosity: 0,
                    enableXfa: false,
                    stopAtErrors: false
                }).promise;
                
                const numPages = pdf.numPages;
                await pdf.destroy();
                return numPages;
            } else {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const numPages = pdf.numPages;
                await pdf.destroy();
                return numPages;
            }
        } catch (err) {
            const estimatedPages = Math.ceil(file.size / (100 * 1024)); // ~100KB per page estimate
            console.warn('Could not read PDF structure, estimating pages:', estimatedPages);
            return Math.min(estimatedPages, 500); // Cap at 500 pages
        }
    }

    // Handle drag events
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (fileDropRef.current) {
            fileDropRef.current.style.borderColor = '#6a2bff';
            fileDropRef.current.style.backgroundColor = '#f8f7ff';
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (fileDropRef.current) {
            fileDropRef.current.style.borderColor = '#e6e9ee';
            fileDropRef.current.style.backgroundColor = '#fff';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (fileDropRef.current) {
            fileDropRef.current.style.borderColor = '#e6e9ee';
            fileDropRef.current.style.backgroundColor = '#fff';
        }
        
        const file = e.dataTransfer.files[0];
        handleFileSelection(file);
    };

    async function renderPdfPageToCanvas(pdf, pageNumber, scale = 2.0) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        const maxDimension = getMaxCanvasDimension();
        let adjustedScale = scale;
        
        if (viewport.width > maxDimension || viewport.height > maxDimension) {
            const scaleX = maxDimension / viewport.width;
            const scaleY = maxDimension / viewport.height;
            adjustedScale = Math.min(scaleX, scaleY) * scale;
        }
        
        const adjustedViewport = page.getViewport({ scale: adjustedScale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = adjustedViewport.height;
        canvas.width = adjustedViewport.width;
        
        const renderContext = {
            canvasContext: context,
            viewport: adjustedViewport
        };
        
        await page.render(renderContext).promise;
        page.cleanup();
        
        return canvas;
    }

    function getMaxCanvasDimension() {
        const memoryInfo = navigator.deviceMemory || 4; // Default to 4GB if not available
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            return memoryInfo > 6 ? 3072 : 2048; 
        } else {
            if (memoryInfo >= 8) return 5120;      
            if (memoryInfo >= 4) return 4096;     
            return 2048;                          
        }
    }

    function canvasToBlob(canvas, format, quality) {
        return new Promise((resolve) => {
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            canvas.toBlob(resolve, mimeType, quality);
        });
    }

    // Convert PDF to images and zip them with large file optimization
    const convertPdfToImages = async () => {
        if (!selectedPdf) {
            setError('Please select a PDF file to convert.');
            return;
        }

        setIsConverting(true);
        setStatus('Preparing to convert PDF...');
        setProgress(0);
        setConvertedFile(null);
        setError('');

        let pdf = null;

        try {
            setStatus('Loading PDF document...');
            
            const loadingTask = pdfjsLib.getDocument({
                url: URL.createObjectURL(selectedPdf),
                verbosity: 0,
                enableXfa: false,
                disableAutoFetch: true,     
                disableStream: false,        
                disableRange: false,        
                cMapPacked: true
            });

            pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;

            if (totalPages > 500) { // Increased page limit
                setError('PDF has too many pages (>500). Please use a smaller document or contact support for batch processing.');
                return;
            }

            setStatus('Initializing conversion process...');

            const zip = new JSZip();
            
            const batchSize = getBatchSize(selectedPdf.size);
            let processedPages = 0;
            
            setStatus('Converting pages to images...');

            for (let startPage = 1; startPage <= totalPages; startPage += batchSize) {
                const endPage = Math.min(startPage + batchSize - 1, totalPages);
                
                if (window.gc) {
                    window.gc();
                }
                
                await new Promise(resolve => setTimeout(resolve, 50));
                
                for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                    try {
                        const canvas = await renderPdfPageToCanvas(pdf, pageNum, scale);
                        const imageBlob = await canvasToBlob(canvas, imageFormat, imageQuality);
                        
                        const fileName = `page_${pageNum.toString().padStart(3, '0')}.${imageFormat}`;
                        zip.file(fileName, imageBlob);
                        
                        processedPages++;
                        
                        const currentProgress = Math.round((processedPages / totalPages) * 100);
                        setProgress(currentProgress);
                        setStatus(`Converting page ${pageNum} of ${totalPages} (${currentProgress}%)...`);
                        
                        canvas.width = 1;
                        canvas.height = 1;
                        
                        if (pageNum % 2 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 5));
                        }
                        
                    } catch (pageError) {
                        console.error(`Error converting page ${pageNum}:`, pageError);
                        setError(`Failed to convert page ${pageNum}. Continuing with other pages...`);
                    }
                }
                
                if (startPage % (batchSize * 3) === 1) {
                    setStatus(`Processing batch ${Math.ceil(startPage / batchSize)} of ${Math.ceil(totalPages / batchSize)}...`);
                }
            }
            
            setStatus('Creating ZIP file...');
            
            const zipBlob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 4 },
                streamFiles: true 
            });
            
            setConvertedFile({
                blob: zipBlob,
                name: `${selectedPdf.name.replace('.pdf', '')}_images.zip`
            });
            
            setStatus('Conversion completed! Your file is ready for download.');
            
        } catch (err) {
            console.error('Error converting PDF to images:', err);
            
            if (err.message.includes('Array buffer allocation failed') || 
                err.message.includes('out of memory') ||
                err.message.includes('Maximum call stack')) {
                setError('PDF file is too large for your browser to process. Try reducing the scale setting or splitting the PDF into smaller parts.');
            } else if (err.message.includes('Invalid PDF')) {
                setError('Invalid or corrupted PDF file. Please try a different file.');
            } else if (err.message.includes('AbortError')) {
                setError('Conversion was cancelled or interrupted. Please try again.');
            } else {
                setError(`Error converting PDF to images: ${err.message}`);
            }
        } finally {
            // Clean up resources
            if (pdf) {
                try {
                    await pdf.destroy();
                } catch (destroyError) {
                    console.warn('Error destroying PDF:', destroyError);
                }
            }
            
            setIsConverting(false);
        }
    };

    function getBatchSize(fileSize) {
        const memoryInfo = navigator.deviceMemory || 4;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            return fileSize > 50 * 1024 * 1024 ? 2 : 3; // Very small batches for mobile
        } else {
            if (memoryInfo >= 8) {
                return fileSize > 100 * 1024 * 1024 ? 3 : 5; // High-end desktop
            } else if (memoryInfo >= 4) {
                return fileSize > 50 * 1024 * 1024 ? 2 : 4;  // Mid-range desktop
            } else {
                return 2; // Low-end desktop
            }
        }
    }

    const handleDownload = () => {
        if (convertedFile) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(convertedFile.blob);
            link.download = convertedFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Reset the form
    const handleReset = () => {
        setSelectedPdf(null);
        setStatus('');
        setProgress(0);
        setConvertedFile(null);
        setError('');
        setPageCount(0);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
    };

    return (
        <div className="card-inner">
            <div className="card-wrap">
                <div className="content private">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div className="title"><span className="first-word">PDF </span>to Images</div>
                            <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                                <div style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>Convert PDF pages to images and download as ZIP.</div>
                                <button onClick={() => setShowModal(true)} style={{ background: 'transparent', border: 'none', color: '#0b76ef', fontSize: 13, cursor: 'pointer', padding: 0 }}>What is this?</button>
                            </div>
                        </div>
                    </div>

                    {/* File Drop Area */}
                    <div 
                        ref={fileDropRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{ 
                            marginTop: 20, 
                            border: '2px dashed #e6e9ee', 
                            borderRadius: 8, 
                            padding: 40, 
                            textAlign: 'center',
                            background: '#fff',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onClick={() => pdfInputRef.current?.click()}
                    >
                        <div style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }}>📄</div>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                            Drag & drop your PDF here or click to browse
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            Supports PDF files up to 200MB (Large files may take longer to process)
                        </div>
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handlePdfSelect}
                            ref={pdfInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Selected File Preview */}
                    {selectedPdf && (
                        <div style={{ marginTop: 16, padding: 12, border: '1px solid #e6e9ee', borderRadius: 8, background: '#f8f9fa', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 20 }}>📄</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: 14 }}>{selectedPdf.name}</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                                    {(selectedPdf.size / (1024 * 1024)).toFixed(2)} MB
                                    {pageCount > 0 && ` • ${pageCount} page${pageCount !== 1 ? 's' : ''}`}
                                    {selectedPdf.size > 50 * 1024 * 1024 && (
                                        <span style={{ color: '#f59e0b', marginLeft: 8 }}>
                                            ⚠️ Large file - processing may take time
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={handleReset}
                                disabled={isConverting}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    fontSize: 18, 
                                    cursor: isConverting ? 'not-allowed' : 'pointer',
                                    color: '#999',
                                    padding: 4
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Configuration Options */}
                    {selectedPdf && (
                        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 14, fontWeight: 500 }}>Image Format</label>
                                <select
                                    value={imageFormat}
                                    onChange={(e) => setImageFormat(e.target.value)}
                                    style={{ width: '100%', padding: 8, marginTop: 4, border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14 }}
                                >
                                    <option value="jpg">JPEG (Recommended for large files)</option>
                                    <option value="png">PNG</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style={{ fontSize: 14, fontWeight: 500 }}>Quality ({Math.round(imageQuality * 100)}%)</label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.05"
                                    value={imageQuality}
                                    onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                                    style={{ width: '100%', marginTop: 4 }}
                                />
                                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                                    {selectedPdf.size > 100 * 1024 * 1024 && 'Lower quality recommended for large files'}
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ fontSize: 14, fontWeight: 500 }}>Scale ({scale}x)</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.25"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                    style={{ width: '100%', marginTop: 4 }}
                                />
                                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                                    {selectedPdf.size > 100 * 1024 * 1024 ? 
                                        'Use 1x scale for very large files' : 
                                        'Lower scale = smaller file size'
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Large file processing notice */}
                    {selectedPdf && selectedPdf.size > 100 * 1024 * 1024 && (
                        <div style={{ marginTop: 12, padding: 12, background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 6, fontSize: 13 }}>
                            <div style={{ fontWeight: 500, color: '#856404', marginBottom: 4 }}>Large File Processing</div>
                            <div style={{ color: '#856404' }}>
                                • Processing may take several minutes
                                • Consider using JPEG format and lower quality/scale for faster processing
                                • Keep this tab active during conversion
                                • Large files are processed in optimized batches to prevent memory issues
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <button
                            onClick={convertPdfToImages}
                            disabled={!selectedPdf || isConverting}
                            style={{
                                padding: '10px 14px',
                                background: (!selectedPdf || isConverting) ? '#ccc' : '#6a2bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                cursor: (!selectedPdf || isConverting) ? 'not-allowed' : 'pointer',
                                opacity: (!selectedPdf || isConverting) ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            {isConverting && (
                                <div style={{ 
                                    width: 14, 
                                    height: 14, 
                                    border: '2px solid #fff', 
                                    borderTop: '2px solid transparent', 
                                    borderRadius: '50%', 
                                    animation: 'spin 1s linear infinite' 
                                }}></div>
                            )}
                            {isConverting ? 'Converting...' : 'Convert to Images'}
                        </button>
                        
                        <button
                            onClick={handleReset}
                            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                        >
                            Clear
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {isConverting && progress > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
                                <span>Converting pages...</span>
                                <span>{progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        background: '#6a2bff',
                                        width: `${progress}%`,
                                        transition: 'width 0.3s ease'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Status Message */}
                    {status && !convertedFile && !error && (
                        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                            {status}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && <div style={{ marginTop: 12, color: '#8a0f0f', fontSize: 14 }}>{error}</div>}

                    {/* Download Section */}
                    {convertedFile && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ textAlign: 'center', padding: 20, border: '1px solid #e6e9ee', borderRadius: 8, background: '#f8f9fa' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                                    Your file is ready for download!
                                </div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                                    {convertedFile.name}
                                </div>
                                <button 
                                    onClick={handleDownload}
                                    style={{ 
                                        padding: '12px 20px', 
                                        background: '#0b76ef', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: 8, 
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 500
                                    }}
                                >
                                    Download ZIP File
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Info Modal */}
                    {showModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>About PDF to Images</div>
                                    <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
                                </div>
                                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#555' }}>
                                    <p>Convert PDF documents to individual image files:</p>
                                    <ul style={{ marginLeft: 20, marginTop: 12 }}>
                                        <li>• <strong>Client-side processing:</strong> Your PDF never leaves your browser</li>
                                        <li>• <strong>Multiple formats:</strong> Export as PNG or JPEG images</li>
                                        <li>• <strong>Quality control:</strong> Adjust image quality and scale</li>
                                        <li>• <strong>ZIP download:</strong> All images packaged in a single ZIP file</li>
                                        <li>• <strong>High quality:</strong> Vector-based rendering for crisp images</li>
                                    </ul>
                                    <p style={{ marginTop: 12 }}>Perfect for extracting diagrams, presentations, or creating image backups of your PDFs.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add spinner animation */}
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}
