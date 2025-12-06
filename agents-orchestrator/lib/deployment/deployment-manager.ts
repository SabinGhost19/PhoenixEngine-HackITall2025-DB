import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface DeploymentResult {
    success: boolean;
    containerId?: string;
    containerName: string;
    port: number;
    url: string;
    error?: string;
    logs?: string;
}

export interface DeploymentStatus {
    legacy: DeploymentResult;
    modern: DeploymentResult;
}

const PROJECT_ROOT = path.join(process.cwd());
const SCRIPTS_DIR = path.join(PROJECT_ROOT, 'scripts');

/**
 * Deploy the legacy PHP monolith
 */
export async function deployLegacy(): Promise<DeploymentResult> {
    const scriptPath = path.join(SCRIPTS_DIR, 'deploy-legacy.sh');
    const containerName = 'phoenix-legacy';
    const port = 8081;

    try {
        console.log('🚀 Deploying legacy monolith...');

        const { stdout, stderr } = await execAsync(`bash "${scriptPath}"`, {
            env: {
                ...process.env,
                DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@host.docker.internal:5432/phoenix'
            },
            cwd: PROJECT_ROOT
        });

        // Extract container ID from output (last line)
        const lines = stdout.trim().split('\n');
        const containerId = lines[lines.length - 1];

        console.log('✅ Legacy deployment successful:', containerId);

        return {
            success: true,
            containerId,
            containerName,
            port,
            url: `http://localhost:${port}`,
            logs: stdout
        };
    } catch (error: any) {
        console.error('❌ Legacy deployment failed:', error);
        return {
            success: false,
            containerName,
            port,
            url: `http://localhost:${port}`,
            error: error.message,
            logs: error.stdout || error.stderr
        };
    }
}

/**
 * Deploy a modern microservice
 */
export async function deployModern(migrationId: string): Promise<DeploymentResult> {
    const scriptPath = path.join(SCRIPTS_DIR, 'deploy-modern.sh');
    const containerName = `phoenix-modern-${migrationId}`;
    const port = 8080;

    try {
        console.log(`🚀 Deploying modern microservice: ${migrationId}...`);

        const { stdout, stderr } = await execAsync(`bash "${scriptPath}" "${migrationId}"`, {
            env: {
                ...process.env,
                DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@host.docker.internal:5432/phoenix'
            },
            cwd: PROJECT_ROOT
        });

        // Extract container ID from output (last line)
        const lines = stdout.trim().split('\n');
        const containerId = lines[lines.length - 1];

        console.log('✅ Modern deployment successful:', containerId);

        return {
            success: true,
            containerId,
            containerName,
            port,
            url: `http://localhost:${port}`,
            logs: stdout
        };
    } catch (error: any) {
        console.error('❌ Modern deployment failed:', error);
        return {
            success: false,
            containerName,
            port,
            url: `http://localhost:${port}`,
            error: error.message,
            logs: error.stdout || error.stderr
        };
    }
}

/**
 * Deploy both legacy and modern services
 */
export async function deployBoth(migrationId: string): Promise<DeploymentStatus> {
    console.log('🚀 Starting dual deployment...');

    // Deploy legacy first
    const legacyResult = await deployLegacy();

    // Deploy modern
    const modernResult = await deployModern(migrationId);

    return {
        legacy: legacyResult,
        modern: modernResult
    };
}

/**
 * Check if a container is running
 */
export async function getContainerStatus(containerName: string): Promise<boolean> {
    try {
        const { stdout } = await execAsync(`docker ps --format '{{.Names}}' | grep "^${containerName}$"`);
        return stdout.trim() === containerName;
    } catch {
        return false;
    }
}

/**
 * Stop a running container
 */
export async function stopContainer(containerName: string): Promise<boolean> {
    try {
        await execAsync(`docker stop ${containerName}`);
        await execAsync(`docker rm ${containerName}`);
        console.log(`✅ Stopped container: ${containerName}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to stop container ${containerName}:`, error.message);
        return false;
    }
}

/**
 * Get logs from a container
 */
export async function getContainerLogs(containerName: string, lines: number = 50): Promise<string> {
    try {
        const { stdout } = await execAsync(`docker logs --tail ${lines} ${containerName}`);
        return stdout;
    } catch (error: any) {
        return `Error fetching logs: ${error.message}`;
    }
}

/**
 * List all Phoenix Engine containers
 */
export async function listContainers(): Promise<Array<{ name: string; status: string; port: string }>> {
    try {
        const { stdout } = await execAsync(`docker ps -a --filter "name=phoenix-" --format "{{.Names}}|{{.Status}}|{{.Ports}}"`);

        return stdout
            .trim()
            .split('\n')
            .filter(line => line)
            .map(line => {
                const [name, status, port] = line.split('|');
                return { name, status, port };
            });
    } catch {
        return [];
    }
}
