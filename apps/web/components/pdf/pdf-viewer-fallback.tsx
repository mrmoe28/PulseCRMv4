// PDF viewer that gracefully handles when react-pdf is not available
import React from 'react';

export function PDFViewer({ children, ...props }: any) {
  return (
    <div className="pdf-viewer-container p-4 bg-gray-100 rounded-lg">
      <p className="text-gray-600">PDF preview is not available in this environment.</p>
      <p className="text-sm text-gray-500 mt-2">The PDF functionality requires native dependencies that are not compatible with the deployment environment.</p>
    </div>
  );
}

export function EnhancedPDFViewer(props: any) {
  return <PDFViewer {...props} />;
}

export function SecurePDFViewer(props: any) {
  return <PDFViewer {...props} />;
}
