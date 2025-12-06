import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifierAgent } from '@/lib/agents/verifier-agent';
import { MicroserviceSchema } from '@/lib/schemas';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RequestSchema = z.object({
  microservice: MicroserviceSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    const verification = await verifierAgent.run({
      microservice: validated.microservice,
    });

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      },
      { status: 500 }
    );
  }
}
