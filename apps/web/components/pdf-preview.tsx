'use client';

import { FileText, Loader } from 'lucide-react';
import { useState } from 'react';

interface PDFPreviewProps {
    fileUrl: string;
    fileName?: string;
    className?: string;
    width?: number;
    height?: number;
}

export default function PDFPreview({
    fileUrl,
    fileName,
    className = '',
    width = 200,
    height = 260
}: PDFPreviewProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = () => {
        console.log('PDF preview loaded successfully for:', fileName);
        setLoading(false);
        setError(false);
    };

    const handleError = () => {
        console.log('PDF preview failed to load for:', fileName);
        setLoading(false);
        setError(true);
    };

    return (
        <div
            className={`relative bg-gray-700 rounded-lg overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 z-10">
                    <div className="text-center">
                        <Loader className="w-6 h-6 text-orange-500 animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Loading PDF...</p>
                    </div>
                </div>
            )}

            {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-600">
                    <div className="text-center p-4">
                        <FileText className="w-12 h-12 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-300 font-medium">PDF Document</p>
                        <p className="text-xs text-gray-400 mt-1">{fileName?.replace(/\.[^/.]+$/, "")}</p>
                    </div>
                </div>
            ) : (
                <iframe
                    src={fileUrl}
                    width="100%"
                    height="100%"
                    onLoad={handleLoad}
                    onError={handleError}
                    className="border-0"
                    title={`Preview of ${fileName || 'PDF document'}`}
                />
            )}

            {/* PDF icon overlay */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded p-1" style={{ zIndex: 6 }}>
                <FileText className="w-3 h-3 text-white" />
            </div>

            {/* Document name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2" style={{ zIndex: 5 }}>
                <p className="text-xs text-white truncate">{fileName?.replace(/\.[^/.]+$/, "")}</p>
            </div>
        </div>
    );
} 