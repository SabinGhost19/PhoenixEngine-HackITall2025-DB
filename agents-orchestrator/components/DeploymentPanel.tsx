'use client';

import { useState } from 'react';
import { Rocket, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

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
}

export default function DeploymentPanel({ migrationId, isGenerating = false }: DeploymentPanelProps) {
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
            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ migrationId }),
            });

            const data = await response.json();
            setDeploymentResult(data);

            if (data.success) {
                console.log('✅ Deployment successful:', data);
            } else {
                console.error('❌ Deployment failed:', data);
            }
        } catch (error) {
            console.error('❌ Deployment error:', error);
            setDeploymentResult({
                success: false,
                legacy: {
                    success: false,
                    containerName: 'phoenix-legacy',
                    port: 8081,
                    url: 'http://localhost:8081',
                    error: 'Network error'
                },
                modern: {
                    success: false,
                    containerName: `phoenix-modern-${migrationId}`,
                    port: 8080,
                    url: 'http://localhost:8080',
                    error: 'Network error'
                },
                message: 'Failed to connect to deployment API'
            });
        } finally {
            setIsDeploying(false);
        }
    };

    const isButtonDisabled = isDeploying || !migrationId || isGenerating;

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
                </div>
            )}
        </div>
    );
}
