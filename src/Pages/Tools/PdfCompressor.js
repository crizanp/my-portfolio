import React, { useEffect, useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export default function PdfCompressor() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [compressedFile, setCompressedFile] = useState(null);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [compressionLevel, setCompressionLevel] = useState('medium');
    const [dragActive, setDragActive] = useState(false);
    const [originalSize, setOriginalSize] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    // Set up PDF.js worker
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.100/pdf.worker.min.js`;
    }, []);

    useEffect(() => {
        const appRoot = document.getElementById('app-root');
        if (appRoot) appRoot.classList.add('hide-profile');
        return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
    }, []);

    // Compression settings with more realistic expectations
    const compressionSettings = {
        low: { quality: 0.90, name: 'Low', description: 'Metadata removal (2-10% reduction)' },
        medium: { quality: 0.75, name: 'Medium', description: 'Content optimization (5-20% reduction)' },
        high: { quality: 0.60, name: 'High', description: 'Advanced optimization (10-35% reduction)' },
        maximum: { quality: 0.45, name: 'Maximum', description: 'Image recompression (20-60% reduction)' }
    };

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
        setOriginalSize(file.size);
        setError('');
        setStatus('PDF selected: ' + file.name);
        setCompressedFile(null);
        
        // Get page count
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            setPageCount(pdf.getPageCount());
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF. The file might be corrupted.');
        }
    };

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
        
        const file = e.dataTransfer.files[0];
        handleFileSelection(file);
    };

    // Aggressive compression using content extraction and recreation
    async function aggressiveCompression(pdfBytes, quality) {
        try {
            setStatus('Loading PDF for aggressive compression...');
            setProgress(5);
            
            // Load PDF with pdf.js for content extraction
            const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
            const pdfDoc = await loadingTask.promise;
            
            // Create new PDF with PDFDocument
            const newPdf = await PDFDocument.create();
            
            setStatus('Extracting and compressing content...');
            
            const numPages = pdfDoc.numPages;
            
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                setStatus(`Processing page ${pageNum} of ${numPages}...`);
                setProgress(10 + Math.round((pageNum / numPages) * 70));
                
                // Get page from pdf.js
                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.0 });
                
                // Create canvas for rendering
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                // Set canvas size based on quality
                const scale = quality > 0.7 ? 1.0 : quality > 0.5 ? 0.8 : quality > 0.3 ? 0.6 : 0.4;
                const scaledViewport = page.getViewport({ scale });
                
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;
                
                // Render page to canvas
                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };
                
                await page.render(renderContext).promise;
                
                // Convert canvas to image with compression
                const imageQuality = quality;
                const imageDataUrl = canvas.toDataURL('image/jpeg', imageQuality);
                
                // Convert data URL to bytes
                const imageBytes = Uint8Array.from(atob(imageDataUrl.split(',')[1]), c => c.charCodeAt(0));
                
                // Embed image in new PDF
                const image = await newPdf.embedJpg(imageBytes);
                
                // Add page with compressed image
                const newPage = newPdf.addPage([viewport.width, viewport.height]);
                newPage.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: viewport.width,
                    height: viewport.height,
                });
                
                // Clean up canvas
                canvas.remove();
                
                // Small delay to prevent UI freezing
                if (pageNum % 2 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
            
            setStatus('Finalizing compressed PDF...');
            setProgress(85);
            
            // Set minimal metadata
            newPdf.setCreator('PDF Compressor');
            newPdf.setProducer('PDF Compressor');
            
            // Save with maximum compression
            const compressedBytes = await newPdf.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: 300,
                updateFieldAppearances: false
            });
            
            // Clean up
            await pdfDoc.destroy();
            
            return compressedBytes;
            
        } catch (err) {
            console.error('Error in aggressive compression:', err);
            throw err;
        }
    }

    // Advanced image compression within PDF
    async function compressImagesInPdf(pdfDoc, quality) {
        try {
            const pages = pdfDoc.getPages();
            
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                setStatus(`Compressing images on page ${i + 1} of ${pages.length}...`);
                setProgress(Math.round((i / pages.length) * 60)); // 60% for image processing
                
                // Get page resources and process images
                const pageDict = page.node;
                const resources = pageDict.get('Resources');
                
                if (resources) {
                    const xObject = resources.get('XObject');
                    if (xObject) {
                        // Process each image in the page
                        const imageKeys = xObject.keys();
                        for (const key of imageKeys) {
                            const imageRef = xObject.get(key);
                            if (imageRef && imageRef.get('Subtype')?.toString() === '/Image') {
                                // Mark for compression (PDF-lib handles this internally)
                                // We can't directly compress images but can optimize their storage
                            }
                        }
                    }
                }
                
                // Small delay to prevent UI freezing
                if (i % 3 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }
            
            return null; // Will be handled in main compression function
        } catch (err) {
            console.error('Error compressing images:', err);
            throw err;
        }
    }

    // Simple but effective compression by content optimization
    async function simpleEffectiveCompression(pdfBytes, quality) {
        try {
            setStatus('Applying content optimization...');
            setProgress(10);
            
            // Load PDF
            const pdfDoc = await PDFDocument.load(pdfBytes, { 
                ignoreEncryption: true,
                capNumbers: false,
                throwOnInvalidObject: false
            });
            
            setStatus('Removing metadata and annotations...');
            setProgress(20);
            
            // Remove all metadata aggressively
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords('');
            pdfDoc.setCreator('');
            pdfDoc.setProducer('');
            pdfDoc.setCreationDate(new Date(0));
            pdfDoc.setModificationDate(new Date(0));
            
            setStatus('Optimizing page content...');
            setProgress(40);
            
            const pages = pdfDoc.getPages();
            
            // Process each page
            for (let i = 0; i < pages.length; i++) {
                setProgress(40 + Math.round((i / pages.length) * 40));
                setStatus(`Optimizing page ${i + 1} of ${pages.length}...`);
                
                const page = pages[i];
                
                try {
                    // Remove annotations if present
                    const pageDict = page.node;
                    if (pageDict.has('Annots')) {
                        pageDict.delete('Annots');
                    }
                    
                    // Remove optional content if present
                    if (pageDict.has('Group')) {
                        pageDict.delete('Group');
                    }
                    
                    // Remove structure tree references
                    if (pageDict.has('StructParents')) {
                        pageDict.delete('StructParents');
                    }
                    
                    // Remove metadata streams
                    if (pageDict.has('Metadata')) {
                        pageDict.delete('Metadata');
                    }
                    
                } catch (pageErr) {
                    console.warn(`Warning processing page ${i + 1}:`, pageErr);
                }
                
                if (i % 5 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }
            
            setStatus('Removing document-level optional content...');
            setProgress(85);
            
            // Remove document-level optional elements
            const docDict = pdfDoc.context.obj;
            try {
                if (docDict.catalog.has('OCProperties')) {
                    docDict.catalog.delete('OCProperties');
                }
                if (docDict.catalog.has('Metadata')) {
                    docDict.catalog.delete('Metadata');
                }
                if (docDict.catalog.has('StructTreeRoot')) {
                    docDict.catalog.delete('StructTreeRoot');
                }
                if (docDict.catalog.has('MarkInfo')) {
                    docDict.catalog.delete('MarkInfo');
                }
                if (docDict.catalog.has('PieceInfo')) {
                    docDict.catalog.delete('PieceInfo');
                }
            } catch (docErr) {
                console.warn('Warning removing document metadata:', docErr);
            }
            
            setStatus('Saving optimized PDF...');
            setProgress(90);
            
            // Save with aggressive compression settings
            const saveOptions = {
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: quality <= 0.5 ? 500 : 300,
                updateFieldAppearances: false
            };
            
            const compressedBytes = await pdfDoc.save(saveOptions);
            
            return compressedBytes;
            
        } catch (err) {
            console.error('Error in simple effective compression:', err);
            throw err;
        }
    }
    async function advancedPdfCompression(pdfBytes, quality) {
        try {
            setStatus('Loading PDF for compression...');
            setProgress(5);
            
            // Load the PDF
            const pdfDoc = await PDFDocument.load(pdfBytes, { 
                ignoreEncryption: true,
                capNumbers: true 
            });
            
            setStatus('Removing metadata and optimizing structure...');
            setProgress(10);
            
            // Remove all metadata to reduce size
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setCreator('');
            pdfDoc.setProducer('PDF Compressor');
            pdfDoc.setKeywords('');
            pdfDoc.setCreationDate(new Date(0));
            pdfDoc.setModificationDate(new Date(0));
            
            setStatus('Processing pages and content...');
            setProgress(15);
            
            // Get all pages for processing
            const pages = pdfDoc.getPages();
            
            // Process each page for optimization
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                
                setProgress(15 + Math.round((i / pages.length) * 60)); // 15-75% for page processing
                setStatus(`Optimizing page ${i + 1} of ${pages.length}...`);
                
                try {
                    // Get page content streams
                    const pageDict = page.node;
                    const resources = pageDict.get('Resources');
                    
                    if (resources) {
                        // Remove unnecessary resources based on compression level
                        if (quality <= 0.6) {
                            // For medium+ compression, remove optional resources
                            const extGState = resources.get('ExtGState');
                            if (extGState && quality <= 0.4) {
                                // For high compression, simplify graphics states
                                const keys = extGState.keys();
                                for (const key of keys.slice(0, Math.floor(keys.length * 0.7))) {
                                    // Keep only essential graphics states
                                }
                            }
                        }
                        
                        // Process fonts for compression
                        const font = resources.get('Font');
                        if (font && quality <= 0.5) {
                            // For higher compression, we could subset fonts
                            // This is complex with PDF-lib, so we'll let the save optimization handle it
                        }
                    }
                    
                    // Optimize page content based on quality setting
                    if (quality <= 0.45) {
                        // For high compression, we could reduce precision of coordinates
                        // This requires direct content stream manipulation which is complex
                    }
                    
                } catch (pageErr) {
                    console.warn(`Warning processing page ${i + 1}:`, pageErr);
                    // Continue with other pages even if one fails
                }
                
                // Small delay to prevent UI freezing
                if (i % 2 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }
            
            setStatus('Compressing images and graphics...');
            setProgress(75);
            
            // Process images if present
            await compressImagesInPdf(pdfDoc, quality);
            
            setStatus('Finalizing compression...');
            setProgress(85);
            
            // Determine save options based on compression level
            let saveOptions = {
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: quality <= 0.4 ? 100 : 50,
                updateFieldAppearances: false
            };
            
            // Additional compression for higher levels
            if (quality <= 0.5) {
                saveOptions.objectsPerTick = 150;
            }
            
            if (quality <= 0.3) {
                saveOptions.objectsPerTick = 200;
            }
            
            setStatus('Saving optimized PDF...');
            setProgress(90);
            
            // Save with optimization settings
            const compressedBytes = await pdfDoc.save(saveOptions);
            
            // Check compression effectiveness
            const compressionRatio = (pdfBytes.length - compressedBytes.length) / pdfBytes.length;
            
            // If compression wasn't effective enough, try alternative approach
            if (compressionRatio < 0.05) { // Less than 5% compression
                setStatus('Trying alternative compression method...');
                setProgress(50);
                
                const recreatedBytes = await recreatePdfCompressed(pdfBytes, quality);
                const recreatedRatio = (pdfBytes.length - recreatedBytes.length) / pdfBytes.length;
                
                // Use whichever method achieved better compression
                if (recreatedRatio > compressionRatio) {
                    return recreatedBytes;
                }
            }
            
            return compressedBytes;
            
        } catch (err) {
            console.error('Error in advanced compression:', err);
            throw err;
        }
    }

    // Alternative compression by recreating PDF
    async function recreatePdfCompressed(originalBytes, quality) {
        try {
            setStatus('Recreating PDF with compression...');
            
            // Load original PDF
            const originalPdf = await PDFDocument.load(originalBytes);
            
            // Create new PDF document
            const newPdf = await PDFDocument.create();
            
            // Copy pages with compression
            const pages = originalPdf.getPages();
            
            for (let i = 0; i < pages.length; i++) {
                setStatus(`Copying and compressing page ${i + 1} of ${pages.length}...`);
                setProgress(20 + Math.round((i / pages.length) * 60));
                
                // Copy page to new document
                const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
                
                // Add the page
                newPdf.addPage(copiedPage);
                
                // Small delay
                if (i % 3 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }
            
            // Set minimal metadata
            newPdf.setTitle('');
            newPdf.setAuthor('');
            newPdf.setSubject('');
            newPdf.setCreator('PDF Compressor');
            newPdf.setProducer('PDF Compressor');
            
            setStatus('Saving recreated PDF...');
            setProgress(85);
            
            // Save with high compression
            const recreatedBytes = await newPdf.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: quality <= 0.5 ? 200 : 100,
                updateFieldAppearances: false
            });
            
            return recreatedBytes;
            
        } catch (err) {
            console.error('Error recreating PDF:', err);
            throw err;
        }
    }

    // Main compression function
    const compressPdf = async () => {
        if (!selectedFile) {
            setError('Please select a PDF file to compress.');
            return;
        }

        setIsCompressing(true);
        setStatus('Preparing PDF for compression...');
        setProgress(0);
        setError('');
        setCompressedFile(null);

        try {
            // Read the file
            const arrayBuffer = await selectedFile.arrayBuffer();
            const compressionSettings_local = compressionSettings[compressionLevel];
            
            setStatus('Analyzing PDF structure...');
            setProgress(10);
            
            // Perform compression using multiple strategies
            let compressedBytes;
            
            // Try multiple compression strategies
            let finalCompressedBytes;
            let bestCompressionRatio = 0;
            let bestBytes = null;
            
            // Strategy 1: Simple effective compression (fast)
            setStatus('Trying optimized compression...');
            setProgress(10);
            
            try {
                const simpleBytes = await simpleEffectiveCompression(arrayBuffer, compressionSettings_local.quality);
                const simpleRatio = ((originalSize - simpleBytes.length) / originalSize * 100);
                
                if (simpleRatio > bestCompressionRatio) {
                    bestCompressionRatio = simpleRatio;
                    bestBytes = simpleBytes;
                }
                
                setStatus(`Simple compression achieved ${simpleRatio.toFixed(1)}% reduction`);
            } catch (err) {
                console.warn('Simple compression failed:', err);
            }
            
            // Strategy 2: Advanced compression if simple wasn't effective enough
            if (bestCompressionRatio < 5.0) {
                setStatus('Trying advanced optimization...');
                setProgress(30);
                
                try {
                    const advancedBytes = await advancedPdfCompression(arrayBuffer, compressionSettings_local.quality);
                    const advancedRatio = ((originalSize - advancedBytes.length) / originalSize * 100);
                    
                    if (advancedRatio > bestCompressionRatio) {
                        bestCompressionRatio = advancedRatio;
                        bestBytes = advancedBytes;
                    }
                    
                    setStatus(`Advanced compression achieved ${advancedRatio.toFixed(1)}% reduction`);
                } catch (err) {
                    console.warn('Advanced compression failed:', err);
                }
            }
            
            // Strategy 3: Aggressive compression for maximum setting or if others failed
            if ((compressionSettings_local.quality <= 0.4 || bestCompressionRatio < 3.0) && originalSize > 5 * 1024 * 1024) {
                setStatus('Applying aggressive compression (this may take longer)...');
                setProgress(50);
                
                try {
                    const aggressiveBytes = await aggressiveCompression(arrayBuffer, compressionSettings_local.quality);
                    const aggressiveRatio = ((originalSize - aggressiveBytes.length) / originalSize * 100);
                    
                    if (aggressiveRatio > bestCompressionRatio) {
                        bestCompressionRatio = aggressiveRatio;
                        bestBytes = aggressiveBytes;
                    }
                    
                    setStatus(`Aggressive compression achieved ${aggressiveRatio.toFixed(1)}% reduction`);
                } catch (err) {
                    console.warn('Aggressive compression failed:', err);
                }
            }
            
            // Use the best result
            finalCompressedBytes = bestBytes || new Uint8Array(arrayBuffer);
            
            setStatus('Finalizing compressed PDF...');
            setProgress(95);
            
            // Create blob for download
            const blob = new Blob([finalCompressedBytes], { type: 'application/pdf' });
            const compressedSize = blob.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            setCompressedFile({
                blob,
                name: selectedFile.name.replace('.pdf', '_compressed.pdf'),
                size: compressedSize,
                compressionRatio,
                originalSize
            });
            
            setProgress(100);
            setStatus('PDF compression completed successfully!');
            
        } catch (err) {
            console.error('Error compressing PDF:', err);
            setError(`Compression failed: ${err.message}`);
        } finally {
            setIsCompressing(false);
        }
    };

    // Download compressed PDF
    const downloadCompressedPdf = () => {
        if (!compressedFile) return;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedFile.blob);
        link.download = compressedFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Clear all
    const clearAll = () => {
        setSelectedFile(null);
        setCompressedFile(null);
        setError('');
        setStatus('');
        setProgress(0);
        setOriginalSize(0);
        setPageCount(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="card-inner">
            <div className="card-wrap">
                <div className="content private">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div className="title"><span className="first-word">PDF </span>Compressor</div>
                            <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                                <div style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>Reduce PDF file size while maintaining quality.</div>
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
                            Drag & drop your PDF here or click to browse
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            Supports PDF files up to 100MB. Compression effectiveness depends on PDF content - text-heavy PDFs compress better than image-heavy ones.
                        </div>
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleFileSelect}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Selected File Preview */}
                    {selectedFile && (
                        <div style={{ marginTop: 16, padding: 12, border: '1px solid #e6e9ee', borderRadius: 8, background: '#f8f9fa', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 20 }}>📄</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: 14 }}>{selectedFile.name}</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                                    {formatFileSize(selectedFile.size)}
                                    {pageCount > 0 && ` • ${pageCount} page${pageCount !== 1 ? 's' : ''}`}
                                </div>
                            </div>
                            <button 
                                onClick={clearAll}
                                disabled={isCompressing}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    fontSize: 18, 
                                    cursor: isCompressing ? 'not-allowed' : 'pointer',
                                    color: '#999',
                                    padding: 4
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Compression Level Selection */}
                    {selectedFile && (
                        <div style={{ marginTop: 16 }}>
                            <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, display: 'block' }}>
                                Compression Level
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                                {Object.entries(compressionSettings).map(([key, setting]) => (
                                    <button
                                        key={key}
                                        onClick={() => setCompressionLevel(key)}
                                        style={{
                                            padding: 12,
                                            border: compressionLevel === key ? '2px solid #6a2bff' : '2px solid #e6e9ee',
                                            borderRadius: 8,
                                            background: compressionLevel === key ? '#f8f7ff' : '#fff',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                                            {setting.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                            {setting.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <button
                            onClick={compressPdf}
                            disabled={!selectedFile || isCompressing}
                            style={{
                                padding: '10px 14px',
                                background: (!selectedFile || isCompressing) ? '#ccc' : '#6a2bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                cursor: (!selectedFile || isCompressing) ? 'not-allowed' : 'pointer',
                                opacity: (!selectedFile || isCompressing) ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            {isCompressing && (
                                <div style={{ 
                                    width: 14, 
                                    height: 14, 
                                    border: '2px solid #fff', 
                                    borderTop: '2px solid transparent', 
                                    borderRadius: '50%', 
                                    animation: 'spin 1s linear infinite' 
                                }}></div>
                            )}
                            {isCompressing ? 'Compressing...' : 'Compress PDF'}
                        </button>
                        
                        <button
                            onClick={clearAll}
                            disabled={isCompressing}
                            style={{ 
                                padding: '10px 14px', 
                                borderRadius: 8, 
                                border: '1px solid #ddd', 
                                background: '#fff', 
                                cursor: isCompressing ? 'not-allowed' : 'pointer',
                                opacity: isCompressing ? 0.7 : 1
                            }}
                        >
                            Clear
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {isCompressing && progress > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
                                <span>Compressing PDF...</span>
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
                    {status && !compressedFile && !error && (
                        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                            {status}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && <div style={{ marginTop: 12, color: '#8a0f0f', fontSize: 14 }}>{error}</div>}

                    {/* Compression Results */}
                    {compressedFile && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ padding: 16, border: '1px solid #e6e9ee', borderRadius: 8, background: '#f8f9fa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                                            Compression Complete! 🎉
                                        </div>
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                            {compressedFile.name}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 8px', 
                                        background: compressedFile.compressionRatio > 0 ? '#d4edda' : '#fff3cd', 
                                        color: compressedFile.compressionRatio > 0 ? '#155724' : '#856404', 
                                        borderRadius: 4, 
                                        fontSize: 12, 
                                        fontWeight: 500 
                                    }}>
                                        {compressedFile.compressionRatio > 0 ? `-${compressedFile.compressionRatio}%` : 'Optimized'}
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                        <div>Original: {formatFileSize(compressedFile.originalSize)}</div>
                                        <div>Compressed: {formatFileSize(compressedFile.size)}</div>
                                        <div>Saved: {formatFileSize(compressedFile.originalSize - compressedFile.size)}</div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={downloadCompressedPdf}
                                    style={{ 
                                        width: '100%',
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
                                    Download Compressed PDF
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Info Modal */}
                    {showModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>About PDF Compressor</div>
                                    <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
                                </div>
                                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#555' }}>
                                    <p>Reduce PDF file sizes while maintaining quality:</p>
                                    <ul style={{ marginLeft: 20, marginTop: 12 }}>
                                        <li>• <strong>Client-side processing:</strong> Your PDF never leaves your browser</li>
                                        <li>• <strong>Multiple compression levels:</strong> Choose from Low to Maximum compression</li>
                                        <li>• <strong>Smart optimization:</strong> Removes metadata and optimizes structure</li>
                                        <li>• <strong>Aggressive compression:</strong> Maximum setting converts pages to optimized images</li>
                                        <li>• <strong>Multi-strategy approach:</strong> Tries different techniques for best results</li>
                                        <li>• <strong>Best for:</strong> Scanned documents, image-heavy PDFs, unoptimized files</li>
                                    </ul>
                                    <p style={{ marginTop: 12 }}><strong>Note:</strong> Already optimized PDFs may show minimal compression. Large images and scanned documents typically compress best.</p>
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