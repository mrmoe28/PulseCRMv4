# Document Signature Feature

## Overview
The ConstructFlow document management system now includes a comprehensive signature feature that allows users to sign PDF documents electronically. Users can either type their name and choose from professional fonts or upload an image of their signature.

## Features

### 1. Signature Creation Methods

#### Type Signature
- Users can type their full name
- Choose from 3 professional fonts:
  - Great Vibes (cursive)
  - Pacifico (casual)  
  - Roboto Slab (formal)
- Signature is rendered on canvas and converted to PNG

#### Upload Signature
- Users can upload PNG or JPG signature images
- Maximum file size: 5MB
- Images are converted to base64 for storage

### 2. Signature Placement
- **Drag & Drop**: Signatures can be dragged anywhere on the PDF
- **Multi-page Support**: Navigate between pages and place signatures on any page
- **Visual Preview**: Hover effects show signature boundaries
- **Remove Option**: Click the X button to remove placed signatures
- **Persistence**: Signature positions are saved in localStorage

### 3. Signature Data Model
```typescript
interface SignatureData {
  userId: string;
  imageUrl: string;      // base64 or blob URL
  page: number;          // PDF page number
  xPercent: number;      // X position as percentage
  yPercent: number;      // Y position as percentage  
  widthPercent: number;  // Width as percentage
  signedAt: string;      // ISO timestamp
}
```

### 4. API Integration

#### Endpoint: `/api/send-signed-pdf`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `pdf`: The PDF file (File/Blob)
  - `signatures`: JSON string of SignatureData[]
  - `documentName`: Name of the document

#### Process:
1. Loads PDF using pdf-lib
2. Embeds signature images at specified positions
3. Adds timestamps below signatures
4. Sends signed PDF via email

### 5. Email Configuration

Required environment variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="PulseCRM <noreply@your-domain.com>"
DEFAULT_EMAIL=user@example.com
RECIPIENT_EMAILS=email1@example.com,email2@example.com
```

## Technical Implementation

### Dependencies
- `react-pdf`: PDF rendering
- `react-draggable`: Signature positioning
- `pdf-lib`: Server-side PDF manipulation
- `nodemailer`: Email sending

### Component Structure
```
DocumentSigner.tsx
├── PDF Viewer (left panel)
│   ├── Document display
│   ├── Page navigation
│   └── Signature overlays
└── Signature Panel (right panel)
    ├── Mode toggle (Type/Upload)
    ├── Signature creation
    ├── Preview
    └── Submit actions
```

### Storage
- Signatures are stored in localStorage with key: `signatures_${documentId}`
- Cleared after successful submission

## Usage Instructions

### For Users
1. Click the "Sign Document" button (pen icon) on any PDF
2. Choose signature method:
   - **Type**: Enter name and select font
   - **Upload**: Select signature image file
3. Click "Add to Document" to place signature
4. Drag signature to desired position
5. Add multiple signatures if needed
6. Click "Submit Signed Document" to finalize

### For Developers

#### Enable Signature Feature
The signature button appears automatically for PDFs that are not already signed:
```typescript
{doc.type === 'application/pdf' && 
 doc.status !== 'signed' && 
 doc.status !== 'completed' && (
  <button onClick={() => setSigningDocument(doc)}>
    <PenTool className="w-4 h-4" />
  </button>
)}
```

#### Handle Signed Documents
```typescript
onSign={(docId, signatures) => {
  // Update document status
  setDocuments(prev => prev.map(doc => 
    doc.id === docId 
      ? { ...doc, status: 'signed' as const }
      : doc
  ));
  addToast('Document signed successfully!', 'success');
}}
```

## Security Considerations

1. **Authentication**: UserId should come from authenticated session
2. **File Validation**: Only PDF files can be signed
3. **Image Validation**: Only PNG/JPG signatures accepted
4. **Email Security**: Use app-specific passwords for SMTP
5. **HTTPS**: Always use secure connections in production

## Vercel Deployment Notes

- No file system writes (serverless constraint)
- All processing done in memory
- Base64 encoding for signature storage
- Stateless API routes
- Environment variables configured in Vercel dashboard

## Future Enhancements

1. **Multiple Signers**: Support for multiple users signing same document
2. **Signature Fields**: Pre-defined signature locations
3. **Certificate**: Digital certificates for legal compliance
4. **Audit Trail**: Complete signature history
5. **Templates**: Reusable signature templates
6. **Mobile Support**: Touch-friendly signature drawing

## Troubleshooting

### Common Issues

1. **Signature not appearing**: Check browser console for errors
2. **Email not sending**: Verify SMTP credentials
3. **PDF not loading**: Ensure CORS headers are set correctly
4. **Drag not working**: Check for CSS conflicts

### Debug Mode
Add to localStorage to enable debug logging:
```javascript
localStorage.setItem('debug_signatures', 'true');
```
