/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
    AlertCircle,
    Download,
    FileText,
    Image as ImageIcon,
    Loader,
    Maximize2,
    Minimize2,
    RotateCw,
    X,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface UniversalDocumentViewerProps {
    fileUrl: string;
    fileName?: string;
    documentId?: string;
    className?: string;
    onClose?: () => void;
    showControls?: boolean;
    height?: string;
    onLoadSuccess?: (document: any) => void;
    onLoadError?: (error: Error) => void;
}

// Function to detect file type from URL or filename
const getFileType = (url: string, fileName?: string): 'pdf' | 'image' | 'unknown' => {
    const fileToCheck = fileName || url;
    const extension = fileToCheck.toLowerCase().split('.').pop();

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const pdfExtensions = ['pdf'];

    if (pdfExtensions.includes(extension || '')) return 'pdf';
    if (imageExtensions.includes(extension || '')) return 'image';

    return 'unknown';
};

// Image Viewer Component
const ImageViewer: React.FC<{
    fileUrl: string;
    fileName?: string;
    onClose?: () => void;
    className?: string;
    height?: string;
}> = ({ fileUrl, fileName, onClose, className, height = '800px' }) => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setLoading(false);
        setError('Failed to load image');
    };

    const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 5));
    const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
    const resetZoom = () => setZoom(1);
    const rotate = () => setRotation(prev => (prev + 90) % 360);

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div
            className={cn(
                "bg-gray-900 rounded-lg overflow-hidden",
                isFullscreen ? "fixed inset-0 z-50" : "",
                className
            )}
            style={{ height: isFullscreen ? '100vh' : height }}
        >
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-orange-500" />
                    <div>
                        <h3 className="text-white font-medium">{fileName || 'Image Document'}</h3>
                        <p className="text-gray-400 text-sm">Image Viewer</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={zoomOut}
                            className="p-2 hover:bg-gray-600 rounded-md text-white"
                            title="Zoom Out"
                        >
                            <ZoomOutIcon className="w-4 h-4" />
                        </button>

                        <button
                            onClick={resetZoom}
                            className="px-3 py-2 hover:bg-gray-600 rounded-md text-white text-sm min-w-[60px]"
                            title="Reset Zoom"
                        >
                            {Math.round(zoom * 100)}%
                        </button>

                        <button
                            onClick={zoomIn}
                            className="p-2 hover:bg-gray-600 rounded-md text-white"
                            title="Zoom In"
                        >
                            <ZoomInIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={rotate}
                        className="p-2 hover:bg-gray-600 rounded-md text-white"
                        title="Rotate"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-gray-600 rounded-md text-white"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={downloadImage}
                        className="p-2 hover:bg-gray-600 rounded-md text-white"
                        title="Download Image"
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-600 rounded-md text-white"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Image Content */}
            <div className="relative overflow-auto bg-gray-100" style={{ height: 'calc(100% - 73px)' }}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="flex flex-col items-center gap-3">
                            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                            <p className="text-gray-400">Loading image...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <AlertCircle className="w-12 h-12 text-red-400" />
                            <div>
                                <p className="text-white font-medium">Failed to load image</p>
                                <p className="text-gray-400 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-center min-h-full p-8">
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={fileUrl}
                        alt={fileName || 'Document image'}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            transformOrigin: 'center',
                            transition: 'transform 0.2s ease'
                        }}
                        className="max-w-none shadow-lg rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
};

