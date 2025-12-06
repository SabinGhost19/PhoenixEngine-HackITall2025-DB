import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import docker from '@/lib/docker';

function cleanDockerLogs(buffer: Buffer): string {
    let logs = '';
    let offset = 0;
    while (offset < buffer.length) {
        // Header is 8 bytes: [type, 0, 0, 0, size, size, size, size]
        if (offset + 8 > buffer.length) break;
        const size = buffer.readUInt32BE(offset + 4);
        offset += 8;
        if (offset + size > buffer.length) break;
        logs += buffer.toString('utf-8', offset, offset + size);
        offset += size;
    }
    return logs;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'anomalies' or 'container'
    const containerName = searchParams.get('container');

    try {
        if (type === 'anomalies') {
            const errors = await redis.lrange('errors', 0, 9); // Last 10 errors
            return NextResponse.json({ logs: errors });
        }

        if (type === 'container' && containerName) {
            try {
                // Find container by fuzzy name match
                const containers = await docker.listContainers({ all: true });
                const target = containers.find(c =>
                    c.Names.some(n => n.toLowerCase().includes(containerName.toLowerCase()))
                );

                if (!target) {
                    return NextResponse.json({ error: 'Container not found' }, { status: 404 });
                }

                const container = docker.getContainer(target.Id);
                // Get logs (last 100 lines)
                const logsBuffer = await container.logs({
                    stdout: true,
                    stderr: true,
                    tail: 100,
                    timestamps: true,
                    follow: false
                }) as Buffer;

                const logs = cleanDockerLogs(logsBuffer);
                return NextResponse.json({ logs });
            } catch (e) {
                console.error("Container log error:", e);
                return NextResponse.json({ error: `Container ${containerName} not found or error reading logs` }, { status: 404 });
            }
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Log fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
