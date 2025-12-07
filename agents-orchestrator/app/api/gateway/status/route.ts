import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8082';

export async function GET() {
    try {
        const response = await fetch(`${GATEWAY_URL}/admin/status`, {
            method: 'GET',
            cache: 'no-store',
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
        console.error('Gateway status error:', error);
        // Return mock data when Gateway is unavailable
        return NextResponse.json({
            php: {
                weight: 0,
                weight_percent: 0,
                migration_status: 'pending'
            },
            python: {
                weight: 0,
                weight_percent: 0,
                migration_status: 'pending'
            },
            traffic_locked: true
        });
    }
}
