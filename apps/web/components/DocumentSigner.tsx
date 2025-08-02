'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Download, X, Type, Upload, Move } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useToast } from './Toast';

interface DocumentSignerProps {
  document: {
    id: string;
    name: string;
    url: string;
    type: string;
    file?: File;
  };
  onClose: () => void;
  onSign?: (documentId: string, signatures: SignatureData[]) => void;
}

interface SignatureData {
  userId: string;
  imageUrl: string;
  page: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  signedAt: string;
}

interface PlacedSignature {
  id: string;
  imageUrl: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const SIGNATURE_FONTS = [
  { name: 'Great Vibes', value: 'Great Vibes, cursive' },
  { name: 'Pacifico', value: 'Pacifico, cursive' },
  { name: 'Roboto Slab', value: 'Roboto Slab, serif' }
];

export default function DocumentSigner({ document: pdfDocument, onClose, onSign }: DocumentSignerProps) {
  const { addToast } = useToast();
  const [signatureMode, setSignatureMode] = useState<'type' | 'upload'>('type');
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].value);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSignature, setDraggedSignature] = useState<PlacedSignature | null>(null);

  // Load saved signatures from localStorage
  useEffect(() => {
    const savedSignatures = localStorage.getItem(`signatures_${pdfDocument.id}`);
    if (savedSignatures) {
      try {
        setPlacedSignatures(JSON.parse(savedSignatures));
      } catch (e) {
        console.error('Error loading saved signatures:', e);
      }
    }
  }, [pdfDocument.id]);

  // Handle PDF URL - create blob URL if file is provided
  useEffect(() => {
    if (pdfDocument.file) {
      const url = URL.createObjectURL(pdfDocument.file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl(pdfDocument.url);
    }
  }, [pdfDocument.file, pdfDocument.url]);

  // Add Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Pacifico&family=Roboto+Slab:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const generateTypedSignature = () => {
    if (!typedName.trim()) {
      addToast('Please enter your name', 'error');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 150;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font and draw signature
    ctx.fillStyle = 'black';
    ctx.font = `48px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    // Convert to base64
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
      addToast('Please upload a PNG or JPG image', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addSignatureToPage = () => {
    if (!signatureImage) {
      addToast('Please create or upload a signature first', 'error');
      return;
    }

    const newSignature: PlacedSignature = {
      id: Date.now().toString(),
      imageUrl: signatureImage,
      page: currentPage,
      x: 100,
      y: 100,
      width: 200,
      height: 75
    };

    const updatedSignatures = [...placedSignatures, newSignature];
    setPlacedSignatures(updatedSignatures);
    
    // Save to localStorage
    localStorage.setItem(`signatures_${pdfDocument.id}`, JSON.stringify(updatedSignatures));
    addToast('Signature added! You can drag it to position.', 'success');
  };

  const updateSignaturePosition = (id: string, x: number, y: number) => {
    const updated = placedSignatures.map(sig => 
      sig.id === id ? { ...sig, x, y } : sig
    );
    setPlacedSignatures(updated);
    localStorage.setItem(`signatures_${pdfDocument.id}`, JSON.stringify(updated));
  };

  const removeSignature = (id: string) => {
    const updated = placedSignatures.filter(sig => sig.id !== id);
    setPlacedSignatures(updated);
    localStorage.setItem(`signatures_${pdfDocument.id}`, JSON.stringify(updated));
  };

  const handleMouseDown = (e: React.MouseEvent, signature: PlacedSignature) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggedSignature(signature);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedSignature) return;

    const container = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - container.left - (draggedSignature.width / 2);
    const y = e.clientY - container.top - (draggedSignature.height / 2);

    updateSignaturePosition(draggedSignature.id, x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedSignature(null);
  };

  const handleSubmit = async () => {
    if (placedSignatures.length === 0) {
      addToast('Please add at least one signature', 'error');
      return;
    }

    setIsSaving(true);

    try {
      // Convert placed signatures to SignatureData format
      // For now, we'll use fixed percentages since we don't have the actual PDF dimensions
      const signatureData: SignatureData[] = placedSignatures.map(sig => ({
        userId: 'current-user',
        imageUrl: sig.imageUrl,
        page: sig.page,
        xPercent: 20, // Fixed position for now
        yPercent: 70, // Bottom of page
        widthPercent: 25,
        signedAt: new Date().toISOString()
      }));

      // Send to API
      const formData = new FormData();
      if (pdfDocument.file) {
        formData.append('pdf', pdfDocument.file);
      } else {
        try {
          const response = await fetch(pdfDocument.url);
          const blob = await response.blob();
          formData.append('pdf', blob, pdfDocument.name);
        } catch (error) {
          console.error('Error fetching PDF:', error);
          addToast('Error loading PDF file', 'error');
          setIsSaving(false);
          return;
        }
      }
      formData.append('signatures', JSON.stringify(signatureData));
      formData.append('documentName', pdfDocument.name);

      const apiResponse = await fetch('/api/send-signed-pdf', {
        method: 'POST',
        body: formData
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to send signed document');
      }

      const result = await apiResponse.json();
      
      if (onSign) {
        onSign(pdfDocument.id, signatureData);
      }

      // Clear saved signatures
      localStorage.removeItem(`signatures_${pdfDocument.id}`);

      addToast('Document signed and sent successfully!', 'success');
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Error submitting signatures:', error);
      addToast('Failed to save signatures', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex">
      {/* Document Preview */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">{pdfDocument.name}</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Page {currentPage} of {numPages || '...'}</span>
            </div>
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Open in new tab"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div 
          className="flex-1 bg-gray-800 p-4 overflow-auto relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative mx-auto bg-white rounded-lg shadow-lg" style={{ width: '100%', maxWidth: '800px', minHeight: '600px' }}>
            {/* PDF Viewer */}
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js`}>
              <div style={{ height: '100%', minHeight: '600px' }}>
                <Viewer 
                  fileUrl={pdfUrl}
                  onDocumentLoad={(e) => setNumPages(e.doc.numPages)}
                  onPageChange={(e) => setCurrentPage(e.currentPage)}
                />
              </div>
            </Worker>
            
            {/* Signature Overlays */}
            {placedSignatures
              .filter(sig => sig.page === currentPage)
              .map(signature => (
                <div
                  key={signature.id}
                  className="absolute cursor-move group"
                  style={{ 
                    left: signature.x, 
                    top: signature.y,
                    width: signature.width,
                    height: signature.height,
                    zIndex: 10
                  }}
                  onMouseDown={(e) => handleMouseDown(e, signature)}
                >
                  <img
                    src={signature.imageUrl}
                    alt="Signature"
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSignature(signature.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Signature Panel */}
      <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-1">Sign Document</h3>
          <p className="text-sm text-gray-400">
            Create your signature and place it on the document
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Signature Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setSignatureMode('type')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                signatureMode === 'type'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Type className="w-4 h-4" />
              Type
            </button>
            <button
              onClick={() => setSignatureMode('upload')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                signatureMode === 'upload'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>

          {/* Type Signature */}
          {signatureMode === 'type' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Style
                </label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  {SIGNATURE_FONTS.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={generateTypedSignature}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Generate Signature
              </button>
            </div>
          )}

          {/* Upload Signature */}
          {signatureMode === 'upload' && (
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Signature Image
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                />
              </label>
              <p className="text-xs text-gray-400">
                Supported formats: PNG, JPG (max 5MB)
              </p>
            </div>
          )}

          {/* Signature Preview */}
          {signatureImage && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Signature Preview</h4>
              <div className="bg-white rounded-lg p-4">
                <img
                  src={signatureImage}
                  alt="Signature preview"
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: '100px' }}
                />
              </div>
              <button
                onClick={addSignatureToPage}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Move className="w-4 h-4" />
                Add to Document
              </button>
            </div>
          )}

          {/* Placed Signatures Summary */}
          {placedSignatures.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Placed Signatures ({placedSignatures.length})
              </h4>
              <div className="space-y-1 text-xs text-gray-400">
                {placedSignatures.map((sig, index) => (
                  <div key={sig.id} className="flex justify-between">
                    <span>Signature {index + 1} - Page {sig.page}</span>
                    <button
                      onClick={() => setCurrentPage(sig.page)}
                      className="text-orange-400 hover:text-orange-300"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">How to Sign</p>
                <p className="text-xs">
                  1. Create or upload your signature<br/>
                  2. Click "Add to Document"<br/>
                  3. Drag signature to desired position<br/>
                  4. Click "Submit" when ready
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isSaving || placedSignatures.length === 0}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isSaving || placedSignatures.length === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Sending...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Submit Signed Document
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}