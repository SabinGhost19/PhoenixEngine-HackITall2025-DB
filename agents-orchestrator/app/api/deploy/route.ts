import { NextRequest, NextResponse } from 'next/server';
import { deployBoth, listContainers } from '@/lib/deployment/deployment-manager';

export const dynamic = 'force-dynamic';

/**
 * POST /api/deploy
 * Deploy both legacy and modern services
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { migrationId } = body;

        if (!migrationId) {
            return NextResponse.json(
                { error: 'Migration ID is required' },
                { status: 400 }
            );
        }

        console.log(`📦 Deployment request received for migration: ${migrationId}`);

        // Deploy both services
        const result = await deployBoth(migrationId);

        // Check if both deployments were successful
        const allSuccess = result.legacy.success && result.modern.success;

        return NextResponse.json({
            success: allSuccess,
            legacy: {
                success: result.legacy.success,
                containerId: result.legacy.containerId,
                containerName: result.legacy.containerName,
                port: result.legacy.port,
                url: result.legacy.url,
                error: result.legacy.error
            },
            modern: {
                success: result.modern.success,
                containerId: result.modern.containerId,
                containerName: result.modern.containerName,
                port: result.modern.port,
                url: result.modern.url,
                error: result.modern.error
            },
            message: allSuccess
                ? 'Both services deployed successfully'
                : 'Deployment completed with errors'
        }, { status: allSuccess ? 200 : 500 });

    } catch (error: any) {
        console.error('❌ Deployment API error:', error);
        return NextResponse.json(
            {
                error: 'Deployment failed',
                details: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/deploy
 * List all running containers
 */
export async function GET() {
    try {
        const containers = await listContainers();

        return NextResponse.json({
            success: true,
            containers
        });
    } catch (error: any) {
        console.error('❌ Failed to list containers:', error);
        return NextResponse.json(
            {
                error: 'Failed to list containers',
                details: error.message
            },
            { status: 500 }
        );
    }
}
