import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function SplitPdf() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [splitFiles, setSplitFiles] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [splitMode, setSplitMode] = useState('pages'); // 'pages', 'ranges', 'every'
    const [customRanges, setCustomRanges] = useState('');
    const [everyNPages, setEveryNPages] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [previewPages, setPreviewPages] = useState([]);
    
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    useEffect(() => {
        const appRoot = document.getElementById('app-root');
        if (appRoot) appRoot.classList.add('hide-profile');
        return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
    }, []);

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        handleFileSelection(file);
    };

    const handleFileSelection = async (file) => {
        if (!file || file.type !== 'application/pdf') {
            setError('Please select a valid PDF file.');
            return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            setError('PDF file is too large. Please use a file smaller than 100MB.');
            return;
        }

        setSelectedFile(file);
        setError('');
        setStatus('PDF selected: ' + file.name);
        setSplitFiles([]);
        setPreviewPages([]);
        
        // Load page count and generate preview
        try {
            setStatus('Analyzing PDF structure...');
            const { pageCount, previews } = await analyzePdf(file);
            setPageCount(pageCount);
            setPreviewPages(previews);
            setStatus(`PDF loaded: ${pageCount} pages`);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF. The file might be corrupted.');
        }
    };

    // Analyze PDF and generate page previews
    async function analyzePdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;
        const previews = [];

        // Generate previews for first few pages
        const maxPreviews = Math.min(10, pageCount);
        for (let i = 1; i <= maxPreviews; i++) {
            try {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.2 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                previews.push({
                    pageNumber: i,
                    thumbnail: imageData,
                    width: viewport.width,
                    height: viewport.height
                });
                
                page.cleanup();
            } catch (err) {
                console.error(`Error generating preview for page ${i}:`, err);
            }
        }

        await pdf.destroy();
        return { pageCount, previews };
    }

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropRef.current) {
            dropRef.current.style.borderColor = '#6a2bff';
            dropRef.current.style.backgroundColor = '#f8f7ff';
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropRef.current) {
            dropRef.current.style.borderColor = '#e6e9ee';
            dropRef.current.style.backgroundColor = '#fff';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (dropRef.current) {
            dropRef.current.style.borderColor = '#e6e9ee';
            dropRef.current.style.backgroundColor = '#fff';
        }
        
        const file = e.dataTransfer.files[0];
        handleFileSelection(file);
    };

    // Parse page ranges (e.g., "1-3,5,7-10")
    const parsePageRanges = (ranges) => {
        const pages = new Set();
        const rangeParts = ranges.split(',').map(part => part.trim());
        
        for (const part of rangeParts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(num => parseInt(num.trim()));
                if (start > 0 && end <= pageCount && start <= end) {
                    for (let i = start; i <= end; i++) {
                        pages.add(i);
                    }
                }
            } else {
                const pageNum = parseInt(part);
                if (pageNum > 0 && pageNum <= pageCount) {
                    pages.add(pageNum);
                }
            }
        }
        
        return Array.from(pages).sort((a, b) => a - b);
    };

    // Split PDF based on selected mode
    const splitPdf = async () => {
        if (!selectedFile) {
            setError('Please select a PDF file to split.');
            return;
        }

        setIsProcessing(true);
        setStatus('Initializing PDF split...');
        setProgress(0);
        setError('');
        setSplitFiles([]);

        try {
            // Import pdf-lib dynamically
            const { PDFDocument } = await import('pdf-lib');
            
            // Load the original PDF
            const arrayBuffer = await selectedFile.arrayBuffer();
            const originalPdf = await PDFDocument.load(arrayBuffer);
            
            let splitTargets = [];
            
            // Determine what to split based on mode
            switch (splitMode) {
                case 'pages':
                    // Split into individual pages
                    for (let i = 1; i <= pageCount; i++) {
                        splitTargets.push({
                            name: `page_${i.toString().padStart(3, '0')}.pdf`,
                            pages: [i - 1] // pdf-lib uses 0-based indexing
                        });
                    }
                    break;
                    
                case 'ranges':
                    // Split based on custom ranges
                    const ranges = parsePageRanges(customRanges);
                    if (ranges.length === 0) {
                        throw new Error('Please enter valid page ranges (e.g., "1-3,5,7-10")');
                    }
                    
                    // Group consecutive pages
                    let currentGroup = [ranges[0]];
                    for (let i = 1; i < ranges.length; i++) {
                        if (ranges[i] === ranges[i-1] + 1) {
                            currentGroup.push(ranges[i]);
                        } else {
                            // Save current group and start new one
                            const startPage = currentGroup[0];
                            const endPage = currentGroup[currentGroup.length - 1];
                            const name = startPage === endPage ? 
                                `page_${startPage}.pdf` : 
                                `pages_${startPage}-${endPage}.pdf`;
                            
                            splitTargets.push({
                                name,
                                pages: currentGroup.map(p => p - 1) // Convert to 0-based
                            });
                            
                            currentGroup = [ranges[i]];
                        }
                    }
                    
                    // Add the last group
                    if (currentGroup.length > 0) {
                        const startPage = currentGroup[0];
                        const endPage = currentGroup[currentGroup.length - 1];
                        const name = startPage === endPage ? 
                            `page_${startPage}.pdf` : 
                            `pages_${startPage}-${endPage}.pdf`;
                        
                        splitTargets.push({
                            name,
                            pages: currentGroup.map(p => p - 1)
                        });
                    }
                    break;
                    
                case 'every':
                    // Split every N pages
                    const n = parseInt(everyNPages);
                    if (n < 1 || n > pageCount) {
                        throw new Error(`Please enter a valid number between 1 and ${pageCount}`);
                    }
                    
                    for (let i = 0; i < pageCount; i += n) {
                        const endPage = Math.min(i + n - 1, pageCount - 1);
                        const startPageNum = i + 1;
                        const endPageNum = endPage + 1;
                        const name = startPageNum === endPageNum ? 
                            `page_${startPageNum}.pdf` : 
                            `pages_${startPageNum}-${endPageNum}.pdf`;
                        
                        const pages = [];
                        for (let j = i; j <= endPage; j++) {
                            pages.push(j);
                        }
                        
                        splitTargets.push({ name, pages });
                    }
                    break;
            }
            
            setStatus('Creating split PDF files...');
            const results = [];
            
            for (let i = 0; i < splitTargets.length; i++) {
                const target = splitTargets[i];
                
                try {
                    // Create new PDF for this split
                    const newPdf = await PDFDocument.create();
                    
                    // Copy pages to new PDF
                    const copiedPages = await newPdf.copyPages(originalPdf, target.pages);
                    copiedPages.forEach(page => newPdf.addPage(page));
                    
                    // Generate PDF bytes
                    const pdfBytes = await newPdf.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    
                    results.push({
                        id: i,
                        name: target.name,
                        blob,
                        size: blob.size,
                        pageCount: target.pages.length,
                        pageNumbers: target.pages.map(p => p + 1).join(', ')
                    });
                    
                    // Update progress
                    const currentProgress = Math.round(((i + 1) / splitTargets.length) * 100);
                    setProgress(currentProgress);
                    setStatus(`Created ${i + 1} of ${splitTargets.length} files (${currentProgress}%)...`);
                    
                } catch (splitError) {
                    console.error(`Error creating ${target.name}:`, splitError);
                    setError(`Failed to create ${target.name}. Continuing with other files...`);
                }
            }
            
            setSplitFiles(results);
            setStatus(`Split completed! Created ${results.length} PDF files.`);
            setProgress(100);
            
        } catch (err) {
            console.error('Error splitting PDF:', err);
            if (err.message.includes('pdf-lib')) {
                setError('PDF processing library not available. Please install pdf-lib dependency.');
            } else {
                setError(`Error splitting PDF: ${err.message}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Download individual split file
    const downloadFile = (file) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file.blob);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download all split files as ZIP
    const downloadAllAsZip = async () => {
        if (splitFiles.length === 0) return;
        
        try {
            setStatus('Creating ZIP file...');
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            
            splitFiles.forEach(file => {
                zip.file(file.name, file.blob);
            });
            
            const zipBlob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `${selectedFile.name.replace('.pdf', '')}_split.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setStatus('ZIP file downloaded successfully!');
        } catch (err) {
            setError('Failed to create ZIP file: ' + err.message);
        }
    };

    // Clear all
    const clearAll = () => {
        setSelectedFile(null);
        setSplitFiles([]);
        setError('');
        setStatus('');
        setProgress(0);
        setPageCount(0);
        setPreviewPages([]);
        setCustomRanges('');
        setEveryNPages(1);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="card-inner">
            <div className="card-wrap">
                <div className="content private">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div className="title"><span className="first-word">Split </span>PDF</div>
                            <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                                <div style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>Split PDF into individual pages or custom ranges.</div>
                                <button onClick={() => setShowModal(true)} style={{ background: 'transparent', border: 'none', color: '#0b76ef', fontSize: 13, cursor: 'pointer', padding: 0 }}>What is this?</button>
                            </div>
                        </div>
                    </div>

                    {/* File Drop Area */}
                    <div 
                        ref={dropRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
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
                    >
                        <div style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }}>📄</div>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                            Drag & drop your PDF here or click to browse
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            Supports PDF files up to 100MB
                        </div>
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleFileSelect}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Selected File Info */}
                    {selectedFile && (
                        <div style={{ marginTop: 16, padding: 12, border: '1px solid #e6e9ee', borderRadius: 8, background: '#f8f9fa', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 20 }}>📄</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: 14 }}>{selectedFile.name}</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    {pageCount > 0 && ` • ${pageCount} page${pageCount !== 1 ? 's' : ''}`}
                                </div>
                            </div>
                            <button 
                                onClick={clearAll}
                                disabled={isProcessing}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    fontSize: 18, 
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    color: '#999',
                                    padding: 4
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Page Previews */}
                    {previewPages.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Page Preview</div>
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0' }}>
                                {previewPages.map(preview => (
                                    <div key={preview.pageNumber} style={{ 
                                        minWidth: 60, 
                                        textAlign: 'center',
                                        border: '1px solid #e6e9ee',
                                        borderRadius: 4,
                                        padding: 4,
                                        background: '#fff'
                                    }}>
                                        <img 
                                            src={preview.thumbnail} 
                                            alt={`Page ${preview.pageNumber}`}
                                            style={{ 
                                                width: 50, 
                                                height: 'auto', 
                                                border: '1px solid #ddd',
                                                borderRadius: 2
                                            }}
                                        />
                                        <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                                            {preview.pageNumber}
                                        </div>
                                    </div>
                                ))}
                                {pageCount > previewPages.length && (
                                    <div style={{ 
                                        minWidth: 60, 
                                        height: 70,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#666',
                                        fontSize: 12,
                                        textAlign: 'center'
                                    }}>
                                        +{pageCount - previewPages.length} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Split Options */}
                    {selectedFile && pageCount > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Split Options</div>
                            
                            {/* Split Mode Selection */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 8, 
                                    padding: 12, 
                                    border: splitMode === 'pages' ? '2px solid #6a2bff' : '1px solid #e6e9ee',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    background: splitMode === 'pages' ? '#f8f7ff' : '#fff'
                                }}>
                                    <input 
                                        type="radio" 
                                        value="pages" 
                                        checked={splitMode === 'pages'}
                                        onChange={(e) => setSplitMode(e.target.value)}
                                        style={{ margin: 0 }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 14 }}>Individual Pages</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>Split into {pageCount} separate files</div>
                                    </div>
                                </label>
                                
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 8, 
                                    padding: 12, 
                                    border: splitMode === 'ranges' ? '2px solid #6a2bff' : '1px solid #e6e9ee',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    background: splitMode === 'ranges' ? '#f8f7ff' : '#fff'
                                }}>
                                    <input 
                                        type="radio" 
                                        value="ranges" 
                                        checked={splitMode === 'ranges'}
                                        onChange={(e) => setSplitMode(e.target.value)}
                                        style={{ margin: 0 }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 14 }}>Custom Ranges</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>Specify page ranges to extract</div>
                                    </div>
                                </label>
                                
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 8, 
                                    padding: 12, 
                                    border: splitMode === 'every' ? '2px solid #6a2bff' : '1px solid #e6e9ee',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    background: splitMode === 'every' ? '#f8f7ff' : '#fff'
                                }}>
                                    <input 
                                        type="radio" 
                                        value="every" 
                                        checked={splitMode === 'every'}
                                        onChange={(e) => setSplitMode(e.target.value)}
                                        style={{ margin: 0 }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 14 }}>Every N Pages</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>Group pages together</div>
                                    </div>
                                </label>
                            </div>
                            
                            {/* Custom Range Input */}
                            {splitMode === 'ranges' && (
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                                        Page Ranges (e.g., "1-3,5,7-10")
                                    </label>
                                    <input
                                        type="text"
                                        value={customRanges}
                                        onChange={(e) => setCustomRanges(e.target.value)}
                                        placeholder="Enter page ranges..."
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: '1px solid #e6e9ee', 
                                            borderRadius: 6, 
                                            fontSize: 14,
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                        Available pages: 1-{pageCount}
                                    </div>
                                </div>
                            )}
                            
                            {/* Every N Pages Input */}
                            {splitMode === 'every' && (
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                                        Pages per file
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={pageCount}
                                        value={everyNPages}
                                        onChange={(e) => setEveryNPages(e.target.value)}
                                        style={{ 
                                            width: '100px', 
                                            padding: '8px 12px', 
                                            border: '1px solid #e6e9ee', 
                                            borderRadius: 6, 
                                            fontSize: 14
                                        }}
                                    />
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                        Will create approximately {Math.ceil(pageCount / parseInt(everyNPages || 1))} files
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <button
                            onClick={splitPdf}
                            disabled={!selectedFile || isProcessing || pageCount === 0}
                            style={{
                                padding: '10px 14px',
                                background: (!selectedFile || isProcessing || pageCount === 0) ? '#ccc' : '#6a2bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                cursor: (!selectedFile || isProcessing || pageCount === 0) ? 'not-allowed' : 'pointer',
                                opacity: (!selectedFile || isProcessing || pageCount === 0) ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            {isProcessing && (
                                <div style={{ 
                                    width: 14, 
                                    height: 14, 
                                    border: '2px solid #fff', 
                                    borderTop: '2px solid transparent', 
                                    borderRadius: '50%', 
                                    animation: 'spin 1s linear infinite' 
                                }}></div>
                            )}
                            {isProcessing ? 'Splitting PDF...' : 'Split PDF'}
                        </button>
                        
                        <button
                            onClick={clearAll}
                            disabled={isProcessing}
                            style={{ 
                                padding: '10px 14px', 
                                borderRadius: 8, 
                                border: '1px solid #ddd', 
                                background: '#fff', 
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                opacity: isProcessing ? 0.7 : 1
                            }}
                        >
                            Clear
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {isProcessing && progress > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
                                <span>Splitting PDF...</span>
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
                    {status && splitFiles.length === 0 && !error && (
                        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                            {status}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && <div style={{ marginTop: 12, color: '#8a0f0f', fontSize: 14 }}>{error}</div>}

                    {/* Split Results */}
                    {splitFiles.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ fontSize: 16, fontWeight: 500 }}>
                                    Split Results ({splitFiles.length} files)
                                </div>
                                <button
                                    onClick={downloadAllAsZip}
                                    style={{ 
                                        padding: '8px 12px', 
                                        background: '#0b76ef', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: 6, 
                                        cursor: 'pointer',
                                        fontSize: 12
                                    }}
                                >
                                    Download All as ZIP
                                </button>
                            </div>
                            
                            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e6e9ee', borderRadius: 8 }}>
                                {splitFiles.map((file, index) => (
                                    <div key={file.id} style={{ 
                                        padding: 12, 
                                        borderBottom: index < splitFiles.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 12
                                    }}>
                                        <div style={{ fontSize: 18 }}>📄</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {file.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                                                {file.pageCount} page{file.pageCount !== 1 ? 's' : ''} • {(file.size / 1024).toFixed(1)} KB
                                                {file.pageNumbers && ` • Pages: ${file.pageNumbers}`}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(file)}
                                            style={{ 
                                                padding: '6px 10px', 
                                                background: '#6a2bff', 
                                                color: '#fff', 
                                                border: 'none', 
                                                borderRadius: 4, 
                                                cursor: 'pointer',
                                                fontSize: 12
                                            }}
                                        >
                                            Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info Modal */}
                    {showModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>About PDF Splitter</div>
                                    <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
                                </div>
                                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#555' }}>
                                    <p>Split PDF documents into separate files:</p>
                                    <ul style={{ marginLeft: 20, marginTop: 12 }}>
                                        <li>• <strong>Individual Pages:</strong> Extract each page as a separate PDF</li>
                                        <li>• <strong>Custom Ranges:</strong> Specify exact page ranges (e.g., "1-3,5,7-10")</li>
                                        <li>• <strong>Every N Pages:</strong> Group consecutive pages together</li>
                                        <li>• <strong>Page Preview:</strong> See thumbnail previews of your pages</li>
                                        <li>• <strong>Batch Download:</strong> Download all files as a ZIP archive</li>
                                        <li>• <strong>Client-side:</strong> All processing happens in your browser</li>
                                    </ul>
                                    <p style={{ marginTop: 12 }}>Perfect for extracting specific sections, creating individual handouts, or organizing large documents.</p>
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