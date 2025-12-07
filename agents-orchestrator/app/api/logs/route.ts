import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

// Get real Docker container logs
async function getContainerLogs(containerName: string, tail: number = 50): Promise<string[]> {
    try {
        const { stdout } = await execAsync(
            `docker logs ${containerName} --tail ${tail} 2>&1`,
            { maxBuffer: 1024 * 1024 }
        );
        return stdout.split('\n').filter(line => line.trim());
    } catch {
        return [`Container ${containerName} not running or not found`];
    }
}

// Get container status
async function getContainerStatus(containerName: string): Promise<'running' | 'stopped' | 'not_found'> {
    try {
        const { stdout } = await execAsync(
            `docker inspect -f '{{.State.Status}}' ${containerName} 2>/dev/null`
        );
        const status = stdout.trim();
        return status === 'running' ? 'running' : 'stopped';
    } catch {
        return 'not_found';
    }
}

// Get Gateway metrics by directly calling its API
async function getGatewayMetrics() {
    try {
        const response = await fetch('http://localhost:8082/admin/status', {
            cache: 'no-store',
        });
        if (response.ok) {
            return await response.json();
        }
    } catch {
        // Gateway not accessible
    }
    return null;
}

// Get Arbiter metrics
async function getArbiterMetrics() {
    try {
        const response = await fetch('http://localhost:5000/status', {
            cache: 'no-store',
        });
        if (response.ok) {
            return await response.json();
        }
    } catch {
        // Arbiter not accessible
    }
    return null;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service') || 'all';
    const tailLines = parseInt(searchParams.get('tail') || '30');

    try {
        const result: {
            timestamp: string;
            gateway: {
                status: string;
                logs: string[];
                metrics: any;
            };
            arbiter: {
                status: string;
                logs: string[];
                metrics: any;
            };
            kafka: {
                status: string;
                logs: string[];
            };
            redis: {
                status: string;
            };
            legacy: {
                status: string;
                logs: string[];
            };
            modern: {
                status: string;
                logs: string[];
            };
        } = {
            timestamp: new Date().toISOString(),
            gateway: { status: 'unknown', logs: [], metrics: null },
            arbiter: { status: 'unknown', logs: [], metrics: null },
            kafka: { status: 'unknown', logs: [] },
            redis: { status: 'unknown' },
            legacy: { status: 'unknown', logs: [] },
            modern: { status: 'unknown', logs: [] },
        };

        // Collect data based on requested service
        if (service === 'all' || service === 'gateway') {
            result.gateway.status = await getContainerStatus('phoenix-gateway');
            result.gateway.logs = await getContainerLogs('phoenix-gateway', tailLines);
            result.gateway.metrics = await getGatewayMetrics();
        }

        if (service === 'all' || service === 'arbiter') {
            result.arbiter.status = await getContainerStatus('phoenix-arbiter');
            result.arbiter.logs = await getContainerLogs('phoenix-arbiter', tailLines);
            result.arbiter.metrics = await getArbiterMetrics();
        }

        if (service === 'all' || service === 'kafka') {
            result.kafka.status = await getContainerStatus('phoenix-kafka');
            result.kafka.logs = await getContainerLogs('phoenix-kafka', 10);
        }

        if (service === 'all' || service === 'redis') {
            result.redis.status = await getContainerStatus('phoenix-redis');
        }

        if (service === 'all' || service === 'legacy') {
            result.legacy.status = await getContainerStatus('phoenix-legacy');
            result.legacy.logs = await getContainerLogs('phoenix-legacy', tailLines);
        }

        if (service === 'all' || service === 'modern') {
            // Try to find modern container dynamically
            let modernContainer = 'phoenix-modern';
            try {
                const { stdout } = await execAsync('docker ps --format "{{.Names}}" | grep -i modern | head -1');
                if (stdout.trim()) {
                    modernContainer = stdout.trim();
                }
            } catch { }

            result.modern.status = await getContainerStatus(modernContainer);
            result.modern.logs = await getContainerLogs(modernContainer, tailLines);
        }

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('Error collecting container logs:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to collect logs',
        }, { status: 500 });
    }
}
