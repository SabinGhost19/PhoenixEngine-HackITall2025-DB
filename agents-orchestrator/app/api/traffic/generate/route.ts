import { NextRequest, NextResponse } from 'next/server';
import { trafficGenerationAgent } from '@/lib/agents/traffic-generation-agent';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8082';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { endpointAnalysis, serviceType = 'php', mode = 'shadowing' } = body;

        if (!endpointAnalysis) {
            return NextResponse.json(
                { success: false, error: 'Missing endpointAnalysis parameter' },
                { status: 400 }
            );
        }

        console.log(`🚦 Generating traffic script for ${serviceType} service via Gateway...`);

        const result = await trafficGenerationAgent.run({
            endpointAnalysis,
            gatewayUrl: GATEWAY_URL,
            serviceType: serviceType as 'php' | 'python',
            mode: mode as 'shadowing' | 'legacy' | 'modern',
        });

        console.log('✅ Traffic script generated successfully');

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Traffic generation API error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

