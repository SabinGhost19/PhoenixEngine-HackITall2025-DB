'use client';

import { useState } from 'react';
import { Rocket, CheckCircle, XCircle, Loader2, ExternalLink, Terminal, Server, Shield, Cpu, Activity } from 'lucide-react';
import { EndpointAnalysis } from '../lib/schemas';
import RetroArcadeDeployment from './retro/RetroArcadeDeployment';

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
                {!isDeploying && !deploymentResult?.success && (
                    <button
                        onClick={handleDeploy}
                        disabled={isButtonDisabled}
                        className={`px-6 py-3 rounded-none font-bold flex items-center gap-2 transition-all border ${isButtonDisabled
                            ? 'border-gray-700 text-gray-700 bg-gray-900/50 cursor-not-allowed'
                            : 'btn-retro'
                            }`}
                    >
                        {isGenerating ? (
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
                )}
            </div>

            {isDeploying && (
                <div className="mb-8 animate-in fade-in zoom-in duration-500">
                    <RetroArcadeDeployment />
                </div>
            )}

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
                <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-10 duration-700">
                    {/* Mission Report Header */}
                    <div className={`p-6 border-2 relative overflow-hidden ${deploymentResult.success
                        ? 'bg-green-900/10 border-green-500/50'
                        : 'bg-red-900/10 border-red-500/50'
                        }`}>
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Activity className="w-32 h-32" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                {deploymentResult.success ? (
                                    <CheckCircle className="w-8 h-8 text-green-500 animate-bounce" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-500 animate-pulse" />
                                )}
                                <h3 className={`text-2xl font-bold tracking-widest ${deploymentResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                    MISSION_REPORT: {deploymentResult.success ? 'SUCCESS' : 'FAILURE'}
                                </h3>
                            </div>
                            <p className="text-amber-500/60 font-mono text-sm max-w-2xl">
                                {deploymentResult.message}
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Legacy Service Card */}
                        <div className="box-retro p-0 overflow-hidden bg-black/60 group hover:border-amber-500/60 transition-colors">
                            <div className="bg-amber-900/20 p-4 border-b border-amber-500/20 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Server className="w-5 h-5 text-amber-500" />
                                    <h4 className="font-bold text-amber-500">LEGACY_TARGET</h4>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded border ${deploymentResult.legacy.success ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                                    {deploymentResult.legacy.success ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-xs text-gray-500 uppercase">Container ID</span>
                                    <span className="font-mono text-amber-300">{deploymentResult.legacy.containerId?.substring(0, 12) || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-xs text-gray-500 uppercase">Port Assignment</span>
                                    <span className="font-mono text-purple-400">{deploymentResult.legacy.port}</span>
                                </div>
                                <div className="pt-2">
                                    {deploymentResult.legacy.success && (
                                        <a
                                            href={deploymentResult.legacy.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full btn-retro py-2 flex items-center justify-center gap-2 text-xs group-hover:bg-amber-500/10"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            ACCESS_UPLINK
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modern Service Card */}
                        <div className="box-retro p-0 overflow-hidden bg-black/60 group hover:border-green-500/60 transition-colors">
                            <div className="bg-green-900/20 p-4 border-b border-green-500/20 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-green-500" />
                                    <h4 className="font-bold text-green-500">MODERN_TARGET</h4>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded border ${deploymentResult.modern.success ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                                    {deploymentResult.modern.success ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-xs text-gray-500 uppercase">Container ID</span>
                                    <span className="font-mono text-green-300">{deploymentResult.modern.containerId?.substring(0, 12) || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-xs text-gray-500 uppercase">Port Assignment</span>
                                    <span className="font-mono text-purple-400">{deploymentResult.modern.port}</span>
                                </div>
                                <div className="pt-2">
                                    {deploymentResult.modern.success && (
                                        <a
                                            href={deploymentResult.modern.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full btn-retro py-2 flex items-center justify-center gap-2 text-xs border-green-500 text-green-500 hover:bg-green-500/10"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            ACCESS_UPLINK
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps Hint */}
                    <div className="bg-blue-900/10 border border-blue-500/30 p-4 flex items-center gap-4 animate-pulse">
                        <Shield className="w-6 h-6 text-blue-400" />
                        <div>
                            <h4 className="text-blue-400 font-bold text-sm">DEPLOYMENT_COMPLETE</h4>
                            <p className="text-blue-300/60 text-xs">
                                Proceed to TRAFFIC_&_MONITORING tab to initiate traffic generation and observe system behavior.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

