'use client';

import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Loader,
  Maximize2,
  RotateCw,
  Search,
  Share2,
  Shield,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from '../../lib/utils';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface SecuritySettings {
  allowDownload?: boolean;
  allowPrint?: boolean;
  allowCopy?: boolean;
  allowShare?: boolean;
  requireAuth?: boolean;
  sessionTimeout?: number; // minutes
  watermark?: {
    text?: string;
    opacity?: number;
    position?: 'center' | 'diagonal' | 'bottom-right';
  };
  accessLevel?: 'public' | 'restricted' | 'confidential';
  trackViewing?: boolean;
}

interface ViewingSession {
  startTime: Date;
  endTime?: Date;
  pageViews: { [page: number]: number };
  totalViewTime: number;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurePDFViewerProps {
  fileUrl: string;
  fileName?: string;
  documentId?: string;
  className?: string;
  onClose?: () => void;
  showControls?: boolean;
  height?: string;
  security?: SecuritySettings;
  onLoadSuccess?: (pdf: unknown) => void;
  onLoadError?: (error: Error) => void;
  onSecurityViolation?: (violation: string) => void;
  onViewingComplete?: (session: ViewingSession) => void;
}

const DEFAULT_SECURITY: SecuritySettings = {
  allowDownload: true,
  allowPrint: true,
  allowCopy: true,
  allowShare: true,
  requireAuth: false,
  sessionTimeout: 30,
  watermark: {
    text: '',
    opacity: 0.1,
    position: 'diagonal'
  },
  accessLevel: 'public',
  trackViewing: true
};

export default function SecurePDFViewer({
  fileUrl,
  fileName,
  documentId,
  className,
  onClose,
  showControls = true,
  security = DEFAULT_SECURITY,
  onLoadSuccess,
  onLoadError,
  onSecurityViolation,
  onViewingComplete,
}: SecurePDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!security.requireAuth);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [viewingSession, setViewingSession] = useState<ViewingSession>({
    startTime: new Date(),
    pageViews: {},
    totalViewTime: 0
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout>();
  const viewingTimerRef = useRef<NodeJS.Timeout>();

  // Merge security settings with defaults
  const securityConfig = { ...DEFAULT_SECURITY, ...security };

  // Initialize viewing session
  useEffect(() => {
    if (securityConfig.trackViewing) {
      const session: ViewingSession = {
        startTime: new Date(),
        pageViews: {},
        totalViewTime: 0,
        ipAddress: 'localhost', // In real app, get from request
        userAgent: navigator.userAgent
      };
      setViewingSession(session);

      // Start viewing timer
      viewingTimerRef.current = setInterval(() => {
        setViewingSession(prev => ({
          ...prev,
          totalViewTime: prev.totalViewTime + 1
        }));
      }, 1000);
    }

    return () => {
      if (viewingTimerRef.current) {
        clearInterval(viewingTimerRef.current);
      }
    };
  }, [securityConfig.trackViewing]);

  // Session timeout
  useEffect(() => {
    if (securityConfig.sessionTimeout && securityConfig.sessionTimeout > 0) {
      sessionTimerRef.current = setTimeout(() => {
        setSessionExpired(true);
        onSecurityViolation?.('Session timeout');
      }, securityConfig.sessionTimeout * 60 * 1000);
    }

    return () => {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }
    };
  }, [securityConfig.sessionTimeout, onSecurityViolation]);

  // Track page views
  useEffect(() => {
    if (securityConfig.trackViewing && pageNumber > 0) {
      setViewingSession(prev => ({
        ...prev,
        pageViews: {
          ...prev.pageViews,
          [pageNumber]: (prev.pageViews[pageNumber] || 0) + 1
        }
      }));
    }
  }, [pageNumber, securityConfig.trackViewing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (onViewingComplete && securityConfig.trackViewing) {
        const finalSession = {
          ...viewingSession,
          endTime: new Date()
        };
        onViewingComplete(finalSession);
      }
    };
  }, [viewingSession, onViewingComplete, securityConfig.trackViewing]);

  // Document load handlers
  const onDocumentLoadSuccess = useCallback(
    ({ numPages, ...info }: { numPages: number }) => {
      setNumPages(numPages);
      setPageNumber(1);
      setLoading(false);
      setError(null);
      onLoadSuccess?.({ numPages, ...info });
    },
    [onLoadSuccess]
  );

  const onDocumentLoadError = useCallback(
    (error: Error) => {
      setLoading(false);
      setError(error.message || 'Failed to load PDF');
      onLoadError?.(error);
    },
    [onLoadError]
  );

