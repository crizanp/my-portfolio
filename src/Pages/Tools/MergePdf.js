import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function MergePdf() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [mergedFile, setMergedFile] = useState(null);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    useEffect(() => {
        const appRoot = document.getElementById('app-root');
        if (appRoot) appRoot.classList.add('hide-profile');
        return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
    }, []);

    // Handle file selection
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files || []);
        addFiles(files);
    };

    const addFiles = async (files) => {
        const validFiles = [];
        
        for (const file of files) {
            if (file.type !== 'application/pdf') {
                setError(`${file.name} is not a PDF file. Only PDF files are allowed.`);
                continue;
            }
            
            if (file.size > 100 * 1024 * 1024) { // 100MB limit per file
                setError(`${file.name} is too large. Please use files smaller than 100MB.`);
                continue;
            }
            
            // Check if file already exists
            const exists = selectedFiles.some(existingFile => 
                existingFile.name === file.name && existingFile.size === file.size
            );
            
            if (!exists) {
                try {
                    // Get page count for the file
                    const pageCount = await getPdfPageCount(file);
                    validFiles.push({
                        id: Date.now() + Math.random(),
                        file,
                        name: file.name,
                        size: file.size,
                        pageCount,
                        status: 'ready'
                    });
                } catch (err) {
                    setError(`Failed to read ${file.name}. It might be corrupted.`);
                }
            }
        }
        
        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
            setError('');
        }
    };

    // Get PDF page count
    async function getPdfPageCount(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const pageCount = pdf.numPages;
            await pdf.destroy();
            return pageCount;
        } catch (err) {
            console.error('Error reading PDF:', err);
            throw new Error('Invalid PDF file');
        }
    }

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = Array.from(e.dataTransfer.files || []);
        addFiles(files);
    };

    // Remove file from list
    const removeFile = (id) => {
        setSelectedFiles(prev => prev.filter(file => file.id !== id));
        setError('');
    };

    // Move file up in the list
    const moveFileUp = (index) => {
        if (index > 0) {
            const newFiles = [...selectedFiles];
            [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
            setSelectedFiles(newFiles);
        }
    };

    // Move file down in the list
    const moveFileDown = (index) => {
        if (index < selectedFiles.length - 1) {
            const newFiles = [...selectedFiles];
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
            setSelectedFiles(newFiles);
        }
    };

    // Merge PDFs using pdf-lib (this will require pdf-lib to be installed)
    const mergePdfs = async () => {
        if (selectedFiles.length < 2) {
            setError('Please select at least 2 PDF files to merge.');
            return;
        }

        setIsProcessing(true);
        setStatus('Initializing PDF merge...');
        setProgress(0);
        setError('');
        setMergedFile(null);

        try {
            // Import pdf-lib dynamically
            const { PDFDocument } = await import('pdf-lib');
            
            // Create a new PDF document
            const mergedPdf = await PDFDocument.create();
            
            let processedFiles = 0;
            const totalFiles = selectedFiles.length;
            
            // Process each PDF file
            for (const fileData of selectedFiles) {
                try {
                    setStatus(`Processing ${fileData.name}...`);
                    
                    // Read the PDF file
                    const arrayBuffer = await fileData.file.arrayBuffer();
                    const pdf = await PDFDocument.load(arrayBuffer);
                    
                    // Copy all pages from this PDF
                    const pageIndices = Array.from({ length: pdf.getPageCount() }, (_, i) => i);
                    const pages = await mergedPdf.copyPages(pdf, pageIndices);
                    
                    // Add pages to the merged PDF
                    pages.forEach(page => mergedPdf.addPage(page));
                    
                    processedFiles++;
                    const currentProgress = Math.round((processedFiles / totalFiles) * 100);
                    setProgress(currentProgress);
                    setStatus(`Processed ${processedFiles} of ${totalFiles} files (${currentProgress}%)...`);
                    
                    // Update file status
                    setSelectedFiles(prev => prev.map(file => 
                        file.id === fileData.id 
                            ? { ...file, status: 'processed' }
                            : file
                    ));
                    
                } catch (fileError) {
                    console.error(`Error processing ${fileData.name}:`, fileError);
                    setError(`Failed to process ${fileData.name}. Continuing with other files...`);
                    
                    // Update file status to error
                    setSelectedFiles(prev => prev.map(file => 
                        file.id === fileData.id 
                            ? { ...file, status: 'error' }
                            : file
                    ));
                }
            }
            
            setStatus('Generating merged PDF...');
            
            // Generate the merged PDF
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            
            // Calculate total pages
            const totalPages = selectedFiles.reduce((sum, file) => 
                file.status === 'processed' ? sum + file.pageCount : sum, 0
            );
            
            setMergedFile({
                blob,
                name: 'merged_document.pdf',
                size: blob.size,
                pageCount: totalPages
            });
            
            setStatus('PDF merge completed successfully!');
            setProgress(100);
            
        } catch (err) {
            console.error('Error merging PDFs:', err);
            if (err.message.includes('pdf-lib')) {
                setError('PDF processing library not available. Please install pdf-lib dependency.');
            } else {
                setError(`Error merging PDFs: ${err.message}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Download merged PDF
    const downloadMergedPdf = () => {
        if (!mergedFile) return;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(mergedFile.blob);
        link.download = mergedFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Clear all files
    const clearAll = () => {
        setSelectedFiles([]);
        setMergedFile(null);
        setError('');
        setStatus('');
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const totalPages = selectedFiles.reduce((sum, file) => sum + file.pageCount, 0);
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

    return (
        <div className="card-inner">
            <div className="card-wrap">
                <div className="content private">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div className="title"><span className="first-word">Merge </span>PDFs</div>
                            <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                                <div style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>Combine multiple PDF files into a single document.</div>
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
                            border: `2px dashed ${dragActive ? '#6a2bff' : '#e6e9ee'}`, 
                            borderRadius: 8, 
                            padding: 40, 
                            textAlign: 'center',
                            background: dragActive ? '#f8f7ff' : '#fff',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }}>📄</div>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                            Drag & drop PDF files here or click to browse
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            Select multiple PDF files to merge (up to 100MB each)
                        </div>
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            multiple
                            onChange={handleFileSelect}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* File List */}
                    {selectedFiles.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ fontSize: 16, fontWeight: 500 }}>
                                    Selected Files ({selectedFiles.length})
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                    {totalPages} pages • {(totalSize / (1024 * 1024)).toFixed(2)} MB total
                                </div>
                            </div>
                            
                            <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                                Files will be merged in the order shown below. Use ↑↓ buttons to reorder.
                            </div>

                            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e6e9ee', borderRadius: 8 }}>
                                {selectedFiles.map((fileData, index) => (
                                    <div key={fileData.id} style={{ 
                                        padding: 12, 
                                        borderBottom: index < selectedFiles.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 12,
                                        background: fileData.status === 'processed' ? '#f0f8f0' : 
                                                   fileData.status === 'error' ? '#fdf2f2' : '#fff'
                                    }}>
                                        <div style={{ fontSize: 18 }}>
                                            {fileData.status === 'processed' ? '✅' : 
                                             fileData.status === 'error' ? '❌' : '📄'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {fileData.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                                                {fileData.pageCount} pages • {(fileData.size / (1024 * 1024)).toFixed(2)} MB
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button
                                                onClick={() => moveFileUp(index)}
                                                disabled={index === 0 || isProcessing}
                                                style={{ 
                                                    padding: '4px 8px', 
                                                    background: index === 0 ? '#f5f5f5' : '#0b76ef', 
                                                    color: index === 0 ? '#999' : '#fff',
                                                    border: 'none', 
                                                    borderRadius: 4, 
                                                    cursor: index === 0 || isProcessing ? 'not-allowed' : 'pointer',
                                                    fontSize: 12
                                                }}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveFileDown(index)}
                                                disabled={index === selectedFiles.length - 1 || isProcessing}
                                                style={{ 
                                                    padding: '4px 8px', 
                                                    background: index === selectedFiles.length - 1 ? '#f5f5f5' : '#0b76ef', 
                                                    color: index === selectedFiles.length - 1 ? '#999' : '#fff',
                                                    border: 'none', 
                                                    borderRadius: 4, 
                                                    cursor: index === selectedFiles.length - 1 || isProcessing ? 'not-allowed' : 'pointer',
                                                    fontSize: 12
                                                }}
                                            >
                                                ↓
                                            </button>
                                            <button
                                                onClick={() => removeFile(fileData.id)}
                                                disabled={isProcessing}
                                                style={{ 
                                                    padding: '4px 8px', 
                                                    background: 'transparent', 
                                                    color: '#999',
                                                    border: '1px solid #ddd', 
                                                    borderRadius: 4, 
                                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                    fontSize: 12
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <button
                            onClick={mergePdfs}
                            disabled={selectedFiles.length < 2 || isProcessing}
                            style={{
                                padding: '10px 14px',
                                background: (selectedFiles.length < 2 || isProcessing) ? '#ccc' : '#6a2bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                cursor: (selectedFiles.length < 2 || isProcessing) ? 'not-allowed' : 'pointer',
                                opacity: (selectedFiles.length < 2 || isProcessing) ? 0.7 : 1,
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
                            {isProcessing ? 'Merging PDFs...' : 'Merge PDFs'}
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
                            Clear All
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {isProcessing && progress > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
                                <span>Merging PDFs...</span>
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
                    {status && !mergedFile && !error && (
                        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                            {status}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && <div style={{ marginTop: 12, color: '#8a0f0f', fontSize: 14 }}>{error}</div>}

                    {/* Download Section */}
                    {mergedFile && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ textAlign: 'center', padding: 20, border: '1px solid #e6e9ee', borderRadius: 8, background: '#f8f9fa' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                                    PDF merge completed successfully!
                                </div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                                    {mergedFile.name} • {mergedFile.pageCount} pages • {(mergedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </div>
                                <button 
                                    onClick={downloadMergedPdf}
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
                                    Download Merged PDF
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Info Modal */}
                    {showModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>About PDF Merger</div>
                                    <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
                                </div>
                                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#555' }}>
                                    <p>Combine multiple PDF documents into a single file:</p>
                                    <ul style={{ marginLeft: 20, marginTop: 12 }}>
                                        <li>• <strong>Client-side processing:</strong> Your PDFs never leave your browser</li>
                                        <li>• <strong>Multiple files:</strong> Select and merge 2 or more PDF files</li>
                                        <li>• <strong>Custom order:</strong> Reorder files using ↑↓ buttons before merging</li>
                                        <li>• <strong>Page preservation:</strong> All pages and formatting maintained</li>
                                        <li>• <strong>File size limit:</strong> Up to 100MB per PDF file</li>
                                        <li>• <strong>Quality maintained:</strong> No compression or quality loss</li>
                                    </ul>
                                    <p style={{ marginTop: 12 }}>Perfect for combining documents, reports, or creating comprehensive PDF collections.</p>
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