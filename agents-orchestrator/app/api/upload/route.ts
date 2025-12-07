import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Store uploaded files in memory (in production, use a proper storage solution)
// Note: This is a simple in-memory storage. In a real app with multiple instances, 
// you'd want to use Redis, S3, or a database.
// Since we're running locally for this demo, a global variable works fine 
// as long as the dev server doesn't restart.
declare global {
  var _uploadedFiles: Map<string, { path: string; content: string }[]> | undefined;
}

if (!global._uploadedFiles) {
  global._uploadedFiles = new Map();
}

const uploadedFiles = global._uploadedFiles;

const UploadSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })),
});

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Allow all origins for dev
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = UploadSchema.parse(body);

    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    uploadedFiles.set(uploadId, validated.files);

    return NextResponse.json({
      success: true,
      uploadId,
      fileCount: validated.files.length,
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 400, headers: corsHeaders() }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get('uploadId');

  if (!uploadId) {
    return NextResponse.json(
      { success: false, error: 'uploadId required' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const files = uploadedFiles.get(uploadId);

  if (!files) {
    return NextResponse.json(
      { success: false, error: 'Upload not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  return NextResponse.json({
    success: true,
    files,
  }, { headers: corsHeaders() });
}
