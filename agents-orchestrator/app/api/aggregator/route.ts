import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aggregatorAgent } from '@/lib/agents/aggregator-agent';
import { migrationResults } from '@/lib/utils/storage';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for full workflow

const RequestSchema = z.object({
  uploadId: z.string(),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })),
  selectedEndpointId: z.string(),
  targetLanguage: z.enum(['go', 'python', 'node-ts']),
  serviceName: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    // Combine all code for context
    const monolithCode = validated.files
      .map(f => `// File: ${f.path}\n${f.content}`)
      .join('\n\n');

    const result = await aggregatorAgent.run({
      monolithCode,
      fileStructure: validated.files,
      selectedEndpointId: validated.selectedEndpointId,
      targetLanguage: validated.targetLanguage,
      serviceName: validated.serviceName,
    });

    // Store result for download
    const migrationId = result.downloadUrl.split('/').pop()!;
    migrationResults.set(migrationId, result);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Aggregator error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration workflow failed',
      },
      { status: 500 }
    );
  }
}
