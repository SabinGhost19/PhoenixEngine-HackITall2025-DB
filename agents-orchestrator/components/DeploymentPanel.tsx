import { useState, useEffect } from 'react';
import { Rocket, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { EndpointAnalysis } from '../lib/schemas';
import TrafficGenerator from './TrafficGenerator';
import MigrationProgressPanel from './MigrationProgressPanel';

interface DeploymentResult {
    success: boolean;
    containerId?: string;
    containerName: string;
    port: number;
    url: string;
    error?: string;
}

interface DeploymentResponse {
    success: boolean;
    legacy: DeploymentResult;
    modern: DeploymentResult;
    message: string;
}

interface DeploymentPanelProps {
    migrationId?: string;
    isGenerating?: boolean;
    endpointAnalysis?: EndpointAnalysis;
}

export default function DeploymentPanel({ migrationId, isGenerating = false, endpointAnalysis }: DeploymentPanelProps) {
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentResult, setDeploymentResult] = useState<DeploymentResponse | null>(null);

    const handleDeploy = async () => {
        if (!migrationId) {
            alert('Please generate a microservice first');
            return;
        }

        setIsDeploying(true);
        setDeploymentResult(null);

        try {
            // 1. Start deployment
            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ migrationId }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server returned ${response.status}: ${text}`);
            }

            // 2. Poll for status
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch('/api/deploy?status=true');
                    const statusData = await statusRes.json();

                    if (statusData.status === 'success' || statusData.status === 'error') {
                        clearInterval(pollInterval);
                        setIsDeploying(false);

                        // Map status data to DeploymentResponse format
                        setDeploymentResult({
                            success: statusData.status === 'success',
                            legacy: statusData.legacy,
                            modern: statusData.modern,
                            message: statusData.message || 'Deployment completed'
                        });

                        if (statusData.status === 'success') {
                            console.log('✅ Deployment successful:', statusData);

                            // Unlock traffic to allow shadowing mode
                            try {
                                await fetch('/api/gateway/traffic-lock', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ locked: false })
                                });
                                console.log('🔓 Traffic lock disabled - shadowing mode enabled');
                            } catch (unlockError) {
                                console.warn('Could not unlock traffic:', unlockError);
                            }
                        } else {
                            console.error('❌ Deployment failed:', statusData);
                        }
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 2000);


        } catch (error) {
            console.error('❌ Deployment error:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setIsDeploying(false);
            setDeploymentResult({
                success: false,
                legacy: {
                    success: false,
                    containerName: 'phoenix-legacy',
                    port: 8081,
                    url: 'http://localhost:8081',
                    error: errorMessage
                },
                modern: {
                    success: false,
                    containerName: `phoenix-modern-${migrationId}`,
                    port: 8080,
                    url: 'http://localhost:8080',
                    error: errorMessage
                },
                message: `Deployment failed: ${errorMessage}`
            });
        }
    };

    const isButtonDisabled = isDeploying || !migrationId || isGenerating;
    const showTrafficGenerator = deploymentResult?.modern.success && endpointAnalysis && migrationId;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Rocket className="w-6 h-6 text-blue-600" />
                        Deploy Services
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Build and run both legacy and modern services in Docker
                    </p>
                </div>
                <button
                    onClick={handleDeploy}
                    disabled={isButtonDisabled}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${isButtonDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isDeploying ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Deploying...
                        </>
                    ) : isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Rocket className="w-5 h-5" />
                            Deploy Now
                        </>
                    )}
                </button>
            </div>

            {!migrationId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                        ⚠️ Please generate a microservice first before deploying
                    </p>
                </div>
            )}

            {isGenerating && migrationId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-blue-800 text-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Microservice generation in progress. Deployment will be available shortly.
                    </p>
                </div>
            )}

            {deploymentResult && (
                <div className="mt-6 space-y-4">
                    {/* Overall Status */}
                    <div className={`p-4 rounded-lg border-2 ${deploymentResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center gap-2">
                            {deploymentResult.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${deploymentResult.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {deploymentResult.message}
                            </span>
                        </div>
                    </div>

                    {/* Legacy Service Status */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                {deploymentResult.legacy.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                Legacy Monolith (PHP)
                            </h3>
                            {deploymentResult.legacy.success && (
                                <a
                                    href={deploymentResult.legacy.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                                >
                                    Open <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                        <div className="text-sm space-y-1">
                            <p className="text-gray-600">
                                <span className="font-medium">Container:</span> {deploymentResult.legacy.containerName}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Port:</span> {deploymentResult.legacy.port}
                            </p>
                            {deploymentResult.legacy.containerId && (
                                <p className="text-gray-600 font-mono text-xs">
                                    <span className="font-medium">ID:</span> {deploymentResult.legacy.containerId.substring(0, 12)}
                                </p>
                            )}
                            {deploymentResult.legacy.error && (
                                <p className="text-red-600 text-xs mt-2">
                                    ❌ {deploymentResult.legacy.error}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Modern Service Status */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                {deploymentResult.modern.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                Modern Microservice (Go)
                            </h3>
                            {deploymentResult.modern.success && (
                                <a
                                    href={deploymentResult.modern.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                                >
                                    Open <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                        <div className="text-sm space-y-1">
                            <p className="text-gray-600">
                                <span className="font-medium">Container:</span> {deploymentResult.modern.containerName}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Port:</span> {deploymentResult.modern.port}
                            </p>
                            {deploymentResult.modern.containerId && (
                                <p className="text-gray-600 font-mono text-xs">
                                    <span className="font-medium">ID:</span> {deploymentResult.modern.containerId.substring(0, 12)}
                                </p>
                            )}
                            {deploymentResult.modern.error && (
                                <p className="text-red-600 text-xs mt-2">
                                    ❌ {deploymentResult.modern.error}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Docker Command Hint */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-2">
                            💡 <span className="font-medium">Tip:</span> View running containers with:
                        </p>
                        <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs font-mono">
                            docker ps
                        </code>
                    </div>

                    {/* Traffic Generator - Only shown on success */}
                    {showTrafficGenerator && (
                        <TrafficGenerator
                            endpointAnalysis={endpointAnalysis!}
                            migrationId={migrationId!}
                            serviceType="php"
                        />
                    )}

                    {/* Migration Progress Panel - Shows real-time migration status */}
                    {deploymentResult?.modern.success && (
                        <MigrationProgressPanel serviceType="php" />
                    )}
                </div>
            )}
        </div>
    );
}

