'use client';

import { useState } from 'react';
import { Rocket, CheckCircle, XCircle, Loader2, ExternalLink, Terminal, Server } from 'lucide-react';
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
        <div className="w-full font-mono">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2 text-glow">
                        <Rocket className="w-6 h-6 text-amber-500" />
                        DEPLOY_SERVICES
                    </h2>
                    <p className="text-amber-500/60 mt-1 text-sm">
                        Build and run both legacy and modern services in Docker
                    </p>
                </div>
                <button
                    onClick={handleDeploy}
                    disabled={isButtonDisabled}
                    className={`px-6 py-3 rounded-none font-bold flex items-center gap-2 transition-all border ${isButtonDisabled
                        ? 'border-gray-700 text-gray-700 bg-gray-900/50 cursor-not-allowed'
                        : 'btn-retro'
                        }`}
                >
                    {isDeploying ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            DEPLOYING_CONTAINERS...
                        </>
                    ) : isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            GENERATING_ARTIFACTS...
                        </>
                    ) : (
                        <>
                            <Rocket className="w-5 h-5" />
                            INITIATE_DEPLOYMENT
                        </>
                    )}
                </button>
            </div>

            {!migrationId && (
                <div className="border border-yellow-500/30 bg-yellow-900/10 p-4 mb-6">
                    <p className="text-yellow-500 text-sm flex items-center gap-2">
                        <span className="animate-pulse">⚠️</span>
                        AWAITING_MICROSERVICE_GENERATION
                    </p>
                </div>
            )}

            {isGenerating && migrationId && (
                <div className="border border-blue-500/30 bg-blue-900/10 p-4 mt-6">
                    <p className="text-blue-400 text-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        MICROSERVICE_GENERATION_IN_PROGRESS...
                    </p>
                </div>
            )}

            {deploymentResult && (
                <div className="mt-8 space-y-6">
                    {/* Overall Status */}
                    <div className={`p-4 border-2 ${deploymentResult.success
                        ? 'bg-green-900/10 border-green-500/50'
                        : 'bg-red-900/10 border-red-500/50'
                        }`}>
                        <div className="flex items-center gap-3">
                            {deploymentResult.success ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-500" />
                            )}
                            <span className={`font-bold tracking-wider ${deploymentResult.success ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {deploymentResult.message.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Legacy Service Status */}
                        <div className="box-retro p-6 bg-black/40">
                            <div className="flex items-center justify-between mb-4 border-b border-amber-500/20 pb-2">
                                <h3 className="font-bold text-amber-500 flex items-center gap-2">
                                    {deploymentResult.legacy.success ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    LEGACY_MONOLITH (PHP)
                                </h3>
                                {deploymentResult.legacy.success && (
                                    <a
                                        href={deploymentResult.legacy.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs uppercase tracking-wider"
                                    >
                                        ACCESS_ENDPOINT <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            <div className="text-sm space-y-2 font-mono">
                                <p className="text-amber-500/80 flex justify-between">
                                    <span className="text-amber-500/40">CONTAINER:</span>
                                    <span>{deploymentResult.legacy.containerName}</span>
                                </p>
                                <p className="text-amber-500/80 flex justify-between">
                                    <span className="text-amber-500/40">PORT:</span>
                                    <span className="text-purple-400">{deploymentResult.legacy.port}</span>
                                </p>
                                {deploymentResult.legacy.containerId && (
                                    <p className="text-amber-500/60 text-xs flex justify-between pt-2 border-t border-amber-500/10 mt-2">
                                        <span className="text-amber-500/30">ID:</span>
                                        <span>{deploymentResult.legacy.containerId.substring(0, 12)}</span>
                                    </p>
                                )}
                                {deploymentResult.legacy.error && (
                                    <p className="text-red-500 text-xs mt-2 border-t border-red-500/30 pt-2">
                                        ❌ {deploymentResult.legacy.error}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Modern Service Status */}
                        <div className="box-retro p-6 bg-black/40">
                            <div className="flex items-center justify-between mb-4 border-b border-amber-500/20 pb-2">
                                <h3 className="font-bold text-green-500 flex items-center gap-2">
                                    {deploymentResult.modern.success ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    MODERN_SERVICE (GO)
                                </h3>
                                {deploymentResult.modern.success && (
                                    <a
                                        href={deploymentResult.modern.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-400 hover:text-green-300 flex items-center gap-1 text-xs uppercase tracking-wider"
                                    >
                                        ACCESS_ENDPOINT <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            <div className="text-sm space-y-2 font-mono">
                                <p className="text-green-500/80 flex justify-between">
                                    <span className="text-green-500/40">CONTAINER:</span>
                                    <span>{deploymentResult.modern.containerName}</span>
                                </p>
                                <p className="text-green-500/80 flex justify-between">
                                    <span className="text-green-500/40">PORT:</span>
                                    <span className="text-purple-400">{deploymentResult.modern.port}</span>
                                </p>
                                {deploymentResult.modern.containerId && (
                                    <p className="text-green-500/60 text-xs flex justify-between pt-2 border-t border-green-500/10 mt-2">
                                        <span className="text-green-500/30">ID:</span>
                                        <span>{deploymentResult.modern.containerId.substring(0, 12)}</span>
                                    </p>
                                )}
                                {deploymentResult.modern.error && (
                                    <p className="text-red-500 text-xs mt-2 border-t border-red-500/30 pt-2">
                                        ❌ {deploymentResult.modern.error}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Docker Command Hint */}
                    <div className="bg-black border border-amber-500/20 p-4 flex items-center gap-4">
                        <Terminal className="w-5 h-5 text-amber-500/50" />
                        <div className="flex-1">
                            <p className="text-xs text-amber-500/50 mb-1 uppercase tracking-wider">
                                System Command Hint
                            </p>
                            <code className="text-green-400 font-mono text-sm">
                                $ docker ps
                            </code>
                        </div>
                    </div>

                    {/* Traffic Generator - Only shown on success */}
                    {showTrafficGenerator && (
                        <div className="mt-8 pt-8 border-t border-amber-500/30">
                            <TrafficGenerator
                                endpointAnalysis={endpointAnalysis!}
                                migrationId={migrationId!}
                                serviceType="php"
                            />
                        </div>
                    )}

                    {/* Migration Progress Panel - Shows real-time migration status */}
                    {deploymentResult?.modern.success && (
                        <div className="mt-8">
                            <MigrationProgressPanel serviceType="php" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

