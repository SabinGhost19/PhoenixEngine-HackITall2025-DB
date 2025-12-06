import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { architectureAgent } from '@/lib/agents/architecture-agent';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RequestSchema = z.object({
  uploadId: z.string(),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    // Combine all code for context
    const monolithCode = validated.files
      .map(f => `// File: ${f.path}\n${f.content}`)
      .join('\n\n');

    const architecture = await architectureAgent.run({
      monolithCode,
      fileStructure: validated.files,
    });

    return NextResponse.json({
      success: true,
      data: architecture,
    });
  } catch (error) {
    console.error('Architecture analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Architecture analysis failed',
      },
      { status: 500 }
    );
  }
}
