import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://gateway:8082';

export async function GET() {
    try {
        const res = await fetch(`${GATEWAY_URL}/admin/traffic-lock`);
        const data = await res.json();
        return NextResponse.json({ unlocked: !data.locked });
    } catch (error) {
        console.error('Error getting traffic lock status from Gateway:', error);
        return NextResponse.json({ unlocked: false });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { unlock } = body;

        const res = await fetch(`${GATEWAY_URL}/admin/traffic-lock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locked: !unlock })
        });

        const data = await res.json();

        return NextResponse.json({
            success: true,
            unlocked: !data.locked
        });
    } catch (error) {
        console.error('Error setting traffic lock status on Gateway:', error);
        return NextResponse.json({ error: 'Failed to update lock status' }, { status: 500 });
    }
}
