'use client';

import { CheckCircle, Download, Eye, FileText, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import EnhancedFileUpload from './enhanced-file-upload';
import PDFPreview from './pdf-preview';
import UniversalDocumentViewer from './pdf/universal-document-viewer';

interface SolarDocument {
    id: string;
    name: string;
    filename: string; // Actual stored filename
    size: string;
    uploadedAt: string;
    url: string;
    status: 'uploaded' | 'processing' | 'ready';
}

export default function SolarDocumentManager() {
    const [documents, setDocuments] = useState<SolarDocument[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<SolarDocument | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [showViewer, setShowViewer] = useState(false);

    const handleUploadComplete = useCallback((uploadResults: any[]) => {
        console.log('Solar document upload completed:', uploadResults);

        const newDocuments = uploadResults
            .filter(result => result.success && result.file)
            .map(result => {
                const file = result.file;
                return {
                    id: file.id,
                    name: file.originalName,
                    filename: file.filename,
                    size: formatFileSize(file.size),
                    uploadedAt: new Date().toLocaleString(),
                    url: file.url,
                    status: 'ready' as const
                };
            });

        setDocuments(prev => [...newDocuments, ...prev]);
        setShowUpload(false);

        if (newDocuments.length > 0) {
            alert(`Successfully uploaded ${newDocuments.length} Solar Installation Agreement(s)!`);
        }
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleViewDocument = (document: SolarDocument) => {
        setSelectedDocument(document);
        setShowViewer(true);
    };

    const handleDownloadDocument = (document: SolarDocument) => {
        const link = window.document.createElement('a');
        link.href = document.url;
        link.download = document.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Solar Installation Agreement Manager</h1>
                <p className="text-gray-400">
                    Upload and manage your Solar Installation Agreement PDFs with secure viewing and download capabilities.
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        {showUpload ? 'Hide Upload' : 'Upload PDF'}
                    </button>
                </div>

                {showUpload && (
                    <div className="border border-gray-700 rounded-lg p-4">
                        <EnhancedFileUpload
                            onUploadComplete={handleUploadComplete}
                            maxFiles={5}
                            className="mb-4"
                        />
                        <div className="text-sm text-gray-400">
                            <p className="mb-2">📋 <strong>Supported formats:</strong> PDF files up to 10MB each</p>
                            <p className="mb-2">🔒 <strong>Security:</strong> All uploads are processed securely</p>
                            <p>✅ <strong>Best for:</strong> Solar Installation Agreements, Contracts, Permits</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Documents List */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Uploaded Documents ({documents.length})
                </h2>

                {documents.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No documents uploaded yet</h3>
                        <p className="text-gray-400 mb-6">
                            Upload your first Solar Installation Agreement to get started
                        </p>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
                        >
                            Upload Your First Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div key={doc.id} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-650 transition-colors">
                                {/* PDF Preview Section */}
                                <div className="relative">
                                    <PDFPreview
                                        fileUrl={doc.url}
                                        fileName={doc.name}
                                        width={300}
                                        height={200}
                                        className="w-full"
                                    />
                                    {/* Status Badge Overlay */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black bg-opacity-70 rounded-full px-2 py-1">
                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                        <span className="text-xs text-green-400">Ready</span>
                                    </div>
                                </div>

                                {/* Document Info Section */}
                                <div className="p-4">
                                    <h3 className="font-medium text-white mb-2 truncate" title={doc.name}>
                                        {doc.name}
                                    </h3>

                                    <div className="text-sm text-gray-400 mb-4 space-y-1">
                                        <div>Size: {doc.size}</div>
                                        <div>Uploaded: {doc.uploadedAt}</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewDocument(doc)}
                                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownloadDocument(doc)}
                                            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PDF Viewer Modal */}
            {showViewer && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{selectedDocument.name}</h3>
                                <p className="text-sm text-gray-400">Solar Installation Agreement</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowViewer(false);
                                    setSelectedDocument(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <UniversalDocumentViewer
                                fileUrl={selectedDocument.url}
                                fileName={selectedDocument.name}
                                height="100%"
                                showControls={true}
                                onLoadSuccess={(document) => {
                                    console.log('Solar agreement loaded:', document);
                                }}
                                onLoadError={(error) => {
                                    console.error('Error loading solar agreement:', error);
                                    alert('Failed to load document. Please try again.');
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">How to Use</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        <div>
                            <h3 className="font-medium text-white mb-1">Upload Documents</h3>
                            <p className="text-gray-400">
                                Click "Upload PDF" and drag & drop or select your Solar Installation Agreement files.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        <div>
                            <h3 className="font-medium text-white mb-1">View & Review</h3>
                            <p className="text-gray-400">
                                Preview documents in the cards, then click "View" for full-screen reading with zoom controls.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        <div>
                            <h3 className="font-medium text-white mb-1">Download & Share</h3>
                            <p className="text-gray-400">
                                Use the download button to save copies locally or share with team members.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 