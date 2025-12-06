import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { endpointAnalysisAgent } from '@/lib/agents/endpoint-analysis-agent';
import { EndpointSchema } from '@/lib/schemas';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RequestSchema = z.object({
  endpoint: EndpointSchema,
  fileContent: z.string(),
  relatedFiles: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    const analysis = await endpointAnalysisAgent.run({
      endpoint: validated.endpoint,
      fileContent: validated.fileContent,
      relatedFiles: validated.relatedFiles,
    });

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Endpoint analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Endpoint analysis failed',
      },
      { status: 500 }
    );
  }
}
