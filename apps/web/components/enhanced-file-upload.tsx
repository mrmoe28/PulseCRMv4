'use client';

import { useState, useCallback, useRef } from 'react';
import { uploadWithRetry, validateFiles, formatFileSize, UploadProgress, UploadResult } from '../lib/upload-utils';

interface EnhancedFileUploadProps {
    onUploadComplete?: (results: UploadResult[]) => void;
    onUploadProgress?: (progress: UploadProgress[]) => void;
    maxFiles?: number;
    className?: string;
}

export default function EnhancedFileUpload({
    onUploadComplete,
    onUploadProgress,
    maxFiles = 10,
    className = ''
}: EnhancedFileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);

        // Validate files
        const { valid, invalid } = validateFiles(fileArray);

        if (invalid.length > 0) {
            alert(`Some files were rejected:\n${invalid.map(i => `${i.file.name}: ${i.reason}`).join('\n')}`);
        }

        if (valid.length === 0) {
            return;
        }

        // Check file limit
        if (valid.length > maxFiles) {
            alert(`Too many files selected. Maximum ${maxFiles} files allowed.`);
            return;
        }

        setSelectedFiles(valid);
        setIsUploading(true);
        setUploadProgress([]);
        setUploadResults([]);

        try {
            const results = await uploadWithRetry(valid, {
                maxRetries: 3,
                retryDelay: 1000,
                timeout: 60000, // 60 seconds
                onProgress: (progress) => {
                    setUploadProgress(prev => {
                        const existing = prev.find(p => p.fileName === progress.fileName);
                        if (existing) {
                            return prev.map(p => p.fileName === progress.fileName ? progress : p);
                        } else {
                            return [...prev, progress];
                        }
                    });

                    // Call parent progress callback
                    onUploadProgress?.(uploadProgress);
                }
            });

            setUploadResults(results);
            onUploadComplete?.(results);

            // Clear selection after successful upload
            if (results.every(r => r.success)) {
                setSelectedFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }

        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [maxFiles, onUploadComplete, onUploadProgress, uploadProgress]);

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

    const removeFile = useCallback((index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const retryUpload = useCallback(() => {
        if (selectedFiles.length > 0) {
            handleFiles(selectedFiles);
        }
    }, [selectedFiles, handleFiles]);

    const getProgressStats = () => {
        const completed = uploadProgress.filter(p => p.status === 'completed').length;
        const failed = uploadProgress.filter(p => p.status === 'error').length;
        const total = uploadProgress.length;

        return { completed, failed, total };
    };

    const stats = getProgressStats();

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
                                {!isUploading && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Upload Progress</h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.completed}/{stats.total} completed
                            {stats.failed > 0 && `, ${stats.failed} failed`}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {uploadProgress.map((progress, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-900 dark:text-white">{progress.fileName}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs px-2 py-1 rounded ${progress.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                progress.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            }`}>
                                            {progress.status}
                                        </span>
                                        <span className="text-xs text-gray-500">{progress.progress}%</span>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${progress.status === 'completed' ? 'bg-green-500' :
                                                progress.status === 'error' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                            }`}
                                        style={{ width: `${progress.progress}%` }}
                                    />
                                </div>

                                {progress.error && (
                                    <p className="text-xs text-red-600 dark:text-red-400">{progress.error}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Retry button for failed uploads */}
                    {stats.failed > 0 && !isUploading && (
                        <button
                            onClick={retryUpload}
                            className="w-full mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            Retry Failed Uploads
                        </button>
                    )}
                </div>
            )}

            {/* Upload Results Summary */}
            {uploadResults.length > 0 && !isUploading && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Upload Results</h3>
                    <div className="space-y-1 text-sm">
                        <p className="text-green-600 dark:text-green-400">
                            ✓ {uploadResults.filter(r => r.success).length} files uploaded successfully
                        </p>
                        {uploadResults.filter(r => !r.success).length > 0 && (
                            <p className="text-red-600 dark:text-red-400">
                                ✗ {uploadResults.filter(r => !r.success).length} files failed to upload
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 