// PDF Viewer Component
const PDFViewer: React.FC<{
    fileUrl: string;
    fileName?: string;
    onClose?: () => void;
    className?: string;
    height?: string;
}> = ({ fileUrl, fileName, onClose, className, height = '800px' }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [actualFileUrl, setActualFileUrl] = useState(fileUrl);

    // Check if file exists and fallback to public directory if needed
    useEffect(() => {
        const checkFileExists = async () => {
            try {
                const response = await fetch(fileUrl, { method: 'HEAD' });
                if (!response.ok) {
                    // If API file doesn't exist, try public directory
                    if (fileUrl.includes('/api/files/')) {
                        const publicUrl = fileUrl.replace('/api/files/', '/');
                        const publicResponse = await fetch(publicUrl, { method: 'HEAD' });
                        if (publicResponse.ok) {
                            setActualFileUrl(publicUrl);
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking file existence:', error);
            }
        };

        checkFileExists();
    }, [fileUrl]);

    const handleIframeLoad = () => {
        setLoading(false);
    };

    const handleIframeError = () => {
        setLoading(false);
        setError('Failed to load PDF');
    };

    const downloadPDF = () => {
        const link = document.createElement('a');
        link.href = actualFileUrl;
        link.download = fileName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const openInNewTab = () => {
        window.open(actualFileUrl, '_blank');
    };

    return (
        <div
            className={cn(
                "bg-gray-900 rounded-lg overflow-hidden",
                isFullscreen ? "fixed inset-0 z-50" : "",
                className
            )}
            style={{ height: isFullscreen ? '100vh' : height }}
        >
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <div>
                        <h3 className="text-white font-medium">{fileName || 'PDF Document'}</h3>
                        <p className="text-gray-400 text-sm">PDF Viewer</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={openInNewTab}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm"
                        title="Open in New Tab"
                    >
                        Open in New Tab
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-gray-600 rounded-md text-white"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={downloadPDF}
                        className="p-2 hover:bg-gray-600 rounded-md text-white"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-600 rounded-md text-white"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* PDF Content */}
            <div className="relative" style={{ height: 'calc(100% - 73px)' }}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                            <p className="text-gray-400">Loading PDF...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <AlertCircle className="w-12 h-12 text-red-400" />
                            <div>
                                <p className="text-white font-medium">Failed to load PDF</p>
                                <p className="text-gray-400 text-sm">{error}</p>
                                <button
                                    onClick={openInNewTab}
                                    className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                                >
                                    Open in New Tab
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <iframe
                    src={`${actualFileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    width="100%"
                    height="100%"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    className="border-0"
                    title={fileName || 'PDF Document'}
                />
            </div>
        </div>
    );
};

// Main Universal Document Viewer
export default function UniversalDocumentViewer({
    fileUrl,
    fileName,
    className,
    onClose,
    height = '800px',
    onLoadSuccess,
    onLoadError,
}: UniversalDocumentViewerProps) {
    const [fileType, setFileType] = useState<'pdf' | 'image' | 'unknown'>('unknown');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const detectedType = getFileType(fileUrl, fileName);
        setFileType(detectedType);
        setLoading(false);

        if (detectedType === 'unknown') {
            setError('Unsupported file type. Only PDF and image files are supported.');
            onLoadError?.(new Error('Unsupported file type'));
        } else {
            onLoadSuccess?.({ type: detectedType, url: fileUrl });
        }
    }, [fileUrl, fileName, onLoadSuccess, onLoadError]);

    if (loading) {
        return (
            <div className={cn("bg-gray-900 rounded-lg flex items-center justify-center", className)} style={{ height }}>
                <div className="flex flex-col items-center gap-3">
                    <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-gray-400">Loading document...</p>
                </div>
            </div>
        );
    }

    if (error || fileType === 'unknown') {
        return (
            <div className={cn("bg-gray-900 rounded-lg flex items-center justify-center", className)} style={{ height }}>
                <div className="flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                    <div>
                        <p className="text-white font-medium">Unable to load document</p>
                        <p className="text-gray-400 text-sm">{error || 'Unsupported file type'}</p>
                        <p className="text-gray-500 text-xs mt-2">Supported formats: PDF, JPG, PNG, GIF, WebP, SVG</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Render image viewer for image files
    if (fileType === 'image') {
        return (
            <ImageViewer
                fileUrl={fileUrl}
                fileName={fileName}
                onClose={onClose}
                className={className}
                height={height}
            />
        );
    }

    // Render PDF viewer for PDF files
    if (fileType === 'pdf') {
        return (
            <PDFViewer
                fileUrl={fileUrl}
                fileName={fileName}
                onClose={onClose}
                className={className}
                height={height}
            />
        );
    }

    return null;
} 