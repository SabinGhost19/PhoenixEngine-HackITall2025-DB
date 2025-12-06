import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
    try {
        // Fetch all necessary keys in parallel
        const [
            consistencyScore,
            weightPython,
            weightPhp,
            totalTx,
            migrationActivePython,
            migrationActivePhp
        ] = await Promise.all([
            redis.get('consistency_score'),
            redis.get('weight_python'),
            redis.get('weight_php'),
            redis.get('total_transactions'),
            redis.get('migration_active_python'),
            redis.get('migration_active_php')
        ]);

        return NextResponse.json({
            consistencyScore: parseFloat(consistencyScore || '0'),
            weightPython: parseFloat(weightPython || '0'),
            weightPhp: parseFloat(weightPhp || '0'),
            totalTx: parseInt(totalTx || '0'),
            migrationActivePython: migrationActivePython === 'true',
            migrationActivePhp: migrationActivePhp === 'true'
        });
    } catch (error) {
        console.error('Redis error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
