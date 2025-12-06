import { NextResponse } from 'next/server';
import { trafficGenerator } from '@/lib/simulation/traffic-generator';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, url, endpointAnalysis } = body;

        if (action === 'start') {
            if (!url || !endpointAnalysis) {
                return NextResponse.json(
                    { error: 'URL and endpointAnalysis are required for start' },
                    { status: 400 }
                );
            }
            trafficGenerator.start(url, endpointAnalysis);
            return NextResponse.json({ message: 'Traffic started', stats: trafficGenerator.getStats() });
        }

        if (action === 'stop') {
            trafficGenerator.stop();
            return NextResponse.json({ message: 'Traffic stopped', stats: trafficGenerator.getStats() });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Traffic API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json(trafficGenerator.getStats());
}
