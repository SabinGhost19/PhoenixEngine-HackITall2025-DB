'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MicroservicePreview from '@/components/generator/MicroservicePreview';
import DeploymentPanel from '@/components/DeploymentPanel';
import TrafficGenerator from '@/components/TrafficGenerator';
import TrafficLockControl from '@/components/TrafficLockControl';
import SystemMonitorDashboard from '@/components/SystemMonitorDashboard';
import { MigrationResult } from '@/lib/schemas';
import { CheckCircle, AlertCircle, ArrowLeft, Upload, Download, Code, Activity, Zap, Server, ShieldCheck, Terminal, Rocket } from 'lucide-react';
import RetroLoader from '@/components/retro/RetroLoader';

export default function ResultPage() {
    const router = useRouter();
    const params = useParams();
    const endpointId = params.id as string;

    const [result, setResult] = useState<MigrationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'code' | 'deploy' | 'operations'>('code');

    useEffect(() => {
        // Read result from sessionStorage
        const resultStr = sessionStorage.getItem('migrationResult');

        if (!resultStr) {
            setError('No migration result found. Please start the migration process again.');
            return;
        }

        try {
            const parsed = JSON.parse(resultStr);
            setResult(parsed);
        } catch {
            setError('Invalid migration result. Please try again.');
        }
    }, []);

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="box-retro p-8 max-w-md w-full border-red-500/50">
                    <div className="flex items-center mb-6 text-red-500">
                        <AlertCircle className="w-8 h-8 mr-3 animate-pulse" />
                        <h2 className="text-xl font-bold tracking-widest">SYSTEM_ERROR</h2>
                    </div>
                    <p className="text-amber-500/80 mb-8 font-mono border-l-2 border-red-500/50 pl-4 py-2 bg-red-900/10">
                        {error}
                    </p>
                    <button
                        onClick={() => router.push('/upload')}
                        className="w-full btn-retro text-sm py-2 flex items-center justify-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        INIT_NEW_MIGRATION
                    </button>
                </div>
            </div>
        );
    }

    // Loading while reading sessionStorage
    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <RetroLoader text="LOADING_RESULTS..." />
            </div>
        );
    }

    const migrationId = result.downloadUrl.split('/').pop()!;

    // Success - show result with tabs
    return (
        <div className="min-h-screen py-8 px-4 font-mono">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="box-retro p-6 mb-8 relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-green-900/20 border border-green-500/50 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                <ShieldCheck className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-green-500 text-glow mb-1 tracking-tight flex items-center gap-2">
                                    MIGRATION_COMPLETE <span className="text-2xl animate-bounce"></span>
                                </h1>
                                <div className="flex items-center gap-4 text-sm font-mono">
                                    <span className="text-amber-500/70 uppercase">{result.microservice.serviceName}</span>
                                    <span className="text-amber-500/30">|</span>
                                    <span className="text-green-400 font-bold">SCORE: {result.verification.score}/100</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <a
                                href={result.downloadUrl}
                                className="flex-1 md:flex-none btn-retro text-sm py-2 px-6 flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                DOWNLOAD_PKG
                            </a>
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('migrationResult');
                                    router.push('/upload');
                                }}
                                className="flex-1 md:flex-none btn-retro text-sm py-2 px-6 flex items-center justify-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-500/10"
                            >
                                <Rocket className="w-4 h-4" />
                                NEW_MIGRATION
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="flex border-b border-amber-500/30">
                        {[
                            { id: 'code', label: 'GENERATED_CODE', icon: Code },
                            { id: 'deploy', label: 'DEPLOY_SERVICES', icon: Server },
                            { id: 'operations', label: 'TRAFFIC_&_MONITORING', icon: Activity },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-all duration-300
                                    ${activeTab === tab.id
                                        ? 'border-amber-500 text-amber-500 bg-amber-900/20 text-glow'
                                        : 'border-transparent text-amber-500/40 hover:text-amber-500 hover:bg-amber-900/10'
                                    }
                                `}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Code Tab */}
                    {activeTab === 'code' && (
                        <div className="box-retro p-6 bg-black/40">
                            <MicroservicePreview
                                microservice={result.microservice}
                                verification={result.verification}
                                downloadUrl={result.downloadUrl}
                            />
                        </div>
                    )}

                    {/* Deploy Tab */}
                    {activeTab === 'deploy' && (
                        <div className="box-retro p-6 bg-black/40">
                            <DeploymentPanel
                                migrationId={migrationId}
                                endpointAnalysis={result.endpointAnalysis}
                            />
                        </div>
                    )}

                    {/* Operations Tab */}
                    {activeTab === 'operations' && (
                        <div className="space-y-6">
                            {/* Traffic Lock Control */}
                            <div className="box-retro p-6 bg-black/40">
                                <TrafficLockControl />
                            </div>

                            {/* Traffic Generator */}
                            <div className="box-retro p-6 bg-black/40">
                                <h2 className="text-lg font-bold text-amber-500 mb-4 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    TRAFFIC_GENERATOR
                                </h2>
                                <p className="text-amber-500/60 mb-6 text-sm">
                                    Generate test traffic through the Gateway. Requests will be shadowed to both Legacy and Modern services for comparison.
                                </p>
                                <TrafficGenerator
                                    endpointAnalysis={result.endpointAnalysis}
                                    migrationId={migrationId}
                                    serviceType="php"
                                />
                            </div>

                            {/* System Monitor Dashboard */}
                            <div className="box-retro p-6 bg-black/40">
                                <SystemMonitorDashboard initialAutoRefresh={true} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-12 border-t border-amber-500/30 pt-6">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-amber-500/50 hover:text-amber-500 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        RETURN_TO_MAIN_MENU
                    </button>
                </div>
            </div>
        </div>
    );
}
