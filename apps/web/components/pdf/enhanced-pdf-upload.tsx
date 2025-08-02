'use client';

import { AlertCircle, CheckCircle, File, Loader, Upload, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  uploadedUrl?: string;
}

interface EnhancedPDFUploadProps {
  onUploadComplete?: (files: never[]) => void;
  onUploadError?: (error: string) => void;
  onClose?: () => void;
  className?: string;
}

export default function EnhancedPDFUpload({
  onUploadComplete,
  onUploadError,
  onClose,
  className
}: EnhancedPDFUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID for files
  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  // Validate PDF file
  const validatePDFFile = (file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }

    // Check file size (max 50MB for PDFs)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'File cannot be empty';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      onUploadError?.('Please select only PDF files');
      return;
    }

    if (pdfFiles.length !== fileArray.length) {
      onUploadError?.('Some files were ignored - only PDF files are allowed');
    }

    const newFiles: UploadedFile[] = pdfFiles.map(file => {
      const error = validatePDFFile(file);
      return {
        id: generateFileId(),
        file: file,
        progress: 0,
        status: error ? 'error' : 'uploading',
        error: error || undefined
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Start upload for valid files
    newFiles.forEach(file => {
      if (file.status === 'uploading') {
        uploadFile(file);
      }
    });
  }, [onUploadError, uploadFile]);

  // Upload individual file
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uploadFile = useCallback(async (file: UploadedFile) => {
    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('files', file.file);

      // Track upload progress
      const xhr = new XMLHttpRequest();

      // Handle progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadedFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, progress } : f
          ));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload response:', response);

            // Handle both single file (response.file) and multiple files (response.files) responses
            let uploadedFile: any;
            if (response.success) {
              if (response.file) {
                // Single file response
                uploadedFile = response.file;
              } else if (response.files && response.files.length > 0) {
                // Multiple files response
                uploadedFile = response.files[0];
              } else {
                throw new Error('No file data in response');
              }

              setUploadedFiles(prev => {
                const updated = prev.map(f =>
                  f.id === file.id
                    ? {
                      ...f,
                      progress: 100,
                      status: 'success' as const,
                      uploadedUrl: uploadedFile.url
                    }
                    : f
                );

                // Check completion after state update
                setTimeout(() => {
                  const allComplete = updated.every(f => f.status !== 'uploading');
                  if (allComplete) {
                    setIsUploading(false);
                    const successfulFiles = updated.filter(f => f.status === 'success');
                    if (successfulFiles.length > 0) {
                      // Map to include the file data needed by the documents page
                      const filesWithData = successfulFiles.map(f => ({
                        name: f.file.name,
                        size: f.file.size,
                        type: f.file.type,
                        uploadedUrl: f.uploadedUrl,
                        url: f.uploadedUrl,
                        fileName: f.file.name
                      }));
                      onUploadComplete?.(filesWithData);

                      // Auto-close modal after successful upload
                      setTimeout(() => {
                        onClose?.();
                      }, 1500);
                    }
                  }
                }, 100);

                return updated;
              });
            } else {
              throw new Error(response.error || 'Upload failed');
            }
          } catch (parseError) {
            console.error('Response parse error:', parseError);
            setUploadedFiles(prev => prev.map(f =>
              f.id === file.id
                ? { ...f, status: 'error' as const, error: 'Invalid server response' }
                : f
            ));
          }
        } else {
          console.error('Upload failed with status:', xhr.status, xhr.statusText);
          setUploadedFiles(prev => prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'error' as const, error: `Upload failed: ${xhr.statusText}` }
              : f
          ));
        }
      });

      // Handle errors
      xhr.addEventListener('error', (e) => {
        console.error('Network error:', e);
        setUploadedFiles(prev => {
          const updated = prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'error' as const, error: 'Network error occurred' }
              : f
          );

          // Check completion after state update
          setTimeout(() => {
            const allComplete = updated.every(f => f.status !== 'uploading');
            if (allComplete) {
              setIsUploading(false);
              const successfulFiles = updated.filter(f => f.status === 'success');
              if (successfulFiles.length > 0) {
                // Map to include the file data needed by the documents page
                const filesWithData = successfulFiles.map(f => ({
                  name: f.file.name,
                  size: f.file.size,
                  type: f.file.type,
                  uploadedUrl: f.uploadedUrl,
                  url: f.uploadedUrl,
                  fileName: f.file.name
                }));
                onUploadComplete?.(filesWithData);

                // Auto-close modal after successful upload (only if all files succeeded)
                const hasErrors = updated.some(f => f.status === 'error');
                if (!hasErrors) {
                  setTimeout(() => {
                    onClose?.();
                  }, 1500);
                }
              }
            }
          }, 100);

          return updated;
        });
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        console.error('Upload timeout');
        setUploadedFiles(prev => prev.map(f =>
          f.id === file.id
            ? { ...f, status: 'error' as const, error: 'Upload timeout' }
            : f
        ));
      });

      // Set timeout (30 seconds)
      xhr.timeout = 30000;

      // Send request
      xhr.open('POST', '/api/files/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => prev.map(f =>
        f.id === file.id
          ? {
            ...f,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Upload failed'
          }
          : f
      ));
      setIsUploading(false);
    }
  });

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // File input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Retry upload
  const retryUpload = useCallback((file: UploadedFile) => {
    setUploadedFiles(prev => prev.map(f =>
      f.id === file.id
        ? { ...f, status: 'uploading', progress: 0, error: undefined }
        : f
    ));
    uploadFile(file);
  }, []);

  // Format file size
  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  return (
    <div className={cn("bg-gray-800 rounded-lg", className)}>
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-white">Upload PDF Documents</h2>
          <p className="text-gray-400 mt-1">Upload construction documents, contracts, plans, and reports</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close upload dialog"
            aria-label="Close upload dialog"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
            isDragOver
              ? "border-orange-500 bg-orange-500/10"
              : "border-gray-600 hover:border-gray-500",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-2">
            {isDragOver ? 'Drop PDF files here' : 'Drag & drop PDF files here'}
          </p>
          <p className="text-gray-400 mb-4">or</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose PDF Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
            title="Select PDF files"
            aria-label="Select PDF files to upload"
          />
          <p className="text-xs text-gray-500 mt-4">
            Maximum file size: 50MB per PDF • Supported format: PDF
          </p>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                Files ({uploadedFiles.length})
              </h3>
              {uploadedFiles.some(f => f.status === 'error') && (
                <button
                  onClick={() => {
                    uploadedFiles.forEach(file => {
                      if (file.status === 'error') {
                        retryUpload(file);
                      }
                    });
                  }}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  Retry Failed
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {/* File Preview Thumbnail */}
                      <div className="w-12 h-16 bg-gray-600 rounded-lg flex items-center justify-center border border-gray-500 flex-shrink-0">
                        <File className="w-6 h-6 text-red-400" />
                      </div>

                      {/* File Details */}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate" title={file.file.name}>
                          {file.file.name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{formatFileSize(file.file.size)}</span>
                          <span>PDF Document</span>
                          <span>Modified: {new Date(file.file.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Status Icon */}
                      {file.status === 'uploading' && (
                        <Loader className="w-5 h-5 text-orange-400 animate-spin" />
                      )}
                      {file.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}

                      {/* Actions */}
                      {file.status === 'error' && (
                        <button
                          onClick={() => retryUpload(file)}
                          className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded"
                        >
                          Retry
                        </button>
                      )}

                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title={`Remove ${file.file.name}`}
                        aria-label={`Remove ${file.file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <div className="mt-2 text-sm text-red-400 bg-red-900/20 rounded p-2">
                      {file.error}
                    </div>
                  )}

                  {/* Success Message */}
                  {file.status === 'success' && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-green-400">
                        ✓ Upload completed successfully
                      </span>
                      {file.uploadedUrl && (
                        <button
                          onClick={() => window.open(file.uploadedUrl, '_blank')}
                          className="text-sm text-orange-400 hover:text-orange-300 underline"
                        >
                          View Document
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Summary */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {uploadedFiles.filter(f => f.status === 'success').length} of {uploadedFiles.length} uploaded
              </span>
              {uploadedFiles.some(f => f.status === 'error') && (
                <span className="text-red-400">
                  {uploadedFiles.filter(f => f.status === 'error').length} failed
                </span>
              )}
            </div>
          </div>
        )}

        {/* Upload Tips */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">💡 Upload Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• For best results, use high-quality scanned PDFs</li>
            <li>• Large files may take longer to process and upload</li>
            <li>• You can upload multiple PDFs at once</li>
            <li>• Uploaded documents will be automatically organized and searchable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
