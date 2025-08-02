import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { put } from '@vercel/blob';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    console.log('📁 File upload request received');

    // Check content type
    const contentType = request.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);

    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('❌ Invalid content type:', contentType);
      return NextResponse.json({ error: 'Invalid content type. Expected multipart/form-data.' }, { status: 400 });
    }

    const formData = await request.formData();
    console.log('📦 FormData received, entries:', Array.from(formData.keys()));

    // Handle both single file ('file') and multiple files ('files')
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File;

    const filesToProcess = files.length > 0 ? files : (singleFile ? [singleFile] : []);

    console.log(`📊 Processing ${filesToProcess.length} files`);

    if (filesToProcess.length === 0) {
      console.error('❌ No files provided in request');
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate file types and sizes
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 10; // Maximum number of files per request

    // Rate limiting check (basic implementation)
    if (filesToProcess.length > maxFiles) {
      console.error(`❌ Too many files: ${filesToProcess.length} (max: ${maxFiles})`);
      return NextResponse.json({
        error: `Too many files. Maximum ${maxFiles} files allowed per request.`
      }, { status: 400 });
    }
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', // Sometimes browsers use this
      'image/png',
      'image/gif',
      'image/webp',
      'text/csv',
      'text/plain', // For CSV files that might be detected as plain text
      'application/csv', // Alternative CSV MIME type
      'application/octet-stream', // For files with unknown MIME type
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Additional validation for file extensions when MIME type is generic
    const getAllowedExtensions = () => [
      'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'csv', 'txt',
      'doc', 'docx', 'xls', 'xlsx'
    ];

    // Validate all files before processing any
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      console.log(`🔍 Validating file ${i + 1}/${filesToProcess.length}: ${file.name}, Type: ${file.type}, Size: ${file.size}`);

      // Check if file is actually a File object
      if (!(file instanceof File)) {
        console.error(`❌ Invalid file object at index ${i}`);
        return NextResponse.json({ error: `Invalid file object at position ${i + 1}` }, { status: 400 });
      }

      if (!file.name || file.name.trim() === '') {
        console.error(`❌ Invalid filename for file at index ${i}`);
        return NextResponse.json({ error: `Invalid filename for file at position ${i + 1}` }, { status: 400 });
      }

      // Security: Check for dangerous filenames
      const dangerousPatterns = [
        /\.\./,  // Directory traversal
        /[<>:"|?*]/,  // Invalid filename characters
        /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
        /^\./,  // Hidden files
        /\.(exe|bat|cmd|scr|vbs|js|jar|com|pif)$/i  // Executable files
      ];

      if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
        console.error(`❌ Dangerous filename detected: ${file.name}`);
        return NextResponse.json({
          error: `Filename "${file.name}" contains invalid or dangerous characters`
        }, { status: 400 });
      }

      if (file.size === 0) {
        console.error(`❌ Empty file: ${file.name}`);
        return NextResponse.json({ error: `File "${file.name}" is empty` }, { status: 400 });
      }

      if (file.size > maxSize) {
        console.error(`❌ File too large: ${file.name} (${file.size} bytes)`);
        return NextResponse.json({ error: `File "${file.name}" is too large. Maximum size is 10MB.` }, { status: 400 });
      }

      // Check MIME type first, then fall back to extension check
      const fileExtension = file.name.toLowerCase().split('.').pop() || '';
      const allowedExtensions = getAllowedExtensions();

      const isValidMimeType = allowedTypes.includes(file.type);
      const isValidExtension = allowedExtensions.includes(fileExtension);

      // Special handling for octet-stream files - check extension
      if (file.type === 'application/octet-stream') {
        if (!isValidExtension) {
          console.error(`❌ Unsupported file extension: ${fileExtension} for ${file.name}`);
          return NextResponse.json({
            error: `File extension ".${fileExtension}" is not supported for "${file.name}". Allowed extensions: ${allowedExtensions.join(', ')}`
          }, { status: 400 });
        }
      } else if (!isValidMimeType && !isValidExtension) {
        console.error(`❌ Unsupported file type: ${file.type} and extension: ${fileExtension} for ${file.name}`);
        return NextResponse.json({
          error: `File type "${file.type}" and extension ".${fileExtension}" are not supported for "${file.name}"`
        }, { status: 400 });
      }

      console.log(`✅ File validation passed: ${file.name}`);
    }

    // Check if we should use Vercel Blob storage
    const isProduction = process.env.NODE_ENV === 'production';
    const useVercelBlob = isProduction && process.env.BLOB_READ_WRITE_TOKEN;
    
    // Create upload directory only for local development
    let uploadDir: string | null = null;
    if (!useVercelBlob) {
      uploadDir = isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
      console.log(`📂 Upload directory: ${uploadDir}`);

      if (!existsSync(uploadDir)) {
        console.log('📁 Creating upload directory...');
        await mkdir(uploadDir, { recursive: true });
      }
    } else {
      console.log('☁️ Using Vercel Blob storage');
    }

    // Process all files
    const uploadedFiles = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      console.log(`💾 Processing file ${i + 1}/${filesToProcess.length}: ${file.name}`);

      try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${timestamp}_${randomId}_${safeName}`;

        console.log(`📝 Processing file: ${file.name}`);

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate file hash for integrity checking
        const fileHash = createHash('sha256').update(buffer).digest('hex');

        let fileUrl: string;

        if (useVercelBlob) {
          // Upload to Vercel Blob
          try {
            const blob = await put(uniqueFilename, buffer, {
              access: 'public',
              addRandomSuffix: false,
              contentType: file.type,
            });
            fileUrl = blob.url;
            console.log(`✅ File uploaded to Vercel Blob: ${uniqueFilename}`);
          } catch (blobError) {
            console.error('❌ Vercel Blob upload failed:', blobError);
            throw new Error('Failed to upload file to cloud storage');
          }
        } else {
          // Save to local file system
          const filePath = path.join(uploadDir!, uniqueFilename);
          await writeFile(filePath, buffer);
          fileUrl = `/api/files/${encodeURIComponent(uniqueFilename)}`;
          console.log(`✅ File saved locally: ${uniqueFilename}`);
        }

        console.log(`✅ File processed successfully (hash: ${fileHash.substring(0, 8)}...)`);

        // Add file metadata to results
        uploadedFiles.push({
          id: randomId,
          filename: uniqueFilename,
          originalName: file.name,
          size: file.size,
          type: file.type,
          hash: fileHash,
          uploadedAt: new Date().toISOString(),
          url: fileUrl,
        });
      } catch (fileError) {
        console.error(`❌ Error processing file ${file.name}:`, fileError);
        return NextResponse.json({
          error: `Failed to process file "${file.name}": ${fileError instanceof Error ? fileError.message : 'Unknown error'}`
        }, { status: 500 });
      }
    }

    console.log(`🎉 Successfully uploaded ${uploadedFiles.length} files`);

    // Return file metadata (handle both single and multiple files)
    if (filesToProcess.length === 1) {
      return NextResponse.json({
        success: true,
        file: uploadedFiles[0],
      });
    } else {
      return NextResponse.json({
        success: true,
        files: uploadedFiles,
      });
    }

  } catch (error) {
    console.error('💥 File upload error:', error);
    return NextResponse.json({
      error: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
