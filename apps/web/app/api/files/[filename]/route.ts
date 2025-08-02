import { existsSync } from 'fs';
import { readFile, stat } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename: rawFilename } = await params;
    const filename = decodeURIComponent(rawFilename);

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Determine file path based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get file stats
    const fileStats = await stat(filePath);
    const fileBuffer = await readFile(filePath);

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.csv': 'text/csv',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Create response headers
    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Content-Length': fileStats.size.toString(),
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Allow iframe embedding for PDFs and images
    if (ext === '.pdf' || contentType.startsWith('image/')) {
      headers['X-Frame-Options'] = 'SAMEORIGIN';
      headers['Content-Security-Policy'] = "frame-ancestors 'self'";
    }

    // Create response with proper headers
    const response = new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });

    return response;

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


