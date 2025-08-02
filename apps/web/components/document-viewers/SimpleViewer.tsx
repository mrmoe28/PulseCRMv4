'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Eye, ExternalLink } from 'lucide-react';

interface SimpleViewerProps {
  document: {
    id: string;
    name: string;
    url: string;
    type: string;
    file?: File; // Optional File object for local files
  };
  onClose: () => void;
}

export default function SimpleViewer({ document, onClose }: SimpleViewerProps) {
  const [viewerUrl, setViewerUrl] = useState<string>(document.url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have a File object, convert it to a data URL for better compatibility
    if (document.file && document.type === 'application/pdf') {
      setIsLoading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          setViewerUrl(e.target.result as string);
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(document.file);
    }
  }, [document.file, document.type]);

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = viewerUrl;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(viewerUrl, '_blank');
  };

  const isPDF = document.type === 'application/pdf' || document.name.toLowerCase().endsWith('.pdf');
  const isImage = document.type.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white truncate max-w-md">
            {document.name}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
          
          <button
            onClick={downloadFile}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-4">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading document...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={downloadFile}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Download className="h-5 w-5 inline mr-2" />
              Download File
            </button>
          </div>
        ) : isImage ? (
          <img
            src={viewerUrl}
            alt={document.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : isPDF ? (
          <iframe
            src={viewerUrl}
            className="w-full h-full bg-white rounded-lg"
            title={document.name}
          />
        ) : (
          <div className="text-center p-8">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-6">
              Preview not available for this file type
            </p>
            <div className="space-y-3">
              <button
                onClick={downloadFile}
                className="block w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Download File
              </button>
              <button
                onClick={openInNewTab}
                className="block w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Eye className="h-5 w-5 inline mr-2" />
                Try Opening in Browser
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
