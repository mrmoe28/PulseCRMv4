import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import os from 'os';

// In development, use temp directory; in production, use public/uploads
const isDevelopment = process.env.NODE_ENV === 'development';
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
    
    // In development, store as base64; in production, save to disk
    let base64Data: string | undefined;
    
    if (isDevelopment) {
      // Store as base64 for development
      base64Data = buffer.toString('base64');
      console.log('Storing file as base64 in development mode');
    } else {
      // Save to disk in production
      const filepath = path.join(UPLOAD_DIR, filename);
      console.log('Saving file to:', filepath);
      await writeFile(filepath, buffer);
      console.log('File saved successfully');
    }

    // Create document metadata
    const newDocument: DocumentMetadata = {
      id: timestamp.toString(),
      name: file.name,
      filename: filename,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      category: formData.get('category') as string || 'contracts',
      status: 'draft',
      ...(isDevelopment && base64Data ? { base64Data } : {})
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
        url: isDevelopment && base64Data 
          ? `data:${file.type};base64,${base64Data}`
          : `/uploads/${filename}`
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
      url: isDevelopment && doc.base64Data
        ? `data:${doc.type};base64,${doc.base64Data}`
        : `/uploads/${doc.filename}`
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