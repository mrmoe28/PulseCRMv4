'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, Loader } from 'lucide-react';

interface PDFViewerProps {
  document: {
    id: string;
    name: string;
    url: string;
    file?: File;
  };
  onClose: () => void;
}

export default function PDFViewer({ document, onClose }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>(document.url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Convert File to base64 data URL if we have a File object
    if (document.file && document.url.startsWith('blob:')) {
      setIsLoading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          setPdfUrl(e.target.result as string);
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(document.file);
    } else if (document.url.startsWith('http://') || document.url.startsWith('https://')) {
      // For remote URLs, use our proxy API to avoid CORS issues
      setPdfUrl(`/api/documents?url=${encodeURIComponent(document.url)}`);
    }
  }, [document.file, document.url]);

  const downloadFile = async () => {
    try {
      // If we have a data URL, convert it back to blob for download
      if (pdfUrl.startsWith('data:')) {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = document.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // For regular URLs
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = document.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback: open in new tab
      window.open(pdfUrl, '_blank');
    }
  };

  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white truncate max-w-md">
            {document.name}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Open in New Tab */}
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
          
          {/* Download Button */}
          <button
            onClick={downloadFile}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-hidden bg-gray-800 flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <Loader className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading PDF...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-red-400 mb-6">{error}</p>
            <div className="space-y-3 max-w-sm mx-auto">
              <button
                onClick={downloadFile}
                className="block w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Download PDF
              </button>
              <button
                onClick={openInNewTab}
                className="block w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ExternalLink className="h-5 w-5 inline mr-2" />
                Try Opening in Browser
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Main PDF viewer using embed/object tags for better compatibility */}
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
              aria-label={document.name}
            >
              <embed
                src={pdfUrl}
                type="application/pdf"
                className="w-full h-full"
              />
              {/* Fallback for browsers that don't support inline PDF */}
              <div className="text-center p-8">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">
                  Your browser cannot display this PDF inline.
                </p>
                <div className="space-y-3 max-w-sm mx-auto">
                  <button
                    onClick={downloadFile}
                    className="block w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Download className="h-5 w-5 inline mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={openInNewTab}
                    className="block w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 inline mr-2" />
                    Open in New Tab
                  </button>
                </div>
              </div>
            </object>
          </>
        )}
      </div>
    </div>
  );
}
