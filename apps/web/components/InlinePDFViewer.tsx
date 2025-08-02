'use client';

import { useState } from 'react';
import { X, Download, Maximize2, Minimize2 } from 'lucide-react';

interface InlinePDFViewerProps {
  url: string;
  title?: string;
  height?: string;
  onClose?: () => void;
}

export default function InlinePDFViewer({ 
  url, 
  title, 
  height = '600px',
  onClose 
}: InlinePDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Construct Google Docs viewer URL for better compatibility
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  
  // Alternative: Use browser's native PDF viewer
  const nativeViewerUrl = `${url}#view=FitH&toolbar=0`;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} bg-gray-900 rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-medium truncate">
          {title || 'PDF Document'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <a
            href={url}
            download
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-56px)]' : ''}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-gray-400">Loading PDF...</div>
          </div>
        )}
        
        <iframe
          src={nativeViewerUrl}
          className="w-full bg-white"
          style={{ height: isFullscreen ? '100%' : height }}
          onLoad={() => setLoading(false)}
          title={title || 'PDF Viewer'}
        />
        
        {/* Fallback message */}
        <noscript>
          <div className="p-4 text-center text-gray-400">
            <p>Unable to display PDF. Please download to view.</p>
            <a 
              href={url} 
              download 
              className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Download PDF
            </a>
          </div>
        </noscript>
      </div>
    </div>
  );
}