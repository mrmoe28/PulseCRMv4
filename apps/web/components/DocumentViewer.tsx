'use client';

import React, { useState } from 'react';
import { X, Download, Maximize2, Minimize2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    type: string;
    url: string;
    file?: File;
  };
  onClose: () => void;
}

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isPDF = document.type === 'application/pdf' || document.name.toLowerCase().endsWith('.pdf');
  const isImage = document.type.startsWith('image/');
  
  // For PDFs, use the enhanced PDF viewer
  if (isPDF) {
    return <PDFViewer document={document} onClose={onClose} />;
  }
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`bg-gray-900 rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'w-[90%] h-[90%] max-w-6xl max-h-[90vh]'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white truncate">{document.name}</h3>
          <div className="flex items-center gap-2">
            <a
              href={document.url}
              download={document.name}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-800 m-4 rounded">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={document.url}
                alt={document.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Preview not available for this file type.</p>
                <a
                  href={document.url}
                  download={document.name}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
