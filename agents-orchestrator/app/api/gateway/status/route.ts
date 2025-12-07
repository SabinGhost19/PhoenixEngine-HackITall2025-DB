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
                { success: false, error: `Gateway returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Normalize response format for frontend
        return NextResponse.json({
            success: true,
            trafficLocked: data.traffic_locked ?? false,
            phpWeight: data.php?.weight ?? 0,
            pythonWeight: data.python?.weight ?? 0,
            phpWeightPercent: data.php?.weight_percent ?? 0,
            pythonWeightPercent: data.python?.weight_percent ?? 0,
            phpMigrationStatus: data.php?.migration_status ?? 'pending',
            pythonMigrationStatus: data.python?.migration_status ?? 'pending',
            // Also include raw data
            raw: data,
        });
    } catch (error) {
        // Return mock data when Gateway is unavailable
        return NextResponse.json({
            success: true, // Still return success so UI can show state
            trafficLocked: true,
            phpWeight: 0,
            pythonWeight: 0,
            phpWeightPercent: 0,
            pythonWeightPercent: 0,
            phpMigrationStatus: 'pending',
            pythonMigrationStatus: 'pending',
            error: 'Gateway not available - showing default values',
        });
    }
}
