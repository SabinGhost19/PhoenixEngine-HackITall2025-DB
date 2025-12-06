import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Store uploaded files in memory (in production, use a proper storage solution)
const uploadedFiles = new Map<string, { path: string; content: string }[]>();

const UploadSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })),
});

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
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get('uploadId');

  if (!uploadId) {
    return NextResponse.json(
      { success: false, error: 'uploadId required' },
      { status: 400 }
    );
  }

  const files = uploadedFiles.get(uploadId);
  
  if (!files) {
    return NextResponse.json(
      { success: false, error: 'Upload not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    files,
  });
}
