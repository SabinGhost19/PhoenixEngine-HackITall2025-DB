import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://gateway:8082';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (!service) {
        return NextResponse.json({ error: 'Service parameter required' }, { status: 400 });
    }

    try {
        const res = await fetch(`${GATEWAY_URL}/admin/set-weight?service=${service}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching weight from Gateway:', error);
        return NextResponse.json({ error: 'Failed to fetch weight' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { service, weight } = body;

        const res = await fetch(`${GATEWAY_URL}/admin/set-weight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service, weight })
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error setting weight on Gateway:', error);
        return NextResponse.json({ error: 'Failed to set weight' }, { status: 500 });
    }
}
