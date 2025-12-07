import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8082';

export async function GET(req: NextRequest) {
    try {
        const service = req.nextUrl.searchParams.get('service') || 'php';

        const response = await fetch(`${GATEWAY_URL}/admin/set-weight?service=${service}`, {
            method: 'GET',
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Gateway get-weight error:', error);
        return NextResponse.json({ weight: 0 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(`${GATEWAY_URL}/admin/set-weight`, {
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
        console.error('Gateway set-weight error:', error);
        return NextResponse.json(
            { error: 'Failed to communicate with Gateway' },
            { status: 503 }
        );
    }
}
