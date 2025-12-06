import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, system } = body; // action: 'start' | 'stop', system: 'python' | 'php'

        if (!['python', 'php'].includes(system)) {
            return NextResponse.json({ error: 'Invalid system' }, { status: 400 });
        }

        const key = `migration_active_${system}`;
        const weightKey = `weight_${system}`;

        if (action === 'start') {
            await redis.set(key, 'true');
        } else if (action === 'stop') {
            await redis.set(key, 'false');
            await redis.set(weightKey, '0'); // Reset weight on stop/rollback
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Redis error:', error);
        return NextResponse.json({ error: 'Failed to update control' }, { status: 500 });
    }
}
