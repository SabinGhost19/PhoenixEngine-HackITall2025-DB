import { NextResponse } from 'next/server';

const ARBITER_URL = process.env.ARBITER_URL || 'http://localhost:5000';

export async function GET() {
    try {
        const response = await fetch(`${ARBITER_URL}/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
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
        console.error('Arbiter status fetch error:', error);

        // Return mock data when Arbiter is not available (for development)
        return NextResponse.json({
            success: true,
            data: {
                php_weight: 0.0,
                python_weight: 0.0,
                consistency_score: 100.0,
                total_transactions: 0,
                matched_transactions: 0,
                migration_status: 'pending',
                last_decision: 'none',
                last_decision_time: '',
            }
        });
    }
}
