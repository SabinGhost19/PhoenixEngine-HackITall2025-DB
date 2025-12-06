import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { microserviceGeneratorAgent } from '@/lib/agents/microservice-generator-agent';
import { EndpointAnalysisSchema } from '@/lib/schemas';

export const runtime = 'nodejs';
export const maxDuration = 120;

const RequestSchema = z.object({
  endpointAnalysis: EndpointAnalysisSchema,
  language: z.enum(['go', 'python', 'node-ts']),
  serviceName: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    const microservice = await microserviceGeneratorAgent.run({
      endpointAnalysis: validated.endpointAnalysis,
      language: validated.language,
      serviceName: validated.serviceName,
    });

    return NextResponse.json({
      success: true,
      data: microservice,
    });
  } catch (error) {
    console.error('Microservice generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Microservice generation failed',
      },
      { status: 500 }
    );
  }
}
