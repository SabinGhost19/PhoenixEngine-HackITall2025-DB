import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://gateway:8082';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, mode } = body; // type: 'python' or 'php', mode: 'legacy' or 'modern'

        if (!type || !['python', 'php'].includes(type)) {
            return NextResponse.json({ error: 'Invalid traffic type' }, { status: 400 });
        }

        // Generate a random account number from existing accounts (ACC001-ACC010)
        const accountNumber = `ACC${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`;

        // Generate a random payload matching service expectations
        const payload = {
            account_number: accountNumber,
            amount: Math.floor(Math.random() * 100) + 10,
            mode: mode || 'shadowing' // Pass mode to Gateway
        };

        // Always route through Gateway
        const endpoint = type === 'python' ? '/python/transfer' : '/php/transfer';
        const url = `${GATEWAY_URL}${endpoint}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.text();

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            data: data,
            mode: mode || 'shadowing',
            payload: payload
        });

    } catch (error) {
        console.error('Traffic generation error:', error);
        return NextResponse.json({ error: 'Failed to generate traffic' }, { status: 500 });
    }
}
