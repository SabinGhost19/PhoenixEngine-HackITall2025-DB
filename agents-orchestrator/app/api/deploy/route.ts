import { NextRequest, NextResponse } from 'next/server';
import { deployBoth, listContainers } from '@/lib/deployment/deployment-manager';
import { saveDeploymentStatus, getDeploymentStatus, DeploymentState } from '@/lib/deployment/status';

export const dynamic = 'force-dynamic';

/**
 * POST /api/deploy
 * Start deployment process in background
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

        // Initialize status
        const initialStatus: DeploymentState = {
            status: 'deploying',
            migrationId,
            legacy: { success: false },
            modern: { success: false },
            message: 'Deployment started...',
            timestamp: Date.now()
        };
        await saveDeploymentStatus(initialStatus);

        // Start deployment in background (fire and forget)
        // We don't await this promise so the response returns immediately
        deployBoth(migrationId).then(async (result) => {
            const allSuccess = result.legacy.success && result.modern.success;

            const finalStatus: DeploymentState = {
                status: allSuccess ? 'success' : 'error',
                migrationId,
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
                    : 'Deployment completed with errors',
                timestamp: Date.now()
            };

            await saveDeploymentStatus(finalStatus);
            console.log('✅ Background deployment completed and status saved');
        }).catch(async (error) => {
            console.error('❌ Background deployment failed:', error);
            const errorStatus: DeploymentState = {
                status: 'error',
                migrationId,
                legacy: { success: false, error: 'Deployment crashed' },
                modern: { success: false, error: 'Deployment crashed' },
                message: `Critical failure: ${error.message}`,
                timestamp: Date.now()
            };
            await saveDeploymentStatus(errorStatus);
        });

        return NextResponse.json({
            success: true,
            message: 'Deployment started in background'
        }, { status: 202 });

    } catch (error: any) {
        console.error('❌ Deployment API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to start deployment',
                details: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/deploy
 * Get deployment status or list containers
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const checkStatus = searchParams.get('status');

    if (checkStatus) {
        const status = await getDeploymentStatus();
        return NextResponse.json(status || { status: 'idle' });
    }

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
