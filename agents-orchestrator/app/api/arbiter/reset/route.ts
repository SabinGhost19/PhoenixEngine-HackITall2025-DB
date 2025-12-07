import { NextResponse } from 'next/server';

const ARBITER_URL = process.env.ARBITER_URL || 'http://localhost:5000';

export async function POST() {
    try {
        const response = await fetch(`${ARBITER_URL}/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `Arbiter returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Arbiter reset error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to connect to Arbiter service' },
            { status: 503 }
        );
    }
}
