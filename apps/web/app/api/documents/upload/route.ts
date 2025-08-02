import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import os from 'os';
import { put } from '@vercel/blob';

// Configure runtime for Vercel
export const runtime = 'nodejs';
export const maxDuration = 30;

// In development, use temp directory; in production, use Vercel Blob
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const useVercelBlob = isProduction && process.env.BLOB_READ_WRITE_TOKEN;
const TEMP_DIR = path.join(os.tmpdir(), 'constructflow-uploads');
const PUBLIC_DIR = path.join(process.cwd(), 'apps/web/public');
const UPLOAD_DIR = isDevelopment ? TEMP_DIR : path.join(PUBLIC_DIR, 'uploads');
const DATA_DIR = path.join(process.cwd(), 'apps/web/data');
const METADATA_FILE = path.join(DATA_DIR, 'documents-metadata.json');

// For development, we'll store files as base64 in the metadata
interface DocumentMetadata {
  id: string;
  name: string;
  filename: string;
  size: number;
  type: string;
  uploadDate: string;
  category?: string;
  status?: string;
  base64Data?: string; // Store file data for development
  storageUrl?: string; // Store the actual URL for Vercel Blob
}

async function ensureDirectories() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
      console.log('Created upload directory:', UPLOAD_DIR);
    }
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
      console.log('Created data directory:', DATA_DIR);
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

async function loadMetadata(): Promise<DocumentMetadata[]> {
  try {
    await ensureDirectories();
    
    if (existsSync(METADATA_FILE)) {
      const data = await readFile(METADATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading metadata:', error);
  }
  return [];
}

async function saveMetadata(metadata: DocumentMetadata[]): Promise<void> {
  try {
    await ensureDirectories();
    await writeFile(
      METADATA_FILE,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Error saving metadata:', error);
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/documents/upload - Request received');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('File received:', file?.name, file?.size);
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Ensure directories exist
    await ensureDirectories();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Store file based on environment
    let base64Data: string | undefined;
    let fileUrl: string;
    
    if (useVercelBlob) {
      // Use Vercel Blob in production
      try {
        console.log('Uploading to Vercel Blob...');
        const blob = await put(filename, buffer, {
          access: 'public',
          addRandomSuffix: false,
          contentType: file.type,
        });
        fileUrl = blob.url;
        console.log('File uploaded to Vercel Blob:', fileUrl);
      } catch (blobError) {
        console.error('Vercel Blob upload failed:', blobError);
        throw new Error('Failed to upload file to cloud storage');
      }
    } else if (isDevelopment) {
      // Store as base64 for development
      base64Data = buffer.toString('base64');
      fileUrl = `data:${file.type};base64,${base64Data}`;
      console.log('Storing file as base64 in development mode');
    } else {
      // Fallback to local storage (not recommended for Vercel)
      const filepath = path.join(UPLOAD_DIR, filename);
      console.log('Saving file to:', filepath);
      await writeFile(filepath, buffer);
      fileUrl = `/uploads/${filename}`;
      console.log('File saved locally');
    }

    // Create document metadata
    const newDocument: DocumentMetadata = {
      id: timestamp.toString(),
      name: file.name,
      filename: filename, // Always store the actual filename
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      category: formData.get('category') as string || 'contracts',
      status: 'draft',
      ...(isDevelopment && base64Data ? { base64Data } : {}),
      ...(useVercelBlob ? { storageUrl: fileUrl } : {}) // Store Vercel Blob URL separately
    };

    // Load existing metadata and add new document
    const metadata = await loadMetadata();
    metadata.unshift(newDocument);
    await saveMetadata(metadata);

    console.log('Metadata saved successfully');

    return NextResponse.json({
      success: true,
      document: {
        id: newDocument.id,
        name: newDocument.name,
        filename: newDocument.filename,
        size: newDocument.size,
        type: newDocument.type,
        uploadDate: newDocument.uploadDate,
        category: newDocument.category,
        status: newDocument.status,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error in POST /api/documents/upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('GET /api/documents/upload - Request received');
  
  try {
    const metadata = await loadMetadata();
    const documents = metadata.map(doc => ({
      id: doc.id,
      name: doc.name,
      filename: doc.filename,
      size: doc.size,
      type: doc.type,
      uploadDate: doc.uploadDate,
      category: doc.category,
      status: doc.status,
      url: doc.base64Data
        ? `data:${doc.type};base64,${doc.base64Data}`
        : (doc.storageUrl || `/uploads/${doc.filename}`)
    }));
    
    console.log('Returning documents:', documents.length);
    
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error in GET /api/documents/upload:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}