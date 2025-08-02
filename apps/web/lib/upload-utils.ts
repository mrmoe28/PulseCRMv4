// Enhanced file upload utilities with retry logic and better error handling

export interface UploadProgress {
    fileName: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

export interface UploadResult {
    success: boolean;
    file?: {
        id: string;
        filename: string;
        originalName: string;
        size: number;
        type: string;
        uploadedAt: string;
        url: string;
    };
    error?: string;
}

export interface UploadOptions {
    maxRetries?: number;
    retryDelay?: number;
    onProgress?: (progress: UploadProgress) => void;
    timeout?: number;
}

// Enhanced upload with retry logic
export async function uploadWithRetry(
    files: File[],
    options: UploadOptions = {}
): Promise<UploadResult[]> {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        onProgress,
        timeout = 30000
    } = options;

    const results: UploadResult[] = [];

    for (const file of files) {
        let lastError: Error | null = null;

        // Update progress
        onProgress?.({
            fileName: file.name,
            progress: 0,
            status: 'pending'
        });

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                onProgress?.({
                    fileName: file.name,
                    progress: 25 * attempt,
                    status: 'uploading'
                });

                const result = await uploadSingleFile(file, { timeout, onProgress });

                if (result.success) {
                    results.push(result);

                    onProgress?.({
                        fileName: file.name,
                        progress: 100,
                        status: 'completed'
                    });

                    break;
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                console.warn(`Upload attempt ${attempt}/${maxRetries} failed for ${file.name}:`, error);

                if (attempt === maxRetries) {
                    // Final attempt failed
                    results.push({
                        success: false,
                        error: lastError.message
                    });

                    onProgress?.({
                        fileName: file.name,
                        progress: 0,
                        status: 'error',
                        error: lastError.message
                    });
                } else {
                    // Wait before retry with exponential backoff
                    const delay = retryDelay * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }

    return results;
}

// Upload single file with timeout and progress
async function uploadSingleFile(
    file: File,
    options: { timeout?: number; onProgress?: (progress: UploadProgress) => void } = {}
): Promise<UploadResult> {
    const { timeout = 30000, onProgress } = options;

    return new Promise((resolve) => {
        const formData = new FormData();
        formData.append('files', file);

        const xhr = new XMLHttpRequest();

        // Set timeout
        xhr.timeout = timeout;

        // Progress tracking
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress?.({
                    fileName: file.name,
                    progress,
                    status: 'uploading'
                });
            }
        });

        // Success handler
        xhr.addEventListener('load', () => {
            try {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        success: true,
                        file: response.file || response.files?.[0]
                    });
                } else {
                    const errorResponse = JSON.parse(xhr.responseText);
                    resolve({
                        success: false,
                        error: errorResponse.error || `HTTP ${xhr.status}: ${xhr.statusText}`
                    });
                }
            } catch (error) {
                resolve({
                    success: false,
                    error: 'Invalid response from server'
                });
            }
        });

        // Error handlers
        xhr.addEventListener('error', () => {
            resolve({
                success: false,
                error: 'Network error occurred'
            });
        });

        xhr.addEventListener('timeout', () => {
            resolve({
                success: false,
                error: 'Upload timeout'
            });
        });

        xhr.addEventListener('abort', () => {
            resolve({
                success: false,
                error: 'Upload cancelled'
            });
        });

        // Send request
        xhr.open('POST', '/api/files/upload');
        xhr.send(formData);
    });
}

// Batch upload with concurrency control
export async function uploadBatch(
    files: File[],
    options: UploadOptions & { concurrency?: number } = {}
): Promise<UploadResult[]> {
    const { concurrency = 3, ...uploadOptions } = options;

    const results: UploadResult[] = [];
    const chunks: File[][] = [];

    // Split files into chunks for concurrent processing
    for (let i = 0; i < files.length; i += concurrency) {
        chunks.push(files.slice(i, i + concurrency));
    }

    // Process chunks sequentially, files within chunks concurrently
    for (const chunk of chunks) {
        const chunkResults = await Promise.all(
            chunk.map(file => uploadWithRetry([file], uploadOptions))
        );

        results.push(...chunkResults.flat());
    }

    return results;
}

// Validate files before upload
export function validateFiles(files: File[]): { valid: File[]; invalid: { file: File; reason: string }[] } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/csv',
        'text/plain',
        'application/csv',
        'application/octet-stream',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const valid: File[] = [];
    const invalid: { file: File; reason: string }[] = [];

    for (const file of files) {
        if (!file.name || file.name.trim() === '') {
            invalid.push({ file, reason: 'Invalid filename' });
        } else if (file.size === 0) {
            invalid.push({ file, reason: 'File is empty' });
        } else if (file.size > maxSize) {
            invalid.push({ file, reason: 'File too large (max 10MB)' });
        } else if (!allowedTypes.includes(file.type)) {
            invalid.push({ file, reason: `File type not supported: ${file.type}` });
        } else {
            valid.push(file);
        }
    }

    return { valid, invalid };
}

// Generate unique upload ID for tracking
export function generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 