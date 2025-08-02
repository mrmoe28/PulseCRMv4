'use client';

import { useState, useCallback, useRef } from 'react';

interface UploadResult {
    success: boolean;
    fileName: string;
    error?: string;
}

interface SimpleEnhancedUploadProps {
    onUploadComplete?: (results: UploadResult[]) => void;
    maxFiles?: number;
    className?: string;
}

export default function SimpleEnhancedUpload({
    onUploadComplete,
    maxFiles = 10,
    className = ''
}: SimpleEnhancedUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFiles = async (files: File[]): Promise<UploadResult[]> => {
        const results: UploadResult[] = [];

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('files', file);

                const response = await fetch('/api/files/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    results.push({ success: true, fileName: file.name });
                } else {
                    const errorData = await response.json();
                    results.push({
                        success: false,
                        fileName: file.name,
                        error: errorData.error || 'Upload failed'
                    });
                }
            } catch (error) {
                results.push({
                    success: false,
                    fileName: file.name,
                    error: 'Network error'
                });
            }
        }

        return results;
    };

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);

        if (fileArray.length === 0) return;

        if (fileArray.length > maxFiles) {
            alert(`Too many files selected. Maximum ${maxFiles} files allowed.`);
            return;
        }

        setSelectedFiles(fileArray);
        setIsUploading(true);
        setUploadStatus('Uploading files...');

        try {
            const results = await uploadFiles(fileArray);

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            if (failed === 0) {
                setUploadStatus(`Successfully uploaded ${successful} file(s)`);
            } else {
                setUploadStatus(`Uploaded ${successful} file(s), ${failed} failed`);
            }

            onUploadComplete?.(results);

            // Clear selection after upload
            setTimeout(() => {
                setSelectedFiles([]);
                setUploadStatus('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 3000);

        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [maxFiles, onUploadComplete]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
    }, [handleFiles]);

    const handleBrowseClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
                    }
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
                onClick={handleBrowseClick}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {isUploading ? 'Uploading...' : 'Drop files here or click to browse'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            PDF, Images, CSV, DOC, XLS files up to 10MB each (max {maxFiles} files)
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.csv,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Selected Files ({selectedFiles.length})
                    </h3>
                    <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Status */}
            {uploadStatus && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-900 dark:text-white">{uploadStatus}</p>
                </div>
            )}
        </div>
    );
} 