  // Navigation
  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  const goToPage = useCallback((page: number) => {
    setPageNumber(Math.max(1, Math.min(page, numPages)));
  }, [numPages]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 5.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const fitToWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40;
      const pageWidth = 595;
      const newScale = containerWidth / pageWidth;
      setScale(Math.max(0.25, Math.min(newScale, 5.0)));
    }
  }, []);

  // Rotation
  const rotateClockwise = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Secure actions with permission checks
  const downloadPDF = useCallback(() => {
    if (!securityConfig.allowDownload) {
      onSecurityViolation?.('Download attempt blocked');
      alert('Download is not permitted for this document');
      return;
    }

    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || fileUrl.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileUrl, fileName, securityConfig.allowDownload, onSecurityViolation]);

  const sharePDF = useCallback(async () => {
    if (!securityConfig.allowShare) {
      onSecurityViolation?.('Share attempt blocked');
      alert('Sharing is not permitted for this document');
      return;
    }

    if (navigator.share && fileUrl) {
      try {
        await navigator.share({
          title: fileName || 'PDF Document',
          url: fileUrl,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        navigator.clipboard.writeText(fileUrl);
        alert('PDF URL copied to clipboard');
      }
    } else {
      navigator.clipboard.writeText(fileUrl);
      alert('PDF URL copied to clipboard');
    }
  }, [fileUrl, fileName, securityConfig.allowShare, onSecurityViolation]);


  // Copy protection
  useEffect(() => {
    if (!securityConfig.allowCopy) {
      const preventCopy = (e: Event) => {
        e.preventDefault();
        onSecurityViolation?.('Copy attempt blocked');
        return false;
      };

      const preventRightClick = (e: MouseEvent) => {
        e.preventDefault();
        onSecurityViolation?.('Right-click blocked');
        return false;
      };

      const preventSelect = (e: Event) => {
        e.preventDefault();
        return false;
      };

      document.addEventListener('copy', preventCopy);
      document.addEventListener('contextmenu', preventRightClick);
      document.addEventListener('selectstart', preventSelect);
      document.addEventListener('dragstart', preventSelect);

      return () => {
        document.removeEventListener('copy', preventCopy);
        document.removeEventListener('contextmenu', preventRightClick);
        document.removeEventListener('selectstart', preventSelect);
        document.removeEventListener('dragstart', preventSelect);
      };
    }
  }, [securityConfig.allowCopy, onSecurityViolation]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className={cn('bg-gray-900 rounded-lg p-8 text-center', className)}>
        <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
        <p className="text-gray-400 mb-6">This document requires authentication to view.</p>
        <button
          onClick={() => setIsAuthenticated(true)}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Authenticate
        </button>
      </div>
    );
  }

  // Session expired check
  if (sessionExpired) {
    return (
      <div className={cn('bg-gray-900 rounded-lg p-8 text-center', className)}>
        <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Session Expired</h3>
        <p className="text-gray-400 mb-6">Your viewing session has expired for security reasons.</p>
        <button
          onClick={() => {
            setSessionExpired(false);
            setIsAuthenticated(false);
          }}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Re-authenticate
        </button>
      </div>
    );
  }

  // Watermark component
  const Watermark = () => {
    if (!securityConfig.watermark?.text) return null;

    const { text, opacity = 0.1, position = 'diagonal' } = securityConfig.watermark;

    let positionClasses = '';
    let transform = '';

    switch (position) {
      case 'center':
        positionClasses = 'top-1/2 left-1/2';
        transform = 'transform -translate-x-1/2 -translate-y-1/2';
        break;
      case 'diagonal':
        positionClasses = 'top-1/2 left-1/2';
        transform = 'transform -translate-x-1/2 -translate-y-1/2 -rotate-45';
        break;
      case 'bottom-right':
        positionClasses = 'bottom-4 right-4';
        break;
    }

    return (
      <div
        className={`absolute pointer-events-none z-20 text-gray-400 text-4xl font-bold select-none ${positionClasses} ${transform}`}
        style={{ opacity }}
      >
        {text}
      </div>
    );
  };

  // Security panel
  const SecurityPanel = () => (
    <div className="bg-gray-800 border-l border-gray-700 w-80 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Security Info
        </h3>
        <button
          onClick={() => setShowSecurityPanel(false)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Access Level */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Access Level</h4>
          <div className={`px-3 py-2 rounded text-sm ${securityConfig.accessLevel === 'confidential' ? 'bg-red-900 text-red-300' :
              securityConfig.accessLevel === 'restricted' ? 'bg-yellow-900 text-yellow-300' :
                'bg-green-900 text-green-300'
            }`}>
            {securityConfig.accessLevel?.toUpperCase()}
          </div>
        </div>

        {/* Permissions */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Permissions</h4>
          <div className="space-y-2">
            {[
              { key: 'allowDownload', label: 'Download', icon: Download },
              { key: 'allowPrint', label: 'Print', icon: FileText },
              { key: 'allowCopy', label: 'Copy', icon: Eye },
              { key: 'allowShare', label: 'Share', icon: Share2 }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${securityConfig[key as keyof SecuritySettings] ? 'bg-green-500' : 'bg-red-500'
                  }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Session Info */}
        {securityConfig.trackViewing && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Session Info</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Started: {viewingSession.startTime.toLocaleTimeString()}</div>
              <div>Duration: {Math.floor(viewingSession.totalViewTime / 60)}m {viewingSession.totalViewTime % 60}s</div>
              <div>Pages viewed: {Object.keys(viewingSession.pageViews).length}</div>
            </div>
          </div>
        )}

        {/* Watermark Info */}
        {securityConfig.watermark?.text && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Watermark</h4>
            <div className="text-sm text-gray-400">
              &quot;{securityConfig.watermark.text}&quot;
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!fileUrl) {
    return (
      <div className={cn('border border-gray-700 rounded-lg p-8 text-center bg-gray-800', className)}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No PDF file selected</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-gray-900 rounded-lg overflow-hidden flex flex-col',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
      style={{ userSelect: securityConfig.allowCopy ? 'auto' : 'none' }}
    >
      {/* Header Controls */}
      {showControls && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* File Info with Security Badge */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FileText className="w-6 h-6 text-red-400" />
                {securityConfig.accessLevel !== 'public' && (
                  <Shield className="w-3 h-3 text-orange-500 absolute -top-1 -right-1" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white truncate max-w-md">
                  {fileName || 'Secure PDF Document'}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{numPages} pages</span>
                  {securityConfig.accessLevel !== 'public' && (
                    <span className={`px-2 py-1 rounded text-xs ${securityConfig.accessLevel === 'confidential' ? 'bg-red-900 text-red-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                      {securityConfig.accessLevel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Search */}
            {showSearch && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in PDF..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Search (Ctrl+F)"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={cn(
                  "p-2 rounded transition-colors",
                  showThumbnails
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
                title="Toggle Thumbnails"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSecurityPanel(!showSecurityPanel)}
                className={cn(
                  "p-2 rounded transition-colors",
                  showSecurityPanel
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
                title="Security Panel"
              >
                <Shield className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-600" />

              {securityConfig.allowDownload && (
                <button
                  onClick={downloadPDF}
                  className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              {securityConfig.allowShare && (
                <button
                  onClick={sharePDF}
                  className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                  title="Share PDF"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation and Zoom Controls */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
            {/* Page Navigation */}
            <div className="flex items-center space-x-3">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1 || loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={pageNumber}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 bg-gray-700 text-white text-center rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                />
                <span className="text-gray-400">of {numPages || '--'}</span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages || loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={zoomOut}
                disabled={loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-sm text-gray-300 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={zoomIn}
                disabled={loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={fitToWidth}
                disabled={loading}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
              >
                Fit Width
              </button>

              <button
                onClick={resetZoom}
                disabled={loading}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
              >
                Reset
              </button>

              <button
                onClick={rotateClockwise}
                disabled={loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="w-48 bg-gray-900 border-r border-gray-700 overflow-y-auto">
            <div className="p-3 border-b border-gray-700">
              <h3 className="text-sm font-medium text-white">Pages ({numPages})</h3>
            </div>
            <div className="p-2 space-y-2">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                <div
                  key={page}
                  onClick={() => goToPage(page)}
                  className={cn(
                    "relative cursor-pointer rounded border-2 transition-all",
                    page === pageNumber
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-gray-700 hover:border-gray-600"
                  )}
                >
                  <div className="aspect-[3/4] bg-white rounded">
                    <Document file={fileUrl} loading={null} error={null}>
                      <Page
                        pageNumber={page}
                        scale={0.15}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="w-full h-full"
                      />
                    </Document>
                  </div>
                  <div className="absolute bottom-1 left-1 right-1 text-center">
                    <span className="text-xs text-white bg-black bg-opacity-75 px-1 rounded">
                      {page}
                    </span>
                  </div>
                  {securityConfig.trackViewing && viewingSession.pageViews[page] && (
                    <div className="absolute top-1 right-1">
                      <span className="text-xs text-orange-400 bg-black bg-opacity-75 px-1 rounded">
                        {viewingSession.pageViews[page]}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="text-center">
                <Loader className="w-8 h-8 text-orange-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading secure PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading PDF</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && fileUrl && (
            <div className="flex justify-center p-4 relative">
              <Watermark />
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                error={null}
                className="pdf-document"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={securityConfig.allowCopy}
                  renderAnnotationLayer={true}
                  className="pdf-page shadow-2xl border border-gray-300"
                />
              </Document>
            </div>
          )}
        </div>

        {/* Security Panel */}
        {showSecurityPanel && <SecurityPanel />}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Document ID: {documentId || 'N/A'}</span>
          {securityConfig.trackViewing && (
            <span>Viewing time: {Math.floor(viewingSession.totalViewTime / 60)}m {viewingSession.totalViewTime % 60}s</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Secure Viewer</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {isFullscreen && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>← → Navigate • + - Zoom • F11 Exit Fullscreen</div>
        </div>
      )}
    </div>
  );
}

// Export types for convenience
export type { SecurePDFViewerProps, SecuritySettings, ViewingSession };
