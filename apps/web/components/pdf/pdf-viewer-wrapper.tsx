'use client';

import dynamic from 'next/dynamic';
import { LoadingIcon } from '../ui/icons';

// Import the SecurePDFViewer dynamically to avoid SSR issues
const SecurePDFViewer = dynamic(
    () => import('./secure-pdf-viewer'),
    {
        ssr: false,
        loading: () => (
            <div className="border border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <LoadingIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-gray-600">Loading PDF viewer...</p>
            </div>
        ),
    }
);

// Re-export the component with the same interface
export default SecurePDFViewer;
export type { SecurePDFViewerProps } from './secure-pdf-viewer'; 