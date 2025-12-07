import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8082';

export async function GET() {
    try {
        const response = await fetch(`${GATEWAY_URL}/admin/traffic-lock`, {
            method: 'GET',
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Gateway traffic-lock GET error:', error);
        return NextResponse.json({ locked: true }, { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(`${GATEWAY_URL}/admin/traffic-lock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Gateway returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Gateway traffic-lock POST error:', error);
        return NextResponse.json(
            { error: 'Failed to communicate with Gateway' },
            { status: 503 }
        );
    }
}
