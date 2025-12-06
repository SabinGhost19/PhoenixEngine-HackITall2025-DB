import { NextRequest, NextResponse } from 'next/server';
import { trafficGenerationAgent } from '@/lib/agents/traffic-generation-agent';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { endpointAnalysis, serviceUrl } = body;

        if (!endpointAnalysis || !serviceUrl) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const result = await trafficGenerationAgent.run({
            endpointAnalysis,
            serviceUrl,
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Traffic generation API error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
