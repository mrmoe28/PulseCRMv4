# File Upload & Document Management System

## Overview
Complete document management system with file upload, PDF viewing, and document organization capabilities.

## Features Implemented

### 1. File Upload Component
- **Drag & Drop**: Intuitive drag-and-drop interface
- **File Validation**: Size and type checking
- **Progress Tracking**: Visual upload progress
- **Error Handling**: Clear error messages
- **Multiple Files**: Support for batch uploads

### 2. API Route (`/api/upload`)
- **Secure Upload**: Server-side validation
- **Unique Filenames**: Prevents conflicts
- **File Storage**: Local storage in `public/uploads`
- **Metadata**: Returns file info for database storage

### 3. Documents Page
- **Document List**: Table view with sorting
- **Search**: Filter documents by name
- **Categories**: Organize by type (Contracts, Invoices, etc.)
- **PDF Viewer**: Built-in PDF viewing
- **Download**: Direct file downloads
- **Delete**: Remove documents
- **Statistics**: Document count and size tracking

## File Upload Usage

### Basic Upload
```tsx
import FileUpload from '@/components/FileUpload';

<FileUpload
  onUpload={async (file) => {
    // Handle file upload
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('Uploaded:', data.file);
  }}
  accept=".pdf,.doc,.docx"
  maxSize={10} // MB
/>
```

### Multiple Files
```tsx
<FileUpload
  onUpload={handleUpload}
  multiple={true}
  accept=".pdf,.doc,.docx,.xls,.xlsx"
  maxSize={25}
/>
```

## Supported File Types

| Type | Extensions | MIME Types |
|------|------------|------------|
| PDF | .pdf | application/pdf |
| Word | .doc, .docx | application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Excel | .xls, .xlsx | application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |

## Storage Options

### Current: Local Storage
Files are stored in `apps/web/public/uploads/`
- ✅ Simple setup
- ✅ Works locally and on Vercel
- ❌ Limited by deployment size
- ❌ Files lost on redeploy

### Recommended for Production

#### Option 1: Vercel Blob Storage
```typescript
import { put } from '@vercel/blob';

const blob = await put(filename, file, {
  access: 'public',
});
```

#### Option 2: AWS S3
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });
await s3.send(new PutObjectCommand({
  Bucket: 'your-bucket',
  Key: filename,
  Body: file,
}));
```

#### Option 3: Cloudinary
```typescript
import { v2 as cloudinary } from 'cloudinary';

const result = await cloudinary.uploader.upload(file, {
  resource_type: 'auto',
  folder: 'documents',
});
```

## Security Considerations

### File Validation
- ✅ Client-side type checking
- ✅ Server-side validation
- ✅ File size limits
- ✅ MIME type verification

### Access Control (To Implement)
```typescript
// Add to API route
const session = await getSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Track uploads
const upload = {
  ...fileData,
  userId: session.user.id,
  organizationId: session.user.organizationId,
};
```

## Database Schema (Recommended)

```sql
CREATE TABLE documents (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  size INTEGER,
  url TEXT,
  category VARCHAR(100),
  uploaded_by VARCHAR(255),
  organization_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
```

## Deployment Considerations

### Vercel Deployment
1. **File Size Limits**: Vercel has a 4.5MB limit for serverless functions
2. **Storage**: Consider external storage for production
3. **Environment Variables**: Add storage credentials

### Environment Variables Needed
```env
# For S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket

# For Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# For Vercel Blob
BLOB_READ_WRITE_TOKEN=your-token
```

## Usage Example: Solar Agreement Upload

For documents like the Solar Installation Agreement:

1. **Upload**: Drag and drop the PDF
2. **Categorize**: Select "Contracts" category
3. **View**: Click the eye icon to view in-browser
4. **Share**: Generate shareable link (future feature)
5. **Track**: See upload history and metadata

## Future Enhancements

1. **Document Sharing**
   - Generate shareable links
   - Set expiration dates
   - Track views

2. **Version Control**
   - Upload new versions
   - Track changes
   - Compare versions

3. **OCR & Search**
   - Extract text from PDFs
   - Full-text search
   - Auto-categorization

4. **Signatures**
   - E-signature integration
   - Track signature status
   - Send for signing

5. **Templates**
   - Document templates
   - Auto-fill fields
   - Generate from data

## Troubleshooting

### Upload Fails
- Check file size (< 10MB)
- Verify file type is allowed
- Check network connection
- Ensure upload directory exists

### PDF Won't Display
- Verify file is actually PDF
- Check CORS settings
- Try downloading instead
- Check browser console

### Files Not Persisting
- Using local storage (files lost on redeploy)
- Implement external storage
- Check file permissions

## Best Practices

1. **Always validate** files on both client and server
2. **Use external storage** for production
3. **Implement access control** for sensitive documents
4. **Regular backups** of uploaded files
5. **Monitor storage usage** and costs
6. **Compress PDFs** before upload when possible
7. **Set up virus scanning** for production