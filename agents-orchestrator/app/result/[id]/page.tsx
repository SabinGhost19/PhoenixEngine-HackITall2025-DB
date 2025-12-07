'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MicroservicePreview from '@/components/generator/MicroservicePreview';
import DeploymentPanel from '@/components/DeploymentPanel';
import TrafficGenerator from '@/components/TrafficGenerator';
import TrafficLockControl from '@/components/TrafficLockControl';
import SystemMonitorDashboard from '@/components/SystemMonitorDashboard';
import { MigrationResult } from '@/lib/schemas';
import { CheckCircle, AlertCircle, ArrowLeft, Upload, Download, Code, Activity, Zap, Server } from 'lucide-react';

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/upload')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        Start New Migration
                    </button>
                </div>
            </div>
        );
    }

    // Loading while reading sessionStorage
    if (!result) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading result...</p>
                </div>
            </div>
        );
    }

    const migrationId = result.downloadUrl.split('/').pop()!;

    // Success - show result with tabs
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Migration Complete! 🎉
                                </h1>
                                <p className="text-gray-500">
                                    {result.microservice.serviceName} • Score: {result.verification.score}/100
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href={result.downloadUrl}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('migrationResult');
                                    router.push('/upload');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                            >
                                <Upload className="w-4 h-4" />
                                New Migration
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs - Simplified to 3 main tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1">
                        {[
                            { id: 'code', label: 'Generated Code', icon: Code },
                            { id: 'deploy', label: 'Deploy Services', icon: Server },
                            { id: 'operations', label: 'Traffic & Monitoring', icon: Activity },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Code Tab */}
                {activeTab === 'code' && (
                    <MicroservicePreview
                        microservice={result.microservice}
                        verification={result.verification}
                        downloadUrl={result.downloadUrl}
                    />
                )}

                {/* Deploy Tab */}
                {activeTab === 'deploy' && (
                    <DeploymentPanel
                        migrationId={migrationId}
                        endpointAnalysis={result.endpointAnalysis}
                    />
                )}

                {/* Operations Tab - All in one! */}
                {activeTab === 'operations' && (
                    <div className="space-y-6">
                        {/* Traffic Lock Control */}
                        <TrafficLockControl />

                        {/* Traffic Generator */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Traffic Generator
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Generate test traffic through the Gateway. Requests will be shadowed to both Legacy and Modern services for comparison.
                            </p>
                        </div>

                        <TrafficGenerator
                            endpointAnalysis={result.endpointAnalysis}
                            migrationId={migrationId}
                            serviceType="php"
                        />

                        {/* System Monitor Dashboard with REAL logs */}
                        <SystemMonitorDashboard />
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="bg-white border-t mt-8">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
