// Central export file for all components
// This ensures consistent imports and helps with module resolution on case-sensitive filesystems

// Core components
export { default as DocumentViewer } from './DocumentViewer';
export { default as DocumentSigner } from './DocumentSigner';
export { default as PDFViewer } from './PDFViewer';
export { default as InlinePDFViewer } from './InlinePDFViewer';
export { default as SignaturePad } from './SignaturePad';
export { default as FileUpload } from './FileUpload';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ContractTemplateEditor } from './ContractTemplateEditor';

// Toast component and hook
export { useToast } from './Toast';

// Form components
export { default as ContactForm } from './contact-form';
export { default as JobForm } from './job-form';

// Layout components
export { default as DashboardLayout } from './dashboard-layout';
export { default as Sidebar } from './sidebar';
export { default as TopNavigation } from './top-navigation';
export { default as MobileNavigation } from './mobile-navigation';

// UI components
export { default as StatusBadge } from './status-badge';

// Feature components
export { default as SolarDocumentManager } from './solar-document-manager';
export { default as EnhancedFileUpload } from './enhanced-file-upload';
export { default as SimpleEnhancedUpload } from './simple-enhanced-upload';
export { default as PdfPreview } from './pdf-preview';

// Icons
export * from './icons';