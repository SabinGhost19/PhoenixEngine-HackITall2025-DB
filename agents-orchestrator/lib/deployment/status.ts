import fs from 'fs/promises';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'deployment-status.json');

export interface DeploymentState {
    status: 'idle' | 'deploying' | 'success' | 'error';
    migrationId: string;
    legacy: {
        success: boolean;
        url?: string;
        error?: string;
        containerName?: string;
        port?: number;
        containerId?: string;
    };
    modern: {
        success: boolean;
        url?: string;
        error?: string;
        containerName?: string;
        port?: number;
        containerId?: string;
    };
    message?: string;
    timestamp: number;
}

export async function saveDeploymentStatus(status: DeploymentState): Promise<void> {
    try {
        await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
    } catch (error) {
        console.error('Failed to save deployment status:', error);
    }
}

export async function getDeploymentStatus(): Promise<DeploymentState | null> {
    try {
        const data = await fs.readFile(STATUS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}
