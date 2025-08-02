'use client';

import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Icons, LoadingIcon } from '../ui/icons';
import { cn } from '../../lib/utils';

interface PDFViewerProps {
    file: string;
    className?: string;
    enableDownload?: boolean;
    enableFullscreen?: boolean;
    showToolbar?: boolean;
}

export function PDFViewer({
    file,
    className,
    enableDownload = true,
    enableFullscreen = true,
    showToolbar = true,
}: PDFViewerProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const downloadPDF = useCallback(() => {
        const link = document.createElement('a');
        link.href = file;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [file]);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    const handleIframeLoad = useCallback(() => {
        setIsLoading(false);
        setError(null);
    }, []);

    const handleIframeError = useCallback(() => {
        setIsLoading(false);
        setError('Failed to load PDF document');
    }, []);

    if (error) {
        return (
            <div className={cn(
                'flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg',
                className
            )}>
                <Icons.AlertCircle size={48} className="text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load PDF</h3>
                <p className="text-gray-600 text-center">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="mt-4"
                >
                    <Icons.RefreshCw size={16} className="mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden',
                isFullscreen && 'fixed inset-0 z-50 bg-black',
                className
            )}
        >
            {/* Toolbar */}
            {showToolbar && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            PDF Document
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Action buttons */}
                        {enableDownload && (
                            <Button variant="outline" size="sm" onClick={downloadPDF}>
                                <Icons.Download size={16} className="mr-2" />
                                Download
                            </Button>
                        )}

                        {enableFullscreen && (
                            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                                {isFullscreen ? (
                                    <>
                                        <Icons.X size={16} className="mr-2" />
                                        Exit Fullscreen
                                    </>
                                ) : (
                                    <>
                                        <Icons.ExternalLink size={16} className="mr-2" />
                                        Fullscreen
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* PDF Content */}
            <div className="relative flex-1 bg-gray-100 dark:bg-gray-800">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                        <LoadingIcon className="w-8 h-8 text-orange-500" />
                    </div>
                )}

                <iframe
                    src={`${file}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full min-h-[600px] border-0"
                    title="PDF Viewer"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                />
            </div>
        </div>
    );
}

export default PDFViewer; 