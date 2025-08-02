'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  BookOpen,
  Share2,
  FileText,
  AlertCircle,
  Loader,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Lazy load react-pdf to handle optional dependency
let Document: any;
let Page: any;
let pdfjs: any;

try {
  const reactPdf = require('react-pdf');
  Document = reactPdf.Document;
  Page = reactPdf.Page;
  pdfjs = reactPdf.pdfjs;
  
  // Configure PDF.js worker
  if (typeof window !== 'undefined' && pdfjs) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
} catch (error) {
  console.log('react-pdf not available, using fallback');
}

interface EnhancedPDFViewerProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
  onError?: (error: Error) => void;
  showToolbar?: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
  allowShare?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export default function EnhancedPDFViewer({
  fileUrl,
  fileName = 'document.pdf',
  className,
  onError,
  showToolbar = true,
  allowDownload = true,
  allowPrint = true,
  allowShare = true,
  maxWidth = 1200,
  maxHeight = 800
}: EnhancedPDFViewerProps) {
  // If react-pdf is not available, show fallback
  if (!Document || !Page) {
    return (
      <div className={cn("pdf-viewer-container p-8 bg-gray-100 rounded-lg text-center", className)}>
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">PDF Preview Unavailable</h3>
        <p className="text-gray-600 mb-4">PDF viewing is not available in this environment.</p>
        {allowDownload && fileUrl && (
          <a
            href={fileUrl}
            download={fileName}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </a>
        )}
      </div>
    );
  }

  // Rest of the component implementation remains the same...
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.min(width - 48, maxWidth),
          height: maxHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [maxWidth, maxHeight]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError('Failed to load PDF document');
    setLoading(false);
    onError?.(error);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const changeZoom = (delta: number) => {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 3));
  };

  const rotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: `Check out this document: ${fileName}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "pdf-viewer-container bg-gray-50 rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 bg-white",
        className
      )}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="pdf-toolbar bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Page Navigation */}
              <button
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages || '-'}
              </span>
              
              <button
                onClick={() => changePage(1)}
                disabled={pageNumber >= (numPages || 1)}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Zoom Controls */}
              <button
                onClick={() => changeZoom(-0.1)}
                className="p-2 rounded hover:bg-gray-100"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <button
                onClick={() => changeZoom(0.1)}
                className="p-2 rounded hover:bg-gray-100"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Other Controls */}
              <button
                onClick={rotate}
                className="p-2 rounded hover:bg-gray-100"
                title="Rotate"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="p-2 rounded hover:bg-gray-100"
                title="Toggle thumbnails"
              >
                <BookOpen className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded hover:bg-gray-100"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {allowShare && (
                <button
                  onClick={handleShare}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}

              {allowDownload && (
                <button
                  onClick={handleDownload}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded hover:bg-gray-100"
                title="Fullscreen"
              >
                {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 flex items-center">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search in document..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="ml-2 p-2 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* PDF Content */}
      <div className="pdf-content flex h-full">
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="pdf-thumbnails w-48 bg-gray-100 border-r border-gray-200 overflow-y-auto p-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Pages</h3>
            <div className="space-y-2">
              {Array.from(new Array(numPages || 0), (el, index) => (
                <button
                  key={`thumb-${index}`}
                  onClick={() => setPageNumber(index + 1)}
                  className={cn(
                    "w-full p-2 rounded border-2 transition-colors",
                    pageNumber === index + 1
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  <div className="text-xs text-gray-600">Page {index + 1}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main PDF View */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center">
              <Loader className="w-8 h-8 animate-spin text-orange-500 mb-2" />
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center text-red-600">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center">
                  <Loader className="w-6 h-6 animate-spin mr-2" />
                  Loading PDF...
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                width={dimensions.width}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